import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function CommonLayout() {
  return (
    <div className="font-inria-sans w-full h-screen flex flex-col justify-center items-center gap-4">
      <Header />
      <Outlet />
      {/* <div className="flex gap-4 absolute bottom-10 left-10 items-center justify-center">
        <img className="w-[7.7rem] h-[3.5rem]" src="/GLASS LAB.png" alt="" />
        <p className="w-[7rem] h-[3.5rem] font-[400] text-[1rem] tracking-[-0.7px] leading-[1.2rem]">
          Generative AI-Powered Design Tool by KIRBY
        </p>
      </div> */}
    </div>
  );
}
