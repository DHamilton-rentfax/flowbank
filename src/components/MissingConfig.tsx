"use client";

export default function MissingConfig() {
  return (
    <div className="flex h-screen items-center justify-center text-center">
      <div>
        <h1 className="text-2xl font-bold text-red-600">⚠️ Missing Firebase Config</h1>
        <p className="mt-2 text-gray-600">
          Please set your Firebase environment variables in <code>.env.local</code>.
        </p>
      </div>
    </div>
  );
}