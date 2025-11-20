import { useEffect, useState } from "react";
import { useStep } from "../context/StepContext";
import ProgressBar from "@ramonak/react-progress-bar";
import "./FistGenerateLoading.css";
import GameCanvas from "../components/GameCanvas";

export default function FirstGenerateLoading() {
  const [loading, setLoading] = useState(true);
  const [sendFiles, setSendFiles] = useState<File[]>([]);

  const {
    setCurrentStep,
    initImage,
    conditionImages,
    conceptImages,
    generateParams,
    setPreviewImageFiles,
  } = useStep();

  useEffect(() => {
    handleSubmit();
  }, []);

  async function handleSubmit() {
    if (!initImage) return console.error("❌ 뼈대 이미지를 선택해주세요.");
    if (!conceptImages || conceptImages.length < 2)
      return console.error("❌ 콘셉트 이미지를 2장 이상 선택해주세요.");
    if (!conditionImages || conditionImages.length < 5)
      return console.error("❌ 조건 이미지를 5장 선택해주세요.");

    try {
      const formData = new FormData();
      formData.append("init_image", initImage);

      Array.from(conceptImages).forEach((f) =>
        formData.append("concept_images", f)
      );
      Array.from(conditionImages).forEach((f) =>
        formData.append("condition_images", f)
      );
      Object.entries(generateParams).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      console.log("🚀 스트림 수신 시작...");

      const response = await fetch(
        "https://q7o04xwntbb5pp-8000.proxy.runpod.net/generate",
        { method: "POST", body: formData }
      );

      const contentType = response.headers.get("Content-Type");
      console.log("📌 응답 Content-Type:", contentType);
      if (!contentType) throw new Error("Content-Type 없음");

      const boundaryMatch = contentType.match(/boundary=([^;]+)/);
      if (!boundaryMatch) throw new Error("boundary 값을 찾을 수 없음");

      const boundary = `--${boundaryMatch[1]}`;

      if (!response.body) throw new Error("ReadableStream 없음");

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      const files: File[] = [];

      let buffer = new Uint8Array(0);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 기존 buffer + 새로운 chunk 병합
        const merged = new Uint8Array(buffer.length + value.length);
        merged.set(buffer);
        merged.set(value, buffer.length);
        buffer = merged;

        // boundary 기준으로 split
        let boundaryBytes = new TextEncoder().encode(boundary);
        let pos = indexOfBytes(buffer, boundaryBytes);

        // boundary가 포함된 경우
        while (pos !== -1) {
          const part = buffer.slice(0, pos);
          buffer = buffer.slice(pos + boundaryBytes.length);

          const file = extractFileFromPart(part);
          if (file) files.push(file);
          console.log("얍,", file);

          setSendFiles([...files]);

          pos = indexOfBytes(buffer, boundaryBytes);
        }
      }

      console.log("🖼️ 이미지 수신 완료:", files.length);
      setPreviewImageFiles(files);

      setLoading(false);
      setTimeout(() => setCurrentStep(3), 800);
    } catch (err) {
      console.error("❌ 전송 실패:", err);
    }
  }

  useEffect(() => {
    console.log("🚀전송할 파일들:", sendFiles);
  }, [sendFiles]);

  /**
   * Uint8Array 안에 boundary(Uint8Array) 존재 위치 찾기
   */
  function indexOfBytes(buffer: Uint8Array, search: Uint8Array): number {
    for (let i = 0; i <= buffer.length - search.length; i++) {
      let match = true;
      for (let j = 0; j < search.length; j++) {
        if (buffer[i + j] !== search[j]) {
          match = false;
          break;
        }
      }
      if (match) return i;
    }
    return -1;
  }

  /**
   * 하나의 multipart 파트를 File 로 변환
   */
  function extractFileFromPart(part: Uint8Array): File | null {
    const text = new TextDecoder().decode(part);

    const headerEnd = text.indexOf("\r\n\r\n");
    if (headerEnd === -1) return null;

    const header = text.slice(0, headerEnd);
    const bodyStart = headerEnd + 4;

    // 파일 이름
    const filenameMatch = header.match(/filename="(.+?)"/);
    const filename = filenameMatch
      ? filenameMatch[1]
      : `image_${Date.now()}.png`;

    // Content-Type
    const contentTypeMatch = header.match(/Content-Type:\s*(.*)/);
    const contentType = contentTypeMatch
      ? contentTypeMatch[1].trim()
      : "application/octet-stream";

    // 바이너리 body (텍스트로 디코딩하면 손상되므로 raw 유지)
    const body = part.slice(bodyStart);

    return new File([body], filename, { type: contentType });
  }

  return (
    <div>
      {loading ? (
        <div className="flex flex-col items-center gap-20">
          <p className="heading_20b">이미지 생성 중...</p>
          {/* <img src="/loading.svg" alt="loading" /> */}
          <ProgressBar
            borderRadius="50px"
            bgColor="pink"
            className="w-[40vw]"
            completed={Math.floor((sendFiles.length / 6 + 0.15) * 100)}
            animateOnRender={true}
            labelColor="black"
          />
          <GameCanvas />
        </div>
      ) : (
        <p></p>
      )}
    </div>
  );
}
