import type { ContextServingFacade } from "./context.ts";
import { DurableJevEgressGate, type JevEgressPolicy } from "./jev-egress.ts";
import { openRouterJevFromEnvironment } from "./jev-classifier.ts";
import type { SemanticClassifier } from "./slow.ts";
/** Trusted bootstrap port. Secret presence never creates consent or a tenant policy. */
export function openRouterJevFactory(
  policies: ReadonlyMap<string, JevEgressPolicy>,
  env: NodeJS.ProcessEnv = process.env,
  transport: typeof fetch = fetch,
): (context: ContextServingFacade) => SemanticClassifier {
  const configuredPolicies = new Map(policies);
  const configuredEnv = {
    JEV_OPENROUTER_API_KEY: env.JEV_OPENROUTER_API_KEY,
    OPENROUTER_API_KEY: env.OPENROUTER_API_KEY,
    JEV_MODEL: env.JEV_MODEL,
  };
  return (context) => {
    const classifiers = new Map(
      [...configuredPolicies].map(([tenant, policy]) => [
        tenant,
        openRouterJevFromEnvironment(
          new DurableJevEgressGate(context.projections.db, context, tenant, policy),
          new Set([tenant]),
          configuredEnv,
          transport,
        ),
      ]),
    );
    return {
      classify: (body, signal, scope) => {
        const classifier = scope && classifiers.get(scope.identity.tenantId);
        if (!classifier) return Promise.reject(Error("JEV_EGRESS_DENIED"));
        return classifier.classify(body, signal, scope);
      },
    };
  };
}
