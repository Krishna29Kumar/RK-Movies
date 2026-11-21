"use client";

import { useEffect, useRef } from "react";

export default function ViewfinderCursor() {
  const cursorElRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100, w: 30, h: 30 });
  const target = useRef({ x: -100, y: -100, w: 30, h: 30 });
  const isHoveredRef = useRef(false);
  const isDownRef = useRef(false);
  const isVisibleRef = useRef(false);
  const activeElementRef = useRef<HTMLElement | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable custom cursor for devices with mouse/fine pointer
    if (
      typeof window === "undefined" ||
      window.matchMedia("(pointer: coarse)").matches ||
      !window.matchMedia("(hover: hover)").matches
    ) {
      return;
    }

    const PADDING = 6;
    const DEFAULT_SIZE = 30;

    const getInteractiveBox = (el: HTMLElement | null): HTMLElement | null => {
      if (!el) return null;
      const box = el.closest<HTMLElement>(
        'button, a, input, textarea, select, [role="button"], [role="link"], [data-cursor-box], [data-cursor="box"], .cursor-box, article, [role="tab"], [role="menuitem"], label'
      );
      if (!box) return null;
      if (box.hasAttribute("disabled") || box.getAttribute("aria-disabled") === "true") {
        return null;
      }
      const rect = box.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      if (rect.width > window.innerWidth * 0.95 || rect.height > window.innerHeight * 0.85) {
        return null;
      }
      return box;
    };

    const updateTargetFromElement = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      target.current.x = rect.left - PADDING;
      target.current.y = rect.top - PADDING;
      target.current.w = rect.width + PADDING * 2;
      target.current.h = rect.height + PADDING * 2;
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        current.current.x = e.clientX - DEFAULT_SIZE / 2;
        current.current.y = e.clientY - DEFAULT_SIZE / 2;
        if (cursorElRef.current) {
          cursorElRef.current.style.opacity = "1";
        }
      }

      const targetEl =
        e.target instanceof HTMLElement
          ? e.target
          : (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null);

      const box = getInteractiveBox(targetEl);

      if (box) {
        activeElementRef.current = box;
        isHoveredRef.current = true;
        updateTargetFromElement(box);
        cursorElRef.current?.classList.add("is-hovered");
      } else {
        activeElementRef.current = null;
        isHoveredRef.current = false;
        target.current.x = mouse.current.x - DEFAULT_SIZE / 2;
        target.current.y = mouse.current.y - DEFAULT_SIZE / 2;
        target.current.w = DEFAULT_SIZE;
        target.current.h = DEFAULT_SIZE;
        cursorElRef.current?.classList.remove("is-hovered");
      }
    };

    const handlePointerDown = () => {
      isDownRef.current = true;
    };

    const handlePointerUp = () => {
      isDownRef.current = false;
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      if (cursorElRef.current) cursorElRef.current.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      if (cursorElRef.current) cursorElRef.current.style.opacity = "1";
    };

    const handleScrollOrResize = () => {
      if (activeElementRef.current) {
        if (!document.body.contains(activeElementRef.current)) {
          activeElementRef.current = null;
          isHoveredRef.current = false;
          target.current.w = DEFAULT_SIZE;
          target.current.h = DEFAULT_SIZE;
          target.current.x = mouse.current.x - DEFAULT_SIZE / 2;
          target.current.y = mouse.current.y - DEFAULT_SIZE / 2;
          cursorElRef.current?.classList.remove("is-hovered");
        } else {
          updateTargetFromElement(activeElementRef.current);
        }
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("blur", handleMouseLeave);
    window.addEventListener("focus", handleMouseEnter);
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    const tick = () => {
      if (activeElementRef.current) {
        if (!document.body.contains(activeElementRef.current)) {
          activeElementRef.current = null;
          isHoveredRef.current = false;
          target.current.w = DEFAULT_SIZE;
          target.current.h = DEFAULT_SIZE;
          target.current.x = mouse.current.x - DEFAULT_SIZE / 2;
          target.current.y = mouse.current.y - DEFAULT_SIZE / 2;
          cursorElRef.current?.classList.remove("is-hovered");
        } else {
          updateTargetFromElement(activeElementRef.current);
        }
      }

      const hovered = isHoveredRef.current;
      const dist = Math.hypot(
        target.current.x - current.current.x,
        target.current.y - current.current.y
      );

      // Positional lerp: very fast & responsive when tracking mouse, smooth spring-like ease when locking to a box
      const posSpeed = hovered ? 0.22 : Math.min(0.75, 0.45 + dist * 0.001);
      const sizeSpeed = 0.24;

      current.current.x += (target.current.x - current.current.x) * posSpeed;
      current.current.y += (target.current.y - current.current.y) * posSpeed;
      current.current.w += (target.current.w - current.current.w) * sizeSpeed;
      current.current.h += (target.current.h - current.current.h) * sizeSpeed;

      if (cursorElRef.current) {
        const scale = isDownRef.current ? 0.94 : 1;
        cursorElRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) scale(${scale})`;
        cursorElRef.current.style.width = `${current.current.w}px`;
        cursorElRef.current.style.height = `${current.current.h}px`;
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("blur", handleMouseLeave);
      window.removeEventListener("focus", handleMouseEnter);
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, []);

  return (
    <div
      ref={cursorElRef}
      aria-hidden="true"
      className="viewfinder-cursor pointer-events-none fixed left-0 top-0 z-[99999]"
      style={{
        opacity: 0,
        willChange: "transform, width, height, opacity",
      }}
    >
      <span className="viewfinder-corner top-left" />
      <span className="viewfinder-corner top-right" />
      <span className="viewfinder-corner bottom-left" />
      <span className="viewfinder-corner bottom-right" />
    </div>
  );
}

