import { useEffect, useState } from "react";
import { useStep } from "../context/StepContext";
import axios from "axios";
import JSZip from "jszip";

export default function MaskGenerateLoading() {
  const [loading, setLoading] = useState(true);
  const {
    prompt,
    maskImage,
    conceptImages,
    selectedImageFile,
    conditionImages,
    initImage,
    setPreviewImageFiles,
    setCurrentStep,
  } = useStep();

  useEffect(() => {
    handleSubmit();
  }, []);

  async function handleSubmit() {
    try {
      if (!selectedImageFile)
        return console.error("❌ 뼈대 이미지를 선택해주세요.");
      if (!conceptImages || conceptImages.length < 2)
        return console.error("❌ 콘셉트 이미지를 2장 이상 선택해주세요.");
      if (!maskImage) return console.error("❌ 마스크 이미지를 선택해주세요.");
      if (!conditionImages || conditionImages.length < 5)
        return console.error("❌ 조건 이미지를 5장 이상 선택해주세요.");
      if (!initImage) return console.error("❌ 뼈대 이미지를 선택해주세요.");
      console.log(prompt);
      console.log(selectedImageFile);
      console.log(maskImage);
      console.log(conceptImages);
      console.log(conditionImages);
      const fixedFile =
        selectedImageFile.type === ""
          ? new File([selectedImageFile], selectedImageFile.name, {
              type: "image/png", // 혹은 실제 확장자에 맞게
            })
          : selectedImageFile;

      const formData = new FormData();
      formData.append("prompt", "glasses");
      formData.append("init_image", fixedFile);
      formData.append("mask_image", maskImage);
      for (const file of conceptImages)
        formData.append("new_concept_images", file);
      for (const file of conditionImages)
        formData.append("condition_images", file);
      //   formData.append("selected_image", selectedImageFile);

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: File [${value.name}] (${value.type}, ${value.size} bytes)`
          );
        } else {
          console.log(`${key}:`, value);
        }
      }

      const res = await axios.post(
        "https://u8i7cgfkr9l1wi-8000.proxy.runpod.net/inpaint",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "arraybuffer",
        }
      );

      // 백엔드가 ZIP을 반환한다고 가정
      const contentType = res.headers["content-type"];
      console.log("📦 응답 타입:", contentType);
      // ✅ ZIP 파일 압축 해제
      const zip = await JSZip.loadAsync(res.data);
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

      console.log("🖼️ 이미지 미리보기 생성 완료:", imageFiles.length);
      // 5. 이제 File[] 타입의 배열을 상태에 저장합니다.
      setPreviewImageFiles(imageFiles);
      setLoading(false);
      setTimeout(() => {
        setCurrentStep(3);
      }, 1000);
    } catch (err) {
      console.error("❌ Inpaint 요청 실패:", err);
    }
  }

  return (
    <div>
      {loading ? (
        <div className="flex flex-col items-center">
          <p className="heading_20b">새로운 이미지 생성 중...</p>
          <img className="" src="/loading.svg" alt="" />
          {/* <button onClick={() => setCurrentStep(4)}>button</button> */}
        </div>
      ) : (
        <p>생성 완료! 다음 단계로 이동합니다.</p>
      )}
    </div>
  );
}
