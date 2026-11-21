"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

interface ClockTimePickerProps {
  label: string;
  value: string; // "HH:mm" (24-hour format)
  onChange: (value24: string) => void;
  required?: boolean;
  placeholder?: string;
}

function parse24(val?: string): { hour12: number; minute: number; period: "AM" | "PM" } {
  if (!val || !val.includes(":")) {
    return { hour12: 10, minute: 0, period: "AM" };
  }
  const [hStr, mStr] = val.split(":");
  const h24 = parseInt(hStr, 10);
  const m = parseInt(mStr, 10) || 0;
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  let hour12 = h24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute: m, period };
}

function format24(hour12: number, minute: number, period: "AM" | "PM"): string {
  let h = hour12 % 12;
  if (period === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatDisplay(hour12: number, minute: number, period: "AM" | "PM"): string {
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

export default function ClockTimePicker({
  label,
  value,
  onChange,
  required = false,
  placeholder = "Select time",
}: ClockTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const parsed = useMemo(() => parse24(value), [value]);

  const [hour12, setHour12] = useState(parsed.hour12);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(parsed.period);
  const [activeMode, setActiveMode] = useState<"hour" | "minute">("hour");
  const [draggingHand, setDraggingHand] = useState<"hour" | "minute" | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<SVGSVGElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    setHour12(parsed.hour12);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
  }, [parsed]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const updateTime = (newHour: number, newMin: number, newPeriod: "AM" | "PM") => {
    setHour12(newHour);
    setMinute(newMin);
    setPeriod(newPeriod);
    onChange(format24(newHour, newMin, newPeriod));
  };

  const CENTER = 135;
  const HOUR_RADIUS = 95;
  const HOUR_HAND_LEN = 55;
  const MIN_HAND_LEN = 85;

  // Angles (0 deg is 12 o'clock)
  const hourAngle = ((hour12 % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;

  // Needles tip coordinates
  const hourTipX = CENTER + HOUR_HAND_LEN * Math.sin((hourAngle * Math.PI) / 180);
  const hourTipY = CENTER - HOUR_HAND_LEN * Math.cos((hourAngle * Math.PI) / 180);

  const minTipX = CENTER + MIN_HAND_LEN * Math.sin((minuteAngle * Math.PI) / 180);
  const minTipY = CENTER - MIN_HAND_LEN * Math.cos((minuteAngle * Math.PI) / 180);

  // Calculate pointer angle relative to center
  const getAngleFromEvent = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!clockRef.current) return { deg: 0, dist: 0 };
    const rect = clockRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const dist = Math.hypot(x, y);
    let rad = Math.atan2(y, x);
    let deg = (rad * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    return { deg, dist };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const { deg, dist } = getAngleFromEvent(e);

    // If click is right in the center (where AM/PM pill is located), don't drag needle
    if (dist < 34) return;

    // Check if closer to hour tip or minute tip
    const rect = clockRef.current!.getBoundingClientRect();
    const scale = rect.width / 270;
    const clickX = (e.clientX - rect.left) / scale;
    const clickY = (e.clientY - rect.top) / scale;

    const distToHourTip = Math.hypot(clickX - hourTipX, clickY - hourTipY);
    const distToMinTip = Math.hypot(clickX - minTipX, clickY - minTipY);

    let hand: "hour" | "minute";
    if (distToHourTip < 24) {
      hand = "hour";
    } else if (distToMinTip < 24) {
      hand = "minute";
    } else if (dist < 75) {
      hand = "hour";
    } else {
      hand = activeMode;
    }

    setDraggingHand(hand);
    setActiveMode(hand);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (hand === "hour") {
      let h = Math.round(deg / 30) % 12;
      if (h === 0) h = 12;
      updateTime(h, minute, period);
    } else {
      let m = Math.round(deg / 6) % 60;
      updateTime(hour12, m, period);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingHand) return;
    const { deg } = getAngleFromEvent(e);

    if (draggingHand === "hour") {
      let h = Math.round(deg / 30) % 12;
      if (h === 0) h = 12;
      updateTime(h, minute, period);
    } else if (draggingHand === "minute") {
      let m = Math.round(deg / 6) % 60;
      updateTime(hour12, m, period);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setDraggingHand(null);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
  };

  const PRESETS = [
    { label: "09:00 AM", h: 9, m: 0, p: "AM" as const },
    { label: "11:00 AM", h: 11, m: 0, p: "AM" as const },
    { label: "02:00 PM", h: 2, m: 0, p: "PM" as const },
    { label: "05:00 PM", h: 5, m: 0, p: "PM" as const },
    { label: "08:00 PM", h: 8, m: 0, p: "PM" as const },
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger button formatted as input */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={[
          "input flex items-center justify-between text-left transition-colors",
          isOpen ? "border-orange ring-1 ring-orange/30" : "hover:border-line-strong",
        ].join(" ")}
      >
        <span className={value ? "font-mono font-medium text-cream" : "text-muted"}>
          {value ? formatDisplay(hour12, minute, period) : placeholder}
        </span>
        <svg
          className={`h-4 w-4 transition-colors ${isOpen ? "text-orange" : "text-muted"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        </svg>
      </button>

      {/* Hidden real input for required form validation */}
      <input
        type="text"
        className="sr-only"
        tabIndex={-1}
        required={required}
        value={value}
        onChange={() => {}}
      />

      {/* Clock popover */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[290px] max-w-[320px] rounded-sm border border-line-strong bg-bg-raised p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header with digital preview & mode switch */}
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {label}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveMode("hour")}
                className={`rounded px-2 py-0.5 font-display text-xl tracking-wide transition-colors ${
                  activeMode === "hour"
                    ? "bg-orange-soft text-orange border border-orange/40"
                    : "text-cream hover:bg-bg-raised-2"
                }`}
              >
                {String(hour12).padStart(2, "0")}
              </button>
              <span className="font-display text-lg text-cream/60">:</span>
              <button
                type="button"
                onClick={() => setActiveMode("minute")}
                className={`rounded px-2 py-0.5 font-display text-xl tracking-wide transition-colors ${
                  activeMode === "minute"
                    ? "bg-teal-soft text-teal border border-teal/40"
                    : "text-cream hover:bg-bg-raised-2"
                }`}
              >
                {String(minute).padStart(2, "0")}
              </button>
              <span className="ml-1 rounded bg-bg-raised-2 px-1.5 py-0.5 font-mono text-[11px] font-bold text-orange">
                {period}
              </span>
            </div>
          </div>

          {/* Guide hint */}
          <p className="mt-2 text-center font-mono text-[10px] text-muted">
            Drag <span className="text-orange font-semibold">orange</span> for Hour •{" "}
            <span className="text-teal font-semibold">teal</span> for Minute
          </p>

          {/* Analog Clock Dial Container */}
          <div className="relative mx-auto mt-2 h-[270px] w-[270px] select-none touch-none">
            <svg
              ref={clockRef}
              viewBox="0 0 270 270"
              className="h-full w-full cursor-crosshair"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Dial Background */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r="128"
                fill="var(--bg-raised-2)"
                stroke="var(--line-strong)"
                strokeWidth="2"
              />
              <circle
                cx={CENTER}
                cy={CENTER}
                r="120"
                fill="none"
                stroke="var(--line)"
                strokeWidth="1"
                strokeDasharray="2 4"
              />

              {/* 60 Minute tick marks */}
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = i * 6;
                const isMajor = i % 5 === 0;
                const r1 = isMajor ? 116 : 120;
                const r2 = 124;
                const x1 = CENTER + r1 * Math.sin((angle * Math.PI) / 180);
                const y1 = CENTER - r1 * Math.cos((angle * Math.PI) / 180);
                const x2 = CENTER + r2 * Math.sin((angle * Math.PI) / 180);
                const y2 = CENTER - r2 * Math.cos((angle * Math.PI) / 180);

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isMajor ? "var(--cream)" : "var(--line-strong)"}
                    strokeWidth={isMajor ? 1.5 : 0.75}
                    opacity={isMajor ? 0.7 : 0.35}
                  />
                );
              })}

              {/* 12 Hour Numbers */}
              {Array.from({ length: 12 }).map((_, i) => {
                const h = i + 1;
                const angle = h * 30;
                const x = CENTER + HOUR_RADIUS * Math.sin((angle * Math.PI) / 180);
                const y = CENTER - HOUR_RADIUS * Math.cos((angle * Math.PI) / 180);
                const isSelected = hour12 === h;

                return (
                  <g
                    key={h}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTime(h, minute, period);
                      setActiveMode("minute");
                    }}
                  >
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="14"
                        fill="var(--orange-soft)"
                        stroke="var(--orange)"
                        strokeWidth="1.5"
                      />
                    )}
                    <text
                      x={x}
                      y={y + 4.5}
                      textAnchor="middle"
                      fill={isSelected ? "var(--orange)" : "var(--cream)"}
                      fontSize={isSelected ? "14" : "12"}
                      fontWeight={isSelected ? "700" : "500"}
                      fontFamily="var(--font-mono)"
                    >
                      {h}
                    </text>
                  </g>
                );
              })}

              {/* Minute Needle (Teal) */}
              <line
                x1={CENTER}
                y1={CENTER}
                x2={minTipX}
                y2={minTipY}
                stroke="var(--teal)"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity={activeMode === "minute" ? 1 : 0.8}
              />
              {/* Minute Needle Tip Handle */}
              <g className="cursor-grab active:cursor-grabbing">
                <circle
                  cx={minTipX}
                  cy={minTipY}
                  r={activeMode === "minute" ? "9" : "7.5"}
                  fill="var(--teal)"
                  stroke="var(--cream)"
                  strokeWidth="2"
                  className="transition-all"
                />
                <circle cx={minTipX} cy={minTipY} r="3" fill="var(--bg)" />
              </g>

              {/* Hour Needle (Orange) */}
              <line
                x1={CENTER}
                y1={CENTER}
                x2={hourTipX}
                y2={hourTipY}
                stroke="var(--orange)"
                strokeWidth="4"
                strokeLinecap="round"
                opacity={activeMode === "hour" ? 1 : 0.85}
              />
              {/* Hour Needle Tip Handle */}
              <g className="cursor-grab active:cursor-grabbing">
                <circle
                  cx={hourTipX}
                  cy={hourTipY}
                  r={activeMode === "hour" ? "10" : "8.5"}
                  fill="var(--orange)"
                  stroke="var(--cream)"
                  strokeWidth="2"
                  className="transition-all"
                />
                <circle cx={hourTipX} cy={hourTipY} r="3.5" fill="var(--bg)" />
              </g>
            </svg>

            {/* In the middle of the clock: AM and PM written */}
            <div className="pointer-events-auto absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center gap-1 rounded-full border border-line-strong bg-bg-raised p-1 shadow-xl">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTime(hour12, minute, "AM");
                  }}
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider transition-all ${
                    period === "AM"
                      ? "bg-orange text-bg shadow-sm"
                      : "text-muted hover:text-cream"
                  }`}
                  aria-label="Set AM"
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTime(hour12, minute, "PM");
                  }}
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider transition-all ${
                    period === "PM"
                      ? "bg-orange text-bg shadow-sm"
                      : "text-muted hover:text-cream"
                  }`}
                  aria-label="Set PM"
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Quick presets strip */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 border-t border-line pt-2.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => updateTime(preset.h, preset.m, preset.p)}
                className="rounded-sm border border-line bg-bg px-2 py-1 font-mono text-[10px] text-muted transition-colors hover:border-orange hover:text-orange"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Done confirmation button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-3 w-full rounded-sm bg-orange px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-bg transition-opacity hover:opacity-90"
          >
            Confirm Time
          </button>
        </div>
      )}
    </div>
  );
}

