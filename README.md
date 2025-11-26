# HieroglyphAI 

> 将中文拆解为视觉元素的AI助手

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple)](https://vitejs.dev/)
[![AI Powered](https://img.shields.io/badge/AI-Gemini--2.5--Flash-orange)](https://ai.google.dev/)


## 灵感来源

画猜群友

## 部署指南

1. 安装依赖：`npm install`
2. 配置环境变量（可选）：若需要在本地开发或手动构建时注入 Key，请在 `.env.local` 中设置 `GEMINI_API_KEY`。
	- 注意：GitHub Actions CI 默认不会把 `GEMINI_API_KEY` 注入到构建中，CI 构建会在没有密钥的情况下运行。如果你需要在 CI 中注入密钥，请仅在受控私有 workflow 中执行或使用受限权限的部署流程，以免泄露到静态前端。
3. 运行项目：`npm run dev`

## 运行时提供 API Key（可选）

你现在可以在应用内直接输入 Gemini API Key：打开界面右上或检索区域的“过滤与偏好”面板，在“API Key (可选)”输入框中粘贴你的 Key，应用会将其保存在本地浏览器的 `localStorage`（键名 `hieroglyph_api_key`）。

- 如果你提供了运行时 Key，应用将在请求时优先使用它。
- 如果未提供运行时 Key，应用仍会尝试回退到构建时注入的 `GEMINI_API_KEY`（仅当你在构建时注入了该 Key），否则你须在运行时通过 UI 提供 Key（App 有一个“API Key (可选)”输入框）。

注意：本地保存仅限当前浏览器/设备，使用时请保管好你的密钥，不要在不安全的环境中共享。
