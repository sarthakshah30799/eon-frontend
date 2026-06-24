import { useNavigate, useParams } from 'react-router-dom';
import { usePermission } from '@/hooks';
import { useGetAccountProfile, useUpdateAccountProfile } from '../hooks';
import { AccountProfileForm } from '../forms/AccountProfileForm';
import type { ICreateAccountProfile } from '../types/accountProfileTypes';

export const AccountProfileEditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canModify } = usePermission('/admin/accounts-profile');

  const { data: account, isLoading, error } = useGetAccountProfile(id || '');
  const { updateAccountProfile, isPending } = useUpdateAccountProfile();

  const handleSubmit = async (values: ICreateAccountProfile) => {
    if (!id) return;
    // Sanitize optional fields to avoid empty string database reference errors
    const sanitized = {
      ...values,
      financialSubProfileId: values.financialSubProfileId || undefined,
      branchIdToTransfer: values.branchIdToTransfer || undefined,
      mapToAccountId: values.mapToAccountId || undefined,
    } as ICreateAccountProfile;
    delete sanitized.financialType;
    await updateAccountProfile({ id, data: sanitized });
    navigate('/admin/accounts-profile');
  };

  if (isLoading) {
    return (
      <div className="py-6 text-center text-text-secondary">
        Loading account details...
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load account profile details.
      </div>
    );
  }

  const defaultValues: ICreateAccountProfile = {
    divisionDept: account.divisionDept?.id || '',
    accountCode: account.accountCode,
    accountName: account.accountName,
    accountType: account.accountType?.id || '',
    subLedger: account.subLedger?.id || '',
    bankNature: account.bankNature?.id || '',
    currencyId: account.currencyId,
    financialCodeId: account.financialCodeId,
    financialSubProfileId: account.financialSubProfileId || '',
    pettyCashExpenseId: account.pettyCashExpenseId || '',
    zeroBalanceAtEod: account.zeroBalanceAtEod,
    branchIdToTransfer: account.branchIdToTransfer || '',
    mapToAccountId: account.mapToAccountId || '',
    doSale: account.doSale,
    doPurchase: account.doPurchase,
    doReceipt: account.doReceipt,
    doPayment: account.doPayment,
    active: account.active,
    cmsBank: account.cmsBank,
    directRemittance: account.directRemittance,
  };

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
      <AccountProfileForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        readOnly={!canModify}
        currentId={id}
      />
    </section>
  );
};
export default AccountProfileEditView;
