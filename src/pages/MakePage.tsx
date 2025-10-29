import { useSearchParams } from "react-router-dom";
import StepOnePage from "./Step1";
import StepTwoPage from "./Step2";
import StepThreePage from "./Step3";

export default function MakePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = searchParams.get("step");

  //   useEffect(() => {
  //     if (!currentStep) {
  //       setSearchParams({ step: "1" });
  //     }
  //   }, []);
  if (currentStep === "1") {
    return <StepOnePage />;
  } else if (currentStep === "2") {
    return <StepTwoPage />;
  } else if (currentStep === "3") {
    return <StepThreePage />;
  }
}
