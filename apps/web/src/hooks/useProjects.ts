import { useCallback, useEffect, useRef, useState } from "react";
import {
  createProject as apiCreateProject,
  deleteProject as apiDeleteProject,
  getProject,
  listProjects,
  saveProjectBlocks as apiSaveBlocks,
  updateProject as apiUpdateProject,
  type Project,
  type ProjectBlock,
  type ProjectDetail,
  type ProjectStatus,
} from "../api/projects";

export function useProjects(enabled: boolean) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const list = await listProjects();
      if (!mountedRef.current) return;
      setProjects(list);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error cargando proyectos");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  const openDetail = useCallback(async (id: string) => {
    setActiveId(id);
    try {
      const d = await getProject(id);
      if (!mountedRef.current) return;
      setDetail(d);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error cargando proyecto");
    }
  }, []);

  const closeDetail = useCallback(() => {
    setActiveId(null);
    setDetail(null);
  }, []);

  const create = useCallback(
    async (input: { name: string; clientId?: string; description?: string; tags?: string[] }) => {
      try {
        const project = await apiCreateProject(input);
        setProjects((current) => [project, ...current]);
        setActiveId(project.id);
        await openDetail(project.id);
        setError(null);
        return project;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error creando proyecto");
        return null;
      }
    },
    [openDetail],
  );

  const update = useCallback(
    async (
      id: string,
      patch: Partial<{
        name: string;
        clientId: string | null;
        description: string;
        status: ProjectStatus;
        tags: string[];
      }>,
    ) => {
      try {
        const updated = await apiUpdateProject(id, patch);
        setProjects((current) => current.map((p) => (p.id === id ? updated : p)));
        setDetail((current) => (current && current.id === id ? { ...current, ...updated } : current));
        setError(null);
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error actualizando");
        return null;
      }
    },
    [],
  );

  const saveBlocks = useCallback(async (id: string, blocks: ProjectBlock[]) => {
    try {
      const updated = await apiSaveBlocks(id, blocks);
      setProjects((current) => current.map((p) => (p.id === id ? updated : p)));
      setDetail((current) => (current && current.id === id ? { ...current, blocks: updated.blocks } : current));
      setError(null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando bloques");
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await apiDeleteProject(id);
      setProjects((current) => current.filter((p) => p.id !== id));
      setActiveId((current) => {
        if (current === id) {
          setDetail(null);
          return null;
        }
        return current;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error borrando");
    }
  }, []);

  const refreshDetail = useCallback(async () => {
    if (!activeId) return;
    await openDetail(activeId);
  }, [activeId, openDetail]);

  return {
    projects,
    activeId,
    detail,
    error,
    loading,
    refresh,
    openDetail,
    closeDetail,
    create,
    update,
    saveBlocks,
    remove,
    refreshDetail,
  };
}