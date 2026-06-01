import type {
  CounterProfileFormValues,
  CounterProfileRecord,
} from '@/modules/counterProfile/types';
import {
  createEmptyCounterProfileFormValues,
  mapFormValuesToRecord,
} from '@/modules/counterProfile/utils';

const STORAGE_KEY = 'maraekat-counter-profiles';

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `counter-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const now = (): string => new Date().toISOString();

const createSeedCounters = (): CounterProfileRecord[] => {
  const first = mapFormValuesToRecord(
    {
      ...createEmptyCounterProfileFormValues(),
      counterCode: 'CTR-001',
      counterName: 'Main Counter',
      isActive: true,
    },
    createId(),
    now(),
    now()
  );

  const second = mapFormValuesToRecord(
    {
      ...createEmptyCounterProfileFormValues(),
      counterCode: 'CTR-002',
      counterName: 'Airport Counter',
      isActive: false,
    },
    createId(),
    now(),
    now()
  );

  return [first, second];
};

const writeStoredCounters = (counters: CounterProfileRecord[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
};

const readStoredCounters = (): CounterProfileRecord[] => {
  if (typeof window === 'undefined') {
    return createSeedCounters();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const seed = createSeedCounters();
    writeStoredCounters(seed);
    return seed;
  }

  try {
    const parsed = JSON.parse(stored) as CounterProfileRecord[];

    if (!Array.isArray(parsed)) {
      const seed = createSeedCounters();
      writeStoredCounters(seed);
      return seed;
    }

    return parsed;
  } catch {
    const seed = createSeedCounters();
    writeStoredCounters(seed);
    return seed;
  }
};

export const counterProfileApi = {
  getCounterProfiles: async (): Promise<CounterProfileRecord[]> => {
    return readStoredCounters();
  },

  getCounterProfileById: async (
    id: string
  ): Promise<CounterProfileRecord | undefined> => {
    return readStoredCounters().find(counter => counter.id === id);
  },

  createCounterProfile: async (
    values: CounterProfileFormValues
  ): Promise<CounterProfileRecord> => {
    const counters = readStoredCounters();
    const timestamp = now();
    const record = mapFormValuesToRecord(values, createId(), timestamp, timestamp);
    writeStoredCounters([...counters, record]);
    return record;
  },

  updateCounterProfile: async (
    id: string,
    values: CounterProfileFormValues
  ): Promise<CounterProfileRecord | undefined> => {
    const counters = readStoredCounters();
    const existing = counters.find(counter => counter.id === id);

    if (!existing) {
      return undefined;
    }

    const updated = mapFormValuesToRecord(
      values,
      existing.id,
      existing.createdAt,
      now()
    );

    writeStoredCounters(
      counters.map(counter => (counter.id === id ? updated : counter))
    );

    return updated;
  },

  updateCounterProfileStatus: async (
    id: string,
    isActive: boolean
  ): Promise<CounterProfileRecord | undefined> => {
    const counters = readStoredCounters();
    const existing = counters.find(counter => counter.id === id);

    if (!existing) {
      return undefined;
    }

    const updated: CounterProfileRecord = {
      ...existing,
      isActive,
      updatedAt: now(),
    };

    writeStoredCounters(
      counters.map(counter => (counter.id === id ? updated : counter))
    );

    return updated;
  },

  deleteCounterProfile: async (id: string): Promise<boolean> => {
    const counters = readStoredCounters();
    writeStoredCounters(counters.filter(counter => counter.id !== id));
    return true;
  },
};
