# Task Plan: 本地部署启动 gpt-pp

## Goal
识别 `/Users/calopteryx/code/gpt-pp` 项目类型，并在本机成功启动可访问的服务。

## Current Phase
Phase 5

## Phases

### Phase 1: Requirements & Discovery
- [x] 阅读项目说明和启动入口
- [x] 识别依赖、运行时和默认端口
- [x] 记录关键发现
- **Status:** complete

### Phase 2: Local Setup
- [x] 检查本机 Python/Go/依赖状态
- [x] 安装或复用必要依赖
- [x] 选择合适启动方式
- **Status:** complete

### Phase 3: Startup
- [x] 启动本地服务
- [x] 保持进程运行
- [x] 记录访问地址
- **Status:** complete

### Phase 4: Verification
- [x] 用命令或浏览器验证服务响应
- [x] 记录测试结果和注意事项
- **Status:** complete

### Phase 5: Delivery
- [x] 总结项目性质、启动命令和访问方式
- [x] 说明任何限制或后续操作
- **Status:** complete

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 使用仓库自带启动脚本优先 | 最贴近项目作者预期，降低配置遗漏风险 |
| 本地优先启动 Python 网关 | README 将其列为轻量控制台；当前 Go 命令未通过 RTK 解析到真实运行时 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| `rtk find` 不支持复合谓词 | 1 | 改用原生 `find` |
| 普通 `nohup ... &` 后台进程在工具命令结束后未保留 | 1 | 使用 `tmux` 独立会话 `gpt-pp-server` 托管服务 |
| 单元测试 2 个用例失败于 `proxy_geo_unavailable` | 1 | 定位为测试未 mock `probe_proxy_geo`，实际访问 `proxy.invalid` 导致；服务 HTTP 验证不受影响 |
