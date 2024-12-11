"use server";

import maxmind, { CityResponse, AsnResponse } from 'maxmind';
import { GetServerIP } from './serverFetch';

type IPInfo = {
    city: CityResponse;
    asn: AsnResponse;
}

export default async function GetIPInfo({ server_id }: { server_id: string }): Promise<IPInfo> {

    const ip = await GetServerIP({ server_id: Number(server_id) })

    const cityLookup = await maxmind.open<CityResponse>('./lib/GeoLite2-City.mmdb')
    const asnLookup = await maxmind.open<AsnResponse>('./lib/GeoLite2-ASN.mmdb')

    return {
        city: cityLookup.get(ip) as CityResponse,
        asn: asnLookup.get(ip) as AsnResponse
    }
}