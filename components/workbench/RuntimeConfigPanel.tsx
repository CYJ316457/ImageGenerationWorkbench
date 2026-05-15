interface RuntimeConfigPanelProps {
  apiKey: string;
  baseUrl: string;
  onApiKeyChange: (value: string) => void;
  onBaseUrlChange: (value: string) => void;
  onClearCache: () => void;
}

export function RuntimeConfigPanel({
  apiKey,
  baseUrl,
  onApiKeyChange,
  onBaseUrlChange,
  onClearCache
}: RuntimeConfigPanelProps) {
  return (
    <section className="panel panel--compact">
      <div className="compact-header">
        <div>
          <p className="eyebrow">工作台</p>
          <h1 className="compact-title">生图工作台</h1>
        </div>
        <button className="secondary-button" onClick={onClearCache} type="button">
          清缓存
        </button>
      </div>

      <div className="runtime-grid">
        <label className="field">
          <span className="field__label">Base URL</span>
          <input
            className="text-input"
            onChange={(event) => onBaseUrlChange(event.target.value)}
            placeholder="https://api.openai.com/v1"
            spellCheck={false}
            type="url"
            value={baseUrl}
          />
        </label>

        <label className="field">
          <span className="field__label">API Key</span>
          <input
            autoComplete="off"
            className="text-input"
            onChange={(event) => onApiKeyChange(event.target.value)}
            placeholder="sk-..."
            spellCheck={false}
            type="password"
            value={apiKey}
          />
        </label>
      </div>
    </section>
  );
}
