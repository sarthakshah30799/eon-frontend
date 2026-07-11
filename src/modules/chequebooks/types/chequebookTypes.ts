import { WorkflowStatus } from '../../../api/sharedTypes';

export { WorkflowStatus as ChequeBookStatusEnum };
export { WorkflowStatus };

export type ChequeBookStatus = `${WorkflowStatus}`;
export type ChequeBookReviewStatus = WorkflowStatus.APPROVE | WorkflowStatus.REJECT;
