import type { ICreateTdsProfile, ITdsProfile } from '../types';

const formatDateForInput = (value?: string | Date | null): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().split('T')[0];
};

export const createEmptyTdsProfileFormValues =
  (): ICreateTdsProfile => ({
    code: '',
    name: '',
    description: '',
    active: true,
    sortOrder: 0,
    from: '',
    to: '',
    value: 0,
  });

export const mapTdsProfileToFormValues = (
  profile: ITdsProfile
): ICreateTdsProfile => ({
  code: profile.code,
  name: profile.name,
  description: profile.description || '',
  active: profile.active,
  sortOrder: profile.sortOrder,
  from: formatDateForInput(profile.from),
  to: formatDateForInput(profile.to),
  value: profile.value,
});

export const sanitizeTdsProfileFormValues = (
  values: ICreateTdsProfile
): ICreateTdsProfile => ({
  ...values,
  code: values.code.trim(),
  name: values.name.trim(),
  description: values.description?.trim() || '',
  from: values.from?.trim() || undefined,
  to: values.to?.trim() || undefined,
});
