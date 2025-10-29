import { useEffect, useState } from "react";

const getRadiusByWidth = (width: number) => {
  if (width >= 1960) {
    return 40;
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

export default function StepThreePage() {
  const letters = ["A", "B", "C", "D", "E", "F"];
  const itemCount = 6;
  const [radiusRem, setRadiusRem] = useState(25);

  useEffect(() => {
    const handleResize = () => {
      setRadiusRem(getRadiusByWidth(window.innerWidth));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-screen flex flex-col justify-center items-center gap-4">
      <div
        style={{
          transform: `translate(${-(radiusRem * 25)}px, ${-(
            radiusRem * 12
          )}px)`,
        }}
        className={`absolute top-1/2 left-1/2 flex flex-col justify-center items-start gap-1`}
      >
        <h1 className="heading_20b">STEP 3. Choose One Favorite Result</h1>
        <h2 className="label_14l">
          생성된 결과 중 가장 마음에 드는 하나를 골라주세요 .
        </h2>
      </div>

      {Array.from({ length: itemCount }).map((_, index) => {
        const angleDeg = (360 / itemCount) * index;
        const xPos = `calc(-50% + ${radiusRem}rem * cos(${angleDeg}deg))`;
        const yPos = `calc(-50% + ${radiusRem}rem * sin(${angleDeg}deg))`;

        return (
          <div
            key={index}
            style={{
              translate: `${xPos} ${yPos}`,
            }}
            className="group cursor-pointer absolute top-1/2 left-1/2 w-[18rem] h-[18rem]"
          >
            <div className=" opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out absolute w-full h-full inset-0 radial-gradient"></div>
            <div className="z-10 absolute top-2 left-2 w-[4rem] h-[4rem] rounded-full bg-white flex justify-center items-center font-700 text-text-black border-1 border-text-black font-[2.4rem]">
              <span>{letters[index]}</span>
            </div>
            <img
              className="z-0 object-cover absolute inset-0 w-full h-full"
              src={`/output.png`}
              alt={`result-${index}`}
            />
          </div>
        );
      })}

      <button className="absolute top-1/2 left-1/2 -translate-x-1/2 cursor-pointer label_17m w-[25rem] h-[4.5rem] border-1 border-text-gray button-shadow [background:var(--gradient-button)] active:[box-shadow:none] active:translate-y-2">
        Next Step
      </button>
    </div>
  );
}
