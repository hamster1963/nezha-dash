"use client";
import useSWRSubscription, {
  type SWRSubscriptionOptions,
} from "swr/subscription";

type LooseObject = {
  [key: string]: any;
};

export function SSEDataFetch(url: string, fallbackData?: LooseObject): any {
  const { data } = useSWRSubscription<LooseObject>(
    url,
    (key: string | URL, { next }: SWRSubscriptionOptions<LooseObject>) => {
      const source = new EventSource(key);
      source.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        next(null, parsedData);
      };
      source.onerror = () => next(new Error("EventSource error"));
      return () => source.close();
    },
    {
      fallbackData: fallbackData,
    },
  );
  return data;
}

export function verifySSEConnection(url: string): Promise<{ name: string }> {
  return new Promise<{ name: string }>((resolve, reject) => {
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      resolve({ name: "SSE Connected" });
      eventSource.close();
    };

    eventSource.onerror = () => {
      reject("Failed to connect");
      eventSource.close();
    };
  });
}
