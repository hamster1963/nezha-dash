"use server";

import maxmind, { CityResponse, AsnResponse } from 'maxmind';
import { GetServerIP } from './serverFetch';
import path from 'path';

type IPInfo = {
    city: CityResponse;
    asn: AsnResponse;
}

export default async function GetIPInfo({ server_id }: { server_id: string }): Promise<IPInfo> {
    const ip = await GetServerIP({ server_id: Number(server_id) })
    
    // 使用 path.join 获取正确的文件路径
    const cityDbPath = path.join(process.cwd(), 'lib', 'GeoLite2-City.mmdb');
    const asnDbPath = path.join(process.cwd(), 'lib', 'GeoLite2-ASN.mmdb');

    const cityLookup = await maxmind.open<CityResponse>(cityDbPath)
    const asnLookup = await maxmind.open<AsnResponse>(asnDbPath)

    return {
        city: cityLookup.get(ip) as CityResponse,
        asn: asnLookup.get(ip) as AsnResponse
    }
}