import { CircleIcon, EraserIcon } from "@phosphor-icons/react";
import Canvas from "../components/Make/Canvas";

export default function StepFourPage() {
  return (
    <div className="w-screen h-screen grid grid-cols-[5fr_3fr] pt-[10.2rem] border-border-gray">
      <div className="w-full border-t-1 border-r-1 pt-[8rem] flex justify-center">
        <div className="w-[90%] h-[70%] bg-url('/canvas_bg.png') relative">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="/output1.png"
            alt=""
          />
          <Canvas />
        </div>
      </div>
      <div className="w-full border-t-1 pt-[4.3rem] pl-[5rem] flex flex-col gap-[4rem]">
        <div className="flex flex-col">
          <div>
            <span className="label_17m tracking-[0]">| Magic Wand</span>
            <div className="flex gap-[2rem] mt-5">
              <button className="cursor-pointer hover:[background:var(--gradient-main)] flex justify-center items-center w-[5rem] h-[5rem] border-1 border-border-gray button-shadow [background:var(--gradient-gray)]">
                <CircleIcon
                  fill="var(--color-text-black)"
                  weight="fill"
                  size={30}
                />
              </button>
              <button className="cursor-pointer hover:[background:var(--gradient-main)] flex justify-center items-center w-[5rem] h-[5rem] border-1 border-border-gray button-shadow [background:var(--gradient-gray)]">
                <CircleIcon
                  fill="var(--color-text-black)"
                  weight="fill"
                  size={22}
                />
              </button>
              <button className="cursor-pointer hover:[background:var(--gradient-main)] flex justify-center items-center w-[5rem] h-[5rem] border-1 border-border-gray button-shadow [background:var(--gradient-gray)]">
                <CircleIcon
                  fill="var(--color-text-black)"
                  weight="fill"
                  size={15}
                />
              </button>
              <button className="cursor-pointer hover:[background:var(--gradient-main)] flex justify-center items-center w-[5rem] h-[5rem] border-1 border-border-gray button-shadow [background:var(--gradient-gray)]">
                <EraserIcon
                  fill="var(--color-text-black)"
                  weight="fill"
                  size={25}
                />
              </button>
            </div>
          </div>
          <div className="mt-[4rem] flex flex-col">
            <span className="label_17m tracking-[0]">| Prompt</span>
            <textarea
              className="mt-4 max-w-[38rem] h-[10rem] p-4 border-1 border-[#d6d6d6] resize-none bg-white text-[1.4rem] leading-[2rem] placeholder:text-gray-300"
              placeholder="새로운 버전의 이미지를 생성하기 위한 프롬프트를 입력하세요."
            ></textarea>
          </div>
          <button className="mt-10 cursor-pointer label_17m w-[25rem] h-[4.5rem] border-1 border-text-gray button-shadow [background:var(--gradient-button)] active:[box-shadow:none] active:translate-y-1">
            Make New Version →
          </button>
        </div>
        <div>
          <div>
            <span className="mb-[2rem] label_17m tracking-[0]">| Export</span>
            <div className="relative grid grid-cols-3 bg-white border-1 border-[#d6d6d6] px-2 py-2 gap-2 max-w-[30rem] rounded-[3rem]">
              <span className="cursor-pointer bg-main rounded-[3rem] w-full text-center text-[1.6rem] text-text-black font-[300]">
                .png
              </span>
              <span className="cursor-pointer rounded-[3rem] w-full text-center text-[1.6rem] text-text-black font-[300]">
                .jpg
              </span>
              <span className="cursor-pointer rounded-[3rem] w-full text-center text-[1.6rem] text-text-black font-[300]">
                .glb
              </span>
              <span className="absolute -bottom-10 right-0 label_12m tracking-[0] text-text-gray">
                .glb 파일 export 시 시간이 소요됩니다.
              </span>
            </div>
          </div>
          <button className="mt-15 cursor-pointer label_17m w-[25rem] h-[4.5rem] border-1 border-text-gray button-shadow [background:var(--gradient-button)] active:[box-shadow:none] active:translate-y-1">
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
