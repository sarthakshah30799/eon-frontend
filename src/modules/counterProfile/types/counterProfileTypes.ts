export interface CounterProfileFormValues {
  counterCode: string;
  counterName: string;
  isActive: boolean;
}

export interface CounterProfileRecord extends CounterProfileFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}
