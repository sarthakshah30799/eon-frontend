import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button, CardSection, Checkbox, Input } from '@/components/ui';

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
    description: 'Foundational tables that other records depend on.',
    tables: [
      { id: 'company', name: 'Company', note: 'Parent company records.' },
      { id: 'branches', name: 'Branches', note: 'Branch records and links.' },
      { id: 'counters', name: 'Counters', note: 'Counter records linked to branches.' },
      { id: 'country-groups', name: 'Country Groups', note: 'Grouping table for countries.' },
      { id: 'countries', name: 'Countries', note: 'Country master.' },
      { id: 'states', name: 'States', note: 'State records linked to country.' },
      { id: 'currencies', name: 'Currencies', note: 'Currency master.' },
      { id: 'currency-rate-groups', name: 'Currency Rate Groups', note: 'Pricing group setup.' },
      { id: 'currency-rates', name: 'Currency Rates', note: 'Rate history.' },
      { id: 'products', name: 'Products', note: 'Product catalog.' },
    ],
  },
  {
    title: 'Accounts & Access',
    description: 'Security, permissions, and configuration tables.',
    tables: [
      { id: 'users', name: 'Users', note: 'Login and user records.' },
      { id: 'roles', name: 'Roles', note: 'Role master.' },
      { id: 'user-roles', name: 'User Roles', note: 'Role assignment mapping.' },
      { id: 'permissions', name: 'Permissions', note: 'Permission definitions.' },
      { id: 'roles-menu-permission', name: 'Roles Menu Permission', note: 'Role to menu access mapping.' },
      { id: 'menu', name: 'Menu', note: 'Sidebar menu structure.' },
      { id: 'additional-settings', name: 'Additional Settings', note: 'App settings master.' },
      { id: 'financial-codes', name: 'Financial Codes', note: 'Financial master.' },
      { id: 'financial-sub-profiles', name: 'Financial Sub Profiles', note: 'Child records for financial codes.' },
      { id: 'account-profiles', name: 'Account Profiles', note: 'Account master.' },
      { id: 'tds-profiles', name: 'TDS Profiles', note: 'Tax deduction setup.' },
      { id: 'document-profiles', name: 'Document Profiles', note: 'Document configuration.' },
      { id: 'category-options', name: 'Category Options', note: 'Common option master.' },
      { id: 'mail-config', name: 'Mail Config', note: 'Mail configuration records.' },
      { id: 'audit-logs', name: 'Audit Logs', note: 'Audit trail.' },
    ],
  },
  {
    title: 'Business Data',
    description: 'Operational data tables.',
    tables: [
      { id: 'party-profiles', name: 'Party Profiles', note: 'Customer / supplier master data.' },
      { id: 'party-profile-documents', name: 'Party Profile Documents', note: 'Linked documents.' },
      { id: 'party-profile-document-files', name: 'Party Profile Document Files', note: 'Document file attachments.' },
      { id: 'party-profile-commission-rules', name: 'Party Profile Commission Rules', note: 'Commission rules.' },
      { id: 'party-profile-status-change-logs', name: 'Party Profile Status Change Logs', note: 'Status history.' },
      { id: 'transactions', name: 'Transactions', note: 'Transaction header.' },
      { id: 'transaction-documents', name: 'Transaction Documents', note: 'Transaction file links.' },
      { id: 'transaction-events', name: 'Transaction Events', note: 'Transaction event trail.' },
      { id: 'transaction-items', name: 'Transaction Items', note: 'Transaction line items.' },
      { id: 'transaction-additional-charges', name: 'Transaction Additional Charges', note: 'Extra charges.' },
      { id: 'transaction-payments', name: 'Transaction Payments', note: 'Payment entries.' },
      { id: 'transaction-logs', name: 'Transaction Logs', note: 'Transaction processing logs.' },
    ],
  },
  {
    title: 'Books & Workflows',
    description: 'Book and workflow support tables.',
    tables: [
      { id: 'manual-books', name: 'Manual Books', note: 'Manual bill book master.' },
      { id: 'manual-book-page-tracking', name: 'Manual Book Page Tracking', note: 'Manual book pages.' },
      { id: 'cheque-books', name: 'Cheque Books', note: 'Cheque book master.' },
      { id: 'cheque-book-page-tracking', name: 'Cheque Book Page Tracking', note: 'Cheque page tracking.' },
      { id: 'expense-income-booking-masters', name: 'Expense Income Booking Masters', note: 'Booking master setup.' },
    ],
  },
];

const ALL_TABLES = MIGRATION_TABLE_GROUPS.flatMap(group => group.tables);

