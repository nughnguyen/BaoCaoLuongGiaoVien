"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <span className="opacity-0">00:00:00 00-00-0000</span>;

  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");
  const dd = String(time.getDate()).padStart(2, "0");
  const mo = String(time.getMonth() + 1).padStart(2, "0");
  const yyyy = time.getFullYear();

  return (
    <span className="font-mono text-primary font-medium tabular-nums">
      {hh}:{mm}:{ss} {dd}-{mo}-{yyyy}
    </span>
  );
}
