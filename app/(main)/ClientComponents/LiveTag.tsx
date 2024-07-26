"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { verifySSEConnection } from "@/lib/sseFetch";

export default function LiveTag() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Store the promise in a variable
    const ssePromise = verifySSEConnection(
      "https://home.buycoffee.tech/v2/VerifySSEConnect",
    );
    setTimeout(() => {
      toast.promise(ssePromise, {
        loading: "Connecting to SSE...",
        success: "HomeDash SSE Connected",
        error: "Error connecting to SSE",
      });
    });
    // Handle promise resolution separately
    ssePromise
      .then(() => {
        setConnected(true);
      })
      .catch(() => {
        setConnected(false);
      });
  }, []);

  return connected ? (
    <Badge className={"flex items-center justify-center gap-1 px-2"}>
      Synced
      <span className="h-2 w-2 rounded-full bg-green-500"></span>
    </Badge>
  ) : (
    <Badge className={"flex items-center justify-center gap-1 px-2"}>
      Static<span className="h-2 w-2 rounded-full bg-red-500"></span>
    </Badge>
  );
}
