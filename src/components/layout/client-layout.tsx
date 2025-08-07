
"use client";

import React, { useEffect, useState } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render children until after mount to avoid hydration mismatches
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
