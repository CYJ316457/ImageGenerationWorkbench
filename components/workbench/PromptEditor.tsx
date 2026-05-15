interface PromptEditorProps {
  prompt: string;
  onChange: (value: string) => void;
  optimizedPrompt: string;
  enableOptimization: boolean;
  onOptimizationChange: (value: boolean) => void;
}

export function PromptEditor({
  prompt,
  onChange,
  optimizedPrompt,
  enableOptimization,
  onOptimizationChange
}: PromptEditorProps) {
  const shouldShowPreview = enableOptimization && prompt.trim().length > 0;

  return (
    <section className="panel panel--compact">
      <div className="panel__header">
        <div>
          <p className="eyebrow">提示词</p>
        </div>
        <label className="switch">
          <input
            checked={enableOptimization}
            onChange={(event) => onOptimizationChange(event.target.checked)}
            type="checkbox"
          />
          <span>优化</span>
        </label>
      </div>
      <textarea
        className="textarea textarea--compact"
        onChange={(event) => onChange(event.target.value)}
        placeholder="例如：小米汽车在海边黄昏的电影感海报，橙色车身，天空有层次感。"
        rows={3}
        value={prompt}
      />
      {shouldShowPreview ? (
        <div className="prompt-preview prompt-preview--compact">
          <p className="eyebrow">优化预览</p>
          <pre>{optimizedPrompt}</pre>
        </div>
      ) : null}
    </section>
  );
}
