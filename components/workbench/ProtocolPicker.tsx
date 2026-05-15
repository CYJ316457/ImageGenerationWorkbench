import type { ImageProtocol } from "@/lib/types";

const options: Array<{ value: ImageProtocol; label: string; help: string }> = [
  { value: "images", label: "生图协议", help: "默认，直接走 Images API" },
  { value: "responses", label: "Responses 协议", help: "走 Responses API + image_generation 工具" }
];

interface ProtocolPickerProps {
  value: ImageProtocol;
  onChange: (value: ImageProtocol) => void;
}

export function ProtocolPicker({ value, onChange }: ProtocolPickerProps) {
  return (
    <label className="field">
      <span className="field__label">协议</span>
      <select className="text-input" onChange={(event) => onChange(event.target.value as ImageProtocol)} value={value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="field__hint">{options.find((option) => option.value === value)?.help}</span>
    </label>
  );
}
