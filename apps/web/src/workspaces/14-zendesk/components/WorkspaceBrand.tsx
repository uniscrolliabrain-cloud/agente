// ZENDESK_BRAND_V1

import { MoreHorizontal } from "lucide-react";
import { BrandLockup } from "../../../components/BrandMark";

export default function WorkspaceBrand() {
  return (
    <div className="flex items-center gap-2.5 px-4 pb-2 pt-4">
      <div className="min-w-0 flex-1">
        <BrandLockup markSize={28} />
      </div>
      <button type="button" aria-label="Mas opciones" className="grid h-7 w-7 place-items-center rounded-lg text-text-3 hover:bg-bg-soft hover:text-text">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}