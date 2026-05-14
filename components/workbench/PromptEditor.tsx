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
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">提示词</p>
          <h2>描述你想生成或修改的画面</h2>
        </div>
        <label className="switch">
          <input
            checked={enableOptimization}
            onChange={(event) => onOptimizationChange(event.target.checked)}
            type="checkbox"
          />
          <span>启用提示词优化</span>
        </label>
      </div>
      <textarea
        className="textarea"
        onChange={(event) => onChange(event.target.value)}
        placeholder="例如：做一张小米汽车在海边黄昏的电影感海报，主体是橙色车身，天空有层次感。"
        rows={6}
        value={prompt}
      />
      <div className="prompt-preview">
        <p className="eyebrow">优化后提示词预览</p>
        <pre>{optimizedPrompt || "输入提示词后，这里会显示优化结果。"}</pre>
      </div>
    </section>
  );
}
