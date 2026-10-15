export type DateRange = '7d' | '30d' | '90d';

export type ClientStatus = 'riesgo' | 'oportunidad' | 'estable';

export type Client = {
  id: string;
  name: string;
  company: string;
  ltv: string;
  status: ClientStatus;
  next: string;
  action: string;
  avatar: string;
  detail: string;
  amount: string;
};

export type Project = {
  name: string;
  pct: number;
  owner: string;
  avatar: string;
  alert: string;
  color: string;
};

export type Ticket = {
  name: string;
  company: string;
  issue: string;
  time: string;
  badge: string;
  badgeColor: string;
  urgency: string;
  dot: string;
};

export type Agent = {
  name: string;
  conf: number;
  tasks: number;
  status: 'ok' | 'warn';
  desc: string;
};

export type Insight = {
  tag: string;
  body: string;
  cta: string;
  variant: 'light' | 'primary' | 'ghost';
};

export type MessageRow = { name: string; msgs: number; pct: number };
export type PipelineStage = { label: string; val: number; w: string };
