import { BackIcon } from "@/components/Icon";
import { Loader } from "@/components/loading/Loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NetworkChartLoading() {
  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5">
          <CardTitle className="flex items-center gap-0.5 text-xl">
            <BackIcon />
            <Loader visible={true} />
          </CardTitle>
          <CardDescription className="text-xs opacity-0">
            loading...
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div className="aspect-auto h-[250px] w-full flex-col items-center justify-center"></div>
      </CardContent>
    </Card>
  );
}
