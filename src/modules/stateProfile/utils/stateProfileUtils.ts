import type { StateProfileFormValues, StateProfileRecord } from '../types';

export const createEmptyStateProfileFormValues =
  (): StateProfileFormValues => ({
    stateCode: '',
    stateName: '',
    gstStateCode: '',
    ctrStateCode: '',
  });

export const mapRecordToFormValues = (
  record: StateProfileRecord
): StateProfileFormValues => ({
  stateCode: record.stateCode,
  stateName: record.stateName,
  gstStateCode: record.gstStateCode,
  ctrStateCode: record.ctrStateCode,
});

export const mapFormValuesToRecord = (
  values: StateProfileFormValues,
  id: string,
  createdAt: string,
  updatedAt: string
): StateProfileRecord => ({
  id,
  createdAt,
  updatedAt,
  ...values,
});

