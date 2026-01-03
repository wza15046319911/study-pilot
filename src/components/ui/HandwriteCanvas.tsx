"use client";

import { useRef, useState, useEffect } from "react";
import { getStroke } from "perfect-freehand";
import { Button } from "@/components/ui/Button";
import { Undo, Trash2, Eraser, Pen } from "lucide-react";

interface HandwriteCanvasProps {
  width?: number; // Optional fixed width, otherwise responsive
  height?: number;
  strokeColor?: string;
  backgroundColor?: string;
  onStroke?: () => void; // Callback when drawing happens
  readOnly?: boolean;
}

export function HandwriteCanvas({
  width,
  height = 400,
  strokeColor = "#000",
  backgroundColor = "#fff",
  onStroke,
  readOnly = false,
}: HandwriteCanvasProps) {
  const [points, setPoints] = useState<number[][]>([]);
  const [lines, setLines] = useState<number[][][]>([]); // Array of strokes
  const svgRef = useRef<SVGSVGElement>(null);

  // Handle pointer events
  const handlePointerDown = (e: React.PointerEvent) => {
    if (readOnly) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = [e.nativeEvent.offsetX, e.nativeEvent.offsetY, e.pressure];
    setPoints([point]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (readOnly) return;
    if (e.buttons !== 1) return;
    const point = [e.nativeEvent.offsetX, e.nativeEvent.offsetY, e.pressure];
    setPoints((prev) => [...prev, point]);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (readOnly) return;
    if (points.length > 0) {
      setLines((prev) => [...prev, points]);
      setPoints([]);
      onStroke?.();
    }
  };

  const handleClear = () => {
    setLines([]);
    setPoints([]);
    onStroke?.();
  };

  const handleUndo = () => {
    setLines((prev) => prev.slice(0, -1));
    onStroke?.();
  };

  // Render current stroke
  const currentStroke = getStroke(points, {
    size: 4,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    last: false, // Don't close the stroke while drawing
  });

  // Render finalized lines
  // ...

  const getPathData = (strokePoints: number[][]) => {
    const stroke = getStroke(strokePoints, {
      size: 4,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });

    if (!stroke.length) return "";

    const d = stroke.reduce(
      (acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length];
        acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        return acc;
      },
      ["M", ...stroke[0], "Q"]
    );

    d.push("Z");
    return d.join(" ");
  };

  return (
    <div
      className="flex flex-col gap-2 w-full h-full relative"
      style={{ touchAction: "none" }}
    >
      <div
        className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-900"
        style={{ height }}
      >
        <svg
          ref={svgRef}
          className="w-full h-full cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ touchAction: "none" }}
        >
          {lines.map((line, i) => (
            <path
              key={i}
              d={getPathData(line)}
              fill={strokeColor}
              className="dark:fill-white"
            />
          ))}
          {points.length > 0 && (
            <path
              d={getPathData(points)}
              fill={strokeColor}
              className="dark:fill-white opacity-80"
            />
          )}
        </svg>

        {/* Floating Toolbar */}
        {!readOnly && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-gray-200 dark:border-gray-700 p-1.5 rounded-full shadow-lg opacity-80 hover:opacity-100 transition-opacity">
            <button
              onClick={handleUndo}
              disabled={lines.length === 0}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30"
              title="Undo"
            >
              <Undo className="size-4" />
            </button>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
            <div className="flex items-center gap-1 px-2">
              <Pen className="size-3 text-current" />
              <span className="text-xs font-mono font-medium opacity-50">
                DRAW
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              onClick={handleClear}
              disabled={lines.length === 0}
              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 disabled:opacity-30"
              title="Clear"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
