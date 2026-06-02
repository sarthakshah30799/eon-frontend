export interface StateProfileFormValues {
  stateCode: string;
  stateName: string;
  gstStateCode: string;
  ctrStateCode: string;
}

export interface StateProfileRecord extends StateProfileFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}

