import React, { useEffect, useRef, useState, useCallback } from "react";

// ==================================================================================
// [1] 타입 정의 및 에셋 설정
// ==================================================================================

interface PlayerState {
  x: number;
  y: number;
  size: number;
  speed: number;
  isWearing: boolean; // 안경 착용 여부
  wearTimer: number; // 안경 착용 유지 시간
  wearingGlassKey: string;
  faceKey: string; // 현재 선택된 얼굴 이미지 키
  moveLeft: boolean;
  moveRight: boolean;
}

interface ItemState {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  typeKey: string; // 떨어지는 안경 종류
  rotation: number;
  rotationSpeed: number;
  markedForDeletion: boolean; // 화면 밖으로 나갔거나 먹은 아이템 삭제 플래그
}

// 이미지 경로 설정 (Next.js의 public 폴더 기준 예시)
const ASSETS: Record<string, string> = {
  face1: "/game/face1.png",
  face2: "/game/face2.png",
  face3: "/game/face3.png",

  glass1: "/game/1.png",
  glass2: "/game/2.png",
  glass3: "/game/3.png",
  glass4: "/game/4.png",
};

const MAX_LIVES = 10;

export default function GameCanvas() {
  // ==================================================================================
  // [2] Refs & State (게임 상태 관리)
  // ==================================================================================

  // DOM 요소 참조
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null); // requestAnimationFrame ID 저장

  // 게임 로직용 Refs (렌더링을 유발하지 않고 값만 변경되는 변수들)
  // 리액트 상태(State)로 관리하면 1프레임마다 리렌더링되어 성능이 저하되므로 Ref 사용
  const framesRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(MAX_LIVES);
  const gameSpeedRef = useRef<number>(3);
  const spawnTimerRef = useRef<number>(0);

  const imagesRef = useRef<Record<string, HTMLImageElement>>({}); // 로드된 이미지 객체 저장

  // 플레이어 물리 상태 (위치, 속도 등)
  const playerRef = useRef<PlayerState>({
    x: 0,
    y: -10,
    size: 120,
    speed: 8,
    isWearing: false,
    wearTimer: 0,
    wearingGlassKey: "",
    faceKey: "face1",
    moveLeft: false,
    moveRight: false,
  });

  // 떨어지는 아이템들 배열
  const itemsRef = useRef<ItemState[]>([]);

  // UI용 State (화면에 보여지는 점수, 게임 단계 등 - 변경 시 리렌더링 됨)
  const [gameState, setGameState] = useState<
    "loading" | "start" | "playing" | "gameover"
  >("loading");
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [finalScore, setFinalScore] = useState<number>(0);

  const [selectedFace, setSelectedFace] = useState<string>("face1"); // 시작 화면에서 선택한 얼굴

  // ==================================================================================
  // [3] 이미지 프리로딩 (useEffect)
  // ==================================================================================
  useEffect(() => {
    let loadedCount = 0;
    const assetKeys = Object.keys(ASSETS);
    const totalImages = assetKeys.length;
    const loadedImages: Record<string, HTMLImageElement> = {};

    assetKeys.forEach((key) => {
      const img = new Image();
      img.src = ASSETS[key];

      const onComplete = () => {
        loadedCount++;
        loadedImages[key] = img;

        // 모든 이미지가 로드되면 게임 준비 상태("start")로 변경
        if (loadedCount === totalImages) {
          imagesRef.current = loadedImages;
          setGameState("start");
        }
      };

      img.onload = onComplete;
      img.onerror = () => {
        console.error(`Failed to load image: ${key}`);
        onComplete();
      };
    });
  }, []);

  // ==================================================================================
  // [4] 게임 초기화 및 루프 로직
  // ==================================================================================

  // 게임 시작/재시작 시 변수 초기화
  const initGame = useCallback(() => {
    if (!wrapperRef.current) return;
    const { clientWidth, clientHeight } = wrapperRef.current;

    scoreRef.current = 0;
    livesRef.current = MAX_LIVES;
    gameSpeedRef.current = 1;
    framesRef.current = 0;
    spawnTimerRef.current = 0;
    itemsRef.current = [];

    playerRef.current = {
      ...playerRef.current,
      x: clientWidth / 2 - 50,
      y: clientHeight - 120,
      isWearing: false,
      wearTimer: 0,
      faceKey: selectedFace, // 선택된 얼굴 적용
      moveLeft: false,
      moveRight: false,
    };

    setScore(0);
    setLives(MAX_LIVES);
    setGameState("playing");
  }, [selectedFace]);

  // 메인 애니메이션 루프 (60fps)
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx || gameState !== "playing") return;

    // 1. 캔버스 지우기 (매 프레임마다)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const player = playerRef.current;
    const loadedImgs = imagesRef.current;

    // 헬퍼: 이미지가 로드되었을 때만 그리는 함수
    const drawSafeImage = (
      img: HTMLImageElement | undefined,
      x: number,
      y: number,
      w: number,
      h: number
    ) => {
      if (img && img.complete && img.naturalWidth > 0) {
        try {
          ctx.drawImage(img, x, y, w, h);
          return true;
        } catch (e) {
          console.warn("Image draw failed", e);
          return false;
        }
      }
      return false;
    };

    // 2. 게임 난이도 및 스폰 로직 업데이트
    framesRef.current++;
    if (framesRef.current % 600 === 0) gameSpeedRef.current += 0.1; // 시간이 지날수록 속도 증가

    spawnTimerRef.current++;
    let spawnRate = 60 - Math.floor(gameSpeedRef.current * 2);
    if (spawnRate < 20) spawnRate = 20;

    // 아이템 생성
    if (spawnTimerRef.current > spawnRate) {
      const size = 100;
      const glassKeys = ["glass1", "glass2", "glass3", "glass4"];
      const randomKey = glassKeys[Math.floor(Math.random() * glassKeys.length)];

      itemsRef.current.push({
        id: Date.now() + Math.random(),
        size: size,
        x: Math.random() * (width - size),
        y: -size, // 화면 위에서 시작
        speed: Math.random() * 2 + gameSpeedRef.current,
        typeKey: randomKey,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        markedForDeletion: false,
      });
      spawnTimerRef.current = 0;
    }

    // 플레이어 이동 계산
    if (player.moveLeft) player.x -= player.speed;
    if (player.moveRight) player.x += player.speed;

    // 벽 충돌 방지
    if (player.x < 0) player.x = 0;
    if (player.x + player.size > width) player.x = width - player.size;

    // 안경 착용 타이머 감소
    if (player.isWearing) {
      player.wearTimer--;
      if (player.wearTimer <= 0) {
        player.isWearing = false;
        player.wearingGlassKey = "";
      }
    }

    // 3. 화면 그리기 (Draw)

    // 그림자
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.beginPath();
    ctx.ellipse(
      player.x + player.size / 2,
      player.y + player.size - 5,
      player.size / 2.5,
      player.size / 5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 얼굴 그리기
    const faceImg = loadedImgs[player.faceKey];
    const faceDrawn = drawSafeImage(
      faceImg,
      player.x,
      player.y,
      player.size,
      player.size
    );

    // 얼굴 이미지가 없을 경우 대체 그래픽(동그라미) 그리기
    if (!faceDrawn) {
      ctx.fillStyle = "#FFCC00";
      if (player.faceKey === "face2") ctx.fillStyle = "#4D90FE";
      if (player.faceKey === "face3") ctx.fillStyle = "#82C900";

      ctx.beginPath();
      ctx.arc(
        player.x + player.size / 2,
        player.y + player.size / 2,
        player.size / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // 눈 그리기
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(
        player.x + player.size / 3,
        player.y + player.size / 2.5,
        5,
        0,
        Math.PI * 2
      );
      ctx.arc(
        player.x + (player.size * 2) / 3,
        player.y + player.size / 2.5,
        5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // 착용 중인 안경 그리기
    if (player.isWearing) {
      const glassImg = loadedImgs[player.wearingGlassKey];
      const gWidth = player.size;
      const gHeight = player.size / 2;
      const gX = player.x;
      const gY = player.y + player.size * 0.21;

      const glassDrawn = drawSafeImage(glassImg, gX, gY, gWidth, gHeight);

      if (!glassDrawn) {
        // 이미지 없을 시 검은 네모 안경
        ctx.fillStyle = "black";
        ctx.fillRect(gX + 10, gY + 10, 30, 20);
        ctx.fillRect(gX + gWidth - 40, gY + 10, 30, 20);
        ctx.fillRect(gX + 30, gY + 15, gWidth - 60, 5);
      }

      // "NICE!" 텍스트 효과
      ctx.font = "bold 20px sans-serif";
      ctx.fillStyle = "#f472b6";

      // ▼▼▼ 여기를 추가하세요 ▼▼▼
      ctx.letterSpacing = "-2px"; // 값을 조절해보세요 (-1px, -3px 등)

      ctx.fillText("NICE!", player.x + player.size, player.y);

      // ▲▲▲ 중요: 다 그리고 나면 다시 0px로 돌려놔야 다른 글자(점수판 등)가 안 깨집니다.
      ctx.letterSpacing = "0px";
    }

    // 아이템 처리 (이동, 충돌 체크, 그리기)
    itemsRef.current.forEach((item) => {
      item.y += item.speed;
      item.rotation += item.rotationSpeed;

      // 충돌 체크 (간단한 원형 거리 계산)
      const dx = player.x + player.size / 2 - (item.x + item.size / 2);
      const dy = player.y + player.size / 2 - (item.y + item.size / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 1. 플레이어가 아이템 획득
      if (dist < player.size / 2 && !item.markedForDeletion) {
        item.markedForDeletion = true;
        scoreRef.current += 10;
        setScore(scoreRef.current);

        player.isWearing = true;
        player.wearingGlassKey = item.typeKey;
        player.wearTimer = 40;
      }

      // 2. 아이템이 바닥에 닿음 (놓침)
      if (item.y > height && !item.markedForDeletion) {
        item.markedForDeletion = true;
        livesRef.current--;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          setFinalScore(scoreRef.current);
          setGameState("gameover");
          return;
        }
      }

      // 아이템 그리기
      if (!item.markedForDeletion) {
        ctx.save();
        ctx.translate(item.x + item.size / 2, item.y + item.size / 2);
        ctx.rotate(item.rotation);

        const itemImg = loadedImgs[item.typeKey];
        const itemDrawn = drawSafeImage(
          itemImg,
          -item.size / 2,
          -item.size / 2,
          item.size,
          item.size / 2
        );

        if (!itemDrawn) {
          ctx.fillStyle = "red";
          ctx.fillRect(
            -item.size / 2,
            -item.size / 4,
            item.size,
            item.size / 2
          );
        }

        ctx.restore();
      }
    });

    // 삭제된 아이템 배열에서 제거
    itemsRef.current = itemsRef.current.filter((i) => !i.markedForDeletion);

    // 다음 프레임 요청
    if (livesRef.current > 0) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [gameState]);

  // ==================================================================================
  // [5] 이벤트 리스너 (리사이즈, 키보드, 마우스)
  // ==================================================================================
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current && canvasRef.current) {
        canvasRef.current.width = wrapperRef.current.clientWidth;
        canvasRef.current.height = wrapperRef.current.clientHeight;
        playerRef.current.y = wrapperRef.current.clientHeight - 120;
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    if (gameState === "playing") {
      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, animate]);

  const handlePointerMove = (clientX: number) => {
    if (gameState !== "playing" || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    playerRef.current.x = x - playerRef.current.size / 2;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameState !== "playing") return;
    if (e.code === "ArrowLeft") playerRef.current.moveLeft = true;
    if (e.code === "ArrowRight") playerRef.current.moveRight = true;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === "ArrowLeft") playerRef.current.moveLeft = false;
    if (e.code === "ArrowRight") playerRef.current.moveRight = false;
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  // ==================================================================================
  // [6] UI 렌더링 (JSX) - 스타일링 포인트
  // ==================================================================================
  return (
    <div
      ref={wrapperRef}
      // 전체 게임 컨테이너 스타일 (너비, 높이, 테두리 등)
      className="bg-[url(/sky.png)] relative w-[50vw] h-[50vh] overflow-hidden select-none rounded-xl border border-slate-200"
    >
      {/* 실제 게임이 그려지는 캔버스 */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full touch-none"
        onMouseDown={(e: React.MouseEvent<HTMLCanvasElement>) =>
          handlePointerMove(e.clientX)
        }
        onMouseMove={(e: React.MouseEvent<HTMLCanvasElement>) => {
          if (e.buttons === 1) handlePointerMove(e.clientX);
        }}
        onTouchStart={(e: React.TouchEvent<HTMLCanvasElement>) =>
          handlePointerMove(e.touches[0].clientX)
        }
        onTouchMove={(e: React.TouchEvent<HTMLCanvasElement>) =>
          handlePointerMove(e.touches[0].clientX)
        }
      />

      {/* --- [HUD] 점수 및 생명 표시 --- */}
      {/* pointer-events-none: 게임 조작을 방해하지 않도록 클릭 통과 설정 */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
        <div className="flex justify-between items-start text-2xl font-bold text-slate-800 drop-shadow-md">
          <div>SCORE: {score}</div>
          <div className="text-red-500">
            {"♥️".repeat(lives)}
            {"🩶".repeat(MAX_LIVES - lives)}
          </div>
        </div>
      </div>

      {/* --- [화면 1] 로딩 스크린 --- */}
      {gameState === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
          <div className="text-xl font-bold animate-pulse text-slate-600">
            이미지 로딩 중...
          </div>
        </div>
      )}

      {/* --- [화면 2] 시작 화면 (캐릭터 선택) --- */}
      {gameState === "start" && (
        // 배경 (반투명 검정)
        <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-40">
          {/* 메인 박스 (흰색 카드) */}
          <div className=" bg-[##3E8892] p-8 text-center animate-bounce-in max-w-[50%] h-[80%] w-full flex items-center flex-col justify-between">
            <h1 className="font-inria-sans text-[3rem] font-[600] text-white mb-2 tracking-tight">
              Grab the Glasses!
            </h1>
            <div>
              <p className="font-inria-sans text-gray-200 mb-10 text-[1.4rem]">
                캐릭터를 선택하고 시작하세요!
              </p>
              {/* 캐릭터 선택 버튼 리스트 */}
              <div className="flex justify-center gap-4 mb-6 pointer-events-auto">
                {["face1", "face2", "face3"].map((faceKey) => (
                  <button
                    key={faceKey}
                    onClick={() => setSelectedFace(faceKey)}
                    // 선택 여부에 따른 스타일 조건부 적용 (테두리, 크기 등)
                    className={`cursor-pointer relative w-40 h-40 rounded-full overflow-hidden transition-all transform hover:scale-110 ${
                      selectedFace === faceKey
                        ? "ring-4 ring-pink-500 ring-offset-2 scale-110 shadow-lg"
                        : "opacity-70 hover:opacity-100 grayscale hover:grayscale-0"
                    }`}
                  >
                    {/* 캐릭터 이미지 */}
                    <img
                      src={ASSETS[faceKey]}
                      alt={faceKey}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 이미지 로드 에러 시 대체 색상
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.style.backgroundColor =
                          faceKey === "face2"
                            ? "#4D90FE"
                            : faceKey === "face3"
                            ? "#82C900"
                            : "#FFCC00";
                      }}
                    />
                    {/* 선택됨 뱃지 */}
                    {selectedFace === faceKey && (
                      <div className="absolute inset-0 flex items-center justify-center bg-pink-500/20 font-bold text-white text-[1rem]">
                        SELECTED
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 게임 시작 버튼 */}
            <button
              onClick={initGame}
              className="pointer-events-auto w-full px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white text-xl font-bold transition transform hover:scale-105 active:scale-95"
            >
              START
            </button>
          </div>
        </div>
      )}

      {/* --- [화면 3] 게임 오버 화면 --- */}
      {gameState === "gameover" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white p-8 w-[20%] text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
              GAME OVER
            </h2>
            <div className="text-5xl font-black text-pink-500 mb-6">
              {finalScore}점
            </div>

            {/* 다시 하기 버튼 */}
            <button
              onClick={() => setGameState("start")}
              className="pointer-events-auto px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white text-xl font-bold rounded-full transition transform hover:scale-105 active:scale-95"
            >
              다시 선택하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
