<div align="center"><img width="600" alt="nezhadash" src="https://github.com/user-attachments/assets/0a5768e1-96f2-4f8a-b77f-01488ed3b237"></div>
<h3 align="center">NezhaDash 是一个基于 Next.js 和 哪吒监控 的仪表盘</h3>
<br>

</div>

> [!CAUTION]
> 此为 V0 兼容版本，与 V1 内置版本功能上可能有所不同
>
> V0 | V1 版本 issue 请在当前仓库发起

> [!TIP]
> 有关 V1 版本 pr 可移步 https://github.com/hamster1963/nezha-dash-v1

### 部署

支持部署环境：

- Vercel
- Cloudflare
- Docker

[演示站点](https://nezha-vercel.vercel.app)
[说明文档](https://nezhadash-docs.vercel.app)

### 如何更新

[更新教程](https://buycoffee.top/blog/tech/nezha-upgrade)

### 环境变量

[环境变量介绍](https://nezhadash-docs.vercel.app/environment)

#### Komari 面板兼容

NezhaDash 现在支持 Komari 面板数据源。要启用 Komari 模式，请设置以下环境变量：

- `NEXT_PUBLIC_Komari=true` - 启用 Komari 面板兼容模式
- `KomariBaseUrl=https://ss.akz.moe` - Komari 面板的基础 URL

当启用 Komari 模式时，系统将从以下 API 端点获取数据：
- `KomariBaseUrl/api/nodes` - 获取服务器列表信息
- `KomariBaseUrl/api/recent/{uuid}` - 获取每个服务器的实时监控数据

> [!NOTE]
> 在 Komari 模式下，系统会并发获取所有服务器的实时数据，提供准确的当前状态监控。如果某个服务器的实时数据获取失败，系统会gracefully降级到基础信息显示。

![screen](/.github/v2-1.webp)
![screen](/.github/v2-2.webp)
![screen](/.github/v2-3.webp)
![screen](/.github/v2-4.webp)
![screen](/.github/v2-dark.webp)
