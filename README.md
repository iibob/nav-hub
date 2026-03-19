
# 🎨 Navigation Hub

轻量级、响应式，支持动态配置的静态导航页。
专为追求极致简洁的用户打造。


## ✨ 核心特性

- **数据驱动**：修改 `JSON` 即可更新内容，无需触碰 HTML。
- **高度自定义**：通过 URL 参数动态设置页面标题和高度。
- **适配移动端**：内置响应式设计，支持纵向/横向响应式切换。

## 🚀 快速开始

### 1. 准备配置

参考 `links.json` 格式定制你的书签数据：

```JSON
{
  "常用": [
    { "name": "GitHub", "url": "https://github.com", "icon": "" },
    { "name": "Google", "url": "https://google.com", "icon": "" }
  ],
  "设计": [
    { "name": "Figma", "url": "https://figma.com", "icon": "" }
  ]
}
```

### 2. 托管数据

将 `links.json` 上传至支持直链的云存储（如七牛云、Cloudflare R2 或 GitHub 等），并获取其 **URL 直链**。

### 3. 配置 URL 参数

通过在链接后添加参数，实现个性化定制：

|**参数**|**说明**|**示例**|
|---|---|---|
|`title`|自定义网页标题|`?title=我的工作台`|
|`data`|指定远程 JSON 路径|`?data=https://example.com/links.json`|
|`height`|调整容器高度 (支持 `vh`, `px` 等)|`?height=80vh`|

> **组合使用：** `https://nav.3ai1.com/?title=设计导航&height=85vh&data=...`


## 🧩 扩展使用：设为新标签页

建议配合浏览器插件使用，实现开启浏览器即达。

- **推荐插件**：

  |插件名称|适用浏览器|插件地址|
  | ---- | ---- | ---- |
  |New Tab Redirect|Chrome|[应用商店](https://chromewebstore.google.com/detail/new-tab-redirect/icpgjfneehieebagbmdbhnlpiopdcmna) \| [GitHub](https://github.com/jimschubert/NewTab-Redirect)|
  |Custom New Tab URL|Chrome|[应用商店](https://chromewebstore.google.com/detail/custom-new-tab-url/mmjbdbjnoablegbkcklggeknkfcjkjia)|
  |New Tab (shows your homepage)|Firefox|[应用商店](https://addons.mozilla.org/en-US/firefox/addon/new-tab-shows-your-homepage/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search)|

- **小技巧**：在插件设置中勾选 **“在地址栏启用光标”**，即可在打开新标签页时直接输入搜索，兼顾导航与搜索效率。
