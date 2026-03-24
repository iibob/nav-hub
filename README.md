# Nav Hub

简约、响应式、能自定义的个人导航中心，专为追求极致简洁的用户打造。

<br>

## ✨ 核心特性

- **可视化编辑**：通过设置菜单即可完成分类管理、站点添加与编辑，并支持拖拽调整站点顺序。
- **数据管理**：站点修改后，支持一键导出最新配置文件。
- **高度自定义**：通过 URL 参数动态设置页面标题和高度。
- **响应式设计**：完美适配桌面端与移动端。

<br>

## 🚀 快速开始

### 1. 准备配置

**方式一：** 可视化配置
1. 点击网站右下角菜单，依次选择 “分类管理” - “清空数据”。
2. 手动添加分类和站点。
3. 添加完成后点击“下载”，保存配置文件。

**方式二：** 参考 `links.json` 格式，快速制定配置文件：

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

将配置文件 `links.json` 上传至支持直链的云存储（如七牛云、Cloudflare R2 或 GitHub 等），并获取其 **URL 直链**。

### 3. 配置 URL 参数

通过在链接后添加参数，实现个性化定制：

|**参数**|**说明**|**示例**|
|---|---|---|
|`title`|自定义网页标题|`?title=我的工作台`|
|`data`|指定远程 JSON 路径|`?data=https://example.com/links.json`|
|`height`|调整容器高度 (支持 `vh`, `px` 等)|`?height=50vh`|

> **组合使用：** `https://nav.3ai1.com/?title=设计导航&height=50vh&data=...`

<br>

## 🧩 扩展使用：设为新标签页

建议配合浏览器插件使用，实现开启浏览器即达。

- **推荐插件**：

  |插件名称|适用浏览器|插件地址|
  | ---- | ---- | ---- |
  |New Tab Redirect|Chrome|[应用商店](https://chromewebstore.google.com/detail/new-tab-redirect/icpgjfneehieebagbmdbhnlpiopdcmna) \| [GitHub](https://github.com/jimschubert/NewTab-Redirect)|
  |Custom New Tab URL|Chrome|[应用商店](https://chromewebstore.google.com/detail/custom-new-tab-url/mmjbdbjnoablegbkcklggeknkfcjkjia)|
  |New Tab (shows your homepage)|Firefox|[应用商店](https://addons.mozilla.org/en-US/firefox/addon/new-tab-shows-your-homepage/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search)|

- **小技巧**：在插件设置中勾选 **“在地址栏启用光标”**，即可在打开新标签页时直接输入搜索，兼顾导航与搜索效率。
