/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // 여기에 추가 환경 변수 있으면 계속 작성 가능
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
