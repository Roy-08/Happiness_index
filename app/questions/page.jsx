// Pastel Aesthetic Updated QuestionsPage

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function QuestionsPage() {
  const [sections, setSections] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ open: false, message: "" });
  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const QUESTIONS_PER_PAGE = 2;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    async function loadForm() {
      const res = await fetch("/api/form/latest", {
        next: { revalidate: 60 },
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

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentPage]);

  function selectOption(qIndex, oIndex) {
    setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }));
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

  const currentQuestions = section?.questions?.slice(startIndex, endIndex) || [];

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
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  }

  const progressPercent = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((Object.keys(answers).length / totalQuestions) * 100);
  }, [answers, totalQuestions]);

  return (
    <div className="min-h-screen w-full p-3 md:p-6 flex flex-col items-center bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200">

      {/* LANGUAGE FIRST */}
      {!selectedLanguage && (
        <div className="flex flex-col items-center justify-center min-h-screen w-full px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-md w-full bg-white/60 backdrop-blur-xl shadow-xl rounded-3xl p-10 border border-white/40 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-700 mb-2">
               Choose Language
            </h2>
            <p className="text-gray-600 mb-8 text-sm">भाषा चुनें</p>

            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => setSelectedLanguage("hindi")}
                className="py-4 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold shadow-md hover:scale-105 transition"
              >
                🇮🇳 हिन्दी
              </button>

              <button
                onClick={() => setSelectedLanguage("english")}
                className="py-4 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 text-white font-semibold shadow-md hover:scale-105 transition"
              >
                🇬🇧 English
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {selectedLanguage && (
        <>
          {/* POPUP */}
          {popup.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
              <div className="relative w-full max-w-sm rounded-2xl p-4 bg-white/70 backdrop-blur-md border shadow-lg mx-4">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-pink-300 flex items-center justify-center text-black font-bold text-base">!</div>
                <h2 className="text-base font-semibold text-black text-center mb-1">Notice</h2>
                <p className="text-gray-700 text-center text-sm mb-2">{popup.message}</p>
                <button onClick={closePopup} className="w-full py-2 rounded-xl bg-pink-400 text-white font-semibold hover:bg-pink-300 text-sm">OK</button>
              </div>
            </div>
          )}

          {/* PROGRESS */}
          <div className="w-full max-w-xl mb-6 relative mt-6">
            <div className="w-full h-4 rounded-full bg-white/50 overflow-hidden shadow-inner">
              <div
                className="h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-pink-400 to-blue-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div
              className="absolute -top-5 transform -translate-x-1/2 px-2 py-1 rounded-full bg-purple-700 text-white text-xs"
              style={{ left: `${progressPercent}%` }}
            >
              {progressPercent}%
            </div>
          </div>

          {/* QUESTIONS */}
          <div className="w-full max-w-xl space-y-3">
            {loading && [1, 2].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-white/60 border animate-pulse" />
            ))}

            {!loading &&
              currentQuestions.map((q, idx) => {
                const qIndex = startIndex + idx;
                return (
                  <div
                    key={qIndex}
                    className="w-full p-3 rounded-2xl bg-white/70 backdrop-blur-xl border shadow-sm"
                  >
                    <div className="mb-2">
                      <div className="text-sm font-bold text-purple-600 mb-1">
                        Q{qIndex + 1}/{totalQuestions}
                      </div>
                      <div className="text-sm font-semibold text-gray-800">
                        {selectedLanguage === "english" ? q.text : q.hindiText}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((op, oIndex) => {
                        const selected = answers[qIndex] === oIndex;
                        return (
                          <label
                            key={oIndex}
                            className={`flex gap-2 p-3 rounded-xl cursor-pointer border transition ${
                              selected
                                ? "border-pink-400 bg-pink-100"
                                : "border-gray-300 bg-white/60"
                            }`}
                          >
                            <input
                              type="radio"
                              checked={selected}
                              onChange={() => selectOption(qIndex, oIndex)}
                              className="accent-pink-500 mt-1"
                            />
                            <span>
                              <div className="text-sm font-medium text-gray-800">
                                {selectedLanguage === "english"
                                  ? op.text
                                  : op.hindiText}
                              </div>
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
          <div className="w-full max-w-xl flex gap-2 mt-4 mb-12">
            {currentPage > 0 && (
              <button
                onClick={goBack}
                className="flex-1 py-2 rounded-full bg-purple-300 text-white text-sm hover:bg-purple-200"
              >
                Back
              </button>
            )}
            <button
              onClick={goNext}
              className="flex-1 py-2 rounded-full bg-pink-400 text-white font-bold text-sm hover:bg-pink-300"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
