"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
export default function QuestionsPage() {
  const [sections, setSections] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState({ open: false, message: "" });
const router = useRouter();

  const QUESTIONS_PER_PAGE = 2;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    async function loadForm() {
      const res = await fetch("/api/form/latest");
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-yellow-500 text-xl">
        Loading…
      </div>
    );
  }

  const section = sections[0];
  const totalQuestions = section.questions.length;
  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);

  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentQuestions = section.questions.slice(startIndex, endIndex);

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
    // LAST PAGE → GO TO REGISTRATION
     router.push("/register");
  }
}


  function goBack() {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  }

 

  const isLastPage = currentPage === totalPages - 1;
const answeredCount = Object.keys(answers).length;
const progressPercent = Math.round(
  (answeredCount / totalQuestions) * 100
);

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
        {section.sectionName}
      </div>
{/* PREMIUM MINIMAL PROGRESS BAR */}
<div className="w-full max-w-xl mb-6 relative">
  <div className="w-full h-4 rounded-full bg-gray-300 overflow-hidden shadow-inner">
    <div
      className="h-4 rounded-full transition-all duration-700 ease-in-out"
      style={{
        width: `${progressPercent}%`,
        backgroundColor: "#FBBF24",
        boxShadow: "0 2px 6px rgba(251, 191, 36, 0.5)",
      }}
    ></div>
  </div>

  <div className="absolute top-0 left-0 w-full h-4 pointer-events-none rounded-full">
    <div className="h-4 w-full bg-white/20 rounded-full"></div>
  </div>

  <div
    className="absolute -top-5 transform -translate-x-1/2 px-2 py-1 rounded-full bg-gray-800 text-white text-xs font-medium shadow-sm"
    style={{ left: `${progressPercent}%` }}
  >
    {progressPercent}%
  </div>
</div>

      {/* QUESTIONS (2 PER PAGE) */}
      <div className="w-full max-w-xl space-y-3">
        {currentQuestions.map((q, idx) => {
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
                <div className="text-sm font-semibold text-black leading-relaxed">
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
                      className={`flex items-start gap-2 p-3 rounded-xl cursor-pointer border transition-all ${
                        selected
                          ? "border-yellow-500 bg-yellow-100"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${qIndex}`}
                        checked={selected}
                        onChange={() => selectOption(qIndex, oIndex)}
                        className="w-4 h-4 accent-yellow-500 mt-1"
                      />
                      <span className="flex flex-col">
                        <span className="text-sm font-medium text-black">
                          {op.text}
                        </span>
                        {op.hindiText && (
                          <span className="text-xs text-gray-700">
                            {op.hindiText}
                          </span>
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

      {/* PAGINATION BUTTONS */}
      <div className="w-full max-w-xl flex justify-between mt-4 gap-2">
  {currentPage > 0 && (
    <button
      onClick={goBack}
      className="flex-1 px-4 py-2 rounded-full bg-gray-700 text-white text-sm
                 cursor-pointer hover:bg-gray-600
                 active:scale-95 transition-all duration-200"
    >
      Back
    </button>
  )}

  <button
    onClick={goNext}
    className="flex-1 px-4 py-2 rounded-full bg-yellow-500 text-black font-bold text-sm
               cursor-pointer hover:bg-yellow-400
               active:scale-95 transition-all duration-200"
  >
    Next
  </button>
</div>

    </div>
  );
}
