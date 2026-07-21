import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button, CardSection, Checkbox, Input } from '@/components/ui';
import migrationsApi, {
  type MigrationConnectionPayload,
  type MigrationPayload,
} from '@/api/migrations/migrations.api';

type MigrationTableGroup = {
  title: string;
  description: string;
  tables: MigrationTable[];
};

type MigrationTable = {
  id: string;
  name: string;
  note: string;
};

type ConnectionMode = 'string' | 'options';
type ConnectionSlot = 'currentMaster' | 'currentTransaction' | 'oldMaster' | 'oldTransaction';

type ConnectionProfileState = {
  connectionMode: ConnectionMode;
  connectionString: string;
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  verified: boolean;
};

const MIGRATION_TABLE_GROUPS: MigrationTableGroup[] = [
  {
    title: 'Core Masters',
    description: 'Source tables that define the main company hierarchy.',
    tables: [
      { id: 'mstcompanyrecord', name: 'mstcompanyrecord', note: 'Old company master.' },
      { id: 'mstcompany', name: 'mstcompany', note: 'Old branch master.' },
      { id: 'mstcounter', name: 'mstcounter', note: 'Old counter master.' },
    ],
  },
  {
    title: 'Users & Roles',
    description: 'User data plus role mapping derived from the old access flags.',
    tables: [
      { id: 'mstuser', name: 'mstuser', note: 'Old user master and role source.' },
      { id: 'user_roles', name: 'user_roles', note: 'Generated join table in the new db.' },
    ],
  },
  {
    title: 'Relations',
    description: 'Parent-child assignment tables used to resolve branch, counter, and user links.',
    tables: [
      { id: 'mstBranchCounterLink', name: 'mstBranchCounterLink', note: 'Branch to counter relation source.' },
      { id: 'mstBranchUserLink', name: 'mstBranchUserLink', note: 'Branch to user relation source.' },
      { id: 'mstCounterUserLink', name: 'mstCounterUserLink', note: 'Counter to user relation source.' },
    ],
  },
];

const ALL_TABLES = MIGRATION_TABLE_GROUPS.flatMap(group => group.tables);

const CONNECTION_SLOTS: ConnectionSlot[] = [
  'currentMaster',
  'currentTransaction',
  'oldMaster',
  'oldTransaction',
];

const CONNECTION_GROUPS: Array<{
  title: string;
  slots: ConnectionSlot[];
}> = [
  {
    title: 'Current Databases',
    slots: ['currentMaster', 'currentTransaction'],
  },
  {
    title: 'Old Databases',
    slots: ['oldMaster', 'oldTransaction'],
  },
];

const CONNECTION_LABELS: Record<ConnectionSlot, { title: string; description: string }> = {
  currentMaster: {
    title: 'Current master connection',
    description: 'Optional override for the new master database.',
  },
  currentTransaction: {
    title: 'Current transaction connection',
    description: 'Optional override for the new transaction database.',
  },
  oldMaster: {
    title: 'Old master connection',
    description: 'Source master database that holds company-level data.',
  },
  oldTransaction: {
    title: 'Old transaction / branch connection',
    description: 'Source branch database used for branch, counter, and user relations.',
  },
};

const isCurrentConnectionSlot = (slot: ConnectionSlot) =>
  slot === 'currentMaster' || slot === 'currentTransaction';

const createEmptyConnectionProfile = (): ConnectionProfileState => ({
  connectionMode: 'string',
  connectionString: '',
  host: '',
  port: '',
  username: '',
  password: '',
  database: '',
  ssl: false,
  verified: false,
});

const createInitialProfiles = (): Record<ConnectionSlot, ConnectionProfileState> => ({
  currentMaster: createEmptyConnectionProfile(),
  currentTransaction: createEmptyConnectionProfile(),
  oldMaster: createEmptyConnectionProfile(),
  oldTransaction: createEmptyConnectionProfile(),
});

const hasConnectionValues = (profile: ConnectionProfileState) =>
  profile.connectionMode === 'string'
    ? profile.connectionString.trim().length > 0
    : [
        profile.host.trim(),
        profile.port.trim(),
        profile.username.trim(),
        profile.password.trim(),
        profile.database.trim(),
      ].some(value => value.length > 0);

const buildConnectionPayload = (
  profile: ConnectionProfileState
): MigrationConnectionPayload | undefined => {
  if (!hasConnectionValues(profile)) {
    return undefined;
  }

  if (profile.connectionMode === 'string') {
    return {
      connectionMode: 'string',
      connectionString: profile.connectionString.trim(),
    };
  }

  return {
    connectionMode: 'options',
    host: profile.host.trim(),
    port: Number(profile.port),
    username: profile.username.trim(),
    password: profile.password,
    database: profile.database.trim(),
    ssl: profile.ssl,
  };
};

const buildMigrationPayload = (
  profiles: Record<ConnectionSlot, ConnectionProfileState>,
  selectedTables: string[] = []
): MigrationPayload => {
  const currentMasterConnection = buildConnectionPayload(profiles.currentMaster);
  const currentTransactionConnection = buildConnectionPayload(profiles.currentTransaction);
  const oldMasterConnection = buildConnectionPayload(profiles.oldMaster);
  const oldTransactionConnection = buildConnectionPayload(profiles.oldTransaction);

  const payload: MigrationPayload = {
    currentMasterConnection,
    currentTransactionConnection,
    oldMasterConnection,
    oldTransactionConnection,
  };

  if (selectedTables.length > 0) {
    payload.selectedTables = selectedTables;
  }

  return payload;
};

const validateConnectionProfile = (profile: ConnectionProfileState, label: string) => {
  if (!hasConnectionValues(profile)) {
    return;
  }

  if (profile.connectionMode === 'string') {
    if (!profile.connectionString.trim()) {
      throw new Error(`Please enter the ${label} connection string.`);
    }
    return;
  }

  if (!profile.host.trim()) throw new Error(`Please enter the ${label} host.`);
  if (!profile.port.trim()) throw new Error(`Please enter the ${label} port.`);
  if (!profile.username.trim()) throw new Error(`Please enter the ${label} username.`);
  if (!profile.password.trim()) throw new Error(`Please enter the ${label} password.`);
  if (!profile.database.trim()) throw new Error(`Please enter the ${label} database.`);

  const port = Number(profile.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Please enter a valid ${label} port.`);
  }
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const MigrationsView = () => {
  const { user, isLoading } = useAuth();
  const [profiles, setProfiles] = useState<Record<ConnectionSlot, ConnectionProfileState>>(
    createInitialProfiles
  );
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRunningSchema, setIsRunningSchema] = useState(false);
  const [isRunningMock, setIsRunningMock] = useState(false);
  const [isRunningReal, setIsRunningReal] = useState(false);
  const [isConnectionVerified, setIsConnectionVerified] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const selectedTables = useMemo(
    () => ALL_TABLES.filter(table => selectedTableIds.includes(table.id)),
    [selectedTableIds]
  );

  const configuredSlots = useMemo(
    () => CONNECTION_SLOTS.filter(slot => hasConnectionValues(profiles[slot])),
    [profiles]
  );

  const setMessage = (message: string) => {
    setStatusMessage(message);
  };

  const updateProfile = (
    slot: ConnectionSlot,
    next: Partial<ConnectionProfileState> | ((current: ConnectionProfileState) => ConnectionProfileState)
  ) => {
    setProfiles(prev => {
      const current = prev[slot];
      const resolved = typeof next === 'function' ? next(current) : { ...current, ...next };
      return {
        ...prev,
        [slot]: {
          ...resolved,
          verified: false,
        },
      };
    });
    setIsConnectionVerified(false);
  };

  const toggleTable = (tableId: string, checked: boolean) => {
    setSelectedTableIds(prev =>
      checked
        ? prev.includes(tableId)
          ? prev
          : [...prev, tableId]
        : prev.filter(id => id !== tableId)
    );
  };

  const toggleGroup = (groupTables: MigrationTable[], checked: boolean) => {
    const ids = groupTables.map(table => table.id);
    setSelectedTableIds(prev => {
      if (checked) {
        const next = [...prev];
        ids.forEach(id => {
          if (!next.includes(id)) next.push(id);
        });
        return next;
      }
      return prev.filter(id => !ids.includes(id));
    });
  };

  const validateConfiguredConnections = () => {
    if (configuredSlots.length === 0) {
      throw new Error('Please enter at least one database connection before verifying.');
    }

    configuredSlots.forEach(slot => {
      validateConnectionProfile(profiles[slot], CONNECTION_LABELS[slot].title);
    });
  };

  const verifyConnectionSet = async () => {
    try {
      validateConfiguredConnections();
      setIsVerifying(true);
      setStatusMessage('');
      const result = await migrationsApi.verifyConnection(buildMigrationPayload(profiles));
      setIsConnectionVerified(result.verified);
      setProfiles(prev => {
        const next = { ...prev };
        CONNECTION_SLOTS.forEach(slot => {
          if (hasConnectionValues(next[slot])) {
            next[slot] = {
              ...next[slot],
              verified: result.verified,
            };
          }
        });
        return next;
      });
      setMessage(result.message);
    } catch (error) {
      setIsConnectionVerified(false);
      setMessage(error instanceof Error ? error.message : 'Failed to verify connections.');
    } finally {
      setIsVerifying(false);
    }
  };

  const ensureReady = () => {
    if (!configuredSlots.some(slot => slot === 'oldMaster' || slot === 'oldTransaction')) {
      throw new Error('Please enter at least one old source connection first.');
    }

    if (!isConnectionVerified) {
      throw new Error('Please verify the configured connections first.');
    }

    if (selectedTableIds.length === 0) {
      throw new Error('Please select at least one table to continue.');
    }
  };

  const handleMockTest = async () => {
    try {
      ensureReady();
      setIsRunningMock(true);
      setStatusMessage('');
      const result = await migrationsApi.runMock(buildMigrationPayload(profiles, selectedTableIds));
      downloadBlob(result.blob, result.filename || 'migration-soft-run.xlsx');
      setMessage(
        `Soft run completed for ${selectedTableIds.length} table(s). Review the XLSX before real migration.`
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Soft run failed.');
    } finally {
      setIsRunningMock(false);
    }
  };

  const handleApplyCurrentSchema = async (slot: ConnectionSlot) => {
    try {
      if (!isCurrentConnectionSlot(slot)) {
        throw new Error('Schema migration can only be run for current databases.');
      }
      if (!isConnectionVerified) {
        throw new Error('Please verify the configured connections first.');
      }

      const profile = profiles[slot];
      validateConnectionProfile(profile, CONNECTION_LABELS[slot].title);

      setIsRunningSchema(true);
      setStatusMessage('');
      const connection = buildConnectionPayload(profile);
      const payload: MigrationPayload =
        slot === 'currentMaster'
          ? { currentMasterConnection: connection }
          : { currentTransactionConnection: connection };
      const result = await migrationsApi.applyCurrentSchema({
        ...payload,
        schemaTarget: slot,
      });
      setMessage(
        `${result.message}. Current DB setup completed for ${CONNECTION_LABELS[slot].title.toLowerCase()}.`
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Current DB schema migration failed.');
    } finally {
      setIsRunningSchema(false);
    }
  };

  const handleRunMigration = async () => {
    try {
      ensureReady();
      setIsRunningReal(true);
      setStatusMessage('');
      const result = await migrationsApi.runMigration(
        buildMigrationPayload(profiles, selectedTableIds)
      );
      downloadBlob(result.blob, result.filename || 'migration-real.xlsx');
      setMessage(`Migration completed for ${selectedTableIds.length} table(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Migration failed.');
    } finally {
      setIsRunningReal(false);
    }
  };

  const renderConnectionCard = (slot: ConnectionSlot) => {
    const profile = profiles[slot];
    const label = CONNECTION_LABELS[slot];
    const allowSchemaMigration = isCurrentConnectionSlot(slot);

    return (
      <div key={slot} className="rounded-sm border border-border-secondary bg-surface-secondary/40 p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{label.title}</h3>
            <p className="text-xs text-text-secondary">{label.description}</p>
          </div>
          <div
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              profile.verified
                ? 'bg-success-50 text-success-700'
                : 'bg-warning-50 text-warning-700'
            }`}
          >
            {profile.verified ? 'Verified' : 'Pending'}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="radio"
                name={`${slot}-connection-mode`}
                checked={profile.connectionMode === 'string'}
                onChange={() => updateProfile(slot, { connectionMode: 'string' })}
              />
              Connection string
            </label>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="radio"
                name={`${slot}-connection-mode`}
                checked={profile.connectionMode === 'options'}
                onChange={() => updateProfile(slot, { connectionMode: 'options' })}
              />
              Host / Port / Username / Password / SSL
            </label>
          </div>

          {profile.connectionMode === 'string' ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <Input
                id={`${slot}-connection-string`}
                label="Connection string"
                placeholder="Server=...;Database=...;User Id=...;Password=...;TrustServerCertificate=True;"
                value={profile.connectionString}
                valueTransform="none"
                classes={{ container: 'max-w-none' }}
                onChange={event => updateProfile(slot, { connectionString: event.target.value })}
              />
              <div className="space-y-2">
                <Button onClick={verifyConnectionSet} loading={isVerifying} className="lg:min-w-40">
                  Verify Connections
                </Button>
                {allowSchemaMigration ? (
                  <Button
                    onClick={() => handleApplyCurrentSchema(slot)}
                    loading={isRunningSchema}
                    variant="outline"
                    disabled={!isConnectionVerified}
                    className="lg:min-w-40"
                  >
                    Run Schema Migrations
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Input
                  label="Host"
                  value={profile.host}
                  valueTransform="none"
                  classes={{ container: 'max-w-none' }}
                  onChange={event => updateProfile(slot, { host: event.target.value })}
                />
                <Input
                  label="Port"
                  inputMode="numeric"
                  value={profile.port}
                  valueTransform="none"
                  classes={{ container: 'max-w-none' }}
                  onChange={event => updateProfile(slot, { port: event.target.value })}
                />
                <Input
                  label="Database"
                  value={profile.database}
                  valueTransform="none"
                  classes={{ container: 'max-w-none' }}
                  onChange={event => updateProfile(slot, { database: event.target.value })}
                />
                <Input
                  label="Username"
                  value={profile.username}
                  valueTransform="none"
                  classes={{ container: 'max-w-none' }}
                  onChange={event => updateProfile(slot, { username: event.target.value })}
                />
                <Input
                  label="Password"
                  type="password"
                  value={profile.password}
                  valueTransform="none"
                  classes={{ container: 'max-w-none' }}
                  onChange={event => updateProfile(slot, { password: event.target.value })}
                />
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-text-secondary">
                    <Checkbox
                      checked={profile.ssl}
                      onChange={checked => updateProfile(slot, { ssl: checked })}
                    />
                    SSL / Trust server certificate
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="space-y-2">
                  <Button onClick={verifyConnectionSet} loading={isVerifying} className="min-w-40">
                    Verify Connections
                  </Button>
                  {allowSchemaMigration ? (
                    <Button
                      onClick={() => handleApplyCurrentSchema(slot)}
                      loading={isRunningSchema}
                      variant="outline"
                      disabled={!isConnectionVerified}
                      className="min-w-40"
                    >
                      Run Schema Migrations
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 text-sm text-text-secondary shadow-sm">
        Loading migration page...
      </div>
    );
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="space-y-6">
      <CardSection heading="Database Connections" className="border-border-primary bg-surface-primary">
        <div className="space-y-5">
          <p className="text-sm text-text-secondary">
            Fill the current and old database profiles you want to use. Current master and current
            transaction are optional overrides. Old master and old transaction are the source
            connections used for migration.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            {CONNECTION_GROUPS.map(group => (
              <div key={group.title} className="space-y-4">
                <div className="rounded-sm border border-border-secondary bg-surface-secondary/30 px-4 py-3">
                  <h3 className="text-sm font-semibold text-text-primary">{group.title}</h3>
                </div>
                <div className="space-y-4">
                  {group.slots.map(slot => renderConnectionCard(slot))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardSection>

      <CardSection heading="Select Tables" className="border-border-primary bg-surface-primary">
        <div className="space-y-5">
          {MIGRATION_TABLE_GROUPS.map(group => {
            const groupChecked = group.tables.every(table => selectedTableIds.includes(table.id));

            return (
              <div
                key={group.title}
                className="rounded-sm border border-border-secondary bg-surface-secondary/40 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{group.title}</h3>
                    <p className="text-xs text-text-secondary">{group.description}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-text-secondary">
                    <Checkbox
                      checked={groupChecked}
                      onChange={checked => toggleGroup(group.tables, checked)}
                    />
                    Select group
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {group.tables.map(table => (
                    <label
                      key={table.id}
                      className="flex items-start gap-3 rounded-sm border border-border-primary bg-surface-primary p-3 text-sm"
                    >
                      <Checkbox
                        checked={selectedTableIds.includes(table.id)}
                        onChange={checked => toggleTable(table.id, checked)}
                      />
                      <span className="space-y-1">
                        <span className="block font-medium text-text-primary">{table.name}</span>
                        <span className="block text-xs text-text-secondary">{table.note}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardSection>

      <CardSection heading="Run Migration" className="border-border-primary bg-surface-primary">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            First apply the schema migration from the current database card you want to target,
            then run the soft test to download the XLSX review sheet, and only after review run
            the real migration.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleMockTest} loading={isRunningMock}>
              Run Soft Run
            </Button>
            <Button onClick={handleRunMigration} loading={isRunningReal} variant="secondary">
              Run Migration
            </Button>
          </div>
          <div className="space-y-1 text-xs text-text-muted">
            <p>
              Configured connections: {configuredSlots.length > 0 ? configuredSlots.join(', ') : 'none'}
            </p>
            {selectedTables.length > 0 ? (
              <p>Selected tables: {selectedTables.map(table => table.name).join(', ')}</p>
            ) : null}
          </div>
        </div>
      </CardSection>

      {statusMessage ? (
        <div className="rounded-sm border border-border-primary bg-surface-primary p-4 text-sm text-text-secondary shadow-sm">
          {statusMessage}
        </div>
      ) : null}
    </section>
  );
};

export default MigrationsView;
