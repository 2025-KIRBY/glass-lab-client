import { ImageIcon, TrashIcon } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useStep } from "../context/StepContext";

interface GuideImageType {
  thumb_url: string;
  second_url: string;
  id: number;
}

export default function StepOnePage() {
  // const [, setSearchParams] = useSearchParams();
  const [guideImages, setGuideImages] = useState<GuideImageType[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<number | null>(null);

  const { setConceptImages, setCurrentStep } = useStep();

  useEffect(() => {
    const fetchGuideImages = async () => {
      const q = query(collection(db, "guide_image"));
      const querySnapshot = await getDocs(q);

      const imageData = querySnapshot.docs.map((doc) => doc.data());
      setGuideImages(imageData as GuideImageType[]);
    };

    fetchGuideImages();
  }, []);

  useEffect(() => {
    if (files.length > 0) {
      setSelectedGuide(null);
    }

    const objectUrls = files.map((file) => URL.createObjectURL(file));
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = event.target.files;
    if (!filesList) return;
    const selectedFiles = Array.from(filesList);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleFileRemove = (
    event: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    event.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedGuide !== null) {
      try {
        const selectedImage = guideImages.find(
          (img) => img.id === selectedGuide
        );
        if (!selectedImage) {
          alert("선택된 가이드 이미지를 찾을 수 없습니다.");
          return;
        }

        // 2. URL을 File 객체로 변환하는 헬퍼 함수
        const urlToFile = async (
          url: string,
          filename: string
        ): Promise<File> => {
          const response = await fetch(url); // 이미지 URL로 fetch 요청
          const blob = await response.blob(); // 응답을 Blob으로 변환
          return new File([blob], filename, { type: blob.type }); // Blob으로 File 객체 생성
        };

        // 3. 썸네일과 세컨드 이미지를 병렬로 fetch하여 File 객체로 변환
        const [thumbFile, secondFile] = await Promise.all([
          urlToFile(
            selectedImage.thumb_url,
            `guide_thumb_${selectedImage.id}.jpg`
          ),
          urlToFile(
            selectedImage.second_url,
            `guide_second_${selectedImage.id}.jpg`
          ),
        ]);

        // 4. File 객체 2개를 FileList로 만들기 (DataTransfer 객체 활용)
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(thumbFile);
        dataTransfer.items.add(secondFile);

        // 5. Context에 FileList 설정
        setConceptImages(dataTransfer.files);
      } catch (error) {
        console.error("Error converting guide images:", error);
        alert("가이드 이미지를 처리하는 중 오류가 발생했습니다.");
        return; // 오류 발생 시 중단
      }
    } else {
      // --- B. 사용자가 직접 이미지를 업로드한 경우 (기존 로직) ---
      if (files.length < 2) {
        alert("취향 이미지를 두 개 이상 선택해주세요.");
        return;
      }
      if (files.length > 5) {
        alert("취향 이미지를 다섯 개 이하로 선택해주세요.");
        return;
      }

      // (개선) File[]을 FileList로 변환하는 더 표준적인 방법
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));

      setConceptImages(dataTransfer.files);
    }

    setCurrentStep(2);
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-4">
      <div className="w-full flex flex-col justify-center items-start gap-1 px-[20%]">
        <h1 className="heading_20b">STEP 1. What's your Mood?</h1>
        <h2 className="label_14l">취향의 이미지를 두 개 이상 넣어주세요 .</h2>
      </div>
      <div className="min-w-[60vw] max-w-[90vw] flex flex-col justify-center items-start gap-4">
        <input
          ref={inputRef}
          accept="image/jpeg, image/png"
          multiple
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          onClick={() => inputRef.current?.click()}
          className="hover: transition-border duration-300 cursor-pointer min-w-full max-w-[90vh] min-h-[25vh] border-dashed border-1 border-border-gray rounded-md p-4 mt-4 flex justify-center items-center"
        >
          {files.length === 0 ? (
            <div className="flex flex-col justify-center items-center gap-2">
              <ImageIcon size={32} color="#8f8b8b" weight="light" />
              <span className="text-text-gray">Click to upload</span>
            </div>
          ) : (
            <AnimatePresence>
              <div className="custom-scrollbar w-full max-h-[20vh] flex flex-wrap gap-2 overflow-y-auto">
                {files.map((file, index) => (
                  <motion.div
                    layout
                    className="relative"
                    key={`${file.name}-${file.lastModified}`}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`upload-${index}`}
                      className="w-auto h-[20vh] object-cover rounded-[1rem]"
                    />
                    <div
                      onClick={(event) => handleFileRemove(event, index)}
                      className="group hover:bg-main active:scale-[0.95] absolute top-2 right-2 bg-[#41403C] rounded-full p-3 cursor-pointer"
                    >
                      <TrashIcon
                        size={21}
                        color="#fff"
                        className="group-hover:fill-text-black"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
      <h2 className="label_14l mt-[3rem] mb-[2rem]">
        생각나는 이미지가 없다면 가이드 이미지를 선택해 보세요 .
      </h2>
      <div className="mb-20 max-w-[1100px] flex flex-wrap justify-start items-center gap-4">
        {guideImages.map((image, index) => (
          <button
            onClick={() => setSelectedGuide(image.id)}
            disabled={files.length > 0}
            className={`group transition-all duration-300 ease-out relative w-[18rem] h-[18rem] border-border-gray border-1 basic-shadow ${
              files.length > 0
                ? "grayscale-100 opacity-50 cursor-not-allowed"
                : "hover:border-border-pink active:scale-95 cursor-pointer"
            }`}
            key={index}
          >
            <img
              className="object-cover w-full h-full"
              src={image.thumb_url}
              alt={`guide-${index}`}
            />
            {selectedGuide === image.id ? (
              <div
                className={`absolute w-full h-full inset-0 [background:var(--gradient-main)] ${
                  files.length > 0 ? "" : "group-hover:opacity-100"
                }`}
              ></div>
            ) : (
              <div
                className={`opacity-0 transition-all duration-300 ease-out absolute w-full h-full inset-0 [background:var(--gradient-main)] ${
                  files.length > 0 ? "" : "group-hover:opacity-100"
                }`}
              ></div>
            )}
          </button>
        ))}
      </div>
      <button
        // disabled={
        //   files.length < 2 || files.length > 5 || selectedGuide === null
        // }
        onClick={handleSubmit}
        className={`transition-all duration-300 ease-out label_17m w-[25rem] h-[4.5rem] border-1 border-text-gray button-shadow [background:var(--gradient-button)] ${
          (files.length >= 2 && files.length <= 5) || selectedGuide !== null
            ? "cursor-pointer active:[box-shadow:none] active:translate-y-1"
            : "grayscale-100 opacity-50 cursor-not-allowed"
        }`}
      >
        Next Step
      </button>
    </div>
  );
}
