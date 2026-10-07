import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { AlertCircle, HelpCircle, LogOut, Trash2, X } from "lucide-react";
import useBodyScrollLock from "../hooks/useBodyScrollLock";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary" | "warning";
  iconType?: "logout" | "danger" | "warning" | "question";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
  }>({
    isOpen: false,
    options: {
      title: "",
      message: "",
    },
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  // Lock background scrolling while confirm modal is active
  useBodyScrollLock(modalState.isOpen);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setModalState({
        isOpen: true,
        options: {
          confirmText: "Confirm",
          cancelText: "Cancel",
          confirmVariant: "primary",
          iconType: "question",
          ...options,
        },
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  const handleConfirm = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  // Keyboard Escape listener
  React.useEffect(() => {
    if (!modalState.isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalState.isOpen, handleClose]);

  const { options } = modalState;

  const renderIcon = () => {
    switch (options.iconType) {
      case "logout":
        return (
          <div className="w-12 h-12 rounded-full bg-[#B87D4B]/10 text-[#B87D4B] flex items-center justify-center mx-auto mb-3">
            <LogOut className="w-6 h-6" />
          </div>
        );
      case "danger":
        return (
          <div className="w-12 h-12 rounded-full bg-[#B33A3A]/10 text-[#B33A3A] flex items-center justify-center mx-auto mb-3">
            <Trash2 className="w-6 h-6" />
          </div>
        );
      case "warning":
        return (
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-[#F7EFE9] text-[#B87D4B] flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="w-6 h-6" />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (options.confirmVariant) {
      case "danger":
        return "bg-[#B33A3A] hover:bg-[#8F2B2B] text-white shadow-sm";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white shadow-sm";
      default:
        return "bg-[#B87D4B] hover:bg-[#9E6536] text-white shadow-sm";
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Global Luxury Confirmation Modal */}
      {modalState.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-[#FFFCFA] rounded-3xl border border-[#F0DFD8] p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl relative text-center">
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 text-[#756D70] hover:text-[#211A1C] rounded-full hover:bg-[#F7EFE9] transition-colors"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>

            {renderIcon()}

            <div className="space-y-1.5">
              <h3 className="font-serif-luxury text-lg font-semibold text-[#211A1C]">
                {options.title}
              </h3>
              <p className="text-xs text-[#756D70] leading-relaxed">
                {options.message}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-full border border-[#F0DFD8] text-xs font-semibold text-[#756D70] hover:bg-[#F7EFE9] hover:text-[#211A1C] transition-colors cursor-pointer"
              >
                {options.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`flex-1 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${getConfirmButtonClasses()}`}
              >
                {options.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmContextType => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

export default ConfirmProvider;
