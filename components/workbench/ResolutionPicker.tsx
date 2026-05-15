import type { ResolutionOption } from "@/lib/types";

const options: Array<{ value: ResolutionOption; label: string }> = [
  { value: "auto", label: "自动" },
  { value: "1024x1024", label: "1:1 · 1024×1024" },
  { value: "1536x1024", label: "横图 · 1536×1024" },
  { value: "1024x1536", label: "竖图 · 1024×1536" }
];

interface ResolutionPickerProps {
  value: ResolutionOption;
  onChange: (value: ResolutionOption) => void;
}

export function ResolutionPicker({ value, onChange }: ResolutionPickerProps) {
  return (
    <label className="field">
      <span className="field__label">分辨率</span>
      <select className="text-input" onChange={(event) => onChange(event.target.value as ResolutionOption)} value={value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
