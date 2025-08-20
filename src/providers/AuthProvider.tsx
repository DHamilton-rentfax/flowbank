"use client";

import { AuthContextProvider } from "@/hooks/use-auth";
import { ReactNode } from "react";

export default function AuthProvider({ children }: { children: ReactNode}) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
