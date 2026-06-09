# 日本测试资料生成器标签页 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有控制台中加入直接调用公开接口的日本测试资料 Tab，并严格只展示白名单字段。

**Architecture:** 新增纯 JavaScript 数据适配模块，负责接口 URL、响应白名单映射和 TXT 文本生成；现有 `app.js` 只负责 Tab、请求状态、渲染、复制和下载。页面不新增后端代理，不保存原始响应。

**Tech Stack:** 原生 HTML/CSS/JavaScript、Node.js 内置 `node:test`、Python `http.server` 风格现有服务、浏览器端 Fetch API。

---

### Task 1: 接口数据适配模块

**Files:**
- Create: `webapp/static/japan-profile.js`
- Create: `tests/japan-profile.test.js`

**Step 1: Write the failing test**

测试以下行为：

- 随机接口 URL 固定为 `/jp-address/generate-address`。
- 关键词使用 `encodeURIComponent`。
- 映射保留姓名、假名、联系方式、地址、公司和设备字段。
- 映射结果不含 `nationalid`、`credit_card_info`、`password`、`security_question`。
- TXT 导出不包含敏感字段和值。

**Step 2: Run test to verify it fails**

Run:

```bash
node --test tests/japan-profile.test.js
```

Expected: FAIL，因为 `webapp/static/japan-profile.js` 尚不存在。

**Step 3: Write minimal implementation**

导出：

```js
const API_ORIGIN = "https://hant.ratenn.com";
function buildProfileUrl(keyword = "") {}
function normalizeJapanProfile(source) {}
function profileToText(profile) {}
```

同时挂载到浏览器全局 `window.JapanProfileData`。

**Step 4: Run test to verify it passes**

Run:

```bash
node --test tests/japan-profile.test.js
```

Expected: PASS。

**Step 5: Commit**

```bash
git add webapp/static/japan-profile.js tests/japan-profile.test.js
git commit -m "功能：新增日本测试资料接口适配"
```

### Task 2: Tab 与生成器页面结构

**Files:**
- Modify: `webapp/static/index.html`

**Step 1: Add static structure assertions**

在 `tests/japan-profile.test.js` 中读取 `index.html`，断言：

- 存在两个 Tab。
- 默认控制台视图存在。
- 日本资料视图存在。
- 加载了 `japan-profile.js`。
- 不存在个人号码、信用卡、CVV、密码结果控件。

**Step 2: Run test to verify it fails**

Run:

```bash
node --test tests/japan-profile.test.js
```

Expected: FAIL，因为 Tab 和生成器 DOM 尚不存在。

**Step 3: Add the markup**

新增：

- Header 下方 `role="tablist"`。
- 原控制台包装为 `paymentView`。
- 日本资料包装为 `japanProfileView`。
- 关键词输入、搜索、刷新、下载按钮。
- 基本信息、地址、工作与设备三组白名单字段。
- `japan-profile.js` 在 `app.js` 前加载。

**Step 4: Run test to verify it passes**

Run:

```bash
node --test tests/japan-profile.test.js
```

Expected: PASS。

**Step 5: Commit**

```bash
git add webapp/static/index.html tests/japan-profile.test.js
git commit -m "功能：新增日本测试资料标签页结构"
```

### Task 3: Tab、请求、复制和下载交互

**Files:**
- Modify: `webapp/static/app.js`

**Step 1: Add interaction contract assertions**

在测试中断言 `app.js`：

- 使用 `JapanProfileData.buildProfileUrl`。
- 使用 `JapanProfileData.normalizeJapanProfile`。
- 使用 `JapanProfileData.profileToText`。
- 不访问原始敏感字段。

**Step 2: Run test to verify it fails**

Run:

```bash
node --test tests/japan-profile.test.js
```

Expected: FAIL。

**Step 3: Implement interactions**

实现：

- 支付控制台为默认 Tab。
- 首次打开日本资料 Tab 自动加载。
- 搜索和“换一组”请求公开接口。
- 请求过程中禁用按钮并显示加载状态。
- 错误时保留最后一次成功内容。
- 字段复制按钮。
- TXT 下载当前白名单资料。
- Tab 状态使用 ARIA 属性同步。

**Step 4: Run test to verify it passes**

Run:

```bash
node --test tests/japan-profile.test.js
```

Expected: PASS。

**Step 5: Commit**

```bash
git add webapp/static/app.js tests/japan-profile.test.js
git commit -m "功能：接入日本测试资料生成接口"
```

### Task 4: 响应式样式

**Files:**
- Modify: `webapp/static/styles.css`

**Step 1: Add CSS contract assertions**

测试要求存在：

- `.app-tabs`
- `.app-tab`
- `.japan-toolbar`
- `.japan-profile-grid`
- 移动端断点

**Step 2: Run test to verify it fails**

Run:

```bash
node --test tests/japan-profile.test.js
```

Expected: FAIL。

**Step 3: Add styles**

沿用现有设计 token，实现：

- 紧凑 Tab 导航。
- 工具栏和状态提示。
- 三组资料面板。
- 稳定复制按钮尺寸。
- 桌面多列、移动单列。
- 无嵌套卡片和文字溢出。

**Step 4: Run test to verify it passes**

Run:

```bash
node --test tests/japan-profile.test.js
```

Expected: PASS。

**Step 5: Commit**

```bash
git add webapp/static/styles.css tests/japan-profile.test.js
git commit -m "样式：完善日本测试资料标签页"
```

### Task 5: 完整验证

**Files:**
- Verify: `webapp/static/index.html`
- Verify: `webapp/static/app.js`
- Verify: `webapp/static/japan-profile.js`
- Verify: `webapp/static/styles.css`

**Step 1: Run automated tests**

```bash
node --test tests/japan-profile.test.js
python3 -m unittest discover -s tests -v
git diff --check
```

Expected: 新增 Node 测试全部通过；记录现有 Python 测试的独立状态；无空白错误。

**Step 2: Start local service**

```bash
.venv/bin/python webapp/server.py --host 127.0.0.1 --port 8888
```

**Step 3: Verify in browser**

桌面和移动视口检查：

- 两个 Tab 可切换。
- 原控制台内容与行为未丢失。
- 日本资料首次进入自动加载。
- 搜索、换一组、复制、TXT 下载可用。
- 页面中不存在敏感字段。
- 无溢出、重叠或空白区域。

**Step 4: Final commit**

```bash
git add webapp/static tests/japan-profile.test.js
git commit -m "功能：完成日本测试资料生成器集成"
```
