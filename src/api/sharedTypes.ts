export interface IUserReference {
  id: string;
  name: string;
}

export enum WorkflowStatus {
  PENDING = 'PENDING',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

