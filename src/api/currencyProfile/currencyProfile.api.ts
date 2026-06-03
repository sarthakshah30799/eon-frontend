import type {
  ICreateCurrencyProfile,
  ICurrencyProfile,
} from '@/modules/currencyProfile/types';
import {
  createEmptyCurrencyProfileFormValues,
  mapFormValuesToRecord,
} from '@/modules/currencyProfile/utils';

const STORAGE_KEY = 'maraekat-currency-profiles';

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `currency-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const now = (): string => new Date().toISOString();

const createSeedCurrencies = (): ICurrencyProfile[] => {
  const first = mapFormValuesToRecord(
    {
      ...createEmptyCurrencyProfileFormValues(),
      currencyCode: 'USD',
      currencyName: 'US Dollar',
      priority: '1',
      ratePer: '1',
      defaultMinRate: '1',
      defaultMaxRate: '5',
      openRatePremium: '0',
      gulfDiscFactor: '0',
      amexMapCode: 'USD001',
      active: true,
      onlyStocking: false,
      productAllowed: '',
    },
    createId(),
    now(),
    now()
  );

  const second = mapFormValuesToRecord(
    {
      ...createEmptyCurrencyProfileFormValues(),
      currencyCode: 'AED',
      currencyName: 'UAE Dirham',
      priority: '2',
      ratePer: '1',
      defaultMinRate: '1',
      defaultMaxRate: '5',
      openRatePremium: '0',
      gulfDiscFactor: '0',
      amexMapCode: 'AED001',
      active: true,
      onlyStocking: true,
      productAllowed: 'CN',
    },
    createId(),
    now(),
    now()
  );

  return [first, second];
};

const writeStoredCurrencies = (currencies: ICurrencyProfile[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currencies));
};

const readStoredCurrencies = (): ICurrencyProfile[] => {
  if (typeof window === 'undefined') {
    return createSeedCurrencies();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const seed = createSeedCurrencies();
    writeStoredCurrencies(seed);
    return seed;
  }

  try {
    const parsed = JSON.parse(stored) as ICurrencyProfile[];

    if (!Array.isArray(parsed)) {
      const seed = createSeedCurrencies();
      writeStoredCurrencies(seed);
      return seed;
    }

    return parsed;
  } catch {
    const seed = createSeedCurrencies();
    writeStoredCurrencies(seed);
    return seed;
  }
};

export const currencyProfileApi = {
  getCurrencyProfiles: async (): Promise<ICurrencyProfile[]> => {
    return readStoredCurrencies();
  },

  getCurrencyProfileById: async (
    id: string
  ): Promise<ICurrencyProfile | undefined> => {
    const currencies = readStoredCurrencies();
    return currencies.find(currency => currency.id === id);
  },

  createCurrencyProfile: async (
    data: ICreateCurrencyProfile
  ): Promise<ICurrencyProfile> => {
    const currencies = readStoredCurrencies();
    const timestamp = now();
    const record = mapFormValuesToRecord(
      data,
      createId(),
      timestamp,
      timestamp
    );

    writeStoredCurrencies([...currencies, record]);

    return record;
  },

  updateCurrencyProfile: async (
    id: string,
    data: ICreateCurrencyProfile
  ): Promise<ICurrencyProfile | undefined> => {
    const currencies = readStoredCurrencies();
    const existing = currencies.find(currency => currency.id === id);

    if (!existing) {
      return undefined;
    }

    const updated = mapFormValuesToRecord(
      data,
      existing.id,
      existing.createdAt,
      now()
    );

    writeStoredCurrencies(
      currencies.map(currency => (currency.id === id ? updated : currency))
    );

    return updated;
  },
};
