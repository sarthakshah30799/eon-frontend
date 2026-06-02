import type {
  CountryProfileFormValues,
  CountryProfileRecord,
} from '@/modules/countryProfile/types';
import {
  createEmptyCountryProfileFormValues,
  mapFormValuesToRecord,
} from '@/modules/countryProfile/utils';

const STORAGE_KEY = 'maraekat-country-profiles';

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `country-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const now = (): string => new Date().toISOString();

const createSeedCountries = (): CountryProfileRecord[] => {
  const first = mapFormValuesToRecord(
    {
      ...createEmptyCountryProfileFormValues(),
      countryCode: 'IN',
      countryName: 'India',
      lrsCountryCode: 'LRS-IN',
      ctrCountryCode: 'CTR-IN',
      riskCategory: 'Low',
      baseCountry: true,
    },
    createId(),
    now(),
    now()
  );

  const second = mapFormValuesToRecord(
    {
      ...createEmptyCountryProfileFormValues(),
      countryCode: 'AE',
      countryName: 'United Arab Emirates',
      lrsCountryCode: 'LRS-AE',
      ctrCountryCode: 'CTR-AE',
      riskCategory: 'Medium',
      restrictedCountry: false,
      greyListCountry: true,
    },
    createId(),
    now(),
    now()
  );

  return [first, second];
};

const writeStoredCountries = (countries: CountryProfileRecord[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(countries));
};

const readStoredCountries = (): CountryProfileRecord[] => {
  if (typeof window === 'undefined') {
    return createSeedCountries();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const seed = createSeedCountries();
    writeStoredCountries(seed);
    return seed;
  }

  try {
    const parsed = JSON.parse(stored) as CountryProfileRecord[];

    if (!Array.isArray(parsed)) {
      const seed = createSeedCountries();
      writeStoredCountries(seed);
      return seed;
    }

    return parsed;
  } catch {
    const seed = createSeedCountries();
    writeStoredCountries(seed);
    return seed;
  }
};

export const countryProfileApi = {
  getCountryProfiles: async (): Promise<CountryProfileRecord[]> => {
    return readStoredCountries();
  },

  getCountryProfileById: async (
    id: string
  ): Promise<CountryProfileRecord | undefined> => {
    return readStoredCountries().find(country => country.id === id);
  },

  createCountryProfile: async (
    values: CountryProfileFormValues
  ): Promise<CountryProfileRecord> => {
    const countries = readStoredCountries();
    const timestamp = now();
    const record = mapFormValuesToRecord(
      values,
      createId(),
      timestamp,
      timestamp
    );
    writeStoredCountries([...countries, record]);
    return record;
  },

  updateCountryProfile: async (
    id: string,
    values: CountryProfileFormValues
  ): Promise<CountryProfileRecord | undefined> => {
    const countries = readStoredCountries();
    const existing = countries.find(country => country.id === id);

    if (!existing) {
      return undefined;
    }

    const updated = mapFormValuesToRecord(
      values,
      existing.id,
      existing.createdAt,
      now()
    );

    writeStoredCountries(
      countries.map(country => (country.id === id ? updated : country))
    );

    return updated;
  },
};
