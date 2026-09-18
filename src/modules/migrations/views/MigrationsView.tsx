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
type ConnectionSlot =
  | 'currentMaster'
  | 'currentTransaction'
  | 'oldMaster'
  | 'oldTransaction';

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
      {
        id: 'mstcompanyrecord',
        name: 'mstcompanyrecord',
        note: 'Old company master.',
      },
      { id: 'mstcompany', name: 'mstcompany', note: 'Old branch master.' },
      {
        id: 'mstcounter',
        name: 'mstcounter',
        note: 'Old counter master. Counters are independent; branch links come from mstBranchCounterLink.',
      },
    ],
  },
  {
    title: 'Geography',
    description:
      'Standalone country and Indian state masters (WIRED). CTRCOUNTRY is read if it exists and is combined with ctrcountry2. Selecting any geography table runs country/state/location-type before currency and branch. CTRCITY/CTRCITY2 are loaded on demand to resolve city ids → names on branch and party (no cities table).',
    tables: [
      {
        id: 'ctrcountry2',
        name: 'ctrcountry2',
        note: 'CTR country names/codes. Also reads CTRCOUNTRY when that table exists and unions both into countries.',
      },
      {
        id: 'tb_MstCountry',
        name: 'tb_MstCountry',
        note: 'ISO/LRS, risk, restricted, grey-list, and base-country overlay for countries.',
      },
      {
        id: 'LRSCountry',
        name: 'LRSCountry',
        note: 'LRS ISO codes merged into the same countries rows by name.',
      },
      {
        id: 'CTRSTATE',
        name: 'CTRSTATE',
        note: 'Combined with CTR_CUSTOMERSTATE and GSTSTATE into states. All rows attach to India.',
      },
      {
        id: 'mstLocationType',
        name: 'mstLocationType',
        note: 'Branch location type lookup. Stored as category_options LOCATIONTYPE, not a separate table.',
      },
    ],
  },
  {
    title: 'Currency',
    description:
      'Operational currency master from old master DB. MASTCURR and MCURRENCYLIST are catalogs only; rows are not inserted without an mCurrency record. Country resolves from nCountryID maps, then ISO hint (INR→IN).',
    tables: [
      {
        id: 'mCurrency',
        name: 'mCurrency',
        note: 'Canonical source for currencies. vCalculationMethod M → MULTIPLICATION; bTradedCurrency → onlyStocking.',
      },
      {
        id: 'MASTCURR',
        name: 'MASTCURR',
        note: 'Name/code catalog (CNNAMENEW/CNCODENEW). Logged when a code has no mCurrency row.',
      },
      {
        id: 'MCURRENCYLIST',
        name: 'MCURRENCYLIST',
        note: 'Allowed-code list. Logged when a code has no mCurrency row; not inserted on its own.',
      },
    ],
  },
  {
    title: 'Rates & Margins',
    description:
      'mstRates → currency_rates (MANUAL base; prefer blank IssCode then CN) + product_currency_rates min/max by vExchType. MarginMaster → product margins (lowest buy / highest sell, PAISA; no branch/issuer). Ticker tables → currency_rates TICKER. StockCurrencyRate / PreMarginMaster / MARGINMASTERTT are deferred and logged when selected.',
    tables: [
      {
        id: 'mstRates',
        name: 'mstRates',
        note: 'Base rates + product min/max. rateFor/branch/IssCode logged unmapped.',
      },
      {
        id: 'MarginMaster',
        name: 'MarginMaster',
        note: 'Collapsed by product+currency; branch/issuer deferred.',
      },
      {
        id: 'tickerliverate',
        name: 'tickerliverate',
        note: 'TICKER provider; Symbol like GBPINRCOMP → GBP.',
      },
      {
        id: 'tmpliverate',
        name: 'tmpliverate',
        note: 'TICKER provider from InrBid/InrAsk.',
      },
      {
        id: 'StockCurrencyRate',
        name: 'StockCurrencyRate',
        note: 'DEFERRED — stock revaluation; logged skip pending client.',
      },
      {
        id: 'PreMarginMaster',
        name: 'PreMarginMaster',
        note: 'DEFERRED — WH/NWH/Holiday margins; logged skip.',
      },
      {
        id: 'MARGINMASTERTT',
        name: 'MARGINMASTERTT',
        note: 'DEFERRED — TT margins; logged skip.',
      },
    ],
  },
  {
    title: 'Purposes',
    description:
      'mstPurpose → purposes. Collapsed by Description; 2-letter code from name initials (always length 2). sell/purchase from vTrnType S/B; corporate/individual from TrnSubType C/I. PurposeLimit and other purpose catalogs are deferred/ask-client when selected (logged only).',
    tables: [
      {
        id: 'mstPurpose',
        name: 'mstPurpose',
        note: 'Operational purchase/sale purpose master → purposes.',
      },
      {
        id: 'mstAppPurpose',
        name: 'mstAppPurpose',
        note: 'DEFERRED — UI view permissions; logged skip.',
      },
      {
        id: 'SubPurpose',
        name: 'SubPurpose',
        note: 'DEFERRED — 1:1 mirror of mstPurpose; logged skip.',
      },
      {
        id: 'PurposeLimit',
        name: 'PurposeLimit',
        note: 'ASK CLIENT — cash/visit caps ≠ TCS threshold/slabs; logged skip.',
      },
      {
        id: 'ADIPurposeMaster',
        name: 'ADIPurposeMaster',
        note: 'DEFERRED — ADI text catalog; AD1 uses same purposes table.',
      },
      {
        id: 'AD1Referral_Inc',
        name: 'AD1Referral_Inc',
        note: 'DEFERRED — transaction log, not master.',
      },
      {
        id: 'IBPurposes',
        name: 'IBPurposes',
        note: 'DEFERRED — settlement/division buckets, not FX purpose.',
      },
      {
        id: 'RBIPurpose',
        name: 'RBIPurpose',
        note: 'DEFERRED — RBICODE mapping; no column on purposes yet.',
      },
      {
        id: 'MstLRSPurpose',
        name: 'MstLRSPurpose',
        note: 'DEFERRED — LRS-only list.',
      },
      {
        id: 'TPPurpose',
        name: 'TPPurpose',
        note: 'DEFERRED — empty sample.',
      },
      {
        id: 'TTPurpose',
        name: 'TTPurpose',
        note: 'DEFERRED — TT/TP/EM purposes until TT wave.',
      },
      {
        id: 'TTSubPurpose',
        name: 'TTSubPurpose',
        note: 'DEFERRED — subcodes; no sub-purpose entity.',
      },
    ],
  },
  {
    title: 'Tax / TCS / GST',
    description:
      'mstTax gst18% → advanced_settings GST_RATE (18). GSTInfo → party gstNo (IGST→CGST→SGST) after parties. TCSPERMASTER → purpose_slabs when old PurposeCode matches migrated mstPurpose. TCSApplyFor logged only. TCSPANTRANS/tb_TCSAPI txn-later. HFEE/TAXROFF/mstTaxd/exempt/RCM skipped (CQ-wave6).',
    tables: [
      {
        id: 'mstTax',
        name: 'mstTax',
        note: 'gst18% → GST_RATE=18. HFEE/TAXROFF skipped & logged.',
      },
      {
        id: 'GSTInfo',
        name: 'GSTInfo',
        note: '→ party_profiles.gstNo; needs party (mstCodes) in same/prior run.',
      },
      {
        id: 'TCSPERMASTER',
        name: 'TCSPERMASTER',
        note: '→ purpose_slabs; auto-runs mstPurpose; unmatched PURPOSECODE logged.',
      },
      {
        id: 'TCSApplyFor',
        name: 'TCSApplyFor',
        note: 'LOG ONLY — no master target.',
      },
      {
        id: 'TCSPANTRANS',
        name: 'TCSPANTRANS',
        note: 'TXN-LATER — bill TCS history.',
      },
      {
        id: 'tb_TCSAPI',
        name: 'tb_TCSAPI',
        note: 'TXN/ENV-LATER — do not copy API tokens.',
      },
      {
        id: 'mstTaxd',
        name: 'mstTaxd',
        note: 'SKIP — GST amount slabs; CQ-wave6.',
      },
      {
        id: 'mstTaxExampt',
        name: 'mstTaxExampt',
        note: 'SKIP — tax exemptions; CQ-wave6.',
      },
      {
        id: 'GSTNoExempt',
        name: 'GSTNoExempt',
        note: 'SKIP — CQ-wave6.',
      },
      {
        id: 'gstrcmslab',
        name: 'gstrcmslab',
        note: 'SKIP — no RCM entity; CQ-wave6.',
      },
    ],
  },
  {
    title: 'Documents / Settings / Locks / Mail',
    description:
      'Wave 7: advsettings (all nBranchID, first DATACODE wins) → advanced_settings; mstPasswordPolicy → PASSWORD_POLICY (wins over PWD*); MailConfig dummy password; ScanDocMaster → document_profiles; monthlock+MLockBrnUserLink → DB2 monthly_lock_windows; tb_EODQuestion → DAY_END_POLICY. See docs/migration-wave7-decisions.md.',
    tables: [
      {
        id: 'advsettings',
        name: 'advsettings',
        note: 'All nBranchID kept; first DATACODE wins; entity→UUID select else text.',
      },
      {
        id: 'mstPasswordPolicy',
        name: 'mstPasswordPolicy',
        note: 'PASSWORD_* children; maxLength default 128; nExpDate logged.',
      },
      {
        id: 'MailConfig',
        name: 'MailConfig',
        note: 'host/port/user/from; dummy encrypted password — reset in UI.',
      },
      {
        id: 'ScanDocMaster',
        name: 'ScanDocMaster',
        note: '→ document_profiles; M/T; clash {code}-{nUniqCode}.',
      },
      {
        id: 'monthlock',
        name: 'monthlock',
        note: 'With MLockBrnUserLink → DB2 locks; first/branch; soft-delete kept; OPEN* CQ.',
      },
      {
        id: 'MLockBrnUserLink',
        name: 'MLockBrnUserLink',
        note: 'User links for monthlock (same task).',
      },
      {
        id: 'tb_EODQuestion',
        name: 'tb_EODQuestion',
        note: '→ DAY_END_POLICY checklist children.',
      },
      {
        id: 'DOCCHECK',
        name: 'DOCCHECK',
        note: 'SKIP/LOG — CQ-wave7 (not document_profiles).',
      },
      {
        id: 'UpdateSettings',
        name: 'UpdateSettings',
        note: 'SKIP — not additional settings.',
      },
      {
        id: 'tb_ConsoParameter',
        name: 'tb_ConsoParameter',
        note: 'SKIP.',
      },
      {
        id: 'yrMaster',
        name: 'yrMaster',
        note: 'SKIP; yrDetails future.',
      },
      {
        id: 'yrDetails',
        name: 'yrDetails',
        note: 'FUTURE — yearly DB names.',
      },
      {
        id: 'ScannedDocs',
        name: 'ScannedDocs',
        note: 'TXN-LATER.',
      },
      {
        id: 'PreScannedDocs',
        name: 'PreScannedDocs',
        note: 'TXN-LATER.',
      },
      {
        id: 'DOCCOLLECTED',
        name: 'DOCCOLLECTED',
        note: 'TXN-LATER.',
      },
      {
        id: 'PAYDATALOCK',
        name: 'PAYDATALOCK',
        note: 'TXN-LATER.',
      },
      {
        id: 'tb_HolidayList',
        name: 'tb_HolidayList',
        note: 'SKIP — no holiday entity.',
      },
      {
        id: 'mstShifts',
        name: 'mstShifts',
        note: 'SKIP — no shift entity.',
      },
    ],
  },
  {
    title: 'Financial & Products',
    description:
      'FinancialProfile + FinancialSubProfile → financial_codes / financial_sub_profiles. AccountsProfile → account_profiles (nCurrencyID 0 → INR). mProductM → products (account FKs by code). mCurrencyProductLink → product_currency_rates allow-list. Run currency first; mock run recommended.',
    tables: [
      {
        id: 'FinancialProfile',
        name: 'FinancialProfile',
        note: 'vFinType B/P/T → FINANCIALTYPE; FinancialSubProfile in same task.',
      },
      {
        id: 'AccountsProfile',
        name: 'AccountsProfile',
        note: 'Requires financial codes + currency; lazy-loads mcurrency when needed.',
      },
      {
        id: 'mProductM',
        name: 'mProductM',
        note: 'Account FKs resolved by accountCode; EEFC fields logged unmapped.',
      },
      {
        id: 'mCurrencyProductLink',
        name: 'mCurrencyProductLink',
        note: 'Allow-list only; margins null; unique (productId, currencyId).',
      },
    ],
  },
  {
    title: 'Parties',
    description:
      'mstCodes high-confidence types → party_profiles (status APPROVE). ME/TA first, then others. Run after company/branch. mProductIssuerLink auto-runs currency → financial → account → product when selected.',
    tables: [
      {
        id: 'mstCodes',
        name: 'mstCodes',
        note: 'CC/TA/FF/ME/AD/FR/TC only. CQ-2 types skipped. Branch lazy/HO fallback. Category codes seeded.',
      },
      {
        id: 'mProductIssuerLink',
        name: 'mProductIssuerLink',
        note: '→ product_card_issuers; auto-runs product chain. Needs TC parties (mstCodes) resolved.',
      },
    ],
  },
  {
    title: 'Users & Roles',
    description:
      'User data plus role mapping derived from the old access flags.',
    tables: [
      {
        id: 'mstuser',
        name: 'mstuser',
        note: 'Old user master and role source.',
      },
      {
        id: 'user_roles',
        name: 'user_roles',
        note: 'Generated join table in the new db.',
      },
    ],
  },
  {
    title: 'Relations',
    description:
      'Parent-child assignment tables used to resolve branch, counter, and user links.',
    tables: [
      {
        id: 'mstBranchCounterLink',
        name: 'mstBranchCounterLink',
        note: 'Branch to counter relation. Writes branch_counters (many-to-many).',
      },
      {
        id: 'mstBranchUserLink',
        name: 'mstBranchUserLink',
        note: 'Branch to user relation source.',
      },
      {
        id: 'mstCounterUserLink',
        name: 'mstCounterUserLink',
        note: 'Counter to user relation source.',
      },
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

const CONNECTION_LABELS: Record<
  ConnectionSlot,
  { title: string; description: string }
> = {
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
    description:
      'Source branch database used for branch, counter, and user relations.',
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

const createInitialProfiles = (): Record<
  ConnectionSlot,
  ConnectionProfileState
> => ({
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
  const currentMasterConnection = buildConnectionPayload(
    profiles.currentMaster
  );
  const currentTransactionConnection = buildConnectionPayload(
    profiles.currentTransaction
  );
  const oldMasterConnection = buildConnectionPayload(profiles.oldMaster);
  const oldTransactionConnection = buildConnectionPayload(
    profiles.oldTransaction
  );

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

const validateConnectionProfile = (
  profile: ConnectionProfileState,
  label: string
) => {
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
  if (!profile.username.trim())
    throw new Error(`Please enter the ${label} username.`);
  if (!profile.password.trim())
    throw new Error(`Please enter the ${label} password.`);
  if (!profile.database.trim())
    throw new Error(`Please enter the ${label} database.`);

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
  const [profiles, setProfiles] = useState<
    Record<ConnectionSlot, ConnectionProfileState>
  >(createInitialProfiles);
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
    next:
      | Partial<ConnectionProfileState>
      | ((current: ConnectionProfileState) => ConnectionProfileState)
  ) => {
    setProfiles(prev => {
      const current = prev[slot];
      const resolved =
        typeof next === 'function' ? next(current) : { ...current, ...next };
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
      throw new Error(
        'Please enter at least one database connection before verifying.'
      );
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
      const result = await migrationsApi.verifyConnection(
        buildMigrationPayload(profiles)
      );
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
      setMessage(
        error instanceof Error ? error.message : 'Failed to verify connections.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const ensureReady = () => {
    if (
      !configuredSlots.some(
        slot => slot === 'oldMaster' || slot === 'oldTransaction'
      )
    ) {
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
      const result = await migrationsApi.runMock(
        buildMigrationPayload(profiles, selectedTableIds)
      );
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
        throw new Error(
          'Schema migration can only be run for current databases.'
        );
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
      setMessage(
        error instanceof Error
          ? error.message
          : 'Current DB schema migration failed.'
      );
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
      setMessage(
        `Migration completed for ${selectedTableIds.length} table(s).`
      );
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
      <div
        key={slot}
        className="rounded-sm border border-border-secondary bg-surface-secondary/40 p-4"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              {label.title}
            </h3>
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
                onChange={() =>
                  updateProfile(slot, { connectionMode: 'string' })
                }
              />
              Connection string
            </label>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="radio"
                name={`${slot}-connection-mode`}
                checked={profile.connectionMode === 'options'}
                onChange={() =>
                  updateProfile(slot, { connectionMode: 'options' })
                }
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
                onChange={event =>
                  updateProfile(slot, { connectionString: event.target.value })
                }
              />
              <div className="space-y-2">
                <Button
                  onClick={verifyConnectionSet}
                  loading={isVerifying}
                  className="lg:min-w-40"
                >
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
                  onChange={event =>
                    updateProfile(slot, { host: event.target.value })
                  }
                />
                <Input
                  label="Port"
                  inputMode="numeric"
                  value={profile.port}
                  valueTransform="none"
                  classes={{ container: 'max-w-none' }}
                  onChange={event =>
                    updateProfile(slot, { port: event.target.value })
                  }
                />
                <Input
                  label="Database"
                  value={profile.database}
                  valueTransform="none"
                  classes={{ container: 'max-w-none' }}
                  onChange={event =>
                    updateProfile(slot, { database: event.target.value })
                  }
                />
                <Input
                  label="Username"
                  value={profile.username}
                  valueTransform="none"
                  classes={{ container: 'max-w-none' }}
                  onChange={event =>
                    updateProfile(slot, { username: event.target.value })
                  }
                />
                <Input
                  label="Password"
                  type="password"
                  value={profile.password}
                  valueTransform="none"
                  classes={{ container: 'max-w-none' }}
                  onChange={event =>
                    updateProfile(slot, { password: event.target.value })
                  }
                />
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-text-secondary">
                    <Checkbox
                      checked={profile.ssl}
                      onChange={checked =>
                        updateProfile(slot, { ssl: checked })
                      }
                    />
                    SSL / Trust server certificate
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="space-y-2">
                  <Button
                    onClick={verifyConnectionSet}
                    loading={isVerifying}
                    className="min-w-40"
                  >
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
      <CardSection
        heading="Database Connections"
        className="border-border-primary bg-surface-primary"
      >
        <div className="space-y-5">
          <p className="text-sm text-text-secondary">
            Fill the current and old database profiles you want to use. Current
            master and current transaction are optional overrides. Old master
            and old transaction are the source connections used for migration.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            {CONNECTION_GROUPS.map(group => (
              <div key={group.title} className="space-y-4">
                <div className="rounded-sm border border-border-secondary bg-surface-secondary/30 px-4 py-3">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {group.title}
                  </h3>
                </div>
                <div className="space-y-4">
                  {group.slots.map(slot => renderConnectionCard(slot))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardSection>

      <CardSection
        heading="Select Tables"
        className="border-border-primary bg-surface-primary"
      >
        <div className="space-y-5">
          {MIGRATION_TABLE_GROUPS.map(group => {
            const groupChecked = group.tables.every(table =>
              selectedTableIds.includes(table.id)
            );

            return (
              <div
                key={group.title}
                className="rounded-sm border border-border-secondary bg-surface-secondary/40 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {group.title}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {group.description}
                    </p>
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
                        <span className="block font-medium text-text-primary">
                          {table.name}
                        </span>
                        <span className="block text-xs text-text-secondary">
                          {table.note}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardSection>

      <CardSection
        heading="Run Migration"
        className="border-border-primary bg-surface-primary"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            First apply the schema migration from the current database card you
            want to target, then run the soft test to download the XLSX review
            sheet, and only after review run the real migration.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleMockTest} loading={isRunningMock}>
              Run Soft Run
            </Button>
            <Button
              onClick={handleRunMigration}
              loading={isRunningReal}
              variant="secondary"
            >
              Run Migration
            </Button>
          </div>
          <div className="space-y-1 text-xs text-text-muted">
            <p>
              Configured connections:{' '}
              {configuredSlots.length > 0 ? configuredSlots.join(', ') : 'none'}
            </p>
            {selectedTables.length > 0 ? (
              <p>
                Selected tables:{' '}
                {selectedTables.map(table => table.name).join(', ')}
              </p>
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
