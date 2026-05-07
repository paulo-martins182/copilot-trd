import { useEffect } from "react";
import type { RefObject } from "react";
import { rectToBounds } from "@renderer/lib/browserBounds";

export function useBrowserBounds(ref: RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    if (!active) {
      void window.tradeScope.browser.setVisible({ visible: false });
      return;
    }

    const element = ref.current;
    if (!element) return;

    const update = () => {
      const rect = element.getBoundingClientRect();
      void window.tradeScope.browser.setBounds(rectToBounds(rect));
      void window.tradeScope.browser.setVisible({ visible: true });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      void window.tradeScope.browser.setVisible({ visible: false });
    };
  }, [active, ref]);
}
