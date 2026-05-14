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
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">运行时凭据</p>
          <h2>手动输入 Base URL 和 API Key</h2>
        </div>
      </div>

      <div className="stack-fields">
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

      <p className="security-note">
        这两个值只会跟随当前请求发送到服务端，不会写入任务历史；页面会把它们缓存到当前浏览器，方便下次继续使用。
      </p>

      <div className="inline-actions">
        <button className="secondary-button" onClick={onClearCache} type="button">
          清空本地缓存
        </button>
      </div>
    </section>
  );
}
