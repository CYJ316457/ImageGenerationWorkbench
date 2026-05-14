interface ImageEditorUploadProps {
  sourceImageName: string;
  maskImageName: string;
  onSourceImageChange: (file: File | null) => void;
  onMaskImageChange: (file: File | null) => void;
}

export function ImageEditorUpload({
  sourceImageName,
  maskImageName,
  onSourceImageChange,
  onMaskImageChange
}: ImageEditorUploadProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">图片编辑</p>
          <h2>上传原图，必要时附加遮罩</h2>
        </div>
      </div>
      <div className="upload-grid">
        <label className="upload-card">
          <span>原图（PNG / JPG / WebP）</span>
          <input
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => onSourceImageChange(event.target.files?.[0] ?? null)}
            type="file"
          />
          <strong>{sourceImageName || "未选择文件"}</strong>
        </label>
        <label className="upload-card">
          <span>遮罩（可选，仅 PNG）</span>
          <input accept="image/png" onChange={(event) => onMaskImageChange(event.target.files?.[0] ?? null)} type="file" />
          <strong>{maskImageName || "未选择文件"}</strong>
        </label>
      </div>
    </section>
  );
}
