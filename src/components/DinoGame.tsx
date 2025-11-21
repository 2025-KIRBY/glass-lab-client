import React, { useEffect, useRef, useState, useCallback } from "react";
import "./DinoGame.css";
// 경로가 맞는지 꼭 확인해주세요!
import { db } from "../../firebase";
import { serverTimestamp, setDoc, doc } from "firebase/firestore";

// --- 1. 인터페이스 및 클래스 정의 ---

interface GameObject {
  draw: (ctx: CanvasRenderingContext2D) => void;
  update: (gameSpeed: number) => void;
}

class Dino implements GameObject {
  w = 40;
  h = 40;
  x = 50;
  y: number;
  vy = 0;
  jumpForce = 13;
  gravity = 0.7;
  isGrounded = true;
  originalY: number;
  runFrame = 0;
  canvasHeight: number;

  constructor(canvasHeight: number) {
    this.canvasHeight = canvasHeight;
    this.y = canvasHeight - this.h - 10;
    this.originalY = canvasHeight - this.h - 10;
  }

  jump() {
    if (this.isGrounded) {
      this.vy = -this.jumpForce;
      this.isGrounded = false;
    }
  }

  update(_gameSpeed: number) {
    this.vy += this.gravity;
    this.y += this.vy;

    if (this.y > this.originalY) {
      this.y = this.originalY;
      this.vy = 0;
      this.isGrounded = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = "40px serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    if (this.isGrounded) {
      this.runFrame++;
      const bounce = Math.sin(this.runFrame * 0.2) * 2;
      ctx.fillText("🤓", this.x, this.y + bounce);
    } else {
      ctx.fillText("🤓", this.x, this.y);
    }
  }
}

class Cactus implements GameObject {
  w = 30;
  h = 40;
  x: number;
  y: number;
  markedForDeletion = false;
  type = "🌵";

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = canvasWidth;
    this.y = canvasHeight - this.h - 10;

    if (Math.random() > 0.8) {
      this.type = "🌵🌵";
      this.w = 50;
    }
  }

  update(gameSpeed: number) {
    this.x -= gameSpeed;
    if (this.x + this.w < 0) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = "35px serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(this.type, this.x, this.y);
  }
}

class Cloud implements GameObject {
  x: number;
  y: number;
  speed: number;
  size: number;
  markedForDeletion = false;

  constructor(canvasWidth: number, canvasHeight: number, gameSpeed: number) {
    this.x = canvasWidth;
    this.y = Math.random() * (canvasHeight / 2);
    this.speed = gameSpeed * 0.3;
    this.size = 30 + Math.random() * 20;
  }

  update(_gameSpeed: number) {
    this.x -= this.speed;
    if (this.x + 50 < 0) this.markedForDeletion = true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = `${this.size}px serif`;
    ctx.fillStyle = "#e0e0e0";
    ctx.fillText("☁️", this.x, this.y);
    ctx.fillStyle = "#000";
  }
}

// --- 2. 메인 컴포넌트 ---

const DinoGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  // 닉네임 및 저장 상태 관리
  const [nickname, setNickname] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isScoreSaved, setIsScoreSaved] = useState(false);

  // 렌더링에 관여하지 않는 게임 내부 상태 (Refs)
  const gameState = useRef({
    score: 0,
    gameSpeed: 5,
    isGameOver: false,
    isPlaying: false,
    frame: 0,
    obstacleTimer: 0,
    cloudTimer: 0,
    dino: null as Dino | null,
    obstacles: [] as Cactus[],
    clouds: [] as Cloud[],
    highScore: Number(localStorage.getItem("dinoHighScore")) || 0,
  });

  // UI 렌더링용 상태 (State)
  const [uiState, setUiState] = useState({
    score: 0,
    highScore: gameState.current.highScore,
    isGameOver: false,
    isPlaying: false,
  });

  // 게임 초기화
  const initGame = useCallback(() => {
    if (!canvasRef.current) return;
    const height = canvasRef.current.height;

    // 재시작 시 저장 상태 초기화
    setIsScoreSaved(false);
    setIsSaving(false);

    gameState.current = {
      ...gameState.current,
      score: 0,
      gameSpeed: 5,
      isGameOver: false,
      frame: 0,
      obstacleTimer: 0,
      dino: new Dino(height),
      obstacles: [],
      clouds: [],
    };

    setUiState((prev) => ({
      ...prev,
      score: 0,
      isGameOver: false,
      isPlaying: true,
    }));
  }, []);

  // 게임 오버 처리
  const handleGameOver = useCallback(() => {
    const state = gameState.current;
    state.isGameOver = true;
    cancelAnimationFrame(requestRef.current);

    if (state.score > state.highScore) {
      state.highScore = state.score;
      localStorage.setItem("dinoHighScore", state.highScore.toString());
    }

    setUiState((prev) => ({
      ...prev,
      isGameOver: true,
      highScore: state.highScore,
    }));
  }, []);

  // Firebase 기록 저장 함수
  const saveRecord = async () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요!");
      return;
    }
    if (isScoreSaved) return;

    setIsSaving(true);
    const finalScore = uiState.score;

    try {
      const newId = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 10)}`;

      await setDoc(doc(db, "dino", newId), {
        id: newId,
        name: nickname,
        score: finalScore,
        created_at: serverTimestamp(),
      });

      setIsScoreSaved(true);
      alert("기록이 성공적으로 저장되었습니다!");
    } catch (error) {
      console.error("Error saving score: ", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  // 애니메이션 루프
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const state = gameState.current;

    if (!canvas || !ctx || !state.dino) return;
    if (!state.isPlaying || state.isGameOver) return;

    requestRef.current = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. 프레임 및 속도 업데이트
    state.frame++;
    if (state.frame % 500 === 0) state.gameSpeed += 0.5;

    if (state.frame % 10 === 0) {
      state.score++;
      setUiState((prev) => ({ ...prev, score: state.score }));
    }

    // 2. 구름 업데이트
    state.cloudTimer++;
    if (state.cloudTimer > 100 + Math.random() * 100) {
      state.clouds.push(
        new Cloud(canvas.width, canvas.height, state.gameSpeed)
      );
      state.cloudTimer = 0;
    }
    state.clouds.forEach((cloud) => {
      cloud.update(state.gameSpeed);
      cloud.draw(ctx);
    });
    state.clouds = state.clouds.filter((c) => !c.markedForDeletion);

    // 3. 장애물 업데이트
    state.obstacleTimer++;
    if (state.obstacleTimer > Math.random() * 50 + 60 + 400 / state.gameSpeed) {
      state.obstacles.push(new Cactus(canvas.width, canvas.height));
      state.obstacleTimer = 0;
    }

    state.obstacles.forEach((obstacle) => {
      obstacle.update(state.gameSpeed);
      obstacle.draw(ctx);

      const dino = state.dino!;
      if (
        dino.x + 15 < obstacle.x + obstacle.w - 5 &&
        dino.x + dino.w - 15 > obstacle.x + 5 &&
        dino.y + 15 < obstacle.y + obstacle.h &&
        dino.y + dino.h > obstacle.y
      ) {
        handleGameOver();
      }
    });
    state.obstacles = state.obstacles.filter((o) => !o.markedForDeletion);

    // 4. 공룡 업데이트
    state.dino.update(state.gameSpeed);
    state.dino.draw(ctx);

    // 5. 바닥 그리기
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 10);
    ctx.lineTo(canvas.width, canvas.height - 10);
    ctx.strokeStyle = "#535353";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [handleGameOver]);

  // 입력 핸들러
  const handleInput = useCallback(
    (e?: KeyboardEvent | React.TouchEvent | React.MouseEvent) => {
      const state = gameState.current;

      // 키보드 이벤트인데 스페이스바가 아니면 무시
      if (e && "code" in e && e.code !== "Space") return;

      // ★ 중요: 닉네임 입력창에 포커스되어 있으면 게임 조작 방지 (스페이스바 입력 시)
      if (document.activeElement?.tagName === "INPUT") return;

      if (e && e.cancelable) e.preventDefault(); // 스크롤 방지

      if (!state.isPlaying) {
        state.isPlaying = true;
        initGame();
        requestRef.current = requestAnimationFrame(animate);
      } else if (state.isGameOver) {
        // 게임 오버 상태에서는 버튼 클릭으로만 동작하도록 함
      } else {
        state.dino?.jump();
      }
    },
    [animate, initGame]
  );

  // 재시작 버튼
  const handleRestart = () => {
    // 입력창 초기화 등을 원하면 여기서 setNickname("") 가능
    initGame();
    gameState.current.isPlaying = true;
    requestRef.current = requestAnimationFrame(animate);
  };

  // 라이프사이클 관리
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;

        if (!gameState.current.isPlaying) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
            ctx.beginPath();
            ctx.moveTo(0, canvasRef.current.height - 10);
            ctx.lineTo(canvasRef.current.width, canvasRef.current.height - 10);
            ctx.strokeStyle = "#535353";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.font = "40px serif";
            ctx.fillText("🤓", 50, canvasRef.current.height - 50);
          }
        }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleInput);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleInput);
      cancelAnimationFrame(requestRef.current);
    };
  }, [handleInput]);

  return (
    <div
      className="dino-game-container"
      ref={containerRef}
      onTouchStart={handleInput}
    >
      <canvas ref={canvasRef} className="dino-canvas  w-[80vw]" />

      <div className="ui-layer">
        <div className="score-board">
          HI {uiState.highScore.toString().padStart(5, "0")}{" "}
          {uiState.score.toString().padStart(5, "0")}
        </div>

        {!uiState.isPlaying && !uiState.isGameOver && (
          <div className="sub-message">PRESS SPACE or TAP TO START</div>
        )}

        {uiState.isGameOver && (
          <div className="game-over-panel">
            <div className="message">GAME OVER</div>
            <div style={{ fontSize: "14px", marginBottom: "10px" }}>
              SCORE: {uiState.score}
            </div>

            {/* 닉네임 입력 및 저장 영역 */}
            {!isScoreSaved ? (
              <>
                <input
                  type="text"
                  className="nickname-input"
                  placeholder="NICKNAME"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={10}
                />
                <button
                  className="save-btn"
                  onClick={saveRecord}
                  disabled={isSaving}
                >
                  {isSaving ? "SAVING..." : "RANKING 등록"}
                </button>
              </>
            ) : (
              <div style={{ color: "#04dd4d", fontSize: "12px" }}>
                ✓ 기록 저장됨
              </div>
            )}

            <button className="restart-btn" onClick={handleRestart}>
              다시 시작 (↺)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DinoGame;
