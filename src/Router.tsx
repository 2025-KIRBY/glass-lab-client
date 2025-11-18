import { createBrowserRouter } from "react-router-dom";
import CommonLayout from "./components/common/CommonLayout";
import MainPage from "./pages/MainPage";
import MakePage from "./pages/MakePage";
import FirstGenerateLoading from "./pages/FistGenerateLoading";
import StepFourPage from "./pages/Step4";
import StepThreePage from "./pages/Step3";
import GalleryPage from "./pages/Gallery";
import MaskGenerateLoading from "./pages/MaskGenerateLoading";

const routes = [
  {
    path: "",
    element: <CommonLayout />,
    children: [
      {
        path: "/",
        element: <MainPage />,
      },
      {
        path: "/make",
        element: <MakePage />,
      },
      {
        path: "/loading",
        element: <FirstGenerateLoading />,
      },
      {
        path: "/loading2",
        element: <MaskGenerateLoading />,
      },
      {
        path: "/test/4",
        element: <StepFourPage />,
      },
      {
        path: "/test/3",
        element: <StepThreePage />,
      },
      {
        path: "/gallery",
        element: <GalleryPage />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
