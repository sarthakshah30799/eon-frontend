import { WorkflowStatus } from '../../../api/sharedTypes';

export { WorkflowStatus as ChequeBookStatusEnum };
export { WorkflowStatus };

export type ChequeBookStatus = `${WorkflowStatus}`;
export type ChequeBookReviewStatus = typeof WorkflowStatus.APPROVE | typeof WorkflowStatus.REJECT;
