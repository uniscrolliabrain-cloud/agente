// ZENDESK_HOOK_V1

import { useCallback, useEffect, useMemo, useState } from "react";
import { generateCoWriteReply, getCoWriteDraft, listTickets } from "../api.ts";
import type { CoWriteDraft, TicketFilter, TicketId, ZendeskTicket } from "../types.ts";

export interface ZendeskState {
  tickets: ZendeskTicket[];
  filteredTickets: ZendeskTicket[];
  activeFilter: TicketFilter;
  activeTicketId: TicketId | null;
  activeTicket: ZendeskTicket | null;
  selectedIds: Set<TicketId>;
  starredIds: Set<TicketId>;
  query: string;
  coWrite: CoWriteDraft | null;
  loading: boolean;
  error: string | null;
  setFilter: (f: TicketFilter) => void;
  setQuery: (q: string) => void;
  selectTicket: (id: TicketId) => void;
  toggleSelected: (id: TicketId) => void;
  toggleStar: (id: TicketId) => void;
  clearSelection: () => void;
  generateReply: () => Promise<void>;
  toggleCoWrite: () => void;
  setCoWriteBody: (body: string) => void;
}

export function useZendesk(): ZendeskState {
  const [tickets, setTickets] = useState<ZendeskTicket[]>([]);
  const [activeFilter, setActiveFilter] = useState<TicketFilter>("principal");
  const [activeTicketId, setActiveTicketId] = useState<TicketId | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<TicketId>>(new Set());
  const [starredIds, setStarredIds] = useState<Set<TicketId>>(new Set(["1", "3"]));
  const [query, setQuery] = useState("");
  const [coWrite, setCoWrite] = useState<CoWriteDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listTickets(activeFilter)
      .then((list) => {
        if (cancelled) return;
        setTickets(list);
        setActiveTicketId((prev) => prev ?? list[0]?.id ?? null);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error cargando tickets");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeFilter]);

  const activeTicket = useMemo(
    () => tickets.find((t) => t.id === activeTicketId) ?? null,
    [tickets, activeTicketId],
  );

  useEffect(() => {
    if (!activeTicketId) {
      setCoWrite(null);
      return;
    }
    let cancelled = false;
    getCoWriteDraft(activeTicketId)
      .then((draft) => {
        if (cancelled) return;
        setCoWrite(draft);
      })
      .catch(() => {
        if (!cancelled) setCoWrite(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTicketId]);

  const filteredTickets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter((t) => {
      const haystack = (t.subject + " " + t.preview + " " + t.customer.name + " " + t.customer.company).toLowerCase();
      return haystack.includes(q);
    });
  }, [tickets, query]);

  const selectTicket = useCallback((id: TicketId) => setActiveTicketId(id), []);
  const setFilter = useCallback((f: TicketFilter) => setActiveFilter(f), []);

  const toggleSelected = useCallback((id: TicketId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleStar = useCallback((id: TicketId) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const generateReply = useCallback(async () => {
    if (!activeTicketId) return;
    const draft = await generateCoWriteReply(activeTicketId);
    setCoWrite(draft);
  }, [activeTicketId]);

  const toggleCoWrite = useCallback(() => {
    setCoWrite((prev) => (prev ? { ...prev, active: !prev.active } : prev));
  }, []);

  const setCoWriteBody = useCallback((body: string) => {
    setCoWrite((prev) => (prev ? { ...prev, body } : prev));
  }, []);

  return {
    tickets,
    filteredTickets,
    activeFilter,
    activeTicketId,
    activeTicket,
    selectedIds,
    starredIds,
    query,
    coWrite,
    loading,
    error,
    setFilter,
    setQuery,
    selectTicket,
    toggleSelected,
    toggleStar,
    clearSelection,
    generateReply,
    toggleCoWrite,
    setCoWriteBody,
  };
}