
import { NextResponse } from "next/server";

export async function GET(_: Request) {
    if (!process.env.NezhaBaseUrl) {
        return NextResponse.json({ error: 'NezhaBaseUrl is not set' }, { status: 400 })
    }

    // Remove trailing slash
    var nezhaBaseUrl = process.env.NezhaBaseUrl;

    if (process.env.NezhaBaseUrl[process.env.NezhaBaseUrl.length - 1] === '/') {
        nezhaBaseUrl = process.env.NezhaBaseUrl.slice(0, -1);
    }

    try {
        const response = await fetch(nezhaBaseUrl+ '/api/v1/server/details',{
            headers: {
                'Authorization': process.env.NezhaAuth as string
            },
            next:{
                revalidate:1
            }
        });
        const data = await response.json();
        data.live_servers = 0;
        data.offline_servers = 0;
        data.total_bandwidth = 0;

        data.result.forEach((element: { status: { Uptime: number; NetOutTransfer: any; }; }) => {
            if (element.status.Uptime !== 0) {
                data.live_servers += 1;
            } else {
                data.offline_servers += 1;
            }
            data.total_bandwidth += element.status.NetOutTransfer;
        });
        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 200 })
    }

}