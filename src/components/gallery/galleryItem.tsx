import { useEffect, useState } from "react";

interface GalleryImageType {
  frame_id: number;
  id: string;
  image_url: string;
}

export default function GalleryItem({
  image,
  index,
}: {
  image: GalleryImageType;
  index: number;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  // 이미지가 로드되면 스켈레톤을 서서히 사라지게 하고,
  // 일정 시간 후 DOM에서 완전히 제거합니다.
  useEffect(() => {
    if (imgLoaded) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 500); // 0.5초 동안 fade out 후 제거 (transition 시간과 맞춰주세요)
      return () => clearTimeout(timer);
    }
  }, [imgLoaded]);

  return (
    <div key={index} className="w-full min-h-[15vw] pt-5 flex flex-col">
      <span className="label_17r text-text-gray500 font-[300]">
        #{index + 1}
      </span>
      <div className="relative">
        {showSkeleton && (
          <div
            className={`absolute inset-0 skeleton w-full aspect-square ${
              imgLoaded ? "fade-out" : ""
            }`}
          ></div>
        )}
        <img
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full object-contain transition-opacity duration-500 ease-in-out ${
            // duration을 0.5s로 늘림
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
          src={image.image_url}
          alt={`Generated image ${index + 1}`}
        />
      </div>
    </div>
  );
}
