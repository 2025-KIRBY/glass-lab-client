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

// --- 스켈레톤 로딩이 적용된 사용자 업로드 이미지 아이템 ---
function UserImageItem({
  file,
  index,
  onRemove,
}: {
  file: File;
  index: number;
  onRemove: (event: React.MouseEvent<HTMLDivElement>, index: number) => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (imgLoaded) {
      // 이미지가 로드되면 0.5초 후 스켈레톤을 DOM에서 제거
      const timer = setTimeout(() => setShowSkeleton(false), 500);
      return () => clearTimeout(timer);
    }
  }, [imgLoaded]);

  return (
    <motion.div
      layout
      className="relative"
      key={`${file.name}-${file.lastModified}`}
    >
      {showSkeleton && (
        <div
          className={`absolute inset-0 w-auto h-[20vh] rounded-[1rem] bg-gray-200 ${
            // 이미지와 동일한 크기/스타일
            imgLoaded ? "opacity-0" : "opacity-100"
          } transition-opacity duration-500 ease-in-out`}
        ></div>
      )}
      <img
        src={URL.createObjectURL(file)} // 기존 로직과 동일하게 유지
        alt={`upload-${index}`}
        className={`w-auto h-[20vh] object-cover rounded-[1rem] ${
          // 기존 클래스
          imgLoaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-500 ease-in-out`}
        onLoad={() => setImgLoaded(true)}
        loading="lazy"
      />
      <div
        onClick={(event) => onRemove(event, index)}
        className="group hover:bg-main active:scale-[0.95] absolute top-2 right-2 bg-[#41403C] rounded-full p-3 cursor-pointer"
      >
        <TrashIcon
          size={21}
          color="#fff"
          className="group-hover:fill-text-black"
        />
      </div>
    </motion.div>
  );
}

// --- 스켈레톤 로딩이 적용된 가이드 이미지 아이템 ---
function GuideImageItem({
  image,
  index,
  selectedGuide,
  filesLength,
  onSelect,
}: {
  image: GuideImageType;
  index: number;
  selectedGuide: number | null;
  filesLength: number;
  onSelect: (id: number) => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (imgLoaded) {
      // 이미지가 로드되면 0.5초 후 스켈레톤을 DOM에서 제거
      const timer = setTimeout(() => setShowSkeleton(false), 500);
      return () => clearTimeout(timer);
    }
  }, [imgLoaded]);

  return (
    <button
      onClick={() => onSelect(image.id)}
      disabled={filesLength > 0}
      className={`flex-shrink-0 group transition-all duration-300 ease-out relative w-[18rem] h-[18rem] border-border-gray border-1 basic-shadow ${
        // 기존 클래스
        filesLength > 0
          ? "grayscale-100 opacity-50 cursor-not-allowed"
          : "hover:border-border-pink active:scale-95 cursor-pointer"
      }`}
      key={index}
    >
      {showSkeleton && (
        <div
          className={`absolute inset-0 object-cover w-full h-full bg-gray-200 ${
            // 이미지와 동일한 크기/스타일
            imgLoaded ? "opacity-0" : "opacity-100"
          } transition-opacity duration-500 ease-in-out`}
        ></div>
      )}
      <img
        className={`object-cover w-full h-full ${
          // 기존 클래스
          imgLoaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-500 ease-in-out`}
        src={image.thumb_url}
        alt={`guide-${index}`}
        onLoad={() => setImgLoaded(true)}
        loading="lazy"
      />
      {selectedGuide === image.id ? (
        <div
          className={`absolute w-full h-full inset-0 [background:var(--gradient-main)] ${
            filesLength > 0 ? "" : "group-hover:opacity-100"
          }`}
        ></div>
      ) : (
        <div
          className={`opacity-0 transition-all duration-300 ease-out absolute w-full h-full inset-0 [background:var(--gradient-main)] ${
            filesLength > 0 ? "" : "group-hover:opacity-100"
          }`}
        ></div>
      )}
    </button>
  );
}

// --- 기존 StepOnePage 컴포넌트 ---
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

  // ★★★ 기존 로직 (절대 변경 안 함) ★★★
  useEffect(() => {
    if (files.length > 0) {
      setSelectedGuide(null);
    }

    const objectUrls = files.map((file) => URL.createObjectURL(file));
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  // ★★★ 기존 로직 (절대 변경 안 함) ★★★
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = event.target.files;
    if (!filesList) return;
    const selectedFiles = Array.from(filesList);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  // ★★★ 기존 로직 (절대 변경 안 함) ★★★
  const handleFileRemove = (
    event: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    event.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // ★★★ 기존 로직 (절대 변경 안 함) ★★★
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

        const urlToFile = async (
          url: string,
          filename: string
        ): Promise<File> => {
          const response = await fetch(url);
          const blob = await response.blob();
          return new File([blob], filename, { type: blob.type });
        };

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

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(thumbFile);
        dataTransfer.items.add(secondFile);

        setConceptImages(dataTransfer.files);
      } catch (error) {
        console.error("Error converting guide images:", error);
        alert("가이드 이미지를 처리하는 중 오류가 발생했습니다.");
        return;
      }
    } else {
      if (files.length < 2) {
        alert("취향 이미지를 두 개 이상 선택해주세요.");
        return;
      }
      if (files.length > 5) {
        alert("취향 이미지를 다섯 개 이하로 선택해주세요.");
        return;
      }

      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));

      setConceptImages(dataTransfer.files);
    }

    setCurrentStep(2);
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-4">
      <div className="w-full flex flex-col justify-center items-start gap-1 px-[10%]">
        <h1 className="heading_20b font-[600] text-text-black text-[1.3vw]">
          STEP 1. What's your Mood?
        </h1>
        <h2 className="label_14l text-[1vw]">
          취향의 이미지를 두 개 이상 넣어주세요 .
        </h2>
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
                {/* --- ▼▼▼ 수정된 부분 (1) ▼▼▼ --- */}
                {files.map((file, index) => (
                  <UserImageItem
                    key={`${file.name}-${file.lastModified}`}
                    file={file}
                    index={index}
                    onRemove={handleFileRemove}
                  />
                ))}
                {/* --- ▲▲▲ 수정된 부분 (1) ▲▲▲ --- */}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
      <h2 className="label_14l mt-[3rem] mb-[2rem]">
        생각나는 이미지가 없다면 가이드 이미지를 선택해 보세요 .
      </h2>
      <div className="mb-20 pb-10 custom-scrollbar-x max-w-[1100px] h-[22rem] overflow-x-scroll overflow-y-hidden flex justify-start items-center gap-2">
        {/* --- ▼▼▼ 수정된 부분 (2) ▼▼▼ --- */}
        {guideImages.map((image, index) => (
          <GuideImageItem
            key={index}
            image={image}
            index={index}
            selectedGuide={selectedGuide}
            filesLength={files.length}
            onSelect={setSelectedGuide}
          />
        ))}
        {/* --- ▲▲▲ 수정된 부분 (2) ▲▲▲ --- */}
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
