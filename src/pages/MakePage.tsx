import { useEffect } from "react";
import { useStep } from "../context/StepContext";
import StepOnePage from "./Step1";
import StepTwoPage from "./Step2";
import StepThreePage from "./Step3";
import StepFourPage from "./Step4";
import FirstGenerateLoading from "./FistGenerateLoading";
import MaskGenerateLoading from "./MaskGenerateLoading";

export default function MakePage() {
  const { currentStep, setCurrentStep } = useStep();

  useEffect(() => {
    if (!currentStep) {
      setCurrentStep(1);
    }
  }, []);
  if (currentStep === 1) {
    return <StepOnePage />;
  } else if (currentStep === 2) {
    return <StepTwoPage />;
  } else if (currentStep === 3) {
    return <StepThreePage />;
  } else if (currentStep === 4) {
    return <StepFourPage />;
  } else if (currentStep === 2.5) {
    return <FirstGenerateLoading />;
  } else if (currentStep === 4.5) {
    return <MaskGenerateLoading />;
  }
}
