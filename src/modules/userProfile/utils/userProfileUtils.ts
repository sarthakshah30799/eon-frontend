import type {
  ICreateUserProfile,
  IUserProfileOption,
  IUserProfile,
  IUserProfileAssignment,
} from '../types';

export const getOptionLabel = (
  options: IUserProfileOption[],
  value: string
): string => {
  return options.find(option => option.value === value)?.label ?? value;
};

const createAssignmentLabel = (
  assignment: Partial<IUserProfileAssignment> & {
    roleName?: string;
    branchName?: string;
    counterName?: string;
  }
): IUserProfileAssignment => ({
  roleId: assignment.roleId || '',
  roleLabel: assignment.roleLabel || assignment.roleName || '',
  branchId: assignment.branchId || '',
  branchLabel: assignment.branchLabel || assignment.branchName || '',
  counterId: assignment.counterId || '',
  counterLabel: assignment.counterLabel || assignment.counterName || '',
});

export const createEmptyUserProfileFormValues = (): ICreateUserProfile => ({
  code: '',
  name: '',
  contactNo: '',
  email: '',
  employeeNo: '',
  designation: '',
  userLicNo: '',
  isActive: true,
  isLocked: false,
  isDormant: false,
  roleId: '',
  roleName: '',
  branchId: '',
  branchName: '',
  counterId: '',
  counterName: '',
  assignments: [],
});

export const mapRecordToFormValues = (
  record: IUserProfile
): ICreateUserProfile => ({
  code: record.code || '',
  name: record.name || '',
  contactNo: record.contactNo || '',
  email: record.email || '',
  employeeNo: record.employeeNo || '',
  designation: record.designation || '',
  userLicNo: record.userLicNo || '',
  isActive: record.isActive !== false,
  isLocked: !!record.isLocked,
  isDormant: !!record.isDormant,
  roleId: '',
  roleName: '',
  branchId: '',
  branchName: '',
  counterId: '',
  counterName: '',
  assignments:
    record.assignments?.length > 0
      ? record.assignments.map(createAssignmentLabel)
      : record.roleId && record.branchId && record.counterId
        ? [
            createAssignmentLabel({
              roleId: record.roleId,
              roleName: record.roleName,
              branchId: record.branchId,
              branchName: record.branchName,
              counterId: record.counterId,
              counterName: record.counterName,
            }),
          ]
        : [],
});

export const mapFormValuesToRecord = (
  values: ICreateUserProfile,
  id: string,
  createdAt: string,
  updatedAt: string
): IUserProfile => ({
  id,
  createdAt,
  updatedAt,
  code: values.code,
  name: values.name,
  contactNo: values.contactNo,
  email: values.email,
  employeeNo: values.employeeNo,
  designation: values.designation,
  userLicNo: values.userLicNo,
  isActive: values.isActive,
  isLocked: values.isLocked,
  isDormant: values.isDormant,
  roleId: values.roleId,
  roleName: values.roleName,
  branchId: values.branchId,
  branchName: values.branchName,
  counterId: values.counterId,
  counterName: values.counterName,
  assignments: values.assignments,
});
