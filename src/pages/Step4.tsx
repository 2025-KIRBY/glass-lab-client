import { CaretLeftIcon, CircleIcon, EraserIcon } from "@phosphor-icons/react";
import Canvas, { CanvasHandle } from "../components/Make/Canvas";
import { useStep } from "../context/StepContext";
import { useEffect, useRef, useState } from "react";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function triggerDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ✨ 1. 다운로드 형식을 저장할 타입과 state 추가
type DownloadFormat = "png" | "jpg" | "glb";

export default function StepFourPage() {
  const {
    initImage,
    setSelectedImageFile,
    selectedImageFile,
    setPrompt,
    setMaskImage,
    setCurrentStep,
  } = useStep();
  const [wandStep, setWandStep] = useState<number | null>(0);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [textAreaContent, setTextAreaContent] = useState<string>("");
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>("png");

  const canvasHandleRef = useRef<CanvasHandle | null>(null);

  useEffect(() => {
    setSelectedImageUrl(
      selectedImageFile ? URL.createObjectURL(selectedImageFile) : null
    );
  }, [selectedImageFile]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    console.log(
      `✅ 원본 이미지 크기: ${img.naturalWidth}x${img.naturalHeight}`
    );
  };

  async function handleMakeNewVersion() {
    setPrompt(textAreaContent);
    const maskBlob = await canvasHandleRef.current?.exportAsFile();
    if (maskBlob) {
      // Blob을 File로 변환
      const maskFile = new File([maskBlob], "mask.png", { type: "image/png" });
      setMaskImage(maskFile);
      console.log("✅ 마스크 이미지 파일 생성 및 저장 완료");
      setCurrentStep(4.5);
    } else {
      console.error("❌ 마스크 이미지 생성 실패");
    }
  }

  // ✨ 5. 'maskFile'을 다운로드하는 함수 (항상 PNG)
  async function handleDownloadMask() {
    if (!canvasHandleRef.current) {
      console.error("❌ 캔버스 ref가 없습니다.");
      return;
    }

    // 1. 캔버스에서 마스크 파일(Blob) 가져오기
    const maskFile = await canvasHandleRef.current.exportAsFile();
    if (!maskFile) {
      console.error("❌ 마스크 파일 생성에 실패했습니다.");
      return;
    }
    console.log("dptgakf");

    // 2. File(Blob) 객체를 다운로드용 URL로 변환
    const url = URL.createObjectURL(maskFile);

    // 3. 헬퍼 함수로 다운로드 실행
    triggerDownload(url, "mask.png");

    // 4. 메모리 정리를 위해 URL 해제
    URL.revokeObjectURL(url);
  }

  async function handleDownloadSelectedImage() {
    console.log(initImage);

    if (!selectedImageUrl) {
      console.error("❌ 다운로드할 이미지가 없습니다.");
      return;
    }

    if (selectedFormat === "glb") {
      alert(
        ".glb 변환은 현재 지원되지 않습니다. (.png 또는 .jpg를 선택하세요)"
      );
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = selectedImageUrl;

    image.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(image, 0, 0);

      const mimeType = selectedFormat === "png" ? "image/png" : "image/jpeg";
      const dataUrl = canvas.toDataURL(mimeType, 1.0);

      // ✅ 1️⃣ 로컬 다운로드
      triggerDownload(
        dataUrl,
        `result_${initImage?.name || "이름 없음"}.${selectedFormat}`
      );

      // ✅ 2️⃣ Firebase Storage 업로드
      try {
        // DataURL → Blob 변환
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        // Firebase Storage 참조 경로 지정
        const fileName = `result_${
          initImage?.name || "이름 없음"
        }_${Date.now()}.${selectedFormat}`;
        const storageRef = ref(storage, `gallery/${fileName}`);

        // 업로드 실행
        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log("✅ Firebase 업로드 성공:", downloadURL);
        alert("이미지가 Firebase에 업로드되었습니다!");
      } catch (error) {
        console.error("❌ Firebase 업로드 실패:", error);
      }
    };

    image.onerror = () => {
      console.error("❌ 이미지 로드에 실패했습니다.");
    };
  }

  console.log(selectedImageFile instanceof File);

  return (
    <div className="w-screen h-screen grid grid-cols-[1fr_500px] pt-[8.2rem] border-border-gray">
      <div className="relative w-full border-t-1 border-r-1 flex justify-center items-center">
        <button
          onClick={() => setCurrentStep(3)}
          className="flex items-center justify-center absolute top-[2rem] left-[2rem] label_17m w-[5rem] h-[4.5rem] border-1 border-text-gray [background:var(--gradient-button)] cursor-pointer"
        >
          <CaretLeftIcon size={25} color="#8f8b8b" />
        </button>
        <div className="relative inline-block">
          <img
            className="block object-contain h-[50%] max-w-[30vw]"
            src={selectedImageUrl!}
            alt=""
            onLoad={handleImageLoad}
          />
          <Canvas
            className="absolute inset-0 w-full h-full"
            wandStep={wandStep}
            ref={canvasHandleRef}
            originalWidth={imageDimensions.width}
            originalHeight={imageDimensions.height}
          />
        </div>
      </div>
      <div className="w-full border-t-1 pt-[2rem] pl-[3rem] flex flex-col gap-[4rem]">
        <div className="flex flex-col">
          <div>
            {/* <button onClick={() => setCurrentStep(3)}>button</button> */}
            <span className="label_17m tracking-[0]">| Magic Wand</span>
            <div className="flex gap-[2rem] mt-5">
              <button
                onClick={() => setWandStep(0)}
                className={`cursor-pointer hover:[background:var(--gradient-main)] flex justify-center items-center w-[5rem] h-[5rem] border-1 border-border-gray button-shadow [background:var(--gradient-gray)] ${
                  0 === wandStep ? "[background:var(--gradient-main)]" : ""
                }`}
              >
                <CircleIcon
                  fill="var(--color-text-black)"
                  weight="fill"
                  size={30}
                />
              </button>
              <button
                onClick={() => setWandStep(1)}
                className={`cursor-pointer hover:[background:var(--gradient-main)] flex justify-center items-center w-[5rem] h-[5rem] border-1 border-border-gray button-shadow [background:var(--gradient-gray)] ${
                  1 === wandStep ? "[background:var(--gradient-main)]" : ""
                }`}
              >
                <CircleIcon
                  fill="var(--color-text-black)"
                  weight="fill"
                  size={22}
                />
              </button>
              <button
                onClick={() => setWandStep(2)}
                className={`cursor-pointer hover:[background:var(--gradient-main)] flex justify-center items-center w-[5rem] h-[5rem] border-1 border-border-gray button-shadow [background:var(--gradient-gray)] ${
                  2 === wandStep ? "[background:var(--gradient-main)]" : ""
                }`}
              >
                <CircleIcon
                  fill="var(--color-text-black)"
                  weight="fill"
                  size={15}
                />
              </button>
              <button
                onClick={() => setWandStep(3)}
                className={`cursor-pointer hover:[background:var(--gradient-main)] flex justify-center items-center w-[5rem] h-[5rem] border-1 border-border-gray button-shadow [background:var(--gradient-gray)] ${
                  3 === wandStep ? "[background:var(--gradient-main)]" : ""
                }`}
              >
                <EraserIcon
                  fill="var(--color-text-black)"
                  weight="fill"
                  size={25}
                />
              </button>
              <button
                onClick={() => setWandStep(4)}
                className={`label_17m text-[1.4rem] cursor-pointer hover:[background:var(--gradient-main)] flex justify-center items-center w-[7rem] h-[5rem] border-1 border-border-gray button-shadow [background:var(--gradient-gray)] `}
              >
                RESET
              </button>
            </div>
          </div>
          <div className="mt-[4rem] flex flex-col">
            <span className="label_17m tracking-[0]">| Prompt</span>
            <textarea
              onChange={(e) => {
                setTextAreaContent(e.target.value);
              }}
              className="mt-4 max-w-[38rem] h-[10rem] p-4 border-1 border-[#d6d6d6] resize-none bg-white text-[1.4rem] leading-[2rem] placeholder:text-gray-300"
              placeholder="새로운 버전의 이미지를 생성하기 위한 프롬프트를 입력하세요."
            ></textarea>
          </div>
          <button
            onClick={handleMakeNewVersion}
            className="mt-10 cursor-pointer label_17m w-[25rem] h-[4.5rem] border-1 border-text-gray button-shadow [background:var(--gradient-button)] active:[box-shadow:none] active:translate-y-1"
          >
            Make New Version →
          </button>
        </div>
        <div>
          <div>
            <span className="mb-[2rem] label_17m tracking-[0]">| Export</span>
            <div className="relative grid grid-cols-3 bg-white border-1 border-[#d6d6d6] px-2 py-2 gap-2 max-w-[30rem] rounded-[3rem]">
              <span
                onClick={() => setSelectedFormat("png")}
                className={`cursor-pointer rounded-[3rem] w-full text-center text-[1.6rem] text-text-black font-[300] ${
                  selectedFormat === "png" ? "bg-main" : ""
                }`}
              >
                .png
              </span>
              <span
                onClick={() => setSelectedFormat("jpg")}
                className={`cursor-pointer rounded-[3rem] w-full text-center text-[1.6rem] text-text-black font-[300] ${
                  selectedFormat === "jpg" ? "bg-main" : ""
                }`}
              >
                .jpg
              </span>
              <span
                onClick={() => setSelectedFormat("glb")}
                className={`cursor-pointer rounded-[3rem] w-full text-center text-[1.6rem] text-text-black font-[300] ${
                  selectedFormat === "glb" ? "bg-main" : ""
                }`}
              >
                .glb
              </span>
              <span className="absolute -bottom-10 right-0 label_12m tracking-[0] text-text-gray">
                .glb 파일 export 시 시간이 소요됩니다.
              </span>
            </div>
          </div>
          <button
            onClick={handleDownloadSelectedImage}
            className="mt-15 cursor-pointer label_17m w-[25rem] h-[4.5rem] border-1 border-text-gray button-shadow [background:var(--gradient-button)] active:[box-shadow:none] active:translate-y-1"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
