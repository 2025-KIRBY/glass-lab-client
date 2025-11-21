import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../../firebase";
import { useEffect, useState, useCallback } from "react";

interface ScoreDataType {
  id: string;
  name: string;
  score: number;
  created_at: any;
}

export default function LeaderBoard2() {
  const [scoreData, setScoreData] = useState<ScoreDataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchScoreData = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const q = query(collection(db, "dino"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => doc.data());
      setScoreData(data as ScoreDataType[]);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScoreData();
  }, [fetchScoreData]);

  return (
    // w-full max-w-md 유지 (그리드가 찌그러지지 않게 너비 확보 필요)
    <div className="mt-8 p-4 w-full max-w-lg">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold font-inria-sans tracking-tight text-slate-800">
          LEADERBOARD
        </h2>

        <button
          onClick={fetchScoreData}
          disabled={isLoading}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors group"
          title="새로고침"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-6 h-6 text-slate-600 ${
              isLoading
                ? "animate-spin text-pink-500"
                : "group-hover:text-pink-500"
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </button>
      </div>

      {/* ▼▼▼ 4x2 그리드 영역 변경 부분 ▼▼▼ */}
      {/* grid-cols-2: 2열, gap-3: 간격 */}
      <div className="grid grid-cols-2 gap-3 pr-1">
        {scoreData.length === 0 ? (
          <div className="col-span-2 text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
            아직 기록이 없어요!
          </div>
        ) : (
          scoreData
            .sort((a, b) => b.score - a.score) // 점수 높은 순 정렬
            .slice(0, 8) // 4행 * 2열 = 8개까지만 자름
            .map((score, index) => (
              <div
                key={score.id || index}
                // flex-col로 변경하여 카드 형태 잡기
                className={`relative flex flex-col justify-center p-3 rounded-xl shadow-sm border transition-transform  ${
                  index === 0
                    ? "bg-yellow-50 border-yellow-300" // 1등
                    : index === 1
                    ? "bg-slate-50 border-gray-300" // 2등
                    : index === 2
                    ? "bg-orange-50 border-orange-200" // 3등
                    : "bg-white border-gray-100" // 나머지
                }`}
              >
                {/* 순위 뱃지 (왼쪽 상단 절대위치 or Flex로 배치) */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex gap-3 items-center">
                    <span
                      className={`leading-0.2 w-10 h-10 flex items-center justify-center rounded-full text-[1rem] font-bold ${
                        index === 0
                          ? "bg-yellow-400 text-white ring-2 ring-yellow-200"
                          : index === 1
                          ? "bg-gray-400 text-white ring-2 ring-gray-200"
                          : index === 2
                          ? "bg-orange-400 text-white ring-2 ring-orange-200"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {index + 1}
                    </span>
                    {/* 닉네임 (공간 좁으니 말줄임표 truncate 적용) */}
                    <span className="text-md font-medium text-slate-700 truncate text-center mt-1">
                      {score.name}
                    </span>
                  </div>
                  {/* 점수 강조 */}
                  <span
                    className={`font-bold text-lg flex justify-center items-center ${
                      index < 3 ? "text-slate-800" : "text-slate-600"
                    }`}
                  >
                    {score.score}
                  </span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
