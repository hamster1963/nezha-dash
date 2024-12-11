"use server";

import fs from "fs";
import { AsnResponse, CityResponse, Reader } from "maxmind";

import { GetServerIP } from "./serverFetch";

type IPInfo = {
  city: CityResponse;
  asn: AsnResponse;
};

export default async function GetIPInfo({
  server_id,
}: {
  server_id: string;
}): Promise<IPInfo> {
  const ip = await GetServerIP({ server_id: Number(server_id) });

  const cityDbBuffer = fs.readFileSync("./lib/GeoLite2-City.mmdb");
  const asnDbBuffer = fs.readFileSync("./lib/GeoLite2-ASN.mmdb");

  const cityLookup = new Reader<CityResponse>(cityDbBuffer);
  const asnLookup = new Reader<AsnResponse>(asnDbBuffer);

  return {
    city: cityLookup.get(ip) as CityResponse,
    asn: asnLookup.get(ip) as AsnResponse,
  };
}
