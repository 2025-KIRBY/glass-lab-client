import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/Home";
import CommonLayout from "./components/common/CommonLayout";

const routes = [
  {
    path: "",
    element: <CommonLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/about",
        element: <div>About</div>,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
