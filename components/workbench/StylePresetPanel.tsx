import { STYLE_PRESETS } from "@/lib/prompt/presets";
import type { StylePresetId } from "@/lib/types";

interface StylePresetPanelProps {
  value: StylePresetId;
  onChange: (value: StylePresetId) => void;
}

export function StylePresetPanel({ value, onChange }: StylePresetPanelProps) {
  return (
    <label className="field">
      <span className="field__label">风格</span>
      <select className="text-input" onChange={(event) => onChange(event.target.value as StylePresetId)} value={value}>
        {STYLE_PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
      </select>
    </label>
  );
}
