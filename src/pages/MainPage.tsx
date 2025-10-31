import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStep } from "../context/StepContext";
import JSZip from "jszip";

export default function MainPage(): React.JSX.Element {
  const navigate = useNavigate();
  const step = useStep();

  // ✅ 추가된 state
  const [previewInpaint, setPreviewInpaint] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<File | null>(null); // ✅ 마스크 이미지 state 추가

  if (!step) {
    return (
      <div className="p-8 max-w-2xl mx-auto font-sans">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          이미지 생성기
        </h1>
        <p className="text-center text-gray-600">로딩 중...</p>
      </div>
    );
  }

  const {
    initImage,
    conceptImages,
    conditionImages,
    handleInitImageChange,
    handleConceptImagesChange,
    handleConditionImagesChange,
  } = step;

  // ✅ 마스크 이미지 핸들러
  const handleMaskImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMaskImage(file);
  };

  // ✅ ZIP 요청 후 미리보기 표시
  const handleSubmit = async () => {
    if (!initImage) return console.error("❌ 뼈대 이미지를 선택해주세요.");
    if (!conceptImages || conceptImages.length < 2)
      return console.error("❌ 콘셉트 이미지를 2장 이상 선택해주세요.");
    if (!conditionImages || conditionImages.length < 5)
      return console.error("❌ 조건 이미지를 5장 선택해주세요.");

    try {
      const formData = new FormData();
      formData.append("init_image", initImage);
      for (const file of conceptImages) formData.append("concept_images", file);
      for (const file of conditionImages)
        formData.append("condition_images", file);

      console.log("🚀 전송 중...");

      // ZIP 바이너리로 응답 받기
      const response = await axios.post(
        "https://xz97ddu0vypwh4-8000.proxy.runpod.net/generate",
        formData,
        { responseType: "blob" }
      );

      console.log("📦 ZIP 응답 수신 완료");

      // ✅ ZIP 파일 압축 해제
      const zip = await JSZip.loadAsync(response.data);
      const urls: string[] = [];

      for (const [filename, file] of Object.entries(zip.files)) {
        if (!file.dir && /\.(png|jpg|jpeg)$/i.test(filename)) {
          const blob = await file.async("blob");
          const url = URL.createObjectURL(blob);
          urls.push(url);
        }
      }

      setPreviewImages(urls);
      console.log("🖼️ 이미지 미리보기 생성 완료:", urls.length);
    } catch (error) {
      console.error("❌ 요청 실패:", error);
    }
  };

  // ✅ 선택한 이미지 `/inpaint`로 전송
  const handleSendToInpaint = async () => {
    if (!initImage) return console.error("❌ 뼈대 이미지를 선택해주세요.");
    if (!conceptImages || conceptImages.length < 2)
      return console.error("❌ 콘셉트 이미지를 2장 이상 선택해주세요.");
    if (!conditionImages || conditionImages.length < 5)
      return console.error("❌ 조건 이미지를 5장 선택해주세요.");
    if (!maskImage) return console.error("❌ 마스크 이미지를 선택해주세요."); // ✅ 마스크 체크 추가
    if (!selectedImage) return alert("이미지를 선택해주세요!");

    try {
      const formData = new FormData();
      formData.append("prompt", "glasses");
      formData.append("init_image", initImage);
      formData.append("mask_image", maskImage);
      for (const file of conceptImages)
        formData.append("new_concept_images", file);
      for (const file of conditionImages)
        formData.append("condition_images", file);

      // const blob = await fetch(selectedImage).then((r) => r.blob());
      // formData.append("selected_image", blob, "selected-image.png");

      const res = await axios.post(
        "https://xz97ddu0vypwh4-8000.proxy.runpod.net/inpaint",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "arraybuffer",
        }
      );

      alert("🎨 Inpaint 전송 완료!");
      // 백엔드가 ZIP을 반환한다고 가정
      const contentType = res.headers["content-type"];
      console.log("📦 응답 타입:", contentType);
      // ✅ ZIP 파일 압축 해제
      const zip = await JSZip.loadAsync(res.data);
      const urls: string[] = [];

      for (const [filename, file] of Object.entries(zip.files)) {
        if (!file.dir && /\.(png|jpg|jpeg)$/i.test(filename)) {
          const blob = await file.async("blob");
          const url = URL.createObjectURL(blob);
          urls.push(url);
        }
      }

      setPreviewInpaint(urls);
      console.log("🖼️ 이미지 미리보기 생성 완료:", urls.length);
    } catch (err) {
      console.error("❌ Inpaint 요청 실패:", err);
    }
  };

  // ✅ UI
  return (
    <div className="p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        이미지 생성기
      </h1>

      {/* 업로드 입력창 */}
      <div className="space-y-6">
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            1. 뼈대 이미지 (Base Image)
          </label>
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={handleInitImageChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            2. 콘셉트 이미지 (2장 이상)
          </label>
          <input
            type="file"
            accept="image/jpeg, image/png"
            multiple
            onChange={handleConceptImagesChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            3. 조건 이미지 (5장)
          </label>
          <input
            type="file"
            accept="image/jpeg, image/png"
            multiple
            onChange={handleConditionImagesChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
          />
        </div>

        {/* ✅ 새로 추가된 마스크 이미지 인풋 */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            4. 마스크 이미지 (Mask Image)
          </label>
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={handleMaskImageChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
          />
        </div>
      </div>

      {/* 버튼 */}
      <button
        onClick={handleSubmit}
        className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors duration-200"
      >
        생성하기 (Generate)
      </button>

      {/* ZIP 해제된 이미지 미리보기 */}
      {previewImages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">결과 이미지 선택</h2>
          <div className="grid grid-cols-3 gap-4">
            {previewImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`preview-${i}`}
                onClick={() => setSelectedImage(url)}
                className={`w-32 h-32 object-cover rounded-lg cursor-pointer border-4 ${
                  selectedImage === url
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleSendToInpaint}
            className="mt-6 w-full bg-amber-600 text-white py-3 px-6 rounded-lg text-lg font-bold hover:bg-amber-700 transition-colors duration-200"
          >
            선택한 이미지 Inpaint로 전송
          </button>
          {previewInpaint.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Inpaint 미리보기</h3>
              <div className="grid grid-cols-3 gap-4">
                {previewInpaint.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`inpaint-preview-${i}`}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
