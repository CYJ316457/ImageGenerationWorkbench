# 生图工作台

一个可部署到服务端、通过网页访问的生图与编辑工作台，围绕 OpenAI 图片模型提供：

- 文本生图
- 上传原图后编辑
- 提示词优化
- 预制风格提示词
- 可选分辨率
- 历史任务回看、失败原因展示、结果复用
- 前端手动输入 `Base URL + API Key`
- 当前浏览器本地缓存运行时配置和草稿参数

## 本地开发

```bash
npm install
copy .env.example .env.local
npm run dev
```

打开 `http://localhost:3000`。

## 环境变量

- `OPENAI_IMAGE_MODEL`：可选，默认 `gpt-image-1`

## 运行方式

启动后，在网页里手动填写：

- `Base URL`
- `API Key`

这两个值会：

- 只跟随当前请求发送到服务端
- 不写入任务历史和本地服务端数据文件
- 缓存在当前浏览器的 `localStorage`，方便下次继续使用

## Docker 部署

```bash
docker build -t image-generation-workbench .
docker run --rm -p 3000:3000 \
  -e OPENAI_IMAGE_MODEL=gpt-image-1 \
  -v image-workbench-data:/app/data \
  image-generation-workbench
```

> 当前镜像不要求预先注入 `OPENAI_API_KEY`，由网页运行时输入。

## 当前实现说明

- 任务元数据先使用本地 JSON 文件存储，适合单用户 / 小团队内部部署
- 图片结果统一通过 `/api/assets/[assetId]` 回放
- 后续如需切到 PostgreSQL / 对象存储，可以在 `lib/tasks/repository.ts` 和 `lib/storage/adapter.ts` 上做无侵入替换
- 当前浏览器缓存包含：模式、提示词草稿、风格、分辨率、优化开关、`Base URL`、`API Key`
