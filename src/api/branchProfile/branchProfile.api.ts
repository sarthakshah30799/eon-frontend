import type {
  BranchProfileFormValues,
  BranchProfileRecord,
} from '@/modules/branchProfile/types';
import {
  createEmptyBranchProfileFormValues,
  mapFormValuesToRecord,
} from '@/modules/branchProfile/utils';

const STORAGE_KEY = 'maraekat_branch_profiles';

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `branch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const now = (): string => new Date().toISOString();

const seedBranches = (): BranchProfileRecord[] => {
  const first = now();
  const second = new Date(Date.now() - 86_400_000).toISOString();
  const third = new Date(Date.now() - 172_800_000).toISOString();

  return [
    mapFormValuesToRecord(
      {
        ...createEmptyBranchProfileFormValues(),
        branchName: 'Mumbai Main Branch',
        branchCode: 'B-001',
        branchNo: '1001',
        address1: 'Andheri East',
        city: 'Mumbai',
        stateId: 'maharashtra',
        operationalGroupId: 'city-location',
        phoneNo1CountryCode: '+91',
        phoneNo1: '9876543210',
        phoneNo2CountryCode: '+91',
        phoneNo2: '9123456780',
        faxNo1CountryCode: '+91',
        faxNo1: '22223333',
        faxNo2CountryCode: '+91',
        faxNo2: '22224444',
        emailId: 'mumbai.branch@example.com',
        contactPerson: 'Amit Shah',
        contactNoCountryCode: '+91',
        contactNo: '9988776655',
        locationTypeId: 'branch',
        operationalUserId: 'operational-user-1',
        acUserInchargeId: 'ac-user-1',
        aiiNo: 'AII-100',
        wuAiiNo: 'WU-AII-100',
        rbiLicenceNo: 'RBI-1000',
        rbiRegDate: '2025-01-12',
        authSignatory: 'Rajesh Mehta',
        branchAttachedToId: '',
        wuAcBranchPostingId: 'wu-posting-1',
        cashLimit: '500000',
        ibmHo1: 'HO-1',
        ibmHo2: 'HO-2',
        ibmBranchId: 'ibm-branch-1',
        lastSettlementRef: 'LSR-001',
        currencyLimit: '250000',
        tempCashLimit: '50000',
        tempCurrencyLimit: '25000',
        branchHasShifts: true,
        canReferenceOnBehalfEntries: false,
        serviceTaxApplicable: false,
        serviceTaxRegnNo: '',
      },
      'branch-1',
      first,
      first
    ),
    mapFormValuesToRecord(
      {
        ...createEmptyBranchProfileFormValues(),
        branchName: 'Delhi City Branch',
        branchCode: 'B-002',
        branchNo: '1002',
        address1: 'Connaught Place',
        city: 'Delhi',
        stateId: 'delhi',
        operationalGroupId: 'city-location',
        phoneNo1CountryCode: '+91',
        phoneNo1: '9811122233',
        phoneNo2CountryCode: '+91',
        phoneNo2: '9876500011',
        faxNo1CountryCode: '+91',
        faxNo1: '33334444',
        faxNo2CountryCode: '+91',
        faxNo2: '33335555',
        emailId: 'delhi.branch@example.com',
        contactPerson: 'Neha Kapoor',
        contactNoCountryCode: '+91',
        contactNo: '9876654321',
        locationTypeId: 'branch',
        operationalUserId: 'operational-user-2',
        acUserInchargeId: 'ac-user-2',
        aiiNo: 'AII-200',
        wuAiiNo: 'WU-AII-200',
        rbiLicenceNo: 'RBI-2000',
        rbiRegDate: '2025-02-10',
        authSignatory: 'Neha Sharma',
        branchAttachedToId: 'branch-1',
        wuAcBranchPostingId: 'wu-posting-2',
        cashLimit: '750000',
        ibmHo1: 'HO-1',
        ibmHo2: 'HO-2',
        ibmBranchId: 'ibm-branch-2',
        lastSettlementRef: 'LSR-002',
        currencyLimit: '350000',
        tempCashLimit: '75000',
        tempCurrencyLimit: '30000',
        branchHasShifts: true,
        canReferenceOnBehalfEntries: true,
        serviceTaxApplicable: true,
        serviceTaxRegnNo: 'ST-DEL-002',
      },
      'branch-2',
      second,
      second
    ),
    mapFormValuesToRecord(
      {
        ...createEmptyBranchProfileFormValues(),
        branchName: 'Dubai Desk',
        branchCode: 'B-003',
        branchNo: '1003',
        address1: 'Business Bay',
        city: 'Dubai',
        stateId: 'gujarat',
        operationalGroupId: 'airport-location',
        phoneNo1CountryCode: '+971',
        phoneNo1: '501122334',
        phoneNo2CountryCode: '+971',
        phoneNo2: '509988776',
        faxNo1CountryCode: '+971',
        faxNo1: '44221100',
        faxNo2CountryCode: '+971',
        faxNo2: '44221111',
        emailId: 'dubai.desk@example.com',
        contactPerson: 'Imran Ali',
        contactNoCountryCode: '+971',
        contactNo: '509911223',
        locationTypeId: 'franchies',
        operationalUserId: 'operational-user-3',
        acUserInchargeId: 'ac-user-3',
        aiiNo: 'AII-300',
        wuAiiNo: 'WU-AII-300',
        rbiLicenceNo: 'RBI-3000',
        rbiRegDate: '2025-03-08',
        authSignatory: 'Imran Ali',
        branchAttachedToId: 'branch-1',
        wuAcBranchPostingId: 'wu-posting-3',
        cashLimit: '250000',
        ibmHo1: 'HO-1',
        ibmHo2: 'HO-2',
        ibmBranchId: 'ibm-branch-3',
        lastSettlementRef: 'LSR-003',
        currencyLimit: '120000',
        tempCashLimit: '40000',
        tempCurrencyLimit: '15000',
        branchHasShifts: false,
        canReferenceOnBehalfEntries: false,
        serviceTaxApplicable: false,
        serviceTaxRegnNo: '',
      },
      'branch-3',
      third,
      third
    ),
  ];
};

const readStoredBranches = (): BranchProfileRecord[] => {
  if (typeof window === 'undefined') {
    return seedBranches();
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    const seeds = seedBranches();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
    return seeds;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as BranchProfileRecord[];
    return Array.isArray(parsedValue) ? parsedValue : seedBranches();
  } catch {
    return seedBranches();
  }
};

const writeStoredBranches = (branches: BranchProfileRecord[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
};

export const branchProfileApi = {
  getBranchProfiles: async (): Promise<BranchProfileRecord[]> => {
    return readStoredBranches();
  },
  getBranchProfileById: async (
    id: string
  ): Promise<BranchProfileRecord | undefined> => {
    return readStoredBranches().find(branch => branch.id === id);
  },
  createBranchProfile: async (
    data: BranchProfileFormValues
  ): Promise<BranchProfileRecord> => {
    const branches = readStoredBranches();
    const createdAt = now();
    const newBranch = mapFormValuesToRecord(
      data,
      createId(),
      createdAt,
      createdAt
    );

    writeStoredBranches([...branches, newBranch]);

    return newBranch;
  },
  updateBranchProfile: async (
    id: string,
    data: BranchProfileFormValues
  ): Promise<BranchProfileRecord | undefined> => {
    const branches = readStoredBranches();
    const existingBranch = branches.find(branch => branch.id === id);

    if (!existingBranch) {
      return undefined;
    }

    const updatedBranch: BranchProfileRecord = {
      ...existingBranch,
      ...data,
      updatedAt: now(),
    };

    writeStoredBranches(
      branches.map(branch => (branch.id === id ? updatedBranch : branch))
    );

    return updatedBranch;
  },
  deleteBranchProfile: async (id: string): Promise<boolean> => {
    const branches = readStoredBranches();
    const nextBranches = branches.filter(branch => branch.id !== id);

    writeStoredBranches(nextBranches);

    return nextBranches.length !== branches.length;
  },
};
