import { MapIcon } from "lucide-react";

import { DASHBOARD_CLIENT } from "../constants/dashboard.constants";

export function EmptyFloorsState() {
  return (
    <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
      <MapIcon className="size-7 text-muted-foreground" />
      <h3 className="mt-4 font-heading text-base font-semibold">{DASHBOARD_CLIENT.EMPTY_TITLE}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{DASHBOARD_CLIENT.EMPTY_DESC}</p>
    </div>
  );
}
