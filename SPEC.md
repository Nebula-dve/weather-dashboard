# SPEC — Weather Dashboard（天气仪表板）

## 1. 目标（Objective）

开发一个从公共天气 API 获取数据的天气仪表板：输入/定位城市后，展示当前天气与未来 7 天预报。**零后端、零构建、零 API key、零外部依赖**，可直接托管到 GitHub Pages 使用。

## 2. 命令（Commands）

| 用途 | 命令 |
|---|---|
| 本地预览 | `python3 -m http.server 8080`（或任意静态服务器）|
| 语法检查 | `node --check app.js` |

> 无构建步骤、无依赖安装。三个源文件直接由浏览器加载。

## 3. 项目结构（Project Structure）

```
weather-dashboard/
├── index.html     # 单页骨架（语义化 HTML）
├── style.css      # 样式（CSS 变量 + 响应式）
├── app.js         # 逻辑（ES6 模块，fetch Open-Meteo）
├── SPEC.md        # 本文档
├── README.md      # 说明 + GitHub Pages 部署
├── LICENSE        # MIT
└── .gitignore
```

## 4. 代码风格（Code Style）

- 原生 ES6+，无框架、无打包、无第三方库。
- 语义化 HTML；样式用 CSS 自定义属性（`--color-*`）。
- 常量与映射表（WMO 天气码 → 中文描述 + emoji）集中在文件顶部。
- 单一数据流：`fetchJSON(url) → render(state)`，DOM 更新与网络请求分离。

## 5. 测试策略（Testing Strategy）

- API 集成：`curl` 直测 geocoding 与 forecast 端点（已验证）。
- 语法：`node --check app.js`。
- 功能：本地静态服务器 + 浏览器手动验证（搜索、定位、7 天预报、错误降级）。
- 边界：无效城市、定位拒绝、网络失败、非 200 响应均需优雅降级并给中文提示。

## 6. 边界（Boundaries）

- **数据源**：仅 Open-Meteo（`api.open-meteo.com` 与 `geocoding-api.open-meteo.com`，免费无 key）。
- **隐私**：不收集、不存储、不上传任何用户数据；定位仅在用户点击授权后使用，且坐标只发给 Open-Meteo。
- **始终做**：请求带超时与错误处理；所有天气码都有中文映射；界面中文。
- **先问/不做**：不引入付费 API、不接入后端、不添加遥测/统计脚本。
