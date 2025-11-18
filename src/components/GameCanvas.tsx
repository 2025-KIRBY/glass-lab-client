import React, { useEffect, useRef, useState, useCallback } from "react";

// --- 타입 정의 ---

// 플레이어 상태 인터페이스
interface PlayerState {
  x: number;
  y: number;
  size: number;
  speed: number;
  isWearing: boolean;
  wearTimer: number;
  wearingGlassKey: string;
  moveLeft: boolean;
  moveRight: boolean;
}

// 떨어지는 아이템(안경) 상태 인터페이스
interface ItemState {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  typeKey: string;
  rotation: number;
  rotationSpeed: number;
  markedForDeletion: boolean;
}

// 이미지 에셋 맵
const ASSETS: Record<string, string> = {
  face: "/face.png",
  glass1: "/gameglasses/1.png",
  glass2: "/gameglasses/2.png",
  glass3: "/gameglasses/3.png",
};

export default function GameCanvas() {
  // --- Refs (DOM 접근용) ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // --- Refs (게임 로직용) ---
  const requestRef = useRef<number | null>(null);
  const framesRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(3);
  const gameSpeedRef = useRef<number>(3);
  const spawnTimerRef = useRef<number>(0);

  // 이미지 객체 저장소 (key: 이미지이름, value: HTMLImageElement)
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

  // 게임 객체 Refs
  const playerRef = useRef<PlayerState>({
    x: 0,
    y: 0,
    size: 100,
    speed: 8,
    isWearing: false,
    wearTimer: 0,
    wearingGlassKey: "",
    moveLeft: false,
    moveRight: false,
  });

  const itemsRef = useRef<ItemState[]>([]);

  // --- State ---
  const [gameState, setGameState] = useState<
    "loading" | "start" | "playing" | "gameover"
  >("loading");
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [finalScore, setFinalScore] = useState<number>(0);

  // --- 이미지 프리로딩 ---
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

  // --- 게임 초기화 ---
  const initGame = useCallback(() => {
    if (!wrapperRef.current) return;
    const { clientWidth, clientHeight } = wrapperRef.current;

    scoreRef.current = 0;
    livesRef.current = 3;
    gameSpeedRef.current = 3;
    framesRef.current = 0;
    spawnTimerRef.current = 0;
    itemsRef.current = [];

    playerRef.current = {
      ...playerRef.current,
      x: clientWidth / 2 - 50,
      y: clientHeight - 120,
      isWearing: false,
      wearTimer: 0,
      moveLeft: false,
      moveRight: false,
    };

    setScore(0);
    setLives(3);
    setGameState("playing");
  }, []);

  // --- 메인 게임 루프 ---
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx || gameState !== "playing") return;

    // 1. 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const player = playerRef.current;
    const loadedImgs = imagesRef.current;

    // 2. 로직 업데이트
    framesRef.current++;
    if (framesRef.current % 600 === 0) gameSpeedRef.current += 0.5;

    spawnTimerRef.current++;
    let spawnRate = 60 - Math.floor(gameSpeedRef.current * 2);
    if (spawnRate < 20) spawnRate = 20;

    if (spawnTimerRef.current > spawnRate) {
      const size = 60;
      const glassKeys = ["glass1", "glass2", "glass3"];
      const randomKey = glassKeys[Math.floor(Math.random() * glassKeys.length)];

      itemsRef.current.push({
        id: Date.now() + Math.random(),
        size: size,
        x: Math.random() * (width - size),
        y: -size,
        speed: Math.random() * 2 + gameSpeedRef.current,
        typeKey: randomKey,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        markedForDeletion: false,
      });
      spawnTimerRef.current = 0;
    }

    // 플레이어 이동
    if (player.moveLeft) player.x -= player.speed;
    if (player.moveRight) player.x += player.speed;

    if (player.x < 0) player.x = 0;
    if (player.x + player.size > width) player.x = width - player.size;

    if (player.isWearing) {
      player.wearTimer--;
      if (player.wearTimer <= 0) {
        player.isWearing = false;
        player.wearingGlassKey = "";
      }
    }

    // 3. 그리기
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

    // 얼굴
    if (loadedImgs.face) {
      ctx.drawImage(
        loadedImgs.face,
        player.x,
        player.y,
        player.size,
        player.size
      );
    } else {
      ctx.fillStyle = "#FFCC00";
      ctx.beginPath();
      ctx.arc(
        player.x + player.size / 2,
        player.y + player.size / 2,
        player.size / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // 착용 안경
    if (player.isWearing && loadedImgs[player.wearingGlassKey]) {
      const glassImg = loadedImgs[player.wearingGlassKey];
      const gWidth = player.size;
      const gHeight = player.size / 2;
      const gX = player.x;
      const gY = player.y + player.size * 0.25;

      ctx.drawImage(glassImg, gX, gY, gWidth, gHeight);

      ctx.font = "bold 20px sans-serif";
      ctx.fillStyle = "#ff4757";
      ctx.fillText("NICE!", player.x + player.size, player.y);
    }

    // 아이템 루프
    itemsRef.current.forEach((item) => {
      item.y += item.speed;
      item.rotation += item.rotationSpeed;

      // 충돌 감지
      const dx = player.x + player.size / 2 - (item.x + item.size / 2);
      const dy = player.y + player.size / 2 - (item.y + item.size / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < player.size / 2 && !item.markedForDeletion) {
        item.markedForDeletion = true;
        scoreRef.current += 10;
        setScore(scoreRef.current);

        player.isWearing = true;
        player.wearingGlassKey = item.typeKey;
        player.wearTimer = 40;
      }

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

      if (!item.markedForDeletion && loadedImgs[item.typeKey]) {
        ctx.save();
        ctx.translate(item.x + item.size / 2, item.y + item.size / 2);
        ctx.rotate(item.rotation);
        ctx.drawImage(
          loadedImgs[item.typeKey],
          -item.size / 2,
          -item.size / 2,
          item.size,
          item.size / 2
        );
        ctx.restore();
      }
    });

    itemsRef.current = itemsRef.current.filter((i) => !i.markedForDeletion);

    if (livesRef.current > 0) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [gameState]);

  // --- 이벤트 리스너 ---
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

  // 입력 핸들러 (타입 명시)
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
    // Window 이벤트 리스너는 네이티브 이벤트를 사용하므로 타입 호환됨
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  return (
    <div
      ref={wrapperRef}
      className="relative w-[50vw] h-[50vh] overflow-hidden bg-blue-50 select-none"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full touch-none"
        // React 이벤트 핸들러 타입은 자동 추론되거나 명시할 수 있음
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

      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
        <div className="flex justify-between items-start text-2xl font-bold text-slate-800 drop-shadow-md">
          <div>SCORE: {score}</div>
          <div className="text-red-500">
            {"❤️".repeat(lives)}
            {"🤍".repeat(3 - lives)}
          </div>
        </div>
        <div className="text-center text-slate-500 text-sm opacity-70 mb-2">
          마우스나 터치로 얼굴을 움직여 안경을 받으세요!
        </div>
      </div>

      {gameState === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
          <div className="text-xl font-bold animate-pulse text-slate-600">
            이미지 로딩 중...
          </div>
        </div>
      )}

      {gameState === "start" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-40">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center animate-bounce-in">
            <h1 className="text-4xl font-black text-indigo-600 mb-2">
              안경 받기 게임
            </h1>
            <p className="text-gray-500 mb-6">
              좌우로 움직여 떨어지는 안경을 착용해보세요!
            </p>
            <button
              onClick={initGame}
              className="pointer-events-auto px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-xl font-bold rounded-full shadow-lg transition transform hover:scale-105 active:scale-95"
            >
              게임 시작
            </button>
          </div>
        </div>
      )}

      {gameState === "gameover" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              GAME OVER
            </h2>
            <div className="text-5xl font-black text-indigo-500 mb-6">
              {finalScore}점
            </div>
            <button
              onClick={initGame}
              className="pointer-events-auto px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white text-xl font-bold rounded-full shadow-lg transition transform hover:scale-105 active:scale-95"
            >
              다시 도전하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
