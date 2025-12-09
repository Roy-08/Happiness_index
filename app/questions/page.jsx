"use client";

import { useState, useEffect } from "react";

export default function QuestionsPage() {
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Popup state
  const [popup, setPopup] = useState({
    open: false,
    message: "",
  });

  useEffect(() => {
    async function loadForm() {
      const res = await fetch("/api/form/latest");
      const data = await res.json();
      setSections(data.sections || []);
      setLoading(false);
    }
    loadForm();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSection]);

  function selectOption(sectionIndex, questionIndex, optionIndex) {
    setAnswers({
      ...answers,
      [`${sectionIndex}-${questionIndex}`]: optionIndex,
    });
  }

  // ---------------------
  // SHOW POPUP
  // ---------------------
  function showPopup(msg) {
    setPopup({ open: true, message: msg });
  }

  function closePopup() {
    setPopup({ open: false, message: "" });
  }

  // ---------------------
  // VALIDATE CURRENT SECTION
  // ---------------------
  function validateCurrentSection() {
    const section = sections[currentSection];
    if (!section) return false;

    for (let q = 0; q < section.questions.length; q++) {
      if (answers[`${currentSection}-${q}`] === undefined) {
        return false;
      }
    }
    return true;
  }

  function goNext() {
    if (!validateCurrentSection()) {
      showPopup("Please answer all questions in this section.");
      return;
    }
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  }

  function goBack() {
    if (currentSection > 0) setCurrentSection(currentSection - 1);
  }

  // ---------------------
  // VALIDATE ALL SECTIONS
  // ---------------------
  function validateAllSections() {
    for (let s = 0; s < sections.length; s++) {
      for (let q = 0; q < sections[s].questions.length; q++) {
        if (answers[`${s}-${q}`] === undefined) return false;
      }
    }
    return true;
  }

  // ---------------------
  // SUBMIT FUNCTION
  // ---------------------
  async function handleSubmit() {
    if (!validateAllSections()) {
      showPopup("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);

    const name = localStorage.getItem("registered_name");
    const email = localStorage.getItem("registered_email");

    await fetch("/api/submitAnswers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        section: "Main Assessment",
        answers,
      }),
    });

    setTimeout(() => {
      window.location.href = "/response";
    }, 800);
  }

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center text-white text-2xl">
        Loading…
      </div>
    );

  const section = sections[currentSection];
  const isLastSection = currentSection === sections.length - 1;

  return (
    <div className="min-h-screen w-full p-4 md:p-6 bg-gray-900 flex flex-col items-center">
      
      {/* ---------------- POPUP UI ---------------- */}
     {popup.open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>

    {/* Card */}
    <div className="relative w-[90%] max-w-sm rounded-2xl p-6 bg-white/20 backdrop-blur-md border border-white/20 shadow-xl">
      
      {/* Icon */}
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-cyan-400 flex items-center justify-center text-white font-bold text-lg">
        !
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-white text-center mb-2">Notice</h2>

      {/* Message */}
      <p className="text-gray-200 text-center mb-4">{popup.message}</p>

      {/* Button */}
      <button
        onClick={closePopup}
        className="w-full py-2 rounded-xl bg-cyan-400 text-black font-semibold hover:opacity-90 transition-all"
      >
        OK
      </button>
    </div>
  </div>
)}


      {/* SECTION TITLE */}
      {section && (
        <div className="w-full max-w-xl mb-10 p-4 rounded-2xl bg-cyan-400 text-black font-bold text-lg text-center shadow-md">
          {`Section ${section.sectionNumber}: ${section.sectionName}`}
        </div>
      )}

      {/* QUESTIONS */}
      <div className="w-full max-w-xl space-y-6">
        {section?.questions.map((q, qIndex) => {
          const key = `${currentSection}-${qIndex}`;
          const questionNumber = qIndex + 1;

          return (
            <div
              key={qIndex}
              className="w-full p-6 rounded-2xl bg-gray-900 text-white border-2 border-cyan-400 shadow-lg"
            >
              <div className="mb-4 text-lg font-bold flex items-center gap-3">
                <span className="text-xl font-extrabold">{`Q${questionNumber}.`}</span>
                <span>{q.text}</span>
              </div>

              <div className="space-y-3">
                {q.options.map((op, oIndex) => {
                  const selected = answers[key] === oIndex;
                  const letter = String.fromCharCode(65 + oIndex);

                  return (
                    <button
                      key={oIndex}
                      onClick={() => selectOption(currentSection, qIndex, oIndex)}
                      className={`relative w-full flex items-center gap-3 pl-16 pr-6 py-4 rounded-full
                        ${selected ? "bg-cyan-400 text-black" : "bg-gray-700 text-white"}`}
                    >
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-black font-bold">
                        {letter}
                      </div>
                      {op.text}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* BUTTONS */}
      <div className="w-full max-w-xl flex justify-between mt-6">
        {currentSection > 0 && (
          <button
            onClick={goBack}
            className="px-6 py-3 rounded-full bg-gray-600 text-white"
          >
            Back
          </button>
        )}

        {!isLastSection ? (
          <button
            onClick={goNext}
            className="px-10 py-3 rounded-full bg-blue-500 text-white ml-auto"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-10 py-3 rounded-full bg-green-500 text-white ml-auto flex items-center gap-3 ${
              submitting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting…
              </>
            ) : (
              "Submit"
            )}
          </button>
        )}
      </div>

      {/* Popup animation */}
      <style jsx>{`
        @keyframes popup {
          0% {
            transform: scale(0.75);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-popup {
          animation: popup 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
