import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button, CardSection, Checkbox, Input } from '@/components/ui';
import migrationsApi from '@/api/migrations/migrations.api';

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

const emptyOptions = {
  host: '',
  port: '',
  username: '',
  password: '',
  database: '',
  ssl: false,
};

const toMigrationPayload = (
  connectionMode: 'string' | 'options',
  connectionString: string,
  connectionOptions: typeof emptyOptions,
  selectedTables: string[]
) => {
  if (connectionMode === 'string') {
    return {
      connectionMode,
      connectionString: connectionString.trim(),
      selectedTables,
    };
  }

  return {
    connectionMode,
    host: connectionOptions.host.trim(),
    port: Number(connectionOptions.port),
    username: connectionOptions.username.trim(),
    password: connectionOptions.password,
    database: connectionOptions.database.trim(),
    ssl: connectionOptions.ssl,
    selectedTables,
  };
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
  const [connectionMode, setConnectionMode] = useState<'string' | 'options'>('string');
  const [connectionString, setConnectionString] = useState('');
  const [connectionOptions, setConnectionOptions] = useState(emptyOptions);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRunningMock, setIsRunningMock] = useState(false);
  const [isRunningReal, setIsRunningReal] = useState(false);
  const [isConnectionVerified, setIsConnectionVerified] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const selectedTables = useMemo(
    () => ALL_TABLES.filter(table => selectedTableIds.includes(table.id)),
    [selectedTableIds]
  );

  const payload = useMemo(
    () =>
      toMigrationPayload(
        connectionMode,
        connectionString,
        connectionOptions,
        selectedTableIds
      ),
    [connectionMode, connectionOptions, connectionString, selectedTableIds]
  );

  const setMessage = (message: string) => {
    setStatusMessage(message);
  };

  const toggleTable = (tableId: string, checked: boolean) => {
    setSelectedTableIds(prev =>
      checked ? (prev.includes(tableId) ? prev : [...prev, tableId]) : prev.filter(id => id !== tableId)
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

  const validateConnection = () => {
    if (connectionMode === 'string') {
      if (!connectionString.trim()) {
        throw new Error('Please enter the old DB connection string.');
      }
      return;
    }

    if (!connectionOptions.host.trim()) throw new Error('Please enter the host.');
    if (!connectionOptions.port.trim()) throw new Error('Please enter the port.');
    if (!connectionOptions.username.trim()) throw new Error('Please enter the username.');
    if (!connectionOptions.password.trim()) throw new Error('Please enter the password.');
    if (!connectionOptions.database.trim()) throw new Error('Please enter the database.');
  };

  const handleVerifyConnection = async () => {
    try {
      validateConnection();
      setIsVerifying(true);
      setStatusMessage('');
      const result = await migrationsApi.verifyConnection(payload);
      setIsConnectionVerified(result.verified);
      setMessage(result.message);
    } catch (error) {
      setIsConnectionVerified(false);
      setMessage(error instanceof Error ? error.message : 'Failed to verify connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  const ensureReady = () => {
    if (!isConnectionVerified) {
      throw new Error('Please verify the old DB connection first.');
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
      const result = await migrationsApi.runMock(payload);
      downloadBlob(result.blob, result.filename || 'migration-soft-run.xlsx');
      setMessage(`Soft run completed for ${selectedTableIds.length} table(s). Review the XLSX before real migration.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Soft run failed.');
    } finally {
      setIsRunningMock(false);
    }
  };

  const handleRunMigration = async () => {
    try {
      ensureReady();
      setIsRunningReal(true);
      setStatusMessage('');
      const result = await migrationsApi.runMigration(payload);
      downloadBlob(result.blob, result.filename || 'migration-real.xlsx');
      setMessage(`Migration completed for ${selectedTableIds.length} table(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Migration failed.');
    } finally {
      setIsRunningReal(false);
    }
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
      <CardSection heading="Old DB Connection" className="border-border-primary bg-surface-primary">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="radio"
                name="connection-mode"
                checked={connectionMode === 'string'}
                onChange={() => {
                  setConnectionMode('string');
                  setIsConnectionVerified(false);
                }}
              />
              Connection string
            </label>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="radio"
                name="connection-mode"
                checked={connectionMode === 'options'}
                onChange={() => {
                  setConnectionMode('options');
                  setIsConnectionVerified(false);
                }}
              />
              Host / Port / Username / Password / SSL
            </label>
          </div>

          {connectionMode === 'string' ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <Input
                id="old-db-connection"
                label="Old DB connection string"
                placeholder="Server=...;Database=...;User Id=...;Password=...;TrustServerCertificate=True;"
                value={connectionString}
                onChange={event => {
                  setConnectionString(event.target.value);
                  setIsConnectionVerified(false);
                }}
              />
              <Button onClick={handleVerifyConnection} loading={isVerifying} className="lg:min-w-40">
                Verify Connection
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Input
                  label="Host"
                  value={connectionOptions.host}
                  onChange={event => {
                    setConnectionOptions(prev => ({ ...prev, host: event.target.value }));
                    setIsConnectionVerified(false);
                  }}
                />
                <Input
                  label="Port"
                  inputMode="numeric"
                  value={connectionOptions.port}
                  onChange={event => {
                    setConnectionOptions(prev => ({ ...prev, port: event.target.value }));
                    setIsConnectionVerified(false);
                  }}
                />
                <Input
                  label="Database"
                  value={connectionOptions.database}
                  onChange={event => {
                    setConnectionOptions(prev => ({ ...prev, database: event.target.value }));
                    setIsConnectionVerified(false);
                  }}
                />
                <Input
                  label="Username"
                  value={connectionOptions.username}
                  onChange={event => {
                    setConnectionOptions(prev => ({ ...prev, username: event.target.value }));
                    setIsConnectionVerified(false);
                  }}
                />
                <Input
                  label="Password"
                  type="password"
                  value={connectionOptions.password}
                  onChange={event => {
                    setConnectionOptions(prev => ({ ...prev, password: event.target.value }));
                    setIsConnectionVerified(false);
                  }}
                />
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-text-secondary">
                    <Checkbox
                      checked={connectionOptions.ssl}
                      onChange={checked => {
                        setConnectionOptions(prev => ({
                          ...prev,
                          ssl: checked,
                        }));
                        setIsConnectionVerified(false);
                      }}
                    />
                    SSL / Trust server certificate
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleVerifyConnection} loading={isVerifying} className="min-w-40">
                  Verify Connection
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardSection>

      <CardSection heading="Select Tables" className="border-border-primary bg-surface-primary">
        <div className="space-y-5">
          {MIGRATION_TABLE_GROUPS.map(group => {
            const groupChecked = group.tables.every(table => selectedTableIds.includes(table.id));

            return (
              <div key={group.title} className="rounded-sm border border-border-secondary bg-surface-secondary/40 p-4">
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
            Soft run downloads the XLSX review sheet first. Real migration uses the same selection and
            writes to the new database only after you confirm the source data.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleMockTest} loading={isRunningMock}>
              Run Soft Run
            </Button>
            <Button onClick={handleRunMigration} loading={isRunningReal} variant="secondary">
              Run Migration
            </Button>
          </div>
          {selectedTables.length > 0 ? (
            <p className="text-xs text-text-muted">
              Selected tables: {selectedTables.map(table => table.name).join(', ')}
            </p>
          ) : null}
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
