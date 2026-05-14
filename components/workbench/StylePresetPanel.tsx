import { STYLE_PRESETS } from "@/lib/prompt/presets";
import type { StylePresetId } from "@/lib/types";

interface StylePresetPanelProps {
  value: StylePresetId;
  onChange: (value: StylePresetId) => void;
}

export function StylePresetPanel({ value, onChange }: StylePresetPanelProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">风格预设</p>
          <h2>快速给提示词加上稳定视觉方向</h2>
        </div>
      </div>
      <div className="preset-grid">
        {STYLE_PRESETS.map((preset) => (
          <button
            className={`preset-card ${preset.id === value ? "active" : ""}`}
            key={preset.id}
            onClick={() => onChange(preset.id)}
            type="button"
          >
            <div className="preset-card__title">
              <strong>{preset.label}</strong>
              <span>{preset.summary}</span>
            </div>
            <p>{preset.recommendedFor}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
