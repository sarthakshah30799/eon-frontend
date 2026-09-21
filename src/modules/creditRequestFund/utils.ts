import { createCreditRequestFundIdempotencyKey } from './constants';
import type { CreditRequestFundFormValues } from './types';

export const createEmptyCreditRequestFundItem =
  (): CreditRequestFundFormValues['items'][number] => ({
    itemTypeOptionId: '',
    itemTypeValue: 'ACCOUNT',
    subledgerPartyProfileId: '',
    subledgerBranchId: '',
    subledgerCode: '',
    accountId: '',
    accountCode: '',
    accountName: '',
    direction: 'CREDIT',
    amount: '',
  });

export const createEmptyCreditRequestFundValues = (
  date: string,
  branchId: string,
  counterId: string
): CreditRequestFundFormValues => ({
  transactionDate: date,
  branchId,
  counterId,
  number: '',
  destinationBranchId: '',
  accountTypeOptionId: '',
  accountMode: '',
  headerAccountId: '',
  headerAccountName: '',
  entityTypeOptionId: '',
  partyProfileId: '',
  partyName: '',
  paymentMethod: '',
  chequeNumber: '',
  chequeDate: '',
  chequeBranch: '',
  drawnOn: '',
  remarkOptionId: '',
  narration: '',
  paidByPanNumber: '',
  paidByPanName: '',
  paidByPanDob: '',
  panHolderRelationOptionId: '',
  travelerPanNumber: '',
  travelerPanName: '',
  travelerPanDob: '',
  idempotencyKey: createCreditRequestFundIdempotencyKey(),
  items: [createEmptyCreditRequestFundItem()],
});
