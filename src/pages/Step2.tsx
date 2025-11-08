import { collection, query, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { useStep } from "../context/StepContext";

interface FrameImageType {
  thumb_url: string;
  png_url: string;
  image_urls: string[];
  id: number;
}

export default function StepTwoPage() {
  const [frameThumbImages, setFrameThumbImages] = useState<FrameImageType[]>(
    []
  );
  const { setCurrentStep, conceptImages, setConditionImages, setInitImage } =
    useStep();
  const [selectedCondition, setSelectedCondition] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!conceptImages) {
      setCurrentStep(1);
      return;
    }
    const fetchGuideImages = async () => {
      const q = query(collection(db, "frame_image"));
      const querySnapshot = await getDocs(q);
      const imageData = querySnapshot.docs.map((doc) => doc.data());
      setFrameThumbImages(imageData as FrameImageType[]);
    };

    fetchGuideImages();
  }, []);

  const handleConditionSelect = (id: number) => {
    setSelectedCondition(id);
  };

  const handleSubmit = async () => {
    if (selectedCondition === null) {
      alert("프레임 이미지를 선택해 주세요.");
      return;
    }
    try {
      const urlToFile = async (
        url: string,
        filename: string
      ): Promise<File> => {
        const response = await fetch(url); // 이미지 URL로 fetch 요청
        const blob = await response.blob(); // 응답을 Blob으로 변환
        return new File([blob], filename, { type: blob.type }); // Blob으로 File 객체 생성
      };

      const selectedImage = frameThumbImages.find(
        (image) => image.id === selectedCondition
      );
      if (!selectedImage) {
        alert("선택된 프레임 이미지를 찾을 수 없습니다.");
        return;
      }

      const ConditionFileArray = await Promise.all(
        selectedImage.image_urls.map((url) => {
          const filename = `condition_image_${selectedImage.id}.jpg`;
          return urlToFile(url, filename);
        })
      );

      const BaseImage = await urlToFile(
        selectedImage.thumb_url,
        "base_image.png"
      );

      // 4. File 객체를 FileList로 만들기 (DataTransfer 객체 활용)
      const dataTransfer = new DataTransfer();
      ConditionFileArray.forEach((file) => dataTransfer.items.add(file));

      // 5. Context에 FileList 설정
      setConditionImages(dataTransfer.files);
      setInitImage(BaseImage);
    } catch (error) {
      console.error("Error converting condition images:", error);
      alert("CONDITION 이미지를 처리하는 중 오류가 발생했습니다.");
      return;
    }

    setCurrentStep(2.5);
  };

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
            onClick={() => handleConditionSelect(image.id)}
          >
            <div
              className={`z-1 group-hover:opacity-100 opacity-0 transition-all duration-300 ease-out absolute w-full h-full inset-0 [background:var(--gradient-main)] ${
                selectedCondition === image.id ? "opacity-100" : ""
              }`}
            ></div>
            <img
              className="cursor-pointer z-3 object-cover absolute inset-0 w-full h-full"
              src={image.png_url}
              alt={`guide-${index}`}
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="cursor-pointer label_17m w-[25rem] h-[4.5rem] border-1 border-text-gray button-shadow [background:var(--gradient-button)] active:[box-shadow:none] active:translate-y-1"
      >
        Next Step
      </button>
    </div>
  );
}
