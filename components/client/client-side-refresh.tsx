"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type ClientSideRefreshProps = {
  timeMs: number;
};
export default function ClientSideRefresh({ timeMs }: ClientSideRefreshProps) {
  const router = useRouter();
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, timeMs);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
