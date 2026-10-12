// PRESENTER_TURN_TO_SSE_HELPER_V1
import type { Kernel } from "../kernel.ts";
import type { KernelContext } from "../context/kernel-context.ts";

export interface PresenterSseResult {
  text: string;
  thoughtId: string;
  role: string;
  reason: string;
}

  // PRESENTER_EXPOSE_LAST_V1
export async function presenterTurnToSse(
  kernel: Kernel,
  ctx: KernelContext,
  turnId: string,
  fallback: string,
): Promise<PresenterSseResult> {
  try {
    const { Presenter } = await import("../observers/presenter.ts");
    const presenter = new Presenter({ kernel });
    const result = await presenter.presentTurn(ctx, turnId);
    if (!result) return { text: fallback, thoughtId: "", role: "response", reason: "no-presentation" };
    const content = result.presentation.content;
    const text =
      typeof content === "string"
        ? content
        : typeof content === "object" && content !== null && "text" in content
          ? String((content as { text?: unknown }).text ?? fallback)
          : fallback;
    return {
      text,
      thoughtId: result.presentation.thoughtId,
      role: result.presentation.role,
      reason: result.presentation.reason,
    };
  } catch {
    return { text: fallback, thoughtId: "", role: "response", reason: "error" };
  }
}