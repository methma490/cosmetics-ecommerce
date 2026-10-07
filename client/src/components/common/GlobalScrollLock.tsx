import React, { useEffect } from "react";
import { lockBodyScroll, unlockBodyScroll } from "../../hooks/useBodyScrollLock";

/**
 * Global component mounted at root that monitors any modal/popup/overlay
 * rendered dynamically in the DOM (e.g. fixed inset-0 z-50).
 * Guarantees that whenever ANY popup is open in the application,
 * the background page is completely blocked from scrolling.
 */
export const GlobalScrollLock: React.FC = () => {
  useEffect(() => {
    let wasLocked = false;

    const checkModals = () => {
      // Find any modal / overlay / drawer currently mounted
      const overlays = document.querySelectorAll(
        ".fixed.inset-0.z-50, [role='dialog'], [data-modal='true']"
      );

      // Only consider visible ones
      let hasVisibleModal = false;
      for (const el of Array.from(overlays)) {
        // Exclude full page loaders or inline containers if hidden
        const style = window.getComputedStyle(el);
        if (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0"
        ) {
          hasVisibleModal = true;
          break;
        }
      }

      if (hasVisibleModal && !wasLocked) {
        lockBodyScroll();
        wasLocked = true;
      } else if (!hasVisibleModal && wasLocked) {
        unlockBodyScroll();
        wasLocked = false;
      }
    };

    const observer = new MutationObserver(() => {
      checkModals();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    // Prevent wheel and touch dragging when cursor/finger is directly on modal backdrops
    const handleBackdropScroll = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.classList &&
        target.classList.contains("fixed") &&
        target.classList.contains("inset-0")
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("touchmove", handleBackdropScroll, {
      passive: false,
    });
    window.addEventListener("wheel", handleBackdropScroll, {
      passive: false,
    });

    // Run initial check
    checkModals();

    return () => {
      observer.disconnect();
      window.removeEventListener("touchmove", handleBackdropScroll);
      window.removeEventListener("wheel", handleBackdropScroll);
      if (wasLocked) {
        unlockBodyScroll();
      }
    };
  }, []);

  return null;
};

export default GlobalScrollLock;
