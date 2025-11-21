import { motion } from "motion/react";

export default function MainPage(): React.JSX.Element {
  const floatIn = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  };

  return (
    <div className=" inset-0 w-screen h-screen absolute overflow-scroll pt-[5rem]">
      {/* <motion.img
        className="absolute top-[57vh] right-[30vw] w-[25rem]"
        src="/mainpage/glasses1.png"
        alt=""
      /> */}
      <motion.img
        className="absolute top-[57vh] right-[20vw] w-[25rem]"
        src="/mainpage/fabric.gif"
        alt=""
      />

      {/* <motion.img
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-[23vh] left-[5vw] w-[25rem]"
        src="/mainpage/glasses2.png"
        alt=""
      /> */}
      <motion.img
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="z-0 absolute top-[23vh] left-[5vw] w-[25rem]"
        src="/mainpage/wing.gif"
        alt=""
      />

      {/* <motion.img
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-[50vh] left-[5rem] w-[25rem]"
        src="/mainpage/glasses3.png"
        alt=""
      /> */}
      <motion.img
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-[50vh] left-[5rem] w-[25rem]"
        src="/mainpage/chess.gif"
        alt=""
      />

      {/* <motion.img
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-[30vh] left-[35vw] w-[25rem]"
        src="/mainpage/glasses4.png"
        alt=""
      /> */}
      <motion.img
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-[30vh] left-[35vw] w-[25rem]"
        src="/mainpage/yellow.gif"
        alt=""
      />
      {/* 
      <motion.img
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-[10vh] right-[20vw] w-[25rem]"
        src="/mainpage/glasses5.png"
        alt=""
      /> */}
      <motion.img
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-[10vh] right-[20vw] w-[25rem]"
        src="/mainpage/snow.gif"
        alt=""
      />

      {/* <motion.img
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-[50vh] left-[45vw] w-[25rem]"
        src="/mainpage/glasses6.png"
        alt=""
      /> */}
      <motion.img
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-[50vh] left-[45vw] w-[25rem]"
        src="/mainpage/chair.gif"
        alt=""
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="absolute z-10 text-[7vw] roboto-font font-[100] tracking-[-6%] leading-[1.2] text-text-black"
      >
        A NEXT-GENERATION <br /> GENERATIVE AI-POWERED
        <br /> IMAGE TOOL
        <br /> FOR CREATING
        <br /> EYEWEAR PROTOTYPES
      </motion.span>
    </div>
  );
}
