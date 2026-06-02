"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Always scroll to top on route change or refresh
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
