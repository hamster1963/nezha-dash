"use server";

import { GetNezhaData } from "@/lib/serverFetch";
import { ServerStackIcon } from "@heroicons/react/20/solid";
import DottedMap from "dotted-map";
import Link from "next/link";

interface GlobalProps {
  countries?: string[]; // 国家代码数组，如 ['CN', 'US']
}

export default async function ServerGlobal() {
  const nezhaServerList = await GetNezhaData();

  const countrytList: string[] = [];
  nezhaServerList.result.forEach((server) => {
    if (server.host.CountryCode) {
      server.host.CountryCode = server.host.CountryCode.toUpperCase();
      if (!countrytList.includes(server.host.CountryCode)) {
        countrytList.push(server.host.CountryCode);
      }
    }
  });

  return <Global countries={countrytList} />;
}

export async function Global({ countries = [] }: GlobalProps) {
  const map = new DottedMap({ height: 60, grid: "vertical" });

  // 为每个国家添加点阵
  countries.forEach((countryCode) => {
    const coords = getCountryCoordinates(countryCode);
    if (coords) {
      map.addPin({
        lat: coords.lat,
        lng: coords.lng,
        svgOptions: { color: "#FF4500", radius: 0.5 },
      });
    }
  });

  const finalMap = map.getSVG({
    radius: 0.35,
    color: "#D1D5DA",
    shape: "circle",
  });

  return (
    <section className="flex flex-col gap-4 mt-[3.2px]">
      <Link
        href={`/`}
        className="rounded-[50px] w-fit bg-stone-100 p-[10px] transition-all hover:bg-stone-200 dark:hover:bg-stone-700 dark:bg-stone-800"
      >
        <ServerStackIcon className="size-4" />
      </Link>
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(finalMap)}`}
        alt="World Map with Highlighted Countries"
      />
    </section>
  );
}

// 国家经纬度映射
const countryCoordinates: Record<string, { lat: number; lng: number }> = {
  // 亚洲
  AF: { lat: 33.0, lng: 65.0 }, // 阿富汗
  AM: { lat: 40.0, lng: 45.0 }, // 亚美尼亚
  AZ: { lat: 40.5, lng: 47.5 }, // 阿塞拜疆
  BD: { lat: 24.0, lng: 90.0 }, // 孟加拉国
  BH: { lat: 26.0, lng: 50.55 }, // 巴林
  BT: { lat: 27.5, lng: 90.5 }, // 不丹
  BN: { lat: 4.5, lng: 114.6667 }, // 文莱
  KH: { lat: 13.0, lng: 105.0 }, // 柬埔寨
  CN: { lat: 35.0, lng: 105.0 }, // 中国
  CY: { lat: 35.0, lng: 33.0 }, // 塞浦路斯
  GE: { lat: 42.0, lng: 43.5 }, // 格鲁吉亚
  IN: { lat: 20.0, lng: 77.0 }, // 印度
  ID: { lat: -5.0, lng: 120.0 }, // 印度尼西亚
  IR: { lat: 32.0, lng: 53.0 }, // 伊朗
  IQ: { lat: 33.0, lng: 44.0 }, // 伊拉克
  IL: { lat: 31.5, lng: 34.75 }, // 以色列
  JP: { lat: 36.0, lng: 138.0 }, // 日本
  JO: { lat: 31.0, lng: 36.0 }, // 约旦
  KZ: { lat: 48.0, lng: 68.0 }, // 哈萨克斯坦
  KW: { lat: 29.3375, lng: 47.6581 }, // 科威特
  KG: { lat: 41.0, lng: 75.0 }, // 吉尔吉斯斯坦
  LA: { lat: 18.0, lng: 105.0 }, // 老挝
  LB: { lat: 33.8333, lng: 35.8333 }, // 黎巴嫩
  MY: { lat: 2.5, lng: 112.5 }, // 马来西亚
  MV: { lat: 3.25, lng: 73.0 }, // 马尔代夫
  MN: { lat: 46.0, lng: 105.0 }, // 蒙古
  MM: { lat: 22.0, lng: 98.0 }, // 缅甸
  NP: { lat: 28.0, lng: 84.0 }, // 尼泊尔
  OM: { lat: 21.0, lng: 57.0 }, // 阿曼
  PK: { lat: 30.0, lng: 70.0 }, // 巴基斯坦
  PH: { lat: 13.0, lng: 122.0 }, // 菲律宾
  QA: { lat: 25.5, lng: 51.25 }, // 卡塔尔
  SA: { lat: 25.0, lng: 45.0 }, // 沙特阿拉伯
  SG: { lat: 1.3667, lng: 103.8 }, // 新加坡
  KR: { lat: 37.0, lng: 127.5 }, // 韩国
  LK: { lat: 7.0, lng: 81.0 }, // 斯里兰卡
  SY: { lat: 35.0, lng: 38.0 }, // 叙利亚
  TW: { lat: 23.5, lng: 121.0 }, // 台湾
  TJ: { lat: 39.0, lng: 71.0 }, // 塔吉克斯坦
  TH: { lat: 15.0, lng: 100.0 }, // 泰国
  TR: { lat: 39.0, lng: 35.0 }, // 土耳其
  TM: { lat: 40.0, lng: 60.0 }, // 土库曼斯坦
  AE: { lat: 24.0, lng: 54.0 }, // 阿联酋
  UZ: { lat: 41.0, lng: 64.0 }, // 乌兹别克斯坦
  VN: { lat: 16.0, lng: 106.0 }, // 越南
  YE: { lat: 15.0, lng: 48.0 }, // 也门
  PS: { lat: 32.0, lng: 35.25 }, // 巴勒斯坦

  // 欧洲
  AL: { lat: 41.0, lng: 20.0 }, // 阿尔巴尼亚
  AD: { lat: 42.5, lng: 1.6 }, // 安道尔
  AT: { lat: 47.3333, lng: 13.3333 }, // 奥地利
  BY: { lat: 53.0, lng: 28.0 }, // 白俄罗斯
  BE: { lat: 50.8333, lng: 4.0 }, // 比利时
  BA: { lat: 44.0, lng: 18.0 }, // 波黑
  BG: { lat: 43.0, lng: 25.0 }, // 保加利亚
  HR: { lat: 45.1667, lng: 15.5 }, // 克罗地亚
  CZ: { lat: 49.75, lng: 15.5 }, // 捷克
  DK: { lat: 56.0, lng: 10.0 }, // 丹麦
  EE: { lat: 59.0, lng: 26.0 }, // 爱沙尼亚
  FI: { lat: 64.0, lng: 26.0 }, // 芬兰
  FR: { lat: 46.0, lng: 2.0 }, // 法国
  DE: { lat: 51.0, lng: 9.0 }, // 德国
  GR: { lat: 39.0, lng: 22.0 }, // 希腊
  HU: { lat: 47.0, lng: 20.0 }, // 匈牙利
  IS: { lat: 65.0, lng: -18.0 }, // 冰岛
  IE: { lat: 53.0, lng: -8.0 }, // 爱尔兰
  IT: { lat: 42.8333, lng: 12.8333 }, // 意大利
  LV: { lat: 57.0, lng: 25.0 }, // 拉脱维亚
  LI: { lat: 47.1667, lng: 9.5333 }, // 列支敦士登
  LT: { lat: 56.0, lng: 24.0 }, // 立陶宛
  LU: { lat: 49.75, lng: 6.1667 }, // 卢森堡
  MT: { lat: 35.8333, lng: 14.5833 }, // 马耳他
  MD: { lat: 47.0, lng: 29.0 }, // 摩尔多瓦
  MC: { lat: 43.7333, lng: 7.4 }, // 摩纳哥
  ME: { lat: 42.0, lng: 19.0 }, // 黑山
  NL: { lat: 52.5, lng: 5.75 }, // 荷兰
  NO: { lat: 62.0, lng: 10.0 }, // 挪威
  PL: { lat: 52.0, lng: 20.0 }, // 波兰
  PT: { lat: 39.5, lng: -8.0 }, // 葡萄牙
  RO: { lat: 46.0, lng: 25.0 }, // 罗马尼亚
  RU: { lat: 60.0, lng: 100.0 }, // 俄罗斯
  SM: { lat: 43.7667, lng: 12.4167 }, // 圣马力诺
  RS: { lat: 44.0, lng: 21.0 }, // 塞尔维亚
  SK: { lat: 48.6667, lng: 19.5 }, // 斯洛伐克
  SI: { lat: 46.0, lng: 15.0 }, // 斯洛文尼亚
  ES: { lat: 40.0, lng: -4.0 }, // 西班牙
  SE: { lat: 62.0, lng: 15.0 }, // 瑞典
  CH: { lat: 47.0, lng: 8.0 }, // 瑞士
  UA: { lat: 49.0, lng: 32.0 }, // 乌克兰
  GB: { lat: 54.0, lng: -2.0 }, // 英国
  VA: { lat: 41.9, lng: 12.45 }, // 梵蒂冈

  // 北美洲
  AG: { lat: 17.05, lng: -61.8 }, // 安提瓜和巴布达
  BS: { lat: 24.25, lng: -76.0 }, // 巴哈马
  BB: { lat: 13.1667, lng: -59.5333 }, // 巴巴多斯
  BZ: { lat: 17.25, lng: -88.75 }, // 伯利兹
  CA: { lat: 60.0, lng: -95.0 }, // 加拿大
  CR: { lat: 10.0, lng: -84.0 }, // 哥斯达黎加
  CU: { lat: 21.5, lng: -80.0 }, // 古巴
  DM: { lat: 15.4167, lng: -61.3333 }, // 多米尼克
  DO: { lat: 19.0, lng: -70.6667 }, // 多米尼加共和国
  SV: { lat: 13.8333, lng: -88.9167 }, // 萨尔瓦多
  GD: { lat: 12.1167, lng: -61.6667 }, // 格林纳达
  GT: { lat: 15.5, lng: -90.25 }, // 危地马拉
  HT: { lat: 19.0, lng: -72.4167 }, // 海地
  HN: { lat: 15.0, lng: -86.5 }, // 洪都拉斯
  JM: { lat: 18.25, lng: -77.5 }, // 牙买加
  MX: { lat: 23.0, lng: -102.0 }, // 墨西哥
  NI: { lat: 13.0, lng: -85.0 }, // 尼加拉瓜
  PA: { lat: 9.0, lng: -80.0 }, // 巴拿马
  KN: { lat: 17.3333, lng: -62.75 }, // 圣基茨和尼维斯
  LC: { lat: 13.8833, lng: -61.1333 }, // 圣卢西亚
  VC: { lat: 13.25, lng: -61.2 }, // 圣文森特和格林纳丁斯
  TT: { lat: 11.0, lng: -61.0 }, // 特立尼达和多巴哥
  US: { lat: 38.0, lng: -97.0 }, // 美国

  // 南美洲
  AR: { lat: -34.0, lng: -64.0 }, // 阿根廷
  BO: { lat: -17.0, lng: -65.0 }, // 玻利维亚
  BR: { lat: -10.0, lng: -55.0 }, // 巴西
  CL: { lat: -30.0, lng: -71.0 }, // 智利
  CO: { lat: 4.0, lng: -72.0 }, // 哥伦比亚
  EC: { lat: -2.0, lng: -77.5 }, // 厄瓜多尔
  GY: { lat: 5.0, lng: -59.0 }, // 圭亚那
  PY: { lat: -23.0, lng: -58.0 }, // 巴拉圭
  PE: { lat: -10.0, lng: -76.0 }, // 秘鲁
  SR: { lat: 4.0, lng: -56.0 }, // 苏里南
  UY: { lat: -33.0, lng: -56.0 }, // 乌拉圭
  VE: { lat: 8.0, lng: -66.0 }, // 委内瑞拉

  // 大洋洲
  AU: { lat: -27.0, lng: 133.0 }, // 澳大利亚
  FJ: { lat: -18.0, lng: 175.0 }, // 斐济
  KI: { lat: 1.4167, lng: 173.0 }, // 基里巴斯
  MH: { lat: 9.0, lng: 168.0 }, // 马绍尔群岛
  FM: { lat: 6.9167, lng: 158.25 }, // 密克罗尼西亚
  NR: { lat: -0.5333, lng: 166.9167 }, // 瑙鲁
  NZ: { lat: -41.0, lng: 174.0 }, // 新西兰
  PW: { lat: 7.5, lng: 134.5 }, // 帕劳
  PG: { lat: -6.0, lng: 147.0 }, // 巴布亚新几内亚
  WS: { lat: -13.5833, lng: -172.3333 }, // 萨摩亚
  SB: { lat: -8.0, lng: 159.0 }, // 所罗门群岛
  TO: { lat: -20.0, lng: -175.0 }, // 汤加
  TV: { lat: -8.0, lng: 178.0 }, // 图瓦卢
  VU: { lat: -16.0, lng: 167.0 }, // 瓦努阿图

  // 非洲
  DZ: { lat: 28.0, lng: 3.0 }, // 阿尔及利亚
  AO: { lat: -12.5, lng: 18.5 }, // 安哥拉
  BJ: { lat: 9.5, lng: 2.25 }, // 贝宁
  BW: { lat: -22.0, lng: 24.0 }, // 博茨瓦纳
  BF: { lat: 13.0, lng: -2.0 }, // 布基纳法索
  BI: { lat: -3.5, lng: 30.0 }, // 布隆迪
  CM: { lat: 6.0, lng: 12.0 }, // 喀麦隆
  CV: { lat: 16.0, lng: -24.0 }, // 佛得角
  CF: { lat: 7.0, lng: 21.0 }, // 中非共和国
  TD: { lat: 15.0, lng: 19.0 }, // 乍得
  KM: { lat: -12.1667, lng: 44.25 }, // 科摩罗
  CG: { lat: -1.0, lng: 15.0 }, // 刚果
  CD: { lat: 0.0, lng: 25.0 }, // 刚果民主共和国
  CI: { lat: 8.0, lng: -5.0 }, // 科特迪瓦
  DJ: { lat: 11.5, lng: 43.0 }, // 吉布提
  EG: { lat: 27.0, lng: 30.0 }, // 埃及
  GQ: { lat: 2.0, lng: 10.0 }, // 赤道几内亚
  ER: { lat: 15.0, lng: 39.0 }, // 厄立特里亚
  ET: { lat: 8.0, lng: 38.0 }, // 埃塞俄比亚
  GA: { lat: -1.0, lng: 11.75 }, // 加蓬
  GM: { lat: 13.4667, lng: -16.5667 }, // 冈比亚
  GH: { lat: 8.0, lng: -2.0 }, // 加纳
  GN: { lat: 11.0, lng: -10.0 }, // 几内亚
  GW: { lat: 12.0, lng: -15.0 }, // 几内亚比绍
  KE: { lat: 1.0, lng: 38.0 }, // 肯尼亚
  LS: { lat: -29.5, lng: 28.5 }, // 莱索托
  LR: { lat: 6.5, lng: -9.5 }, // 利比里亚
  LY: { lat: 25.0, lng: 17.0 }, // 利比亚
  MG: { lat: -20.0, lng: 47.0 }, // 马达加斯加
  MW: { lat: -13.5, lng: 34.0 }, // 马拉维
  ML: { lat: 17.0, lng: -4.0 }, // 马里
  MR: { lat: 20.0, lng: -12.0 }, // 毛里塔尼亚
  MU: { lat: -20.2833, lng: 57.55 }, // 毛里求斯
  YT: { lat: -12.8333, lng: 45.1667 }, // 马约特
  MA: { lat: 32.0, lng: -5.0 }, // 摩洛哥
  MZ: { lat: -18.25, lng: 35.0 }, // 莫桑比克
  NA: { lat: -22.0, lng: 17.0 }, // 纳米比亚
  NE: { lat: 16.0, lng: 8.0 }, // 尼日尔
  NG: { lat: 10.0, lng: 8.0 }, // 尼日利亚
  RW: { lat: -2.0, lng: 30.0 }, // 卢旺达
  ST: { lat: 1.0, lng: 7.0 }, // 圣多美和普林西比
  SN: { lat: 14.0, lng: -14.0 }, // 塞内加尔
  SC: { lat: -4.5833, lng: 55.6667 }, // 塞舌尔
  SL: { lat: 8.5, lng: -11.5 }, // 塞拉利昂
  SO: { lat: 10.0, lng: 49.0 }, // 索马里
  ZA: { lat: -29.0, lng: 24.0 }, // 南非
  SD: { lat: 15.0, lng: 30.0 }, // 苏丹
  SZ: { lat: -26.5, lng: 31.5 }, // 斯威士兰
  TZ: { lat: -6.0, lng: 35.0 }, // 坦桑尼亚
  TG: { lat: 8.0, lng: 1.1667 }, // 多哥
  TN: { lat: 34.0, lng: 9.0 }, // 突尼斯
  UG: { lat: 1.0, lng: 32.0 }, // 乌干达
  EH: { lat: 24.5, lng: -13.0 }, // 西撒哈拉
  ZM: { lat: -15.0, lng: 30.0 }, // 赞比亚
  ZW: { lat: -20.0, lng: 30.0 }, // 津巴布韦
};

// 根据国家代码获取经纬度
function getCountryCoordinates(countryCode: string) {
  return countryCoordinates[countryCode] || null;
}
