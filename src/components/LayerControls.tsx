"use client";

export interface LayerVisibility {
  livability: boolean;
  neighborhoods: boolean;
  districts: boolean;
  addresses: boolean;
}

interface LayerControlsProps {
  layers: LayerVisibility;
  onToggle: (key: keyof LayerVisibility) => void;
}

const LAYER_CONFIG: { key: keyof LayerVisibility; label: string; color: string; style: "filled" | "dashed" | "long-dashed" | "dot" }[] = [
  { key: "livability", label: "Livability", color: "#22c55e", style: "filled" },
  { key: "neighborhoods", label: "Neighborhoods", color: "#60a5fa", style: "dashed" },
  { key: "districts", label: "School Districts", color: "#f59e0b", style: "long-dashed" },
  { key: "addresses", label: "Addresses", color: "#ef4444", style: "dot" },
];

function LayerIndicator({ color, style }: { color: string; style: string }) {
  if (style === "filled") {
    return (
      <div
        className="h-3 w-4 rounded-sm border"
        style={{ backgroundColor: color, borderColor: color, opacity: 0.6 }}
      />
    );
  }

  if (style === "dot") {
    return (
      <div
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    );
  }

  return (
    <svg width="16" height="12" viewBox="0 0 16 12">
      <line
        x1="0" y1="6" x2="16" y2="6"
        stroke={color}
        strokeWidth="2"
        strokeDasharray={style === "dashed" ? "4,3" : "8,4"}
      />
    </svg>
  );
}

export default function LayerControls({ layers, onToggle }: LayerControlsProps) {
  return (
    <div className="absolute top-16 right-4 z-[1000] bg-white border border-gray-200 rounded-lg overflow-hidden">
      <p className="px-3 py-1.5 text-[10px] font-medium text-brand-teal uppercase tracking-wider border-b border-gray-100">
        Layers
      </p>
      <div className="py-1">
        {LAYER_CONFIG.map(({ key, label, color, style }) => (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors"
          >
            <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 ${
              layers[key]
                ? "border-brand-teal bg-brand-teal/10"
                : "border-gray-300 bg-transparent"
            }`}>
              {layers[key] && (
                <svg className="h-2.5 w-2.5 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex items-center justify-center w-4 shrink-0">
              <LayerIndicator color={color} style={style} />
            </div>
            <span className={layers[key] ? "text-brand-navy" : "text-brand-teal"}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
