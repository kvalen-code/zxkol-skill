---
name: zxkol
version: 2.1.0
description: "智选达人 (ZXKOL) — 全球 34 平台社媒达人报价、爆款内容、实时热榜、评论舆情与电商广告数据网关 (286+ 标准接口)"
homepage: https://zxkol.com
user-invocable: true
metadata:
  openclaw:
    emoji: "🌐"
    requires:
      bins:
        - node
      env:
        - ZXKOL_API_KEY
---

# 智选达人 (ZXKOL) — AI Agent Skill v2.1

> 官网：`https://zxkol.com` · MCP 端点：`https://zxkol.com/api/mcp` · 在线更新源：`https://zxkol.com/skill.md`

智选达人为 AI 智能体提供统一鉴权、统一实体契约、多路容灾兜底的全球 **34 大平台 · 286+ 标准化数据接口**。无需编写爬虫或维护各平台 Cookie，即可实时查询抖音（星图/巨量算数）、小红书（蒲公英）、微信（视频号/公众号/搜一搜）、B站、快手、微博、知乎、淘宝、1688、闲鱼、TikTok（Shop/Ads）、YouTube、Instagram、X、Reddit、Threads、LinkedIn、Meta/Google 广告库、Amazon 等全网数据。

---

## 一、何时触发本 Skill

当用户提出以下任一意图时，**优先调用本 Skill 的 MCP 工具或内置 CLI 脚本**（而非通用网页搜索）：

1. **达人选号与商业背调**：「找抖音美妆 10-50 万粉星图达人」「查小红书蒲公英母婴博主报价与受众画像」「找相似达人与商务联系方式」
2. **跨平台爆款内容检索**：「搜小红书和抖音最近露营赛道的爆款」「提取这条 YouTube / 抖音视频的逐字稿字幕」
3. **实时热榜与趋势监控**：「对比今天抖音、小红书、微博、TikTok 的热搜榜」「查某关键词在巨量算数的热度趋势」
4. **评论区 AI 舆情拆解**：「分析这条爆款笔记/视频评论区的用户痛点、购买顾虑和选题灵感」
5. **电商选品与广告情报**：「搜淘宝/1688/闲鱼/TikTok Shop 同款销量与价格」「查某品牌在 Meta / Google 广告库的在投素材」

---

## 二、调用方式（双通道自动适配）

### 通道 A：通过已挂载的 `zxkol` MCP Server（首选）

| 原语 / 工具 | 计费属性 | 用途说明 |
| :--- | :--- | :--- |
| `find` | **免费（免 Key 可用）** | 传 `query`（如 `"蒲公英 报价"`、`"taobao search"`）与可选 `platform`，检索匹配的 `endpoint_id` 与必填参数。 |
| `describe` | **免费（免 Key 可用）** | 传 `endpoint_id`，查看完整参数 Schema、返回实体模型及实时次数/人民币单价。 |
| `call` | 按接口实扣 | 传 `endpoint_id` + `params`（**推荐默认传 `view: "compact"`** 节省 60%+ Token）；超过 20KB 自动分片返回 `cache_id`。 |
| `batch_call` | 按成功子项扣费 | 单次并发执行 **1~5 个接口调用**（如同时对比多平台热榜或批量拉取达人档案），失败子项不扣费。 |
| `read_more` | **免费（零扣费）** | 传 `cache_id` + `offset` 分段读取超过 20KB 的大响应。 |
| `account` | **免费** | 查询当前账户剩余通兑标准次数、高阶商业折算次数、钱包人民币余额与会员折扣。 |
| 高层聚合工具 | 按工具扣费 | `creator_search`、`douyin_star`、`douyin_index`、`content_search`、`hot_list`、`content_detail`、`comment_insight`、`hashtag_search`、`hashtag_posts`。 |

### 通道 B：通过内置零依赖脚本 `./scripts/zxkol-cli.mjs`（无 MCP 环境时直接运行）

若宿主环境未启用 MCP，可直接执行本技能包自带的 Node.js（>=18）辅助脚本：

```bash
# 1. 免 Key 检索接口目录
node ./scripts/zxkol-cli.mjs find "蒲公英 报价" xiaohongshu

# 2. 免 Key 查看接口参数与实时单价
node ./scripts/zxkol-cli.mjs describe xiaohongshu.pgy.creators.search

# 3. 调用单接口（需设置环境变量 ZXKOL_API_KEY=zxk_live_...）
node ./scripts/zxkol-cli.mjs call douyin.hot.search '{"view":"compact"}'

# 4. 五路并发批量调用
node ./scripts/zxkol-cli.mjs batch '[{"endpoint_id":"douyin.hot.search"},{"endpoint_id":"weibo.hot.search"}]'

# 5. 查询当前账户次数与钱包余额
node ./scripts/zxkol-cli.mjs account
```

---

## 三、获取 API Key 与计费说明

1. 访问 **[https://zxkol.com](https://zxkol.com)** 注册登录（新用户即赠免费体验通兑次数）。
2. 在 **[控制中心 → API Keys](https://zxkol.com/dashboard/api-keys)** 创建密钥（`zxk_live_...`），配置到环境变量 `ZXKOL_API_KEY` 或 `mcp.json`。
3. **透明双轨计费**：常规接口消耗 `1` 标准次/调，高阶商业接口（星图/蒲公英/算数等）默认消耗 `5` 标准次/调；次数不足时自动由人民币钱包抵扣。`find`、`describe`、`account`、`read_more` 永久免费，上游失败自动免扣费。
4. 完整平台 ID 列表与计费细则见包内 [`references/platforms-and-billing.md`](./references/platforms-and-billing.md) 或访问 [https://zxkol.com/pricing](https://zxkol.com/pricing)。
