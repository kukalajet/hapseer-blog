"use client";

import { FC, useEffect, useState } from "react";

const ReadingProgress: FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };

    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div
        className="h-full bg-gray-800 dark:bg-gray-200 transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export { ReadingProgress };
