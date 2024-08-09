import { NezhaAPISafe } from "@/app/types/nezha-api";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNezhaInfo(serverInfo: NezhaAPISafe) {
  return {
    ...serverInfo,
    cpu: serverInfo.status.CPU,
    up: serverInfo.status.NetOutSpeed / 1024 / 1024,
    down: serverInfo.status.NetInSpeed / 1024 / 1024,
    online: serverInfo.online_status,
    mem: (serverInfo.status.MemUsed / serverInfo.host.MemTotal) * 100,
    stg: (serverInfo.status.DiskUsed / serverInfo.host.DiskTotal) * 100,
    country_code: serverInfo.host.CountryCode,
  };
}

export function formatBytes(bytes: number, decimals: number = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getDaysBetweenDates(date1: string, date2: string): number {
  const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);

  // 计算两个日期之间的天数差异
  return Math.round(
    Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay),
  );
}

export const fetcher = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    })
    .then((data) => data.data)
    .catch((err) => {
      console.error(err);
      throw err;
    });

export const nezhaFetcher = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    })
    .then((data) => data)
    .catch((err) => {
      console.error(err);
      throw err;
    });
