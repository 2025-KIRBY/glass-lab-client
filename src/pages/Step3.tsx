import { useEffect, useState } from "react";
import { useStep } from "../context/StepContext";

const getRadiusByWidth = (width: number) => {
  if (width >= 1960) {
    return 50;
  } else if (width >= 1024) {
    // 1024px 이상 (데스크탑)
    return 25;
  } else if (width >= 768) {
    // 768px ~ 1023px (태블릿)
    return 20;
  } else {
    // 768px 미만 (모바일)
    return 15;
  }
};

const getWidthByWidth = (width: number) => {
  if (width >= 1960) {
    return 35;
  } else if (width >= 1024) {
    // 1024px 이상 (데스크탑)
    return 18;
  } else if (width >= 768) {
    // 768px ~ 1023px (태블릿)
    return 18;
  } else {
    // 768px 미만 (모바일)
    return 12;
  }
};

const dummy = [
  "/glasses2.png",
  "/glasses2.png",
  "/glasses2.png",
  "/glasses2.png",
  "/glasses2.png",
  "/glasses2.png",
];

export default function StepThreePage() {
  const letters = ["C", "D", "E", "F", "A", "B"];
  const itemCount = 6;
  const [radiusRem, setRadiusRem] = useState(25);
  const [widthRem, setWidthRem] = useState(25);
  const [urls, setUrls] = useState<string[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<number | null>(null);

  const { setCurrentStep, previewImageFiles, setSelectedImageFile } = useStep();

  useEffect(() => {
    // 1. previewImageFiles가 File[] 배열인지 확인
    if (previewImageFiles.length === 0) {
      return; // 배열이 비어있으면 아무것도 안 함
    }

    const urls: string[] = [];
    // 2. File 배열을 순회 (Object.entries가 필요 없음)
    for (const file of previewImageFiles) {
      // 3. File 객체로부터 바로 URL 생성 (async/await 필요 없음)
      const url = URL.createObjectURL(file);
      urls.push(url);
    }

    setUrls(urls);

    // 💡 중요: 메모리 누수를 방지하기 위해
    //    컴포넌트가 언마운트될 때 생성된 URL들을 해제(revoke)해야 합니다.
    return () => {
      console.log("🧹 URL 해제 중...");
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImageFiles]);

  useEffect(() => {
    const handleResize = () => {
      setRadiusRem(getRadiusByWidth(window.innerWidth));
      setWidthRem(getWidthByWidth(window.innerWidth));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSubmit = () => {
    if (!selectedUrl) {
      console.error("❌ 파일이 선택되지 않았습니다.");
      return;
    }
    setSelectedImageFile(previewImageFiles[Number(selectedUrl) - 1]);
    setCurrentStep(4);
  };

  return (
    <div className="relative w-full h-screen flex flex-col justify-center items-center gap-4">
      <div
        style={{
          transform: `translate(${-(radiusRem * 25)}px, ${-(
            radiusRem * 12
          )}px)`,
        }}
        className={`w-[30rem] absolute top-1/2 left-1/2 flex flex-col justify-center items-start gap-1`}
      >
        <h1 className="heading_20b">STEP 3. Choose One Favorite Result</h1>
        <h2 className="label_14l">
          생성된 결과 중 가장 마음에 드는 하나를 골라주세요 .
        </h2>
      </div>

      {urls.map((url, index) => {
        const angleDeg = (360 / itemCount) * index;
        const xPos = `calc(-50% + ${radiusRem}rem * cos(${angleDeg}deg))`;
        const yPos = `calc(-50% + ${radiusRem}rem * sin(${angleDeg}deg))`;

        return (
          <div
            onClick={() => setSelectedUrl(Number(index + 1))}
            key={index}
            style={{
              translate: `${xPos} ${yPos}`,
              width: `${widthRem}rem`,
              height: `${widthRem}rem`,
            }}
            className={`group cursor-pointer absolute top-1/2 left-1/2`}
          >
            <div
              className={`opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out absolute w-[150%] h-[150%] top-[-20%] left-[-30%] radial-gradient ${
                selectedUrl === index + 1 ? "opacity-100" : ""
              }`}
            ></div>
            <div
              className={`z-10 absolute top-8 left-8 w-[3.5rem] h-[3.5rem] rounded-full bg-white flex justify-center items-center text-text-black border-1 border-text-black group-hover:[background:var(--gradient-main)] ${
                selectedUrl === index + 1
                  ? "[background:var(--gradient-noop)]"
                  : ""
              }`}
            >
              <span className="text-[2rem] font-bold h-[2.9rem]">
                {letters[index]}
              </span>
            </div>
            <img
              className="z-0 object-cover absolute inset-0 w-full h-full"
              src={url}
              alt={`result-${index}`}
            />
          </div>
        );
      })}

      <button
        onClick={handleSubmit}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-10 cursor-pointer label_17m text-[1.8rem] w-[25rem] h-[4.5rem] border-1 border-text-gray button-shadow [background:var(--gradient-button)] active:[box-shadow:none] active:-translate-y-9"
      >
        Next Step
      </button>
    </div>
  );
}
