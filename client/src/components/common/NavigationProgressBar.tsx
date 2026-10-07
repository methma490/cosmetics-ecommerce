import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Luxury Top Navigation Progress Bar.
 * Provides instant visual feedback on route changes with a sleek,
 * metallic-gold progress animation at the top of the browser window.
 */
export const NavigationProgressBar: React.FC = () => {
  const location = useLocation();

  const [progress, setProgress] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((timeout) => {
      clearTimeout(timeout);
    });

    timeoutsRef.current = [];
  };

  useEffect(() => {
    clearAllTimeouts();

    // Start asynchronously to avoid synchronous state updates inside effect
    const start = setTimeout(() => {
      setVisible(true);
      setProgress(25);
    }, 0);

    const t1 = setTimeout(() => {
      setProgress(55);
    }, 120);

    const t2 = setTimeout(() => {
      setProgress(85);
    }, 240);

    const t3 = setTimeout(() => {
      setProgress(100);
    }, 380);

    const t4 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 600);

    timeoutsRef.current = [start, t1, t2, t3, t4];

    return () => {
      clearAllTimeouts();
    };
  }, [location.pathname, location.search]);

  if (!visible && progress === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="
          h-full
          bg-gradient-to-r
          from-[#D4AF37]
          via-[#FFF1A8]
          to-[#B87D4B]
          transition-all
          duration-300
          ease-out
          shadow-[0_0_12px_rgba(212,175,55,0.7)]
        "
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transitionProperty: "width, opacity",
          transitionDuration:
            progress === 100
              ? "150ms, 250ms"
              : "300ms, 150ms",
        }}
      />
    </div>
  );
};

export default NavigationProgressBar;