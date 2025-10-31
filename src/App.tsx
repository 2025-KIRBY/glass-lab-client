import { RouterProvider } from "react-router-dom";
import router from "./Router";
import "./styles/global.css";
import { StepProvider } from "./context/StepContext";

function App() {
  return (
    <div className="App">
      <StepProvider>
        <RouterProvider router={router} />
      </StepProvider>
    </div>
  );
}

export default App;
