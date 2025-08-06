"use client";

import React, { useEffect, useState } from "react";

export function ClientLayout({ children, recaptchaSiteKey }: { children: React.ReactNode, recaptchaSiteKey?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if(recaptchaSiteKey) {
      (window as any).recaptchaSiteKey = recaptchaSiteKey;
    }
  }, [recaptchaSiteKey]);

  // Don't render children until after mount to avoid hydration mismatches
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
