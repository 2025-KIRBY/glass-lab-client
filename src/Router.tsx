import { createBrowserRouter } from "react-router-dom";
import CommonLayout from "./components/common/CommonLayout";
import MainPage from "./pages/MainPage";
import MakePage from "./pages/MakePage";

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
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
