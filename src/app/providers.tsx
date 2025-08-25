"use client";

import { ReactNode } from "react";
import { AuthProvider } from "../hooks/use-auth";

export default function Providers({ children }: { children: ReactNode }) {
  // add any client providers here later (Theme, Query, etc.)
  return <AuthProvider>{children}</AuthProvider>;
}