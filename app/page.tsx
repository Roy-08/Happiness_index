"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/questions"); // or "/question"
  }, [router]);

  return null; // nothing renders
}
