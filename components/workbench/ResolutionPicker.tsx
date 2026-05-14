import type { ResolutionOption } from "@/lib/types";

const options: Array<{ value: ResolutionOption; label: string; description: string }> = [
  { value: "auto", label: "自动", description: "让模型自动选择最合适的构图比例" },
  { value: "1024x1024", label: "1:1", description: "适合头像、封面、方图" },
  { value: "1536x1024", label: "横图", description: "适合海报横版、网页头图、场景图" },
  { value: "1024x1536", label: "竖图", description: "适合竖版海报、手机封面、人物全身图" }
];

interface ResolutionPickerProps {
  value: ResolutionOption;
  onChange: (value: ResolutionOption) => void;
}

export function ResolutionPicker({ value, onChange }: ResolutionPickerProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">分辨率</p>
          <h2>选择输出比例</h2>
        </div>
      </div>
      <div className="option-grid">
        {options.map((option) => (
          <button
            className={`option-card ${option.value === value ? "active" : ""}`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
