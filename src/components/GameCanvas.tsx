import React, { useEffect, useRef, useState, useCallback } from "react";
import { db } from "../../firebase";

// ▼▼▼ [1] Firebase 관련 임포트 및 설정 (이 부분을 본인의 설정으로 채워주세요) ▼▼▼
// npm install firebase 명령어로 설치가 필요합니다.
import { serverTimestamp, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  // 여기에 Firebase 콘솔에서 복사한 설정값을 넣으세요.
  // apiKey: "...",
  // authDomain: "...",
  // projectId: "...",
  // ...
};

// 앱 초기화 (설정이 비어있으면 에러가 날 수 있으니 try-catch로 감싸거나 설정을 꼭 채워주세요)
// ▲▲▲ Firebase 설정 끝 ▲▲▲

// ==================================================================================
// [2] 타입 정의 및 에셋 설정
// ==================================================================================

interface PlayerState {
  x: number;
  y: number;
  size: number;
  speed: number;
  isWearing: boolean;
  wearTimer: number;
  wearingGlassKey: string;
  faceKey: string;
  moveLeft: boolean;
  moveRight: boolean;
}

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
  // [3] Refs & State
  // ==================================================================================

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  const framesRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(MAX_LIVES);
  const gameSpeedRef = useRef<number>(3);
  const spawnTimerRef = useRef<number>(0);

  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

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

  const itemsRef = useRef<ItemState[]>([]);

  const [gameState, setGameState] = useState<
    "loading" | "start" | "playing" | "gameover"
  >("loading");
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [selectedFace, setSelectedFace] = useState<string>("face1");

  // ▼▼▼ [추가] 점수 저장용 State ▼▼▼
  const [nickname, setNickname] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveComplete, setSaveComplete] = useState<boolean>(false);

  // ==================================================================================
  // [4] 이미지 프리로딩
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
  // [5] 게임 로직
  // ==================================================================================

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
      faceKey: selectedFace,
      moveLeft: false,
      moveRight: false,
    };

    // 게임 시작 시 저장 관련 상태 초기화
    setNickname("");
    setSaveComplete(false);
    setIsSaving(false);

    setScore(0);
    setLives(MAX_LIVES);
    setGameState("playing");
  }, [selectedFace]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx || gameState !== "playing") return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const player = playerRef.current;
    const loadedImgs = imagesRef.current;

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

    framesRef.current++;
    if (framesRef.current % 600 === 0) gameSpeedRef.current += 0.1;

    spawnTimerRef.current++;
    let spawnRate = 60 - Math.floor(gameSpeedRef.current * 2);
    if (spawnRate < 20) spawnRate = 20;

    if (spawnTimerRef.current > spawnRate) {
      const size = 100;
      const glassKeys = ["glass1", "glass2", "glass3", "glass4"];
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

    const faceImg = loadedImgs[player.faceKey];
    const faceDrawn = drawSafeImage(
      faceImg,
      player.x,
      player.y,
      player.size,
      player.size
    );

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

    if (player.isWearing) {
      const glassImg = loadedImgs[player.wearingGlassKey];
      const gWidth = player.size;
      const gHeight = player.size / 2;
      const gX = player.x;
      const gY = player.y + player.size * 0.21;

      const glassDrawn = drawSafeImage(glassImg, gX, gY, gWidth, gHeight);

      if (!glassDrawn) {
        ctx.fillStyle = "black";
        ctx.fillRect(gX + 10, gY + 10, 30, 20);
        ctx.fillRect(gX + gWidth - 40, gY + 10, 30, 20);
        ctx.fillRect(gX + 30, gY + 15, gWidth - 60, 5);
      }

      ctx.font = "bold 20px sans-serif";
      ctx.fillStyle = "#f472b6";
      ctx.letterSpacing = "-2px";
      ctx.fillText("NICE!", player.x + player.size, player.y);
      ctx.letterSpacing = "0px";
    }

    itemsRef.current.forEach((item) => {
      item.y += item.speed;
      item.rotation += item.rotationSpeed;

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

    itemsRef.current = itemsRef.current.filter((i) => !i.markedForDeletion);

    if (livesRef.current > 0) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [gameState]);

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

  // ▼▼▼ [추가] 점수 저장 핸들러 함수 ▼▼▼
  const handleSaveScore = async () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요!");
      return;
    }

    setIsSaving(true);
    try {
      // Firestore document id — 원하는 string으로 생성
      const newId = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 10)}`;
      // /score 컬렉션에 저장
      await setDoc(doc(db, "score", newId), {
        id: newId,
        name: nickname,
        score: finalScore,
        created_at: serverTimestamp(),
      });
      setSaveComplete(true);
    } catch (error) {
      console.error("Error adding score: ", error);
      alert("점수 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // ==================================================================================
  // [6] UI 렌더링
  // ==================================================================================
  return (
    <div
      ref={wrapperRef}
      className="bg-[url(/sky.png)] relative w-[50vw] h-[50vh] overflow-hidden select-none rounded-xl border border-slate-200"
    >
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

      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
        <div className="flex justify-between items-start text-2xl font-bold text-slate-800 drop-shadow-md">
          <div className="text-white">SCORE: {score}</div>
          <div className="text-red-500">
            {"♥️".repeat(lives)}
            {"🩶".repeat(MAX_LIVES - lives)}
          </div>
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
        <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-40">
          <div className=" bg-[##3E8892] p-8 text-center animate-bounce-in max-w-[50%] h-[80%] w-full flex items-center flex-col justify-between">
            <h1 className="font-inria-sans text-[3rem] font-[600] text-white mb-2 tracking-tight">
              Grab the Glasses!
            </h1>
            <div>
              <p className="font-inria-sans text-gray-200 mb-10 text-[1.4rem]">
                캐릭터를 선택하고 시작하세요!
              </p>
              <div className="flex justify-center gap-4 mb-6 pointer-events-auto">
                {["face1", "face2", "face3"].map((faceKey) => (
                  <button
                    key={faceKey}
                    onClick={() => setSelectedFace(faceKey)}
                    className={`cursor-pointer relative w-40 h-40 rounded-full overflow-hidden transition-all transform hover:scale-110 ${
                      selectedFace === faceKey
                        ? "ring-4 ring-pink-500 ring-offset-2 scale-110 shadow-lg"
                        : "opacity-70 hover:opacity-100 grayscale hover:grayscale-0"
                    }`}
                  >
                    <img
                      src={ASSETS[faceKey]}
                      alt={faceKey}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.style.backgroundColor =
                          faceKey === "face2"
                            ? "#4D90FE"
                            : faceKey === "face3"
                            ? "#82C900"
                            : "#FFCC00";
                      }}
                    />
                    {selectedFace === faceKey && (
                      <div className="absolute inset-0 flex items-center justify-center bg-pink-500/20 font-bold text-white text-[1rem]">
                        SELECTED
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={initGame}
              className="pointer-events-auto w-full px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white text-xl font-bold transition transform hover:scale-105 active:scale-95"
            >
              START
            </button>
          </div>
        </div>
      )}

      {/* --- [화면 3] 게임 오버 화면 (수정됨: 저장 기능 추가) --- */}
      {gameState === "gameover" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          {/* w-[20%]가 너무 좁아서 입력창이 깨질 수 있어 w-[30%] min-w-[300px] 등으로 살짝 넓힘 */}
          <div className="bg-white p-8 w-[30%] min-w-[300px] shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
              GAME OVER
            </h2>
            <div className="text-5xl font-black text-pink-500 mb-6">
              {finalScore}점
            </div>

            {/* ▼▼▼ 점수 저장 폼 영역 ▼▼▼ */}
            <div className="mb-6 pointer-events-auto">
              {!saveComplete ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="닉네임을 입력하세요"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={10}
                    className="text-[1.2rem] w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-pink-500 text-center font-bold text-slate-700"
                  />
                  <button
                    onClick={handleSaveScore}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {isSaving ? "저장 중..." : "랭킹에 점수 저장"}
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-green-100 text-green-700 font-bold rounded-lg">
                  저장되었습니다
                </div>
              )}
            </div>
            {/* ▲▲▲ 점수 저장 폼 영역 끝 ▲▲▲ */}

            <button
              onClick={() => setGameState("start")}
              className="pointer-events-auto w-full px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white text-xl font-bold rounded-full transition transform hover:scale-105 active:scale-95"
            >
              {saveComplete ? "다시 하기" : "저장 안 하고 다시 하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
