"use server";

import { NezhaAPI, ServerApi } from "@/app/types/nezha-api";
import { MakeOptional } from "@/app/types/utils";
import { error } from "console";
import getEnv from "./env-entry";

export async function GetNezhaData() {

  var nezhaBaseUrl = getEnv("NezhaBaseUrl");
  if (!nezhaBaseUrl) {
    error("NezhaBaseUrl is not set");
    return;
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
    const nezhaData = (await response.json()).result as NezhaAPI[];
    const data: ServerApi = {
      live_servers: 0,
      offline_servers: 0,
      total_bandwidth: 0,
      result: [],
    };
    const timestamp = Date.now() / 1000;
    data.result = nezhaData.map(
      (element: MakeOptional<NezhaAPI, "ipv4" | "ipv6" | "valid_ip">) => {
        if (timestamp - element.last_active > 300) {
          data.offline_servers += 1;
          element.online_status = false;
        } else {
          data.live_servers += 1;
          element.online_status = true;
        }
        data.total_bandwidth += element.status.NetOutTransfer;

        delete element.ipv4;
        delete element.ipv6;
        delete element.valid_ip;

        return element;
      },
    );

    return data;
  } catch (error) {
    return error;
  }
}
