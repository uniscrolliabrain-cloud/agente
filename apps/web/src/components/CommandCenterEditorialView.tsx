// COMMAND_CENTER_EDITORIAL_VIEW_V1 - misma carga y contratos que
// CommandCenterView, con la composición editorial aprobada en UI Lab.
// Se puede revertir con VITE_COMMAND_CENTER_V2=false.
import { useCallback, useEffect, useState } from "react";
import { isDemoSession } from "../api/client";
import { getCompanyOverview, type CompanyOverview } from "../api/company";
import CommandCenterEditorial from "./command-center-editorial/CommandCenterEditorial";

interface Props {
  onOpenTask?: (taskId: string) => void;
  onReviewTask?: (taskId: string) => void;
  onOpenTasksView?: () => void;
  onOpenAgentsView?: () => void;
  onOpenTeamView?: () => void;
  onOpenChat?: () => void;
}

export default function CommandCenterEditorialView({
  onOpenTask,
  onReviewTask,
  onOpenTasksView,
  onOpenAgentsView,
  onOpenTeamView,
  onOpenChat,
}: Props) {
  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    try {
      setOverview(await getCompanyOverview());
      setUpdatedAt(new Date().toISOString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la empresa");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const poll = window.setInterval(() => void load(true), 30000);
    return () => window.clearInterval(poll);
  }, [load]);

  return (
    <CommandCenterEditorial
      overview={overview}
      loading={loading}
      refreshing={refreshing}
      error={error}
      updatedAt={updatedAt}
      demoSession={isDemoSession()}
      onRefresh={() => void load(true)}
      onReload={() => load(true)}
      {...(onOpenTask ? { onOpenTask } : {})}
      {...(onReviewTask ? { onReviewTask } : {})}
      {...(onOpenTasksView ? { onOpenTasksView } : {})}
      {...(onOpenAgentsView ? { onOpenAgentsView } : {})}
      {...(onOpenTeamView ? { onOpenTeamView } : {})}
      {...(onOpenChat ? { onOpenChat } : {})}
    />
  );
}
