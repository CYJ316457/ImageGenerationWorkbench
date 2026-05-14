# 生图工作台

一个可部署到服务端、通过网页访问的生图与编辑工作台，围绕 OpenAI 官方图片模型提供：

- 文本生图
- 上传原图后编辑
- 提示词优化
- 预制风格提示词
- 可选分辨率
- 历史任务回看、失败原因展示、结果复用

## 本地开发

```bash
npm install
copy .env.example .env.local
npm run dev
```

打开 `http://localhost:3000`。

## 环境变量

- `OPENAI_API_KEY`：必填，服务端图片模型调用
- `OPENAI_IMAGE_MODEL`：默认 `gpt-image-1`

## Docker 部署

```bash
docker build -t image-generation-workbench .
docker run --rm -p 3000:3000 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e OPENAI_IMAGE_MODEL=gpt-image-1 \
  -v image-workbench-data:/app/data \
  image-generation-workbench
```

## 当前实现说明

- 任务元数据先使用本地 JSON 文件存储，适合单用户 / 小团队内部部署
- 图片结果统一通过 `/api/assets/[assetId]` 回放
- 后续如需切 PostgreSQL / 对象存储，可以在 `lib/tasks/repository.ts` 和 `lib/storage/adapter.ts` 上做无侵入替换
