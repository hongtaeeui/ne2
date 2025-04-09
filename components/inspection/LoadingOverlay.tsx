import React from "react";

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full border-t-2 border-primary h-10 w-10" />
        <p className="mt-4 text-lg font-semibold">처리 중입니다...</p>
      </div>
    </div>
  );
}
