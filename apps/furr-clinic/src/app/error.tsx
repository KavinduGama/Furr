"use client";

import React from "react";

export default function ClinicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl font-bold mb-4 shadow-sm border border-amber-200">
        ⚠️
      </div>
      <h2 className="text-xl font-black text-[#02202B] mb-2">
        Clinical Workspace Interrupted
      </h2>
      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        {error.message || "An unexpected error occurred while managing clinical data."}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-[#006B78] hover:bg-[#00525C] text-white rounded-xl text-sm font-bold transition shadow-sm"
      >
        Retry Action
      </button>
    </div>
  );
}
