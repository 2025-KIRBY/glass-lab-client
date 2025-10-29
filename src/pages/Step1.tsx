import { ImageIcon, TrashIcon } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

interface GuideImageType {
  img_url: string;
  id: number;
}

export default function StepOnePage() {
  const [guideImages, setGuideImages] = useState<GuideImageType[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-4">
      <div className="w-full flex flex-col justify-center items-start gap-1 px-[20%]">
        <h1 className="heading_20b">STEP 1. What's your Mood?</h1>
        <h2 className="label_14l">취향의 이미지를 두 개 이상 넣어주세요 .</h2>
      </div>
      <div className="min-w-[60vw] max-w-[90vw] flex flex-col justify-center items-start gap-4">
        <input
          ref={inputRef}
          multiple
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          onClick={() => inputRef.current?.click()}
          className="hover: transition-border duration-300 cursor-pointer min-w-full max-w-[90vh] min-h-[20vh] border-dashed border-1 border-border-gray rounded-md p-4 mt-4 flex justify-center items-center"
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
      <h2 className="label_14l mt-[6rem] mb-[2rem]">
        생각나는 이미지가 없다면 가이드 이미지를 선택해 보세요 .
      </h2>
      <div className="mb-20 max-w-[1100px] flex flex-wrap justify-start items-center gap-4">
        {guideImages.map((image, index) => (
          <div
            className="active:scale-95 group cursor-pointer hover:border-border-pink hover:border-1 relative w-[18rem] h-[18rem] border-border-gray border-1 basic-shadow"
            key={index}
          >
            <img
              className="object-cover w-full h-full"
              src={image.img_url}
              alt={`guide-${index}`}
            />
            <div className="group-hover:opacity-100 opacity-0 transition-all duration-300 ease-out absolute w-full h-full inset-0 [background:var(--gradient-main)]"></div>
          </div>
        ))}
      </div>
      <button className="cursor-pointer label_17m w-[25rem] h-[4.5rem] border-1 border-text-gray button-shadow [background:var(--gradient-button)] active:[box-shadow:none] active:translate-y-2">
        Next Step
      </button>
    </div>
  );
}
