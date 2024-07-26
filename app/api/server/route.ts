
import { NextResponse } from "next/server";

export async function GET(_: Request) {

    try {
        const response = await fetch(process.env.NezhaBaseUrl+ '/api/v1/server/details',{
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