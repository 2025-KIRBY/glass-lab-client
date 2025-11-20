import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { motion } from "motion/react";
import { GenerateParams } from "../../context/StepContext";

interface Step2ModalProps {
  onClose: () => void; // 모달 닫기 (아니요)
  onConfirm: (params: GenerateParams) => void; // 생성 시작 (예)
}

export default function Step2Modal({ onClose, onConfirm }: Step2ModalProps) {
  const [isOpen, setIsOpen] = useState(false); // 토글 상태

  // 5개의 파라미터 상태 관리
  const [params, setParams] = useState<GenerateParams>({
    init_image_weight: 0.6,
    concept_images_weight: 0.8,
    condition_images_weight: 0.2,
    controlnet_condition_scale: 0.35,
    control_guidance_end: 0.35,
  });

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center backdrop-blur-sm">
      <motion.div
        // initial={{ opacity: 0, y: -20 }}
        // animate={{ opacity: 1, y: 0 }}
        // exit={{ opacity: 0, y: -20 }}
        className={`
          bg--bg shadow-2xl overflow-hidden flex flex-col
          w-[50rem] transition-all duration-300 ease-in-out
          ${isOpen ? "h-[45rem]" : "h-[20rem]"} 
        `}
      >
        {/* --- Header & Title --- */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 gap-6">
          <h2 className="heading_20b text-[18px] font-bold text-text-black">
            안경을 생성하시겠습니까?
          </h2>
          <p className="text-text-gray500 text-[13px] text-center whitespace-pre-wrap">
            선택하신 조건으로 AI 이미지를 생성합니다.{"\n"}
            (이 과정은 약 10~20초 소요됩니다)
          </p>

          {/* --- Toggle Button --- */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer flex items-center gap-2 text-text-gray500 hover:text-text-pink600 transition-colors text-[12px] font-medium mt-2"
          >
            추가 조정
            {isOpen ? <CaretUpIcon size={16} /> : <CaretDownIcon size={16} />}
          </button>
        </div>

        {/* --- Toggle Content (Sliders) --- */}
        <div
          className={`
            bg-gray-50 border-t border-gray-300 overflow-y-auto custom-scrollbar
            transition-all duration-300 ease-in-out px-10
            ${
              isOpen
                ? "flex-[2] py-8 opacity-100"
                : "flex-[0] h-0 py-0 opacity-0"
            }
          `}
        >
          <div className="flex flex-col gap-6">
            <SliderInput
              label="Init Image Weight"
              name="init_image_weight"
              value={params.init_image_weight}
              onChange={handleSliderChange}
            />
            <SliderInput
              label="Concept Images Weight"
              name="concept_images_weight"
              value={params.concept_images_weight}
              onChange={handleSliderChange}
            />
            <SliderInput
              label="Condition Images Weight"
              name="condition_images_weight"
              value={params.condition_images_weight}
              onChange={handleSliderChange}
            />
            <SliderInput
              label="ControlNet Condition Scale"
              name="controlnet_condition_scale"
              value={params.controlnet_condition_scale}
              onChange={handleSliderChange}
            />
            <SliderInput
              label="Control Guidance End"
              name="control_guidance_end"
              value={params.control_guidance_end}
              onChange={handleSliderChange}
            />
          </div>
        </div>

        {/* --- Footer Buttons --- */}
        <div className="flex w-full border-t border-gray-200">
          <button
            onClick={onClose}
            className="cursor-pointer flex-1 py-6 text-[1.3rem] font-medium text-text-gray500 hover:bg-gray-50 transition-colors"
          >
            아니요
          </button>
          <div className="w-[1px] bg-gray-200"></div>
          <button
            onClick={() => onConfirm(params)}
            className="cursor-pointer flex-1 py-6 text-[1.3rem] font-bold text-border-pink hover:bg-pink-50 transition-colors"
          >
            생성
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Helper Component for Slider ---
function SliderInput({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label
          htmlFor={name}
          className="text-[14px] text-gray-600 font-inria-sans font-[400]"
        >
          {label}
        </label>
        <span className="text-[12px] font-inria-sans text-border-black bg-pink-50 px-2 py-0.5 rounded">
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        id={name}
        name={name}
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-main hover:accent-text-pink600"
      />
    </div>
  );
}
