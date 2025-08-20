"use client";

import { ReactNode } from "react";
import { AuthContextProvider } from "@/hooks/use-auth";
;
export default function AuthProvider({ children }) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}