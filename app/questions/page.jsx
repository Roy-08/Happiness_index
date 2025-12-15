"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function QuestionsPage() {
  const [sections, setSections] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ open: false, message: "" });
  const router = useRouter();

  const QUESTIONS_PER_PAGE = 2;
  const [currentPage, setCurrentPage] = useState(0);

  /* ---------------- FETCH FORM (CACHED) ---------------- */
  useEffect(() => {
    async function loadForm() {
      const res = await fetch("/api/form/latest", {
        next: { revalidate: 60 }, // 🔥 CACHE
      });
      const data = await res.json();

      setSections([
        {
          sectionNumber: 1,
          sectionName: data.headline || "Assessment",
          questions: data.questions || [],
        },
      ]);

      setLoading(false);
    }
    loadForm();
  }, []);

  /* ---------------- FAST SCROLL ---------------- */
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentPage]);

  function selectOption(qIndex, oIndex) {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: oIndex,
    }));
  }

  function showPopup(msg) {
    setPopup({ open: true, message: msg });
  }

  function closePopup() {
    setPopup({ open: false, message: "" });
  }

  const section = sections[0];
  const totalQuestions = section?.questions?.length || 0;
  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);

  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentQuestions =
    section?.questions?.slice(startIndex, endIndex) || [];

  function validateCurrentPage() {
    return currentQuestions.every((_, idx) => {
      const qIndex = startIndex + idx;
      return answers[qIndex] !== undefined;
    });
  }

  function goNext() {
    if (!validateCurrentPage()) {
      showPopup("Please answer all questions on this page.");
      return;
    }

    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    } else {
      router.push("/register");
    }
  }

  function goBack() {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  }

  /* ---------------- MEMOIZED PROGRESS ---------------- */
  const progressPercent = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round(
      (Object.keys(answers).length / totalQuestions) * 100
    );
  }, [answers, totalQuestions]);

  return (
    <div className="min-h-screen w-full p-3 md:p-6 bg-[#FFF7E6] flex flex-col items-center">

      {/* POPUP */}
      {popup.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-sm rounded-2xl p-4 bg-white border border-yellow-400 shadow-lg mx-4">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-base">
              !
            </div>
            <h2 className="text-base font-semibold text-black text-center mb-1">
              Notice
            </h2>
            <p className="text-gray-800 text-center text-sm mb-2">
              {popup.message}
            </p>
            <button
              onClick={closePopup}
              className="w-full py-2 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* SECTION TITLE */}
      <div className="w-full max-w-xl mb-4 p-2 rounded-xl bg-yellow-500 text-black font-bold text-sm text-center shadow-sm">
        {section?.sectionName || "Assessment"}
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full max-w-xl mb-6 relative">
        <div className="w-full h-4 rounded-full bg-gray-300 overflow-hidden shadow-inner">
          <div
            className="h-4 rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: "#FBBF24",
            }}
          />
        </div>
        <div
          className="absolute -top-5 transform -translate-x-1/2 px-2 py-1 rounded-full bg-gray-800 text-white text-xs"
          style={{ left: `${progressPercent}%` }}
        >
          {progressPercent}%
        </div>
      </div>

      {/* QUESTIONS */}
      <div className="w-full max-w-xl space-y-3">
        {loading &&
          [1, 2].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-white border border-yellow-200 animate-pulse"
            />
          ))}

        {!loading &&
          currentQuestions.map((q, idx) => {
            const qIndex = startIndex + idx;
            return (
              <div
                key={qIndex}
                className="w-full p-3 rounded-xl bg-white border-2 border-yellow-400 shadow-sm"
              >
                <div className="mb-2">
                  <div className="text-base font-bold text-yellow-600 mb-1">
                    Q{qIndex + 1}/{totalQuestions}
                  </div>
                  <div className="text-sm font-semibold text-black">
                    {q.text}
                  </div>
                  {q.hindiText && (
                    <div className="text-xs text-gray-700 mt-1 pl-2 border-l-4 border-yellow-400">
                      {q.hindiText}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {q.options.map((op, oIndex) => {
                    const selected = answers[qIndex] === oIndex;
                    return (
                      <label
                        key={oIndex}
                        className={`flex gap-2 p-3 rounded-xl cursor-pointer border ${
                          selected
                            ? "border-yellow-500 bg-yellow-100"
                            : "border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={selected}
                          onChange={() => selectOption(qIndex, oIndex)}
                          className="accent-yellow-500 mt-1"
                        />
                        <span>
                          <div className="text-sm font-medium text-black">
                            {op.text}
                          </div>
                          {op.hindiText && (
                            <div className="text-xs text-gray-700">
                              {op.hindiText}
                            </div>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* BUTTONS */}
      <div className="w-full max-w-xl flex gap-2 mt-4">
        {currentPage > 0 && (
          <button
            onClick={goBack}
            className="flex-1 py-2 rounded-full bg-gray-700 text-white text-sm hover:bg-gray-600"
          >
            Back
          </button>
        )}
        <button
          onClick={goNext}
          className="flex-1 py-2 rounded-full bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400"
        >
          Next
        </button>
      </div>
    </div>
  );
}