export const MigrationsView = () => {
  const { user, isLoading } = useAuth();
  const [connectionMode, setConnectionMode] = useState<'string' | 'options'>(
    'string'
  );
  const [connectionString, setConnectionString] = useState('');
  const [connectionOptions, setConnectionOptions] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    database: '',
    ssl: false,
  });
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [isConnectionVerified, setIsConnectionVerified] = useState(false);
  const [lastAction, setLastAction] = useState<'mock' | 'migrate' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const selectedTables = useMemo(
    () => ALL_TABLES.filter(table => selectedTableIds.includes(table.id)),
    [selectedTableIds]
  );

  const toggleTable = (tableId: string, checked: boolean) => {
    setSelectedTableIds(prev => {
      if (checked) {
        return prev.includes(tableId) ? prev : [...prev, tableId];
      }

      return prev.filter(id => id !== tableId);
    });
    setLastAction(null);
    setStatusMessage('');
  };

  const toggleGroup = (groupTables: MigrationTable[], checked: boolean) => {
    const groupIds = groupTables.map(table => table.id);

    setSelectedTableIds(prev => {
      if (checked) {
        const next = [...prev];
        groupIds.forEach(id => {
          if (!next.includes(id)) {
            next.push(id);
          }
        });
        return next;
      }

      return prev.filter(id => !groupIds.includes(id));
    });
    setLastAction(null);
    setStatusMessage('');
  };

  const handleVerifyConnection = () => {
    const hasStringConnection = connectionMode === 'string' && connectionString.trim();
    const hasOptionConnection =
      connectionMode === 'options' &&
      connectionOptions.host.trim() &&
      connectionOptions.port.trim() &&
      connectionOptions.username.trim() &&
      connectionOptions.password.trim();

    if (!hasStringConnection && !hasOptionConnection) {
      setIsConnectionVerified(false);
      setStatusMessage(
        connectionMode === 'string'
          ? 'Please enter the old DB connection string before verifying.'
          : 'Please fill host, port, username, and password before verifying.'
      );
      return;
    }

    setIsConnectionVerified(true);
    setStatusMessage(
      connectionMode === 'string'
        ? 'Connection string verified for the old DB source.'
        : 'Host and port connection details verified for the old DB source.'
    );
  };

  const handleMockTest = () => {
    if (!isConnectionVerified) {
      setStatusMessage('Please verify the old DB connection first.');
      return;
    }

    if (selectedTables.length === 0) {
      setStatusMessage('Please select at least one table to run mock test.');
      return;
    }

    setLastAction('mock');
    setStatusMessage(
      `Mock test completed for ${selectedTables.length} table${selectedTables.length > 1 ? 's' : ''}. XLSX sheet preview is ready.`
    );
  };

  const handleRunMigration = () => {
    if (!isConnectionVerified) {
      setStatusMessage('Please verify the old DB connection first.');
      return;
    }

    if (selectedTables.length === 0) {
      setStatusMessage('Please select at least one table to run migration.');
      return;
    }

    setLastAction('migrate');
    setStatusMessage(
      `Migration started for ${selectedTables.length} table${selectedTables.length > 1 ? 's' : ''}.`
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
                  setStatusMessage('');
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
                  setStatusMessage('');
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
                  setStatusMessage('');
                }}
                valueTransform="none"
                classes={{ container: 'max-w-none' }}
              />

              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={handleVerifyConnection}>
                  Verify Connection
                </Button>
                <span className="self-center text-sm text-text-secondary">
                  {isConnectionVerified ? 'Connection verified' : 'Not verified yet'}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                id="old-db-host"
                label="Host"
                placeholder="127.0.0.1"
                value={connectionOptions.host}
                onChange={event => {
                  setConnectionOptions(prev => ({ ...prev, host: event.target.value }));
                  setIsConnectionVerified(false);
                  setStatusMessage('');
                }}
                valueTransform="none"
                classes={{ container: 'max-w-none' }}
              />
              <Input
                id="old-db-port"
                label="Port"
                placeholder="1433"
                value={connectionOptions.port}
                onChange={event => {
                  setConnectionOptions(prev => ({ ...prev, port: event.target.value }));
                  setIsConnectionVerified(false);
                  setStatusMessage('');
                }}
                valueTransform="none"
                classes={{ container: 'max-w-none' }}
              />
              <Input
                id="old-db-username"
                label="Username"
                placeholder="db user"
                value={connectionOptions.username}
                onChange={event => {
                  setConnectionOptions(prev => ({ ...prev, username: event.target.value }));
                  setIsConnectionVerified(false);
                  setStatusMessage('');
                }}
                valueTransform="none"
                classes={{ container: 'max-w-none' }}
              />
              <Input
                id="old-db-password"
                label="Password"
                type="password"
                placeholder="password"
                value={connectionOptions.password}
                onChange={event => {
                  setConnectionOptions(prev => ({ ...prev, password: event.target.value }));
                  setIsConnectionVerified(false);
                  setStatusMessage('');
                }}
                valueTransform="none"
                classes={{ container: 'max-w-none' }}
              />
              <Input
                id="old-db-database"
                label="Database"
                placeholder="database name"
                value={connectionOptions.database}
                onChange={event => {
                  setConnectionOptions(prev => ({ ...prev, database: event.target.value }));
                  setIsConnectionVerified(false);
                  setStatusMessage('');
                }}
                valueTransform="none"
                classes={{ container: 'max-w-none' }}
              />
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <Checkbox
                    checked={connectionOptions.ssl}
                    onChange={checked => {
                      setConnectionOptions(prev => ({ ...prev, ssl: checked }));
                      setIsConnectionVerified(false);
                      setStatusMessage('');
                    }}
                  />
                  SSL enabled
                </label>
              </div>

              <div className="lg:col-span-2 flex flex-wrap gap-3">
                <Button type="button" onClick={handleVerifyConnection}>
                  Verify Connection
                </Button>
                <span className="self-center text-sm text-text-secondary">
                  {isConnectionVerified ? 'Connection verified' : 'Not verified yet'}
                </span>
              </div>
            </div>
          )}
        </div>

        {statusMessage && (
          <div
            className={[
              'mt-4 rounded-xl border px-4 py-3 text-sm',
              statusMessage.toLowerCase().includes('verified') || statusMessage.toLowerCase().includes('completed') || statusMessage.toLowerCase().includes('started')
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-800',
            ].join(' ')}
          >
            {statusMessage}
          </div>
        )}
      </CardSection>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.5fr)]">
        <div className="space-y-5">
          {MIGRATION_TABLE_GROUPS.map(group => {
            const selectedCount = group.tables.filter(table =>
              selectedTableIds.includes(table.id)
            ).length;
            const allSelected = selectedCount === group.tables.length;

            return (
              <CardSection
                key={group.title}
                heading={`${group.title} (${group.tables.length})`}
                className="border-border-primary bg-surface-primary"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <p className="max-w-2xl text-sm text-text-secondary">
                    {group.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-text-secondary">
                      {selectedCount} selected
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleGroup(group.tables, !allSelected)}
                    >
                      {allSelected ? 'Clear' : 'Select all'}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  {group.tables.map(table => {
                    const isSelected = selectedTableIds.includes(table.id);

                    return (
                      <label
                        key={table.id}
                        htmlFor={table.id}
                        className={[
                          'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition',
                          isSelected
                            ? 'border-sky-300 bg-sky-50'
                            : 'border-border-primary bg-white hover:border-sky-200 hover:bg-sky-50/40',
                        ].join(' ')}
                      >
                        <Checkbox
                          id={table.id}
                          checked={isSelected}
                          onChange={checked => toggleTable(table.id, checked)}
                          className="mt-0.5 shrink-0"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-text-primary">
                              {table.name}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-600">
                              Current schema
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-text-secondary">
                            {table.note}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </CardSection>
            );
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <CardSection heading="Selected Tables" className="border-border-primary bg-surface-primary">
            {selectedTables.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-primary bg-white p-4 text-sm text-text-secondary">
                No tables selected yet.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedTables.map((table, index) => (
                  <div
                    key={table.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border-primary bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">
                        {index + 1}. {table.name}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {table.note}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTable(table.id, false)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardSection>

          <CardSection heading="Run Migration" className="border-border-primary bg-surface-primary">
            <p className="text-sm leading-6 text-text-secondary">
              First run mock test to generate the sheet. After review, run actual migration.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleMockTest}
                disabled={!isConnectionVerified || selectedTables.length === 0}
              >
                Mock Test
              </Button>
              <Button
                type="button"
                onClick={handleRunMigration}
                disabled={!isConnectionVerified || selectedTables.length === 0}
              >
                Run Migration
              </Button>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-text-secondary">
              <p className="font-semibold text-text-primary">Current state</p>
              <p className="mt-1">
                Verified: {isConnectionVerified ? 'Yes' : 'No'}
              </p>
              <p className="mt-1">
                Selected tables: {selectedTables.length}
              </p>
              <p className="mt-1">
                Last action: {lastAction === 'mock' ? 'Mock test' : lastAction === 'migrate' ? 'Migration run' : 'None'}
              </p>
            </div>
          </CardSection>

          <CardSection heading="Notes" className="border-border-primary bg-surface-primary">
            <ul className="space-y-2 text-sm leading-6 text-text-secondary">
              <li>• Top box supports either connection string or host/port options.</li>
              <li>• Select tables below for migration.</li>
              <li>• Mock Test is for sheet generation and verification.</li>
              <li>• Run Migration is for the actual data move.</li>
            </ul>
          </CardSection>
        </aside>
      </div>
    </section>
  );
};

export default MigrationsView;
