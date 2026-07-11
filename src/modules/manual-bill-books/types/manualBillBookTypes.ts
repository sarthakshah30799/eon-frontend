import { WorkflowStatus } from '../../../api/sharedTypes';

export { WorkflowStatus as ManualBillBookStatusEnum };
export { WorkflowStatus };

export type ManualBillBookStatus = `${WorkflowStatus}`;
export type ManualBillBookReviewStatus = WorkflowStatus.APPROVE | WorkflowStatus.REJECT;
