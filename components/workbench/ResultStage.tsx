import Image from "next/image";

import type { ImageProtocol, ImageTaskSummary, TaskMode } from "@/lib/types";

interface ResultStageProps {
  activeTask: ImageTaskSummary | null;
  errorMessage: string;
  isSubmitting: boolean;
  elapsedSeconds: number;
  mode: TaskMode;
  protocol: ImageProtocol;
}

function protocolLabel(protocol: ImageProtocol) {
  return protocol === "responses" ? "Responses 协议" : "生图协议";
}

export function ResultStage({
  activeTask,
  errorMessage,
  isSubmitting,
  elapsedSeconds,
  mode,
  protocol
}: ResultStageProps) {
  if (isSubmitting) {
    return (
      <section className="panel result-stage">
        <div className="loading-state">
          <div className="loading-spinner" aria-hidden="true" />
          <p className="eyebrow">生成中</p>
          <h2>{mode === "generate" ? "正在生图" : "正在编辑图片"}</h2>
          <p className="loading-state__time">已耗时 {elapsedSeconds} 秒</p>
          <p className="loading-state__hint">
            当前使用 {protocolLabel(protocol)}，通常需要 10-30 秒，复杂任务会更久。
          </p>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="panel result-stage">
        <div className="empty-state error">
          <p className="eyebrow">执行失败</p>
          <h2>这次任务没有成功</h2>
          <p>{errorMessage}</p>
        </div>
      </section>
    );
  }

  if (!activeTask) {
    return (
      <section className="panel result-stage">
        <div className="empty-state">
          <p className="eyebrow">结果区</p>
          <h2>这里显示最新结果</h2>
          <p>填写提示词后发起任务，结果会直接显示在这里。</p>
        </div>
      </section>
    );
  }

  const resultUrl = activeTask.outputUrls[0];

  return (
    <section className="panel result-stage">
      <div className="panel__header">
        <div>
          <p className="eyebrow">{activeTask.mode === "generate" ? "生图结果" : "编辑结果"}</p>
          <h2>{activeTask.styleLabel}</h2>
        </div>
        {resultUrl ? (
          <a className="primary-link" download href={resultUrl} target="_blank">
            下载
          </a>
        ) : null}
      </div>
      <p className="result-stage__summary">{activeTask.optimizedPrompt}</p>
      <div className={`comparison-grid ${activeTask.sourceImageUrl ? "two-up" : ""}`}>
        {activeTask.sourceImageUrl ? (
          <figure className="image-frame muted">
            <figcaption>原图</figcaption>
            <Image alt="原图" height={1024} src={activeTask.sourceImageUrl} unoptimized width={1024} />
          </figure>
        ) : null}
        {resultUrl ? (
          <figure className="image-frame">
            <figcaption>结果</figcaption>
            <Image alt={activeTask.originalPrompt} height={1024} src={resultUrl} unoptimized width={1024} />
          </figure>
        ) : null}
      </div>
    </section>
  );
}
