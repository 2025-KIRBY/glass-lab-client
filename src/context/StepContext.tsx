import { createContext, useContext, useState } from "react";

type StepContextType = {
  initImage: File | null;
  setInitImage: (file: File | null) => void;
  conceptImages: FileList | null;
  setConceptImages: (files: FileList | null) => void;
  conditionImages: FileList | null;
  setConditionImages: (files: FileList | null) => void;
  handleInitImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleConceptImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleConditionImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const StepContext = createContext<StepContextType | null>(null);

export function StepProvider({ children }: { children: React.ReactNode }) {
  const [initImage, setInitImage] = useState<File | null>(null);
  const [conceptImages, setConceptImages] = useState<FileList | null>(null);
  const [conditionImages, setConditionImages] = useState<FileList | null>(null);

  const handleInitImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInitImage(e.target.files[0]); // 단일 파일은 첫 번째 파일을 선택
    }
  };

  const handleConceptImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConceptImages(e.target.files); // FileList 객체 (또는 null)를 저장
  };

  const handleConditionImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConditionImages(e.target.files);
  };

  return (
    <StepContext.Provider
      value={{
        initImage,
        setInitImage,
        conceptImages,
        setConceptImages,
        conditionImages,
        setConditionImages,
        handleInitImageChange,
        handleConceptImagesChange,
        handleConditionImagesChange,
      }}
    >
      {children}
    </StepContext.Provider>
  );
}

export function useStep() {
  const context = useContext(StepContext);

  if (context === null) {
    throw new Error("useStep must be used within a StepProvider");
  }

  return context;
}
