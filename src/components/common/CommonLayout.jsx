import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function CommonLayout() {
  return (
    <div className="font-[Rock] w-full h-screen bg-[#1d1d1d] flex flex-col justify-center items-center gap-4">
      <Header />
      <Outlet />
    </div>
  );
}
