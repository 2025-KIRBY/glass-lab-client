import { collection, query, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";

interface FrameImageType {
  thumb_url: string;
  image_urls: string[];
}

export default function StepTwoPage() {
  const [frameThumbImages, setFrameThumbImages] = useState<FrameImageType[]>(
    []
  );

  useEffect(() => {
    const fetchGuideImages = async () => {
      const q = query(collection(db, "frame_image"));
      const querySnapshot = await getDocs(q);
      const imageData = querySnapshot.docs.map((doc) => doc.data());
      setFrameThumbImages(imageData as FrameImageType[]);
    };

    fetchGuideImages();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-4">
      <div className="w-full flex flex-col justify-center items-start gap-1 px-[20%] mb-[5rem]">
        <h1 className="heading_20b">STEP 2. Choose your Frame</h1>
        <h2 className="label_14l">
          참고하고 싶은 안경 프레임을 선택해 주세요 .
        </h2>
      </div>
      <div className="mb-20 max-w-[1100px] flex flex-wrap justify-start items-center gap-[4.7rem]">
        {frameThumbImages.map((image, index) => (
          <div
            className="active:scale-95 group cursor-pointer hover:border-border-pink hover:border-1 relative w-[14rem] h-[14rem] border-border-gray border-1 basic-shadow"
            key={index}
          >
            <div className="z-1 group-hover:opacity-100 opacity-0 transition-all duration-300 ease-out absolute w-full h-full inset-0 [background:var(--gradient-main)]"></div>
            <img
              className="z-3 object-cover absolute inset-0 w-full h-full"
              src={image.thumb_url}
              alt={`guide-${index}`}
            />
          </div>
        ))}
      </div>
      <button className="cursor-pointer label_17m w-[25rem] h-[4.5rem] border-1 border-text-gray button-shadow [background:var(--gradient-button)] active:[box-shadow:none] active:translate-y-2">
        Next Step
      </button>
    </div>
  );
}
