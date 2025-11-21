import { XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";

export default function Tutorial({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 w-sceen h-screen bg-black/50 flex justify-center items-center z-50">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { duration: 0.4 } }}
        exit={{ y: -20, opacity: 0, transition: { duration: 0.4 } }}
        className="w-[70%] h-[70%] bg--bg rounded-md flex flex-col justify-center items-center gap-5 p-5 relative"
      >
        <span
          onClick={onClose}
          className="text-white absolute -top-15 right-1 cursor-pointer hover:text-main"
        >
          <XIcon size={30} weight="fill" />
        </span>
        <span className="text-white text-[2rem] tracking-tight absolute -top-13 left-1">
          Step 4 가이드
        </span>
        <img src="/tutorial.png" className="w-[95%]" alt="" />
      </motion.div>
    </div>
  );
}
