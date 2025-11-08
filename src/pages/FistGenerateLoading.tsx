import axios from "axios";
import { useStep } from "../context/StepContext";
import JSZip from "jszip";
import { useEffect, useState } from "react";

export default function FirstGenerateLoading() {
  const [loading, setLoading] = useState(true);
  const {
    setCurrentStep,
    initImage,
    conditionImages,
    conceptImages,
    setPreviewImageFiles,
  } = useStep();

  useEffect(() => {
    handleSubmit();
  }, []);

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
        "https://u8i7cgfkr9l1wi-8000.proxy.runpod.net/generate",
        formData,
        { responseType: "blob" }
      );

      console.log("📦 ZIP 응답 수신 완료");

      // ✅ ZIP 파일 압축 해제
      const zip = await JSZip.loadAsync(response.data);
      const filePromises: Promise<File>[] = [];

      // zip.forEach를 사용해 zip 안의 모든 파일/폴더를 순회합니다.
      // (relativePath: 파일명, zipEntry: JSZipObject)
      zip.forEach((relativePath, zipEntry) => {
        // 1. 폴더는 건너뜁니다.
        if (zipEntry.dir) {
          return;
        }
        // 2. JSZipObject에서 blob 데이터를 비동기적으로 추출합니다.
        const promise = zipEntry.async("blob").then((content) => {
          // 3. blob 데이터를 File 객체로 만듭니다.
          // (relativePath는 'images/image1.png' 같은 형태일 수 있으므로
          //  zipEntry.name을 사용하는 것이 더 정확할 수 있습니다.)
          return new File([content], zipEntry.name, { type: content.type });
        });

        filePromises.push(promise);
      });

      // 4. 모든 파일이 File 객체로 변환될 때까지 기다립니다.
      const imageFiles = await Promise.all(filePromises);

      // 5. 이제 File[] 타입의 배열을 상태에 저장합니다.
      setPreviewImageFiles(imageFiles);

      console.log("🖼️ 이미지 미리보기 생성 완료:", imageFiles.length);
      setLoading(false);
      setTimeout(() => {
        setCurrentStep(3);
      }, 1000);
    } catch (error) {
      console.error("❌ 요청 실패:", error);
    }
  };
  return (
    <div>
      {loading ? (
        <div className="flex flex-col items-center">
          <p className="heading_20b">이미지 생성 중...</p>
          <img className="" src="/loading.svg" alt="" />
        </div>
      ) : (
        <p>생성 완료! 다음 단계로 이동합니다.</p>
      )}
    </div>
  );
}
