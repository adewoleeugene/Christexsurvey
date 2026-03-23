"use client";

import { LocateFixed, RotateCcw, Plus, Minus, PanelLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/theme-toggle";
import { useReportsStore } from "@/store/reports-store";

interface MapControlsProps {
  onLocateMe: () => void;
  onResetView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function MapControls({
  onLocateMe,
  onResetView,
  onZoomIn,
  onZoomOut,
}: MapControlsProps) {
  const { isPanelVisible, setPanelVisible } = useReportsStore();

  return (
    <>
      {/* Top-right controls */}
      {!isPanelVisible && (
        <div className="absolute right-4 top-4 z-[1000]">
          <ControlButton
            icon={PanelLeft}
            onClick={() => setPanelVisible(true)}
            title="Show panel"
          />
        </div>
      )}

      {/* Bottom-right controls */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <ControlButton
          icon={LocateFixed}
          onClick={onLocateMe}
          title="Locate me"
        />
        <ControlButton
          icon={RotateCcw}
          onClick={onResetView}
          title="Reset view"
        />
        <div className="flex flex-col overflow-hidden rounded-lg border bg-background shadow-lg">
          <button
            onClick={onZoomIn}
            className="flex size-11 items-center justify-center border-b transition-colors hover:bg-accent"
            title="Zoom in"
          >
            <Plus className="size-4" />
          </button>
          <button
            onClick={onZoomOut}
            className="flex size-11 items-center justify-center transition-colors hover:bg-accent"
            title="Zoom out"
          >
            <Minus className="size-4" />
          </button>
        </div>
      </div>
    </>
  );
}

function ControlButton({
  icon: Icon,
  onClick,
  title,
}: {
  icon: React.ElementType;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "flex size-11 items-center justify-center rounded-lg border bg-background shadow-lg transition-colors hover:bg-accent"
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
