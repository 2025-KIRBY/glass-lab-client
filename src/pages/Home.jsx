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
    <div className="font-[Rock] w-full h-screen bg-[#1d1d1d] flex flex-col justify-center items-center gap-4">
      <div className="w-[600px] flex flex-col justify-center items-start gap-4">
        <h1 className="font-bold text-white text-[3rem]">
          Add Style Images ...
        </h1>
        <h2 className="text-white text-[1.6rem]">
          Upload images and make your own mood board.
        </h2>
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
          className="hover:border-[#B0AAA6] transition-border duration-300 cursor-pointer w-full min-h-[20vh] border-dashed border-2 border-[#454647] rounded-md p-4 mt-4 flex justify-center items-center"
        >
          {files.length === 0 ? (
            <div className="flex flex-col justify-center items-center gap-2">
              <ImageIcon size={32} color="#454647" weight="bold" />
              <span className="text-[#454647]">Click to upload</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Array.from(files).map((file, index) => (
                <div className="relative" key={index}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`upload-${index}`}
                    className="w-auto h-[30vh] object-cover rounded-[1rem]"
                  />
                  <div
                    onClick={(event) => handleFileRemove(event, index)}
                    className="hover:bg-red-700 absolute top-2 right-2 bg-[#41403C] rounded-full p-3 cursor-pointer"
                  >
                    <TrashIcon size={21} color="#fff" />
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
