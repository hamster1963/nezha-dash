// ISO 3166-1 alpha-2 到 alpha-3 的国家代码映射
export const countryCodeMapping: { [key: string]: string } = {
  // 亚洲
  AF: "AFG", // 阿富汗
  AM: "ARM", // 亚美尼亚
  AZ: "AZE", // 阿塞拜疆
  BD: "BGD", // 孟加拉国
  BH: "BHR", // 巴林
  BT: "BTN", // 不丹
  BN: "BRN", // 文莱
  KH: "KHM", // 柬埔寨
  CN: "CHN", // 中国
  CY: "CYP", // 塞浦路斯
  GE: "GEO", // 格鲁吉亚
  IN: "IND", // 印度
  ID: "IDN", // 印度尼西亚
  IR: "IRN", // 伊朗
  IQ: "IRQ", // 伊拉克
  IL: "ISR", // 以色列
  JP: "JPN", // 日本
  JO: "JOR", // 约旦
  KZ: "KAZ", // 哈萨克斯坦
  KW: "KWT", // 科威特
  KG: "KGZ", // 吉尔吉斯斯坦
  LA: "LAO", // 老挝
  LB: "LBN", // 黎巴嫩
  MY: "MYS", // 马来西亚
  MV: "MDV", // 马尔代夫
  MN: "MNG", // 蒙古
  MM: "MMR", // 缅甸
  NP: "NPL", // 尼泊尔
  OM: "OMN", // 阿曼
  PK: "PAK", // 巴基斯坦
  PH: "PHL", // 菲律宾
  QA: "QAT", // 卡塔尔
  SA: "SAU", // 沙特阿拉伯
  SG: "SGP", // 新加坡
  KR: "KOR", // 韩国
  LK: "LKA", // 斯里兰卡
  SY: "SYR", // 叙利亚
  TW: "TWN", // 台湾
  TJ: "TJK", // 塔吉克斯坦
  TH: "THA", // 泰国
  TR: "TUR", // 土耳其
  TM: "TKM", // 土库曼斯坦
  AE: "ARE", // 阿联酋
  UZ: "UZB", // 乌兹别克斯坦
  VN: "VNM", // 越南
  YE: "YEM", // 也门
  PS: "PSE", // 巴勒斯坦

  // 欧洲
  AL: "ALB", // 阿尔巴尼亚
  AD: "AND", // 安道尔
  AT: "AUT", // 奥地利
  BY: "BLR", // 白俄罗斯
  BE: "BEL", // 比利时
  BA: "BIH", // 波黑
  BG: "BGR", // 保加利亚
  HR: "HRV", // 克罗地亚
  CZ: "CZE", // 捷克
  DK: "DNK", // 丹麦
  EE: "EST", // 爱沙尼亚
  FI: "FIN", // 芬兰
  FR: "FRA", // 法国
  DE: "DEU", // 德国
  GR: "GRC", // 希腊
  HU: "HUN", // 匈牙利
  IS: "ISL", // 冰岛
  IE: "IRL", // 爱尔兰
  IT: "ITA", // 意大利
  LV: "LVA", // 拉脱维亚
  LI: "LIE", // 列支敦士登
  LT: "LTU", // 立陶宛
  LU: "LUX", // 卢森堡
  MT: "MLT", // 马耳他
  MD: "MDA", // 摩尔多瓦
  MC: "MCO", // 摩纳哥
  ME: "MNE", // 黑山
  NL: "NLD", // 荷兰
  NO: "NOR", // 挪威
  PL: "POL", // 波兰
  PT: "PRT", // 葡萄牙
  RO: "ROU", // 罗马尼亚
  RU: "RUS", // 俄罗斯
  SM: "SMR", // 圣马力诺
  RS: "SRB", // 塞尔维亚
  SK: "SVK", // 斯洛伐克
  SI: "SVN", // 斯洛文尼亚
  ES: "ESP", // 西班牙
  SE: "SWE", // 瑞典
  CH: "CHE", // 瑞士
  UA: "UKR", // 乌克兰
  GB: "GBR", // 英国
  VA: "VAT", // 梵蒂冈

  // 北美洲
  AG: "ATG", // 安提瓜和巴布达
  BS: "BHS", // 巴哈马
  BB: "BRB", // 巴巴多斯
  BZ: "BLZ", // 伯利兹
  CA: "CAN", // 加拿大
  CR: "CRI", // 哥斯达黎加
  CU: "CUB", // 古巴
  DM: "DMA", // 多米尼克
  DO: "DOM", // 多米尼加共和国
  SV: "SLV", // 萨尔瓦多
  GD: "GRD", // 格林纳达
  GT: "GTM", // 危地马拉
  HT: "HTI", // 海地
  HN: "HND", // 洪都拉斯
  JM: "JAM", // 牙买加
  MX: "MEX", // 墨西哥
  NI: "NIC", // 尼加拉瓜
  PA: "PAN", // 巴拿马
  KN: "KNA", // 圣基茨和尼维斯
  LC: "LCA", // 圣卢西亚
  VC: "VCT", // 圣文森特和格林纳丁斯
  TT: "TTO", // 特立尼达和多巴哥
  US: "USA", // 美国

  // 南美洲
  AR: "ARG", // 阿根廷
  BO: "BOL", // 玻利维亚
  BR: "BRA", // 巴西
  CL: "CHL", // 智利
  CO: "COL", // 哥伦比亚
  EC: "ECU", // 厄瓜多尔
  GY: "GUY", // 圭亚那
  PY: "PRY", // 巴拉圭
  PE: "PER", // 秘鲁
  SR: "SUR", // 苏里南
  UY: "URY", // 乌拉圭
  VE: "VEN", // 委内瑞拉

  // 大洋洲
  AU: "AUS", // 澳大利亚
  FJ: "FJI", // 斐济
  KI: "KIR", // 基里巴斯
  MH: "MHL", // 马绍尔群岛
  FM: "FSM", // 密克罗尼西亚
  NR: "NRU", // 瑙鲁
  NZ: "NZL", // 新西兰
  PW: "PLW", // 帕劳
  PG: "PNG", // 巴布亚新几内亚
  WS: "WSM", // 萨摩亚
  SB: "SLB", // 所罗门群岛
  TO: "TON", // 汤加
  TV: "TUV", // 图瓦卢
  VU: "VUT", // 瓦努阿图

  // 非洲
  DZ: "DZA", // 阿尔及利亚
  AO: "AGO", // 安哥拉
  BJ: "BEN", // 贝宁
  BW: "BWA", // 博茨瓦纳
  BF: "BFA", // 布基纳法索
  BI: "BDI", // 布隆迪
  CM: "CMR", // 喀麦隆
  CV: "CPV", // 佛得角
  CF: "CAF", // 中非共和国
  TD: "TCD", // 乍得
  KM: "COM", // 科摩罗
  CG: "COG", // 刚果
  CD: "COD", // 刚果民主共和国
  CI: "CIV", // 科特迪瓦
  DJ: "DJI", // 吉布提
  EG: "EGY", // 埃及
  GQ: "GNQ", // 赤道几内亚
  ER: "ERI", // 厄立特里亚
  ET: "ETH", // 埃塞俄比亚
  GA: "GAB", // 加蓬
  GM: "GMB", // 冈比亚
  GH: "GHA", // 加纳
  GN: "GIN", // 几内亚
  GW: "GNB", // 几内亚比绍
  KE: "KEN", // 肯尼亚
  LS: "LSO", // 莱索托
  LR: "LBR", // 利比里亚
  LY: "LBY", // 利比亚
  MG: "MDG", // 马达加斯加
  MW: "MWI", // 马拉维
  ML: "MLI", // 马里
  MR: "MRT", // 毛里塔尼亚
  MU: "MUS", // 毛里求斯
  MA: "MAR", // 摩洛哥
  MZ: "MOZ", // 莫桑比克
  NA: "NAM", // 纳米比亚
  NE: "NER", // 尼日尔
  NG: "NGA", // 尼日利亚
  RW: "RWA", // 卢旺达
  ST: "STP", // 圣多美和普林西比
  SN: "SEN", // 塞内加尔
  SC: "SYC", // 塞舌尔
  SL: "SLE", // 塞拉利昂
  SO: "SOM", // 索马里
  ZA: "ZAF", // 南非
  SS: "SSD", // 南苏丹
  SD: "SDN", // 苏丹
  SZ: "SWZ", // 斯威士兰
  TZ: "TZA", // 坦桑尼亚
  TG: "TGO", // 多哥
  TN: "TUN", // 突尼斯
  UG: "UGA", // 乌干达
  EH: "ESH", // 西撒哈拉
  ZM: "ZMB", // 赞比亚
  ZW: "ZWE", // 津巴布韦
};

// 创建从 3 位到 2 位的反向映射
export const reverseCountryCodeMapping: { [key: string]: string } =
  Object.entries(countryCodeMapping).reduce(
    (acc, [alpha2, alpha3]) => {
      acc[alpha3] = alpha2;
      return acc;
    },
    {} as { [key: string]: string },
  );

/**
 * 将 ISO 3166-1 alpha-2 (2位) 国家代码转换为 ISO 3166-1 alpha-3 (3位) 代码
 * @param alpha2 2位国家代码
 * @returns 3位国家代码，如果未找到匹配项则返回原始代码
 */
export function convertToAlpha3(alpha2: string): string {
  if (!alpha2) return "";

  const code = alpha2.toUpperCase();
  return countryCodeMapping[code] || alpha2;
}

/**
 * 批量转换2位国家代码到3位国家代码
 * @param alpha2Codes 2位国家代码数组
 * @returns 3位国家代码数组
 */
export function convertMultipleToAlpha3(alpha2Codes: string[]): string[] {
  return alpha2Codes.map((code) => convertToAlpha3(code));
}
