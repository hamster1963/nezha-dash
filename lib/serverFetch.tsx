"use server";

import { NezhaAPI, ServerApi } from "@/app/[locale]/types/nezha-api";
import { MakeOptional } from "@/app/[locale]/types/utils";
import getEnv from "@/lib/env-entry";
import { unstable_noStore as noStore } from "next/cache";

export async function GetNezhaData() {
  noStore();

  var nezhaBaseUrl = getEnv("NezhaBaseUrl");
  if (!nezhaBaseUrl) {
    console.log("NezhaBaseUrl is not set");
    return { error: "NezhaBaseUrl is not set" };
  }

  // Remove trailing slash
  if (nezhaBaseUrl[nezhaBaseUrl.length - 1] === "/") {
    nezhaBaseUrl = nezhaBaseUrl.slice(0, -1);
  }
  try {
    const response = await fetch(nezhaBaseUrl + "/api/v1/server/details", {
      headers: {
        Authorization: getEnv("NezhaAuth") as string,
      },
      next: {
        revalidate: 0,
      },
    });
    const resData = await response.json();
    const nezhaData = resData.result as NezhaAPI[];
    if (!nezhaData) {
      console.log(resData);
      return { error: "NezhaData fetch failed" };
    }
    const data: ServerApi = {
      live_servers: 0,
      offline_servers: 0,
      total_out_bandwidth: 0,
      total_in_bandwidth: 0,
      result: [],
    };

    var forceShowAllServers = getEnv("ForceShowAllServers");
    let nezhaDataFiltered: NezhaAPI[];
    if (forceShowAllServers === "true") {
      nezhaDataFiltered = nezhaData;
    } else {
      // remove hidden servers
      nezhaDataFiltered = nezhaData.filter(
        (element) => !element.hide_for_guest,
      );
    }

    const timestamp = Date.now() / 1000;
    data.result = nezhaDataFiltered.map(
      (element: MakeOptional<NezhaAPI, "ipv4" | "ipv6" | "valid_ip">) => {
        if (timestamp - element.last_active > 300) {
          data.offline_servers += 1;
          element.online_status = false;
        } else {
          data.live_servers += 1;
          element.online_status = true;
        }
        data.total_out_bandwidth += element.status.NetOutTransfer;
        data.total_in_bandwidth += element.status.NetInTransfer;

        delete element.ipv4;
        delete element.ipv6;
        delete element.valid_ip;

        return element;
      },
    );

    return data;
  } catch (error) {
    console.log("GetServerDetail error:", error);
    return error;
  }
}

export async function GetServerMonitor({ server_id }: { server_id: number }) {
  var nezhaBaseUrl = getEnv("NezhaBaseUrl");
  if (!nezhaBaseUrl) {
    console.log("NezhaBaseUrl is not set");
    return { error: "NezhaBaseUrl is not set" };
  }

  // Remove trailing slash
  if (nezhaBaseUrl[nezhaBaseUrl.length - 1] === "/") {
    nezhaBaseUrl = nezhaBaseUrl.slice(0, -1);
  }

  try {
    const response = await fetch(
      nezhaBaseUrl + `/api/v1/monitor/${server_id}`,
      {
        headers: {
          Authorization: getEnv("NezhaAuth") as string,
        },
        next: {
          revalidate: 30,
        },
      },
    );
    const resData = await response.json();
    const monitorData = resData.result;
    if (!monitorData) {
      console.log(resData);
      return { error: "MonitorData fetch failed" };
    }
    return monitorData;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function GetServerDetail({ server_id }: { server_id: number }) {
  var nezhaBaseUrl = getEnv("NezhaBaseUrl");
  if (!nezhaBaseUrl) {
    console.log("NezhaBaseUrl is not set");
    return { error: "NezhaBaseUrl is not set" };
  }

  // Remove trailing slash
  if (nezhaBaseUrl[nezhaBaseUrl.length - 1] === "/") {
    nezhaBaseUrl = nezhaBaseUrl.slice(0, -1);
  }

  try {
    const response = await fetch(
      nezhaBaseUrl + `/api/v1/server/details?id=${server_id}`,
      {
        headers: {
          Authorization: getEnv("NezhaAuth") as string,
        },
        next: {
          revalidate: 0,
        },
      },
    );
    const resData = await response.json();
    const detailDataList = resData.result;
    if (!detailDataList) {
      console.log(resData);
      return { error: "MonitorData fetch failed" };
    }

    const timestamp = Date.now() / 1000;
    const detailData = detailDataList.map(
      (element: MakeOptional<NezhaAPI, "ipv4" | "ipv6" | "valid_ip">) => {
        if (timestamp - element.last_active > 300) {
          element.online_status = false;
        } else {
          element.online_status = true;
        }
        delete element.ipv4;
        delete element.ipv6;
        delete element.valid_ip;
        return element;
      },
    )[0];

    return detailData;
  } catch (error) {
    console.error(error);
    return error;
  }
}
