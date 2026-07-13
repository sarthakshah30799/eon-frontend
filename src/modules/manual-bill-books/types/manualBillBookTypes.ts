import { WorkflowStatus } from '../../../api/sharedTypes';

export { WorkflowStatus as ManualBillBookStatusEnum };
export { WorkflowStatus };

export type ManualBillBookStatus = `${WorkflowStatus}`;
export type ManualBillBookReviewStatus = typeof WorkflowStatus.APPROVE | typeof WorkflowStatus.REJECT;
