import type {
  UserProfileFormValues,
  UserProfileRecord,
} from '@/modules/userProfile/types';
import {
  createEmptyUserProfileFormValues,
  mapFormValuesToRecord,
} from '@/modules/userProfile/utils';

const STORAGE_KEY = 'maraekat_user_profiles';

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const now = (): string => new Date().toISOString();

const seedProfiles = (): UserProfileRecord[] => {
  const first = now();
  const second = new Date(Date.now() - 86_400_000).toISOString();
  const third = new Date(Date.now() - 172_800_000).toISOString();

  return [
    mapFormValuesToRecord(
      {
        ...createEmptyUserProfileFormValues(),
        corporateClientId: 'client-1',
        code: 'USR-001',
        name: 'Aarav Shah',
        cellNo: '+91 98765 43210',
        emailId: 'aarav.shah@example.com',
        branchId: 'branch-1',
        idWillExpireOn: '2026-12-31',
        groupId: 'group-1',
        purposeId: 'purpose-1',
        mpUsername: 'aarav.shah',
        controlSetup: {
          isActive: true,
          isAdministrator: false,
          miscLimitAuthorization: true,
          canClearCounter: false,
          complianceAuthorization: true,
          dataEntryAuthorization: true,
          creditLimitAuthorization: false,
        },
      },
      'user-1',
      first,
      first
    ),
    mapFormValuesToRecord(
      {
        ...createEmptyUserProfileFormValues(),
        corporateClientId: 'client-2',
        code: 'USR-002',
        name: 'Neha Kapoor',
        cellNo: '+91 98111 22334',
        emailId: 'neha.kapoor@example.com',
        branchId: 'branch-2',
        idWillExpireOn: '2026-08-30',
        groupId: 'group-2',
        purposeId: 'purpose-2',
        mpUsername: 'neha.kapoor',
        controlSetup: {
          isActive: true,
          isAdministrator: true,
          miscLimitAuthorization: true,
          canClearCounter: true,
          complianceAuthorization: true,
          dataEntryAuthorization: true,
          creditLimitAuthorization: true,
        },
      },
      'user-2',
      second,
      second
    ),
    mapFormValuesToRecord(
      {
        ...createEmptyUserProfileFormValues(),
        corporateClientId: 'client-3',
        code: 'USR-003',
        name: 'Imran Ali',
        cellNo: '+91 99887 76655',
        emailId: 'imran.ali@example.com',
        branchId: 'branch-3',
        idWillExpireOn: '2027-03-15',
        groupId: 'group-3',
        purposeId: 'purpose-3',
        mpUsername: 'imran.ali',
        controlSetup: {
          isActive: false,
          isAdministrator: false,
          miscLimitAuthorization: false,
          canClearCounter: false,
          complianceAuthorization: true,
          dataEntryAuthorization: false,
          creditLimitAuthorization: false,
        },
      },
      'user-3',
      third,
      third
    ),
  ];
};

const readStoredProfiles = (): UserProfileRecord[] => {
  if (typeof window === 'undefined') {
    return seedProfiles();
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    const seeds = seedProfiles();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
    return seeds;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as UserProfileRecord[];
    return Array.isArray(parsedValue) ? parsedValue : seedProfiles();
  } catch {
    return seedProfiles();
  }
};

const writeStoredProfiles = (profiles: UserProfileRecord[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
};

export const userProfileApi = {
  getUserProfiles: async (): Promise<UserProfileRecord[]> => {
    return readStoredProfiles();
  },
  getUserProfileById: async (
    id: string
  ): Promise<UserProfileRecord | undefined> => {
    return readStoredProfiles().find(profile => profile.id === id);
  },
  createUserProfile: async (
    data: UserProfileFormValues
  ): Promise<UserProfileRecord> => {
    const profiles = readStoredProfiles();
    const createdAt = now();
    const newProfile = mapFormValuesToRecord(
      data,
      createId(),
      createdAt,
      createdAt
    );

    writeStoredProfiles([...profiles, newProfile]);

    return newProfile;
  },
  updateUserProfile: async (
    id: string,
    data: UserProfileFormValues
  ): Promise<UserProfileRecord | undefined> => {
    const profiles = readStoredProfiles();
    const existingProfile = profiles.find(profile => profile.id === id);

    if (!existingProfile) {
      return undefined;
    }

    const updatedProfile: UserProfileRecord = {
      ...existingProfile,
      ...data,
      updatedAt: now(),
    };

    writeStoredProfiles(
      profiles.map(profile => (profile.id === id ? updatedProfile : profile))
    );

    return updatedProfile;
  },
  deleteUserProfile: async (id: string): Promise<boolean> => {
    const profiles = readStoredProfiles();
    const nextProfiles = profiles.filter(profile => profile.id !== id);

    writeStoredProfiles(nextProfiles);

    return nextProfiles.length !== profiles.length;
  },
};

