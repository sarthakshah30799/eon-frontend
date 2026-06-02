import type { StateProfileFormValues, StateProfileRecord } from '@/modules/stateProfile/types';
import {
  createEmptyStateProfileFormValues,
  mapFormValuesToRecord,
} from '@/modules/stateProfile/utils';

const STORAGE_KEY = 'maraekat-state-profiles';

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `state-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const now = (): string => new Date().toISOString();

const createSeedStates = (): StateProfileRecord[] => {
  const first = mapFormValuesToRecord(
    {
      ...createEmptyStateProfileFormValues(),
      stateCode: 'MH',
      stateName: 'Maharashtra',
      gstStateCode: '27',
      ctrStateCode: 'MH-CTR',
    },
    createId(),
    now(),
    now()
  );

  const second = mapFormValuesToRecord(
    {
      ...createEmptyStateProfileFormValues(),
      stateCode: 'KA',
      stateName: 'Karnataka',
      gstStateCode: '29',
      ctrStateCode: 'KA-CTR',
    },
    createId(),
    now(),
    now()
  );

  return [first, second];
};

const writeStoredStates = (states: StateProfileRecord[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
};

const readStoredStates = (): StateProfileRecord[] => {
  if (typeof window === 'undefined') {
    return createSeedStates();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const seed = createSeedStates();
    writeStoredStates(seed);
    return seed;
  }

  try {
    const parsed = JSON.parse(stored) as StateProfileRecord[];

    if (!Array.isArray(parsed)) {
      const seed = createSeedStates();
      writeStoredStates(seed);
      return seed;
    }

    return parsed;
  } catch {
    const seed = createSeedStates();
    writeStoredStates(seed);
    return seed;
  }
};

export const stateProfileApi = {
  getStateProfiles: async (): Promise<StateProfileRecord[]> => {
    return readStoredStates();
  },

  getStateProfileById: async (
    id: string
  ): Promise<StateProfileRecord | undefined> => {
    return readStoredStates().find(state => state.id === id);
  },

  createStateProfile: async (
    values: StateProfileFormValues
  ): Promise<StateProfileRecord> => {
    const states = readStoredStates();
    const timestamp = now();
    const record = mapFormValuesToRecord(values, createId(), timestamp, timestamp);
    writeStoredStates([...states, record]);
    return record;
  },

  updateStateProfile: async (
    id: string,
    values: StateProfileFormValues
  ): Promise<StateProfileRecord | undefined> => {
    const states = readStoredStates();
    const existing = states.find(state => state.id === id);

    if (!existing) {
      return undefined;
    }

    const updated = mapFormValuesToRecord(values, existing.id, existing.createdAt, now());
    writeStoredStates(states.map(state => (state.id === id ? updated : state)));
    return updated;
  },
};

