import React from "react";

import { Loader } from "@/components/loading/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type SubscribeCardProps = {
  provider: string;
  behavior: string;
  value: number;
  nextBillDay?: number;
  total: number;
  unit: string;
  colorClassName: string;
  isLoading: boolean;
};

function SubscribeCard({
  provider,
  behavior,
  value,
  total,
  unit,
  nextBillDay,
  colorClassName,
  isLoading,
}: SubscribeCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold md:text-base">
          {provider}
        </CardTitle>
        {nextBillDay !== -1 && (
          <div className={"flex items-center gap-0.5"}>
            <p className={"text-[10px] font-semibold opacity-50"}>
              {nextBillDay}
            </p>
            <p className={"text-[10px] font-bold"}>|</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={"flex items-center gap-0.5"}>
          <p className="text-[12px] text-muted-foreground">{behavior}</p>
          <Loader visible={isLoading} />
        </div>

        <div className={"flex items-baseline gap-1"}>
          <p className={"mb-4 text-3xl font-semibold"}>{value}</p>
          <p className={"mb-4 text-sm font-light text-muted-foreground"}>
            {unit}
          </p>
        </div>
        <Progress
          aria-label={`Used ${unit}`}
          aria-labelledby={`${value} Used ${unit}`}
          value={(value / total) * 100}
          indicatorClassName={colorClassName}
          className={"h-[3px] rounded-sm"}
        />
      </CardContent>
    </Card>
  );
}

export default SubscribeCard;
