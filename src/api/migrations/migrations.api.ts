import { apiClient } from '../api';

export type MigrationConnectionMode = 'string' | 'options';
export type MigrationRunMode = 'mock' | 'real';

export type MigrationConnectionPayload = {
  connectionMode: MigrationConnectionMode;
  connectionString?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
};

export type MigrationPayload = {
  currentMasterConnection?: MigrationConnectionPayload;
  currentTransactionConnection?: MigrationConnectionPayload;
  oldMasterConnection?: MigrationConnectionPayload;
  oldTransactionConnection?: MigrationConnectionPayload;
  selectedTables?: string[];
};

export type MigrationVerifyResponse = {
  verified: boolean;
  message: string;
};

export type MigrationSchemaApplyResponse = {
  message: string;
  currentMaster?: {
    label: string;
    migrations: string[];
    source: string;
  };
  currentTransaction?: {
    label: string;
    migrations: string[];
    source: string;
  };
};

export const migrationsApi = {
  verifyConnection: async (
    payload: MigrationPayload
  ): Promise<MigrationVerifyResponse> => {
    const res = await apiClient.post<MigrationVerifyResponse>(
      '/migrations/verify',
      payload
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to verify source connection');
    }

    return res.data;
  },

  applyCurrentSchema: async (
    payload: MigrationPayload & { schemaTarget?: 'currentMaster' | 'currentTransaction' }
  ): Promise<MigrationSchemaApplyResponse> => {
    const res = await apiClient.post<MigrationSchemaApplyResponse>(
      '/migrations/apply-current-schema',
      payload
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to apply current database schema migrations');
    }

    return res.data;
  },

  runMock: async (payload: MigrationPayload): Promise<{ blob: Blob; filename?: string }> => {
    const res = await apiClient.postDownload('/migrations/mock', payload);

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to generate migration preview');
    }

    return res.data;
  },

  runMigration: async (payload: MigrationPayload): Promise<{ blob: Blob; filename?: string }> => {
    const res = await apiClient.postDownload('/migrations/run', payload);

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to run migration');
    }

    return res.data;
  },
};

export default migrationsApi;
