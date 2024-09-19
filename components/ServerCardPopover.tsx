import { NezhaAPISafe } from "@/app/types/nezha-api";
import { cn, formatBytes } from "@/lib/utils";

export function ServerCardPopoverCard({
  className,
  title,
  content,
  children,
}: {
  className?: string;
  title: string;
  content?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-[6px] flex w-full flex-col", className)}>
      <div className="text-sm font-semibold">{title}</div>
      {children ? (
        children
      ) : (
        <div className="break-all text-xs font-medium">{content}</div>
      )}
    </div>
  );
}

export default function ServerCardPopover({
  host,
  status,
}: {
  host: NezhaAPISafe["host"];
  status: NezhaAPISafe["status"];
}) {
  return (
    <section className="max-w-[300px]">
      <ServerCardPopoverCard
        title="System"
        content={`${host.Platform}-${host.PlatformVersion} [${host.Virtualization}: ${host.Arch}]`}
      />
      <ServerCardPopoverCard
        title="CPU"
        content={`${host.CPU.map((item) => item).join(", ")}`}
      />
      <ServerCardPopoverCard
        title="Mem"
        content={`${formatBytes(status.MemUsed)} / ${formatBytes(host.MemTotal)}`}
      />
      <ServerCardPopoverCard
        title="STG"
        content={`${formatBytes(status.DiskUsed)} / ${formatBytes(host.DiskTotal)}`}
      />
      <ServerCardPopoverCard
        title="Swap"
        content={`${formatBytes(status.SwapUsed)} / ${formatBytes(host.SwapTotal)}`}
      />
      <ServerCardPopoverCard
        title="Network"
        content={`${formatBytes(status.NetOutTransfer)} / ${formatBytes(status.NetInTransfer)}`}
      />
      <ServerCardPopoverCard
        title="Load"
        content={`${status.Load1.toFixed(2)} / ${status.Load5.toFixed(2)} / ${status.Load15.toFixed(2)}`}
      />
      <ServerCardPopoverCard
        className="mb-0"
        title="Online"
        content={`${(status.Uptime / 86400).toFixed(0)} Days`}
      />
    </section>
  );
}
