import { ImageIcon, TrashIcon } from "@phosphor-icons/react";
import { useState, useRef } from "react";

export default function HomePage() {
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleFileRemove = (event, index) => {
    event.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-4">
      <div>
        <h1 className="step-title">STEP 1. What's your Mood?</h1>
        <h2 className="step-desc">취향의 이미지를 두 개 이상 넣어주세요.</h2>
      </div>
      <div className="min-w-[600px] max-w-[90vw] flex flex-col justify-center items-start gap-4">
        <input
          ref={inputRef}
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          onClick={() => inputRef.current?.click()}
          htmlFor="file-upload"
          className="hover:border-[#B0AAA6] transition-border duration-300 cursor-pointer min-w-full max-w-[90vh] min-h-[20vh] border-dashed border-1 border-border-gray rounded-md p-4 mt-4 flex justify-center items-center"
        >
          {files.length === 0 ? (
            <div className="flex flex-col justify-center items-center gap-2">
              <ImageIcon size={32} color="#8f8b8b" weight="light" />
              <span className="text-text-gray">Click to upload</span>
            </div>
          ) : (
            <div className=" max-w-[90vw] max-h-[40vh] flex flex-wrap gap-2 overflow-y-scroll">
              {Array.from(files).map((file, index) => (
                <div className="relative" key={index}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`upload-${index}`}
                    className="w-auto h-[30vh] object-cover rounded-[1rem]"
                  />
                  <div
                    onClick={(event) => handleFileRemove(event, index)}
                    className="group hover:bg-main absolute top-2 right-2 bg-[#41403C] rounded-full p-3 cursor-pointer"
                  >
                    <TrashIcon
                      size={21}
                      color="#fff"
                      className="group-hover:fill-text-black"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
