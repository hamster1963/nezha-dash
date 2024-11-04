<h1 align="center">NezhaDash</h1>

<strong>NezhaDash 是一个基于 Next.js 和 哪吒监控 的仪表盘</strong>
<br>

</div>

| 一键部署到 Vercel-推荐                                | Docker部署                                                      | Cloudflare部署                                                               | 如何更新？                                                |
| ----------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| [部署简易教程](https://buycoffee.top/blog/tech/nezha) | [Docker 部署教程](https://buycoffee.top/blog/tech/nezha-docker) | [Cloudflare 部署教程](https://buycoffee.top/blog/tech/nezha-cloudflare)      | [更新教程](https://buycoffee.top/blog/tech/nezha-upgrade) |
| [Vercel-demo](https://nezha-vercel.buycoffee.top)     | [Docker-demo](https://nezha-docker.buycoffee.tech)              | [Cloudflare-demo](https://nezha-cloudflare.buycoffee.tech) [密码: nezhadash] |

#### Cloudflare 部署所需环境变量

NODE_VERSION 22.9.0
<br>
BUN_VERSION 1.1.29

#### 环境变量

| 变量名                         | 含义                           | 示例                                                          |
| ------------------------------ | ------------------------------ | ------------------------------------------------------------- |
| NezhaBaseUrl                   | nezha 面板地址                 | http://120.x.x.x:8008                                         |
| NezhaAuth                      | nezha 面板 API Token           | 5hAY3QX6Nl9B3Uxxxx26KMvOMyXS1Udi                              |
| SitePassword                   | 页面密码                       | **默认**：无密码                                              |
| DefaultLocale                  | 面板默认显示语言               | **默认**：en [简中:zh 繁中:zh-t 英语:en 日语:ja]              |
| ForceShowAllServers            | 是否强制显示所有服务器         | **默认**：false                                               |
| NEXT_PUBLIC_NezhaFetchInterval | 获取数据间隔（毫秒）           | **默认**：2000                                                |
| NEXT_PUBLIC_ShowFlag           | 是否显示旗帜                   | **默认**：false                                               |
| NEXT_PUBLIC_DisableCartoon     | 是否禁用卡通人物               | **默认**：false                                               |
| NEXT_PUBLIC_ShowTag            | 是否显示标签                   | **默认**：false                                               |
| NEXT_PUBLIC_ShowNetTransfer    | 是否显示流量信息               | **默认**：false                                               |
| NEXT_PUBLIC_ForceUseSvgFlag    | 是否强制使用SVG旗帜            | **默认**：false                                               |
| NEXT_PUBLIC_FixedTopServerName | 是否固定卡片顶部显示服务器名称 | **默认**：false                                               |
| NEXT_PUBLIC_CustomLogo         | 自定义Logo                     | **示例**：https://nezha-cf.buycoffee.top/apple-touch-icon.png |
| NEXT_PUBLIC_CustomTitle        | 自定义标题                     |                                                               |
| NEXT_PUBLIC_CustomDescription  | 自定义描述(无多语言支持)       |                                                               |

![screen](/.github/shot-1.png)
![screen](/.github/shot-2.png)
![screen](/.github/shot-3.png)
![screen](/.github/shot-1-dark.png)
![screen](/.github/shot-2-dark.png)
![screen](/.github/shot-3-dark.png)
