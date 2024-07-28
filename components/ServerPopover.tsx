import { NezhaAPISafe } from "@/app/types/nezha-api";
import { formatBytes } from "@/lib/utils";

export default function ServerCardPopover({
  host,
  status,
}: {
  host: NezhaAPISafe["host"];
  status: NezhaAPISafe["status"];
}) {
  return (
    <section className="max-w-[240px]">
      <div>
        System: {host.Platform}-{host.PlatformVersion} [{host.Virtualization}:{" "}
        {host.Arch}]
      </div>
      <div>CPU: [{host.CPU.map((item) => item).join(", ")}]</div>
      <div>
        STG: {formatBytes(status.DiskUsed)}/{formatBytes(host.DiskTotal)}
      </div>
      <div>
        Mem: {formatBytes(status.MemUsed)}/{formatBytes(host.MemTotal)}
      </div>
      <div>
        Swap: {formatBytes(status.SwapUsed)}/{formatBytes(host.SwapTotal)}
      </div>
      <div></div>
      <div>
        Load: {status.Load1.toFixed(2)}/{status.Load5.toFixed(2)}/
        {status.Load15.toFixed(2)}
      </div>
      <div>Online: {(status.Uptime / 86400).toFixed(0)} Days</div>
    </section>
  );
}
