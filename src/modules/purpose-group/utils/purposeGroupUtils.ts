import type {
  ICreatePurposeGroup,
  IPurposeGroup,
} from '../types/purposeGroupTypes';

export const createEmptyPurposeGroupFormValues = (): ICreatePurposeGroup => ({
  name: '',
  title: '',
  profileType: '',
  sortOrder: 0,
  purposeIds: [],
});

export const mapPurposeGroupToFormValues = (
  purposeGroup: IPurposeGroup
): ICreatePurposeGroup => ({
  name: purposeGroup.name,
  title: purposeGroup.title,
  profileType: purposeGroup.profileType,
  sortOrder: purposeGroup.sortOrder,
  purposeIds: (purposeGroup.purposes ?? []).map(purpose => purpose.id),
});

export const sanitizePurposeGroupFormValues = (
  values: ICreatePurposeGroup
): ICreatePurposeGroup => ({
  name: values.name.trim(),
  title: values.title.trim(),
  profileType: values.profileType,
  sortOrder: Number(values.sortOrder || 0),
  purposeIds: [...new Set((values.purposeIds ?? []).filter(Boolean))],
});

export const formatPurposeGroupProfileLabel = (profileType: string) =>
  profileType === 'AD'
    ? 'AD'
    : profileType === 'FFMC'
      ? 'FFMC'
      : profileType || '-';
