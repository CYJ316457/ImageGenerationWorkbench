import Image from "next/image";

import type { ImageTaskSummary } from "@/lib/types";

interface ResultStageProps {
  activeTask: ImageTaskSummary | null;
  errorMessage: string;
  isSubmitting: boolean;
}

export function ResultStage({ activeTask, errorMessage, isSubmitting }: ResultStageProps) {
  if (isSubmitting) {
    return (
      <section className="panel result-stage">
        <div className="empty-state">
          <p className="eyebrow">处理中</p>
          <h2>正在生成结果图</h2>
          <p>系统会依次完成提示词优化、调用模型和结果落盘，请稍候。</p>
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
          <h2>这里会显示你最近一次任务的输出</h2>
          <p>先在左侧填写提示词并发起一次生成，或切换到图片编辑模式上传原图。</p>
        </div>
      </section>
    );
  }

  const resultUrl = activeTask.outputUrls[0];

  return (
    <section className="panel result-stage">
      <div className="panel__header">
        <div>
          <p className="eyebrow">结果图</p>
          <h2>{activeTask.mode === "generate" ? "本次生成结果" : "本次编辑结果"}</h2>
        </div>
        {resultUrl ? (
          <a className="primary-link" download href={resultUrl} target="_blank">
            下载图片
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
