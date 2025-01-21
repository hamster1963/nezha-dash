import { Progress } from "@/components/ui/progress"

type ServerUsageBarProps = {
  value: number
}

export default function ServerUsageBar({ value }: ServerUsageBarProps) {
  return (
    <Progress
      aria-label={"Server Usage Bar"}
      aria-labelledby={"Server Usage Bar"}
      value={value}
      indicatorClassName={value > 90 ? "bg-red-500" : value > 70 ? "bg-orange-400" : "bg-green-500"}
      className={"h-[3px] rounded-sm"}
    />
  )
}
