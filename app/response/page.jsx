"use client";

import { useState } from "react";

export default function ResponsePage() {
  const [email] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("registered_email") || "Not Available";
    }
    return "Not Available";
  });

  const [name] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("registered_name") || "Participant";
    }
    return "Participant";
  });

  return (
    <div className="w-screen h-screen relative overflow-hidden">

      {/* SOFT YELLOW BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff7cc] via-[#fde68a] to-[#facc15]" />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />

      {/* CENTER CONTENT */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="w-full max-w-2xl rounded-3xl overflow-hidden bg-[#fffdf4] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-black">

          {/* HEADER */}
          <div className="py-12 px-8 text-center bg-gradient-to-b from-[#fde047] via-[#facc15] to-[#fbbf24]">
            <h1 className="text-gray-900 text-4xl sm:text-5xl font-extrabold">
              Thank You!
            </h1>
            <p className="text-gray-800 text-base sm:text-lg mt-5">
              Your responses have been successfully recorded.
            </p>
          </div>

          {/* BODY */}
          <div className="p-8 sm:p-14 text-center">
            <p className="text-gray-800 text-lg font-medium mb-2">
              Hello, {name} 
            </p>
            <p className="text-gray-700 text-base sm:text-lg mb-3">
              Your report has been sent to your email:
            </p>
            <p className="text-yellow-700 font-semibold text-lg sm:text-xl break-words">
              {email}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
