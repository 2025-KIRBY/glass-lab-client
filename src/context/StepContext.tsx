import { createContext, useContext, useState } from "react";

type StepContextType = {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  initImage: File | null;
  setInitImage: (file: File | null) => void;
  initId: number | null;
  setInitId: (id: number | null) => void;
  conceptImages: FileList | null;
  setConceptImages: (files: FileList | null) => void;
  inpaintConceptImages: FileList | null;
  setInpaintConceptImages: (files: FileList | null) => void;
  conditionImages: FileList | null;
  setConditionImages: (files: FileList | null) => void;
  handleInitImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleConceptImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleConditionImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewImageUrls: string[];
  setPreviewImageUrls: (urls: string[]) => void;
  selectedImageFile: File | null;
  setSelectedImageFile: (file: File | null) => void;
  previewImageFiles: File[];
  setPreviewImageFiles: (files: File[]) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  maskImage: File | null;
  setMaskImage: (file: File | null) => void;
};

export const StepContext = createContext<StepContextType | null>(null);

export function StepProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [initImage, setInitImage] = useState<File | null>(null);
  const [initId, setInitId] = useState<number | null>(null);
  const [inpaintConceptImages, setInpaintConceptImages] =
    useState<FileList | null>(null);
  const [conceptImages, setConceptImages] = useState<FileList | null>(null);
  const [conditionImages, setConditionImages] = useState<FileList | null>(null);
  const [previewImageFiles, setPreviewImageFiles] = useState<File[]>([]);
  const [previewImageUrls, setPreviewImageUrls] = useState<string[]>([]);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("glasses");
  const [maskImage, setMaskImage] = useState<File | null>(null);

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
        currentStep,
        setCurrentStep,
        initImage,
        setInitImage,
        initId,
        setInitId,
        conceptImages,
        setConceptImages,
        inpaintConceptImages,
        setInpaintConceptImages,
        conditionImages,
        setConditionImages,
        handleInitImageChange,
        handleConceptImagesChange,
        handleConditionImagesChange,
        previewImageUrls,
        setPreviewImageUrls,
        selectedImageFile,
        setSelectedImageFile,
        previewImageFiles,
        setPreviewImageFiles,
        prompt,
        setPrompt,
        maskImage,
        setMaskImage,
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
