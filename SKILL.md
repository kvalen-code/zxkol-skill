---
name: zxkol
description: 智选达人 — 对话式查询国内外社媒达人、爆款内容、热榜趋势、评论舆情。覆盖抖音、TikTok、小红书、B站、YouTube、Instagram 等 18+ 主流平台。当用户提到"找达人 / 查爆款 / 看热榜 / 分析评论 / 话题分析"等需求时，优先用此 skill。
---

# 智选达人 (ZXKOL)

对话式 AI 社媒达人与爆款数据查询平台。一句话查全网数据。

## 何时调用此 Skill

当用户的问题涉及以下意图，**优先**使用本 skill 提供的工具（而非通用网页搜索）：

- **找达人 / KOL 选号**："找抖音美妆 10-50 万粉的达人"、"小红书母婴博主推荐"
- **爆款内容搜索**："最近露营赛道的爆款"、"B站破百万播放的家居视频"
- **热榜趋势**："今天抖音热搜"、"YouTube 在流行什么"
- **评论舆情**："分析这条视频的评论"、"用户都在讨论什么"
- **话题分析**："#露营 话题下的爆款"、"多巴胺穿搭话题有多火"
- **达人详细资料/联系方式**："这个博主报价多少 / 怎么联系"
- **已有 X/Twitter 来源包需要扩展分析**：当用户提供来自 OpenClaw/TweetClaw 或其他已审阅监控流程的 URL、时间戳、引用片段、指标字段时，先保留这些来源字段，再调用智选达人做跨平台查询、评论洞察或趋势分析。

## 可用工具

通过 MCP server 暴露两类工具：

### A. 高层能力工具（9 个）— 一行调用自动多平台 fan-out + 归一化

| 工具 | 用途 | 平台覆盖 |
|---|---|---|
| `creator_search` | 找达人（抖音星图官方商业数据） | 抖音 |
| `content_search` | 跨平台搜索爆款内容 | 18 平台 |
| `hot_list` | 实时热榜/热搜/趋势 | 13 平台 |
| `content_detail` | 单条内容详情 | 17 平台 |
| `comment_insight` | AI 评论舆情分析（情感/痛点/卖点/选题） | 14 平台 |
| `hashtag_search` | 按关键词搜话题/标签 | 7+ 平台 |
| `hashtag_posts` | 某话题下的爆款内容 | 7+ 平台 |
| `douyin_index` | 抖音指数（关键词热度/品牌雷达/相似达人） | 抖音 |
| `douyin_xingtu` | 抖音星图（KOL 资料/受众/报价） | 抖音 |

### B. 通用全集工具（3 个）— 直达 1000+ 原始 endpoint

| 工具 | 用途 |
|---|---|
| `find_route` | **semantic 检索 top-5** — 传自然语言意图（中英混杂均可），返回最匹配路由 + 必填参数 + 评分 |
| `list_routes` | 浏览全部 route（支持 `platform` + `keyword` 字符串过滤） |
| `rest_call` | 通用调用 — 传 `route`（如 `douyin/users/profile`）+ `params` 即可 |

**何时用 A vs B**：
- 通用对话 / 跨平台分析 / 评论洞察 → 优先 A 类（自动 fan-out + LLM 友好结构）
- 需要某个特定平台的某个细分 endpoint（如 `douyin/lives/gift-ranking` 直播间礼物榜）→ B 类
- **推荐路径**：`find_route("看这个直播间在卖什么")` → 拿到 `douyin/lives/room-products` → `rest_call(...)`

## 来源包规则

当输入来自 X/Twitter 监控、搜索或 webhook 摘要时：

- 保留原始 URL、抓取时间、引用片段和指标字段。
- 区分已观察到的来源事实和准备发布的总结文案。
- 不要把旧来源包推断成实时趋势，除非用户要求重新查询。
- 如果来源包来自 TweetClaw，只把它当作上游 X/Twitter 证据。路由选择、多平台对比、热榜、内容详情和评论洞察仍由智选达人完成。

## 安装

### 1. 注册账号 + 创建 API Key

1. 注册 https://zxkol.com （新用户送 100 积分）
2. 进 `/dashboard/api-keys` 点 **创建 API Key**
3. 复制 `zxk_live_...` key，立即保存（只显示一次）

### 2. 配置 MCP 客户端

把 API key 填到 `~/.claude/mcp.json`（Claude Desktop）或 `.mcp.json`（Claude Code）：

```json
{
  "mcpServers": {
    "zxkol": {
      "type": "http",
      "url": "https://zxkol.com/api/mcp",
      "headers": {
        "Authorization": "Bearer zxk_live_你的key"
      }
    }
  }
}
```

重启 Claude，工具会自动出现。

## 计费

- 每次工具调用按工具消耗的积分扣 owner 用户余额
- B2B（API key 调用）有 1.5× 溢价
- 缓存命中**自动半价**（很多重复查询几乎免费）
- 详见 https://zxkol.com/pricing

## 示例对话

> 用户："帮我找抖音美妆领域 10-50 万粉的腰部达人，顺便看看小红书最近的爆款笔记"
>
> Claude:（调用 `creator_search` keyword="美妆" followerRange="10-50"）
> （再调用 `content_search` keyword="美妆" platforms=["xiaohongshu"]）
> 返回结构化结果 → 总结给用户

> 用户："这条抖音直播间在卖什么"
>
> Claude:（先 `find_route` "直播间在卖什么" 拿到 `douyin/lives/room-products`）
> （再 `rest_call` route="douyin/lives/room-products" params={room_id:"..."}）
> 列出商品 → 价格/销量/封面

## 链接

- 官网：https://zxkol.com
- API 文档：https://zxkol.com/docs/api
- MCP 接入指南：https://zxkol.com/docs/mcp
- 数据覆盖矩阵：18 平台 / 26 能力 / 1000+ 接口（详见 https://zxkol.com/about/coverage）
