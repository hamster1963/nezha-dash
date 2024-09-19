import { NezhaAPISafe } from "@/app/types/nezha-api";
import ServerUsageBar from "@/components/ServerUsageBar";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatNezhaInfo } from "@/lib/utils";
import ServerCardPopover from "./ServerCardPopover";
import getUnicodeFlagIcon from "country-flag-icons/unicode";

export default function ServerCard({
  serverInfo,
}: {
  serverInfo: NezhaAPISafe;
}) {
  const { name, country_code, online, cpu, up, down, mem, stg, ...props } =
    formatNezhaInfo(serverInfo);

  const showFlag = process.env.NEXT_PUBLIC_ShowFlag === "true";

  return online ? (
    <Card
      className={
        "flex flex-col items-center justify-start gap-3 p-3 md:px-5 lg:flex-row"
      }
    >
      <Popover>
        <PopoverTrigger asChild>
          <section className={"flex items-center justify-start gap-2 lg:w-28"}>
            {showFlag ? (
              country_code ? (
                <span className="text-[12px] text-muted-foreground">
                  {getUnicodeFlagIcon(country_code)}
                </span>
              ) : (
                <span className="text-[12px] text-muted-foreground">🏁</span>
              )
            ) : null}
            <p
              className={cn(
                "break-all font-bold tracking-tight",
                showFlag ? "text-xs" : "text-sm",
              )}
            >
              {name}
            </p>
            <span className="h-2 w-2 shrink-0 rounded-full bg-green-500"></span>
          </section>
        </PopoverTrigger>
        <PopoverContent side="top">
          <ServerCardPopover status={props.status} host={props.host} />
        </PopoverContent>
      </Popover>
      <section className={"grid grid-cols-5 items-center gap-3"}>
        <div className={"flex flex-col"}>
          <p className="text-xs text-muted-foreground">CPU</p>
          <div className="flex items-center text-xs font-semibold">
            {cpu.toFixed(2)}%
          </div>
          <ServerUsageBar value={cpu} />
        </div>
        <div className={"flex flex-col"}>
          <p className="text-xs text-muted-foreground">Mem</p>
          <div className="flex items-center text-xs font-semibold">
            {mem.toFixed(2)}%
          </div>
          <ServerUsageBar value={mem} />
        </div>
        <div className={"flex flex-col"}>
          <p className="text-xs text-muted-foreground">STG</p>
          <div className="flex items-center text-xs font-semibold">
            {stg.toFixed(2)}%
          </div>
          <ServerUsageBar value={stg} />
        </div>
        <div className={"flex flex-col"}>
          <p className="text-xs text-muted-foreground">Upload</p>
          <div className="flex items-center text-xs font-semibold">
            {up.toFixed(2)}
            Mb/s
          </div>
        </div>
        <div className={"flex flex-col"}>
          <p className="text-xs text-muted-foreground">Download</p>
          <div className="flex items-center text-xs font-semibold">
            {down.toFixed(2)}
            Mb/s
          </div>
        </div>
      </section>
    </Card>
  ) : (
    <Card
      className={
        "flex flex-col items-center justify-start gap-3 p-3 md:px-5 lg:flex-row"
      }
    >
      <Popover>
        <PopoverTrigger asChild>
          <section className={"flex items-center justify-start gap-2 lg:w-28"}>
            {showFlag ? (
              country_code ? (
                <span className="text-[12px] text-muted-foreground">
                  {getUnicodeFlagIcon(country_code)}
                </span>
              ) : (
                <span className="text-[12px] text-muted-foreground">🏁</span>
              )
            ) : null}
            <p
              className={cn(
                "break-all font-bold tracking-tight",
                showFlag ? "text-xs" : "text-sm",
              )}
            >
              {name}
            </p>
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-500"></span>
          </section>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-2" side="top">
          <p className="text-sm text-muted-foreground">Offline</p>
        </PopoverContent>
      </Popover>
    </Card>
  );
}
