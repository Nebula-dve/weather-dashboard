# 🌤️ Weather Dashboard · 天气仪表板

一个从 **Open-Meteo** 公共天气 API 获取数据的轻量天气仪表板。**零后端、零构建、零 API Key、零外部依赖**——纯 HTML/CSS/JS，克隆即用，可直接托管到 GitHub Pages。

## ✨ 功能

- 🔍 **全球城市搜索**（支持中文/英文，如「北京」「London」）
- 🌡️ **当前天气**：温度、体感、湿度、风速、风向、天气现象（emoji 图标 + 中文描述）
- 📅 **未来 7 天预报**：最高/最低温、天气、降水概率
- 📍 **浏览器定位**（一键获取当前位置天气）
- 🌐 **中文界面** + 响应式（移动端/桌面）
- 🛡️ **隐私友好**：不收集、不存储、不上传任何用户数据

## 🚀 快速开始

无需安装任何东西，任意静态服务器即可：

```bash
# 方式一：Python
cd weather-dashboard
python3 -m http.server 8080
# 打开 http://localhost:8080

# 方式二：GitHub Pages（免费托管）
# 仓库 Settings → Pages → Branch 选 main / 根目录 → Save
# 几分钟后访问 https://<你的用户名>.github.io/weather-dashboard/
```

## 🧱 技术栈

| 项 | 说明 |
|---|---|
| 前端 | 原生 HTML + CSS + ES6 JavaScript |
| 数据源 | [Open-Meteo](https://open-meteo.com/)（免费、无需注册/API Key）|
| 依赖 | 无（零第三方库、零构建）|
| 托管 | 任意静态服务器 / GitHub Pages |

## 📁 目录结构

```
weather-dashboard/
├── index.html     # 页面骨架
├── style.css      # 样式（CSS 变量 + 响应式）
├── app.js         # 逻辑（WMO 天气码映射 / fetch / 渲染）
├── SPEC.md        # 开发规范
├── README.md      # 本文档
└── LICENSE        # MIT
```

## 🔌 数据接口

- 城市搜索：`geocoding-api.open-meteo.com/v1/search`
- 天气：`api.open-meteo.com/v1/forecast`（`current` 当前 + `daily` 7 天 + `timezone=auto`）

> 天气码采用 WMO 标准，已在 `app.js` 顶部映射为中文描述与 emoji 图标。

## 📄 许可

[MIT](./LICENSE)。数据版权归 [Open-Meteo](https://open-meteo.com/) 及其上游数据源所有。
