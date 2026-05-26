import type {
  UserRoleFormValues,
  UserRoleRecord,
} from '@/modules/userRole/types';
import {
  createEmptyUserRoleFormValues,
  mapFormValuesToRecord,
} from '@/modules/userRole/utils';

const STORAGE_KEY = 'maraekat_user_roles';

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `role-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const now = (): string => new Date().toISOString();

const seedRoles = (): UserRoleRecord[] => {
  const first = now();
  const second = new Date(Date.now() - 86_400_000).toISOString();
  const third = new Date(Date.now() - 172_800_000).toISOString();

  return [
    mapFormValuesToRecord(
      {
        ...createEmptyUserRoleFormValues(),
        roleCode: 'RL-001',
        roleName: 'Administrator',
        isActive: true,
      },
      'role-1',
      first,
      first
    ),
    mapFormValuesToRecord(
      {
        ...createEmptyUserRoleFormValues(),
        roleCode: 'RL-002',
        roleName: 'Supervisor',
        isActive: true,
      },
      'role-2',
      second,
      second
    ),
    mapFormValuesToRecord(
      {
        ...createEmptyUserRoleFormValues(),
        roleCode: 'RL-003',
        roleName: 'Counter User',
        isActive: false,
      },
      'role-3',
      third,
      third
    ),
  ];
};

const readStoredRoles = (): UserRoleRecord[] => {
  if (typeof window === 'undefined') {
    return seedRoles();
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    const seeds = seedRoles();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
    return seeds;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as UserRoleRecord[];
    return Array.isArray(parsedValue) ? parsedValue : seedRoles();
  } catch {
    return seedRoles();
  }
};

const writeStoredRoles = (roles: UserRoleRecord[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
};

export const userRoleApi = {
  getUserRoles: async (): Promise<UserRoleRecord[]> => {
    return readStoredRoles();
  },
  getUserRoleById: async (id: string): Promise<UserRoleRecord | undefined> => {
    return readStoredRoles().find(role => role.id === id);
  },
  createUserRole: async (data: UserRoleFormValues): Promise<UserRoleRecord> => {
    const roles = readStoredRoles();
    const createdAt = now();
    const newRole = mapFormValuesToRecord(data, createId(), createdAt, createdAt);

    writeStoredRoles([...roles, newRole]);

    return newRole;
  },
  updateUserRole: async (
    id: string,
    data: UserRoleFormValues
  ): Promise<UserRoleRecord | undefined> => {
    const roles = readStoredRoles();
    const existingRole = roles.find(role => role.id === id);

    if (!existingRole) {
      return undefined;
    }

    const updatedRole: UserRoleRecord = {
      ...existingRole,
      ...data,
      updatedAt: now(),
    };

    writeStoredRoles(
      roles.map(role => (role.id === id ? updatedRole : role))
    );

    return updatedRole;
  },
  deleteUserRole: async (id: string): Promise<boolean> => {
    const roles = readStoredRoles();
    const nextRoles = roles.filter(role => role.id !== id);

    writeStoredRoles(nextRoles);

    return nextRoles.length !== roles.length;
  },
};

