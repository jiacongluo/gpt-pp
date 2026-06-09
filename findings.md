# Findings & Decisions

## Requirements
- 用户要求说明这是一个什么项目，并帮忙在本地部署启动起来。

## Research Findings
- 仓库当前 git 状态干净。
- 初步文件结构包含 Python Web 应用、Go 网关命令、静态前端和 PayPal/Stripe 相关探针脚本。
- README 标注项目为 “Plus PayPal 0 元提链控制台 / PayPal smart checkout conversion gateway”，用于本地控制台、协议分析和网关实验。
- Python 网关入口是 `webapp/server.py`，默认监听 `127.0.0.1:8888`。
- Go 网关入口是 `cmd/ppgateway/main.go`，默认监听 `:8787`，但当前环境未确认可用的真实 Go 运行时。
- `.env.example` 存在；`start.sh` 会在缺少 `.env` 时复制该模板。
- 项目没有发现 `requirements.txt`、`pyproject.toml`、`Pipfile` 或 `poetry.lock`。
- 端口 `8888` 和 `8787` 当前均未被占用。
- 系统 Python 当前未安装 `curl_cffi` 和 `playwright`；需要通过虚拟环境安装。
- `start.sh` 已创建 `.env` 和 `.venv`，并安装 `curl_cffi` 与 `playwright`。
- 服务由 tmux 会话 `gpt-pp-server` 托管，PID 记录在 `.local-server.pid`，日志在 `webapp/local-server.log`。
- `.local-server.pid` 已加入 `.gitignore`，避免本地运行 PID 污染 git 状态。
- 当前访问地址：`http://127.0.0.1:8888/`。
- 验证结果：`GET /` 返回 `200 text/html`，`GET /api/stats` 返回 `{"ok": true, ...}`。
- README 离线单元测试当前 57 个测试中 55 个通过、2 个错误；错误用例为 `test_web_flow_non_zero_can_still_confirm_by_default` 和 `test_web_flow_returns_url_after_zero_verification`，根因是未 mock `probe_proxy_geo` 导致尝试探测 `proxy.invalid`。

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| 优先阅读 README、start.sh、webapp/server.py、go.mod | 这些文件最可能直接说明用途、依赖和启动方式 |
| 本地优先启动 Python 网关 | README 将其列为轻量控制台；当前 Go 命令未通过 RTK 解析到真实运行时 |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| `rtk find` 不支持复合谓词 | 改用原生 `find` 进行依赖文件扫描 |
| 依赖清单文件缺失 | 按 `start.sh` 中声明的依赖创建虚拟环境并安装 |
| `nohup` 后台启动未保留进程 | 使用 tmux 会话托管服务 |
| 单测尝试访问无效代理地理接口 | 记录为测试套件现状；本次目标以 HTTP 服务启动验证为准 |

## Resources
- `/Users/calopteryx/code/gpt-pp/README.md`
- `/Users/calopteryx/code/gpt-pp/start.sh`
- `/Users/calopteryx/code/gpt-pp/webapp/server.py`
- `/Users/calopteryx/code/gpt-pp/go.mod`
- `/Users/calopteryx/code/gpt-pp/.gitignore`
