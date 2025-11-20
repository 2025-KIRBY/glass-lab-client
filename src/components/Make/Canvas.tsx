import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { MouseEvent, TouchEvent } from "react";

// Define the brush color as a constant
const BRUSH_COLOR = "rgba(254,206,237,0.7)";

export type CanvasHandle = {
  exportAsFile: () => Promise<File | null>;
};

type CanvasProps = {
  wandStep: number | null;
  className?: string;
  originalWidth: number;
  originalHeight: number;
};

const Canvas = forwardRef<CanvasHandle, CanvasProps>(
  ({ wandStep, className, originalWidth, originalHeight }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // ⛔️ [문제 1] 충돌의 원인이 되는 High-DPI용 useEffect 제거
    // ...

    // ✨ [해결 1] 캔버스 해상도 설정 Effect
    // 캔버스 해상도 설정과 context 설정을 이 Effect에서 *모두* 처리합니다.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas && originalWidth > 0 && originalHeight > 0) {
        // 1. 캔버스 '자체' 해상도를 원본 이미지 크기로 설정
        canvas.width = originalWidth;
        canvas.height = originalHeight;

        // 2. 해상도가 리셋될 때마다 2D context를 새로 가져옵니다.
        const context = canvas.getContext("2d");
        if (context) {
          context.lineCap = "round"; // 기본 설정
          context.lineJoin = "round";
          contextRef.current = context;
          setCtx(context); // 👈 State에 context 저장
          console.log(
            `🎨 캔버스 해상도 설정: ${originalWidth}x${originalHeight}`
          );
        }
      }
    }, [originalWidth, originalHeight]);

    // ✨ [해결 2] 브러시 설정 Effect
    // 이 Effect는 'wandStep' 또는 'ctx'가 변경될 때만 실행됩니다.
    useEffect(() => {
      if (!ctx) return;
      ctx.lineCap = "round"; // 기존
      ctx.lineJoin = "round"; // 추가!!  ←✨✨✨✨

      switch (wandStep) {
        case 0: // 👈 wandStep가 0일 때 (기본값)
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = BRUSH_COLOR;
          ctx.lineWidth = 65;
          break;
        case 1:
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = BRUSH_COLOR;
          ctx.lineWidth = 40;
          break;
        case 2:
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = BRUSH_COLOR;
          ctx.lineWidth = 27;
          break;
        case 3:
          ctx.globalCompositeOperation = "destination-out";
          ctx.lineWidth = 40;
          ctx.strokeStyle = "rgba(0,0,0,1)"; // 지우개는 색상 무관
          break;
        default: // wandStep이 null, 4 또는 예상치 못한 값일 때
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = BRUSH_COLOR;
          ctx.lineWidth = 40;
          break;
      }
    }, [wandStep, ctx]);

    // ✅ [추가] 캔버스 초기화 Effect: wandStep이 4일 때 캔버스 전체를 지웁니다.
    useEffect(() => {
      // ctx가 준비되었고 wandStep이 정확히 4일 때만 실행
      if (!ctx || wandStep !== 4) return;

      // 캔버스 전체를 지웁니다.
      ctx.clearRect(0, 0, originalWidth, originalHeight);
      console.log("🧹 캔버스 초기화 완료: wandStep이 4로 설정됨");
    }, [wandStep, ctx, originalWidth, originalHeight]);

    // ✨ [해결 3] 좌표 스케일링 함수
    // CSS 크기(e.g., 400x300)와 캔버스 해상도(e.g., 1920x1080) 사이의
    // 비율을 계산하여 마우스 좌표를 스케일링합니다.
    const getScaledCoordinates = (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { scaledX: 0, scaledY: 0 };

      const scaleX = canvas.width / canvas.offsetWidth;
      const scaleY = canvas.height / canvas.offsetHeight;

      return {
        scaledX: x * scaleX,
        scaledY: y * scaleY,
      };
    };

    // ✨ [해결 3-1] 마우스 이벤트에 스케일링 적용
    const startDrawing = (event: MouseEvent) => {
      if (wandStep === null || !contextRef.current) return;
      const { offsetX, offsetY } = event.nativeEvent;
      const { scaledX, scaledY } = getScaledCoordinates(offsetX, offsetY); // 👈 스케일링

      setIsDrawing(true);
      contextRef.current.beginPath();
      contextRef.current.moveTo(scaledX, scaledY); // 👈 스케일링된 좌표 사용
    };

    const finishDrawing = () => {
      if (!isDrawing) return;
      setIsDrawing(false);
      contextRef.current?.closePath();
    };

    const drawing = ({ nativeEvent }: MouseEvent) => {
      if (!isDrawing || !contextRef.current) return;
      const { offsetX, offsetY } = nativeEvent;
      const { scaledX, scaledY } = getScaledCoordinates(offsetX, offsetY); // 👈 스케일링

      contextRef.current.lineTo(scaledX, scaledY); // 👈 스케일링된 좌표 사용
      contextRef.current.stroke();
    };

    // ✨ [해결 3-2] 터치 이벤트 수정 (스케일링 적용)
    // (기존의 MouseEvent dispatch 방식은 복잡하고 offsetX/Y 계산이 어려워 수정)
    const handleTouchStart = (e: TouchEvent) => {
      if (wandStep === null || !contextRef.current || e.touches.length === 0)
        return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const offsetX = touch.clientX - rect.left; // 👈 터치용 offsetX 계산
      const offsetY = touch.clientY - rect.top; // 👈 터치용 offsetY 계산
      const { scaledX, scaledY } = getScaledCoordinates(offsetX, offsetY); // 👈 스케일링

      setIsDrawing(true);
      contextRef.current.beginPath();
      contextRef.current.moveTo(scaledX, scaledY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawing || !contextRef.current || e.touches.length === 0) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const offsetX = touch.clientX - rect.left;
      const offsetY = touch.clientY - rect.top;
      const { scaledX, scaledY } = getScaledCoordinates(offsetX, offsetY);

      contextRef.current.lineTo(scaledX, scaledY);
      contextRef.current.stroke();
    };

    useImperativeHandle(ref, () => ({
      /**
       * 캔버스 내용을 'mask-image.png' 파일(검정 배경, 흰색 칠)로 변환하여 반환합니다.
       */
      exportAsFile: () => {
        return new Promise((resolve) => {
          const canvas = canvasRef.current;
          // ❗ contextRef.current를 사용해야 현재 캔버스 내용을 읽을 수 있습니다.
          const ctx = contextRef.current;

          if (!canvas || !ctx) {
            console.error("❌ 캔버스 또는 컨텍스트를 찾을 수 없습니다.");
            return resolve(null);
          }

          try {
            // 1. 원본 캔버스(핑크색 그림)의 모든 픽셀 데이터를 가져옵니다.
            const originalImageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const data = originalImageData.data; // [R, G, B, A, R, G, B, A, ...] 배열

            // 2. 새로운 마스크용 캔버스(눈에 보이지 않음)를 만듭니다.
            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;
            const maskCtx = maskCanvas.getContext("2d");

            if (!maskCtx) {
              console.error("❌ 마스크 캔버스 컨텍스트 생성 실패");
              return resolve(null);
            }

            // 3. 마스크 캔버스에 채울 새로운 ImageData 객체를 생성합니다.
            const maskImageData = maskCtx.createImageData(
              canvas.width,
              canvas.height
            );
            const maskData = maskImageData.data;

            // 4. 원본 픽셀 데이터를 반복 처리합니다. (i는 4씩 증가)
            for (let i = 0; i < data.length; i += 4) {
              // data[i + 3]은 알파(투명도) 값입니다. (0 ~ 255)

              // 5. 알파 값이 0보다 크면 (조금이라도 칠해졌으면)
              if (data[i + 3] > 0) {
                // 흰색 (R, G, B, A)
                maskData[i] = 255; // R
                maskData[i + 1] = 255; // G
                maskData[i + 2] = 255; // B
                maskData[i + 3] = 255; // A (불투명)
              } else {
                // 검은색 (R, G, B, A)
                maskData[i] = 0; // R
                maskData[i + 1] = 0; // G
                maskData[i + 2] = 0; // B
                maskData[i + 3] = 255; // A (불투명)
              }
            }

            // 6. 새로 만든 흑백 픽셀 데이터를 마스크 캔버스에 그립니다.
            maskCtx.putImageData(maskImageData, 0, 0);

            // 7. '마스크 캔버스'의 내용을 Blob으로 변환합니다.
            maskCanvas.toBlob(
              (blob) => {
                if (!blob) {
                  console.error("❌ 마스크 Blob 생성 실패");
                  return resolve(null);
                }
                // Blob을 File 객체로 변환
                const maskFile = new File([blob], "mask-image.png", {
                  type: "image/png",
                });
                resolve(maskFile);
              },
              "image/png",
              1.0 // 품질 (PNG는 무손실이므로 1.0 의미 없음)
            );
          } catch (error) {
            console.error("❌ 마스크 생성 중 오류 발생:", error);
            resolve(null);
          }
        });
      },
    }));

    // ⛔️ 캔버스를 감싸던 div 제거 (불필요)
    // <div className="absolute inset-0 z-2 canvas_wrap w-full h-full">
    return (
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={drawing}
        onMouseLeave={finishDrawing}
        // ✨ 터치 이벤트 핸들러 직접 연결
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={finishDrawing}
        className={className} // 👈 부모에서 받은 className (e.g., "absolute inset-0 w-full h-full") 적용
      ></canvas>
    );
    // </div>
  }
);
export default Canvas;
