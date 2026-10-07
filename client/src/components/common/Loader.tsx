import React from "react";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  text,
  fullScreen = false,
}) => {
  useBodyScrollLock(fullScreen);
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-[#F3D6DE] border-t-[#C85C7A] rounded-full animate-spin`}
      />
      {text && (
        <p className="text-xs tracking-wider uppercase text-[#756D70] font-medium">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF8F3]/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return <div className="py-12 flex justify-center">{spinner}</div>;
};

export default Loader;
