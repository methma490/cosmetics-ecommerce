import { useEffect } from "react";

let lockCount = 0;
let originalBodyOverflow = "";
let originalHtmlOverflow = "";
let originalBodyTouchAction = "";
let originalPaddingRight = "";

/**
 * Universally locks body and HTML scrolling.
 * Uses a reference count so nested popups/modals don't unlock prematurely.
 */
export const lockBodyScroll = (): void => {
  if (typeof document === "undefined") return;

  if (lockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalBodyTouchAction = document.body.style.touchAction;
    originalPaddingRight = document.body.style.paddingRight;

    // Compensate for scrollbar disappearance on desktop to avoid layout shift
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
  }

  lockCount++;
};

/**
 * Restores body and HTML scrolling when all popups/modals are closed.
 */
export const unlockBodyScroll = (): void => {
  if (typeof document === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.touchAction = originalBodyTouchAction;
    document.body.style.paddingRight = originalPaddingRight;
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
  }
};

/**
 * React hook to lock background scroll while a modal, drawer, or popup is open.
 *
 * @param isLocked Whether the popup is currently visible/open
 */
export const useBodyScrollLock = (isLocked: boolean): void => {
  useEffect(() => {
    if (!isLocked) return;

    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [isLocked]);
};

export default useBodyScrollLock;
