import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useStep } from "../../context/StepContext";

export default function Header() {
  const navigate = useNavigate();
  const { setCurrentStep } = useStep();

  function handleClick(label: string, path: string) {
    if (label === "HOME" || label === "GALLERY") {
      navigate(path);
    } else if (label === "MAKE") {
      setCurrentStep(1);
      navigate(path);
    }
  }

  const menuItems = [
    { label: "HOME", path: "/" },
    { label: "GALLERY", path: "/gallery" },
    { label: "MAKE", path: "/make" },
  ];
  return (
    <div className="cursor-pointer absolute top-5 left-5 flex justify-center items-center gap-10">
      <img
        onClick={() => navigate("/")}
        className="w-[4rem] h-[4rem]"
        src="/logo_transparent.svg"
        alt="Glass Lab"
      />
      {menuItems.map((item) => (
        <motion.div
          key={item.label}
          className="relative px-3 group flex justify-center items-center"
          whileHover="hover"
          initial="rest"
          animate="rest"
        >
          {/* 배경 박스 */}
          <motion.div
            variants={{
              rest: { opacity: 0, scaleX: 0, transition: { duration: 0.2 } },
              hover: { opacity: 1, scaleX: 1, transition: { duration: 0.25 } },
            }}
            className="
              absolute inset-0 
              bg-text-black
              origin-left
            "
          />

          {/* 텍스트 */}
          <span
            onClick={() => handleClick(item.label, item.path)}
            className="relative z-10 font-inria-sans text-[2rem] font-[300] tracking-[-1px] text-text-gray500 group-hover:text-white"
          >
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
