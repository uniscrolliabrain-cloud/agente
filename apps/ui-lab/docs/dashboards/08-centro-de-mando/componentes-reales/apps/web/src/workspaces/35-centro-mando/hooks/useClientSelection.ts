import { useState } from 'react';
import type { Client } from '../types';
export function useClientSelection() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  return { selectedClient, setSelectedClient };
}
