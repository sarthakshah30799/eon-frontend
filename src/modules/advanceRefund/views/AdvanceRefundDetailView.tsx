import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  SurfacePanel,
  CardSection,
  Breadcrumb,
  Badge,
  Modal,
  AsyncSelect,
  DatePicker,
  Input,
} from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { accountProfileApi } from '@/api/accountProfile';
import { useAdvanceRefund, useHonourAdvanceRefund } from '../hooks';
import {
  AdvanceRefundStatus,
  AdvanceRefundType,
  AdvanceRefundPayoutSource,
  type AdvanceRefundItem,
} from '../types';
import { ADVANCE_REFUND_TEXT } from '../constants';
import { toast } from 'react-hot-toast';
import { formatDateTime } from '@/utils';

import { useQuery } from '@tanstack/react-query';
import type { IAccountProfile } from '@/modules/accountProfile/types/accountProfileTypes';

export const AdvanceRefundDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHoUser = Boolean(user?.isHo || user?.isHoStaff);

  const { data: record, isLoading, error } = useAdvanceRefund(id || '');
  const honourMutation = useHonourAdvanceRefund();

  // Honour Modal state
  const [isHonourModalOpen, setIsHonourModalOpen] = useState(false);
  const [hoPayingBankAccountId, setHoPayingBankAccountId] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeDate, setChequeDate] = useState<Date | null>(null);
  const [drawnOn, setDrawnOn] = useState('');
  const [narration, setNarration] = useState('');

  const { data: hoAccountsRes, isLoading: isAccountsLoading } = useQuery({
    queryKey: ['account-profiles', 'ho-payment-banks', isHonourModalOpen],
    queryFn: () =>
      accountProfileApi.getAccountProfiles({
        limit: 100,
        offset: 0,
        payment: true,
        active: true,
      }),
    enabled: isHonourModalOpen,
  });
  const hoAccounts: IAccountProfile[] = hoAccountsRes?.data || [];

  const handleHonourSubmit = async () => {
    if (!id) return;
    if (!hoPayingBankAccountId) {
      toast.error('Please select an HO paying bank account');
      return;
    }

    await honourMutation.mutateAsync({
      id,
      payload: {
        hoPayingBankAccountId,
        chequeNumber: chequeNumber || undefined,
        chequeDate: chequeDate ? chequeDate.toISOString().slice(0, 10) : undefined,
        drawnOn: drawnOn || undefined,
        narration: narration || undefined,
      },
    });

    setIsHonourModalOpen(false);
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: ADVANCE_REFUND_TEXT.BREADCRUMB_LIST, href: '/advance-refunds' },
    { label: record?.number || ADVANCE_REFUND_TEXT.BREADCRUMB_DETAIL, active: true },
  ];

  if (isLoading) {
    return (
      <div className="py-12 text-center text-text-secondary">
        Loading advance refund details...
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="py-12 text-center text-error-600">
        Failed to load advance refund details.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <SurfacePanel className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-primary">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">
                {record.number}
              </h1>
              <Badge
                variant={
                  record.status === AdvanceRefundStatus.COMPLETED
                    ? 'success'
                    : record.status === AdvanceRefundStatus.PENDING_HO_APPROVAL
                    ? 'warning'
                    : 'default'
                }
              >
                {record.status}
              </Badge>
              <Badge variant={record.refundType === AdvanceRefundType.REFUND ? 'info' : 'default'}>
                {record.refundType}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Transaction Date:{' '}
              <span className="font-medium text-text-primary">
                {formatDateTime(record.transactionDate)}
              </span>{' '}
              | As-on Date:{' '}
              <span className="font-medium text-text-primary">
                {formatDateTime(record.asOnDate)}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/advance-refunds')}>
              Back to List
            </Button>
            {record.status === AdvanceRefundStatus.PENDING_HO_APPROVAL && isHoUser && (
              <Button
                variant="default"
                onClick={() => {
                  setChequeNumber(record.chequeNumber || '');
                  setChequeDate(record.chequeDate ? new Date(record.chequeDate) : null);
                  setDrawnOn(record.drawnOn || '');
                  setNarration(record.narration || '');
                  setIsHonourModalOpen(true);
                }}
              >
                Honour & Pay Refund
              </Button>
            )}
          </div>
        </div>

        {/* 1. Branch, Counter & Party Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <CardSection heading="Workplace & Party">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-text-secondary">Branch:</dt>
              <dd className="font-medium text-text-primary">
                {record.branchSnapshot?.name || '-'} ({record.branchSnapshot?.code || '-'})
              </dd>
              <dt className="text-text-secondary">Counter:</dt>
              <dd className="font-medium text-text-primary">
                {record.counterSnapshot?.counterName || '-'}
              </dd>
              <dt className="text-text-secondary">Party Name:</dt>
              <dd className="font-medium text-text-primary">
                {record.partyProfileSnapshot?.name || '-'}
              </dd>
              <dt className="text-text-secondary">Party Code:</dt>
              <dd className="font-medium text-text-primary">
                {record.partyProfileSnapshot?.code || '-'}
              </dd>
              <dt className="text-text-secondary">PAN Number:</dt>
              <dd className="font-medium text-text-primary">{record.panNumber || '-'}</dd>
              <dt className="text-text-secondary">PAN Name:</dt>
              <dd className="font-medium text-text-primary">{record.panName || '-'}</dd>
              <dt className="text-text-secondary">PAN DOB:</dt>
              <dd className="font-medium text-text-primary">
                {formatDateTime(record.panDob)}
              </dd>
              <dt className="text-text-secondary">Narration:</dt>
              <dd className="font-medium text-text-primary col-span-2">
                {record.narration}
              </dd>
            </dl>
          </CardSection>

          {/* 2. Settlement Details */}
          <CardSection heading="Settlement & Linked Vouchers">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {record.refundType === AdvanceRefundType.KNOCK_OFF ? (
                <>
                  <dt className="text-text-secondary">Knock Off Account:</dt>
                  <dd className="font-medium text-text-primary">
                    {record.knockOffAccountSnapshot?.accountName || '-'}{' '}
                    ({record.knockOffAccountSnapshot?.accountCode || '-'})
                  </dd>
                  <dt className="text-text-secondary">Journal Voucher ID:</dt>
                  <dd className="font-mono text-xs text-text-primary">
                    {record.journalVoucherId || '-'}
                  </dd>
                </>
              ) : (
                <>
                  <dt className="text-text-secondary">Payout Source:</dt>
                  <dd className="font-medium text-text-primary">
                    {record.payoutSource === AdvanceRefundPayoutSource.HO_PAYOUT
                      ? 'Head Office Payout (Advice)'
                      : 'Local Branch Bank'}
                  </dd>
                  <dt className="text-text-secondary">Payment Method:</dt>
                  <dd className="font-medium text-text-primary">{record.paymentMethod || '-'}</dd>
                  {record.payingBankAccountSnapshot && (
                    <>
                      <dt className="text-text-secondary">Local Paying Bank:</dt>
                      <dd className="font-medium text-text-primary">
                        {record.payingBankAccountSnapshot?.accountName || '-'}{' '}
                        ({record.payingBankAccountSnapshot?.accountCode || '-'})
                      </dd>
                    </>
                  )}
                  <dt className="text-text-secondary">Beneficiary Name:</dt>
                  <dd className="font-medium text-text-primary">{record.beneficiaryName || '-'}</dd>
                  <dt className="text-text-secondary">Beneficiary A/C:</dt>
                  <dd className="font-medium text-text-primary">
                    {record.beneficiaryAccountNumber || '-'}
                  </dd>
                  <dt className="text-text-secondary">IFSC Code:</dt>
                  <dd className="font-medium text-text-primary">{record.beneficiaryIfscCode || '-'}</dd>
                  <dt className="text-text-secondary">Bank Name:</dt>
                  <dd className="font-medium text-text-primary">{record.bankName || '-'}</dd>
                  {record.paymentVoucherId && (
                    <>
                      <dt className="text-text-secondary">Payment Voucher ID:</dt>
                      <dd className="font-mono text-xs text-text-primary">
                        {record.paymentVoucherId}
                      </dd>
                    </>
                  )}
                  {record.adviceVoucherId && (
                    <>
                      <dt className="text-text-secondary">Advice Voucher ID:</dt>
                      <dd className="font-mono text-xs text-text-primary">
                        {record.adviceVoucherId}
                      </dd>
                    </>
                  )}
                  {record.hoPaymentVoucherId && (
                    <>
                      <dt className="text-text-secondary">HO Payment Voucher ID:</dt>
                      <dd className="font-mono text-xs text-emerald-600 font-semibold">
                        {record.hoPaymentVoucherId}
                      </dd>
                    </>
                  )}
                </>
              )}
            </dl>
          </CardSection>
        </div>

        {/* 3. Items Breakdown Table */}
        <CardSection heading="Refunded Advance Receipts">
          <div className="overflow-x-auto border border-border-primary rounded-md">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-surface-secondary text-text-secondary text-xs uppercase border-b border-border-primary">
                <tr>
                  <th className="p-3 w-12 text-center font-semibold text-text-primary">#</th>
                  <th className="p-3 font-semibold text-text-primary">Receipt Number</th>
                  <th className="p-3 font-semibold text-text-primary">Receipt Date</th>
                  <th className="p-3 text-right font-semibold text-text-primary">Original Amount (₹)</th>
                  <th className="p-3 text-right font-semibold text-text-primary">Consumed Prior (₹)</th>
                  <th className="p-3 text-right font-semibold text-text-primary">Available Balance (₹)</th>
                  <th className="p-3 text-right font-bold text-text-primary">Refund Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {record.items.map((item: AdvanceRefundItem, idx: number) => (
                  <tr key={item.id} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="p-3 text-center text-text-secondary">{idx + 1}</td>
                    <td className="p-3 font-medium text-text-primary">
                      {item.receiptVoucherSnapshot?.number || '-'}
                    </td>
                    <td className="p-3">
                      {formatDateTime(
                        item.receiptVoucherSnapshot?.transactionDate
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {Number(item.originalReceiptAmount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-3 text-right">
                      {Number(item.consumedAmount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-3 text-right">
                      {Number(item.availableAmount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-3 text-right font-bold text-primary-600">
                      {Number(item.refundAmount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end p-4 bg-surface-secondary rounded-md border border-border-primary mt-4">
            <div className="text-lg font-bold text-text-primary">
              Total Refund Amount:{' '}
              <span className="text-primary-600 ml-2">
                ₹
                {Number(record.totalRefundAmount).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </CardSection>
      </SurfacePanel>

      {/* Honour & Pay Modal for Head Office */}
      <Modal
        open={isHonourModalOpen}
        onOpenChange={setIsHonourModalOpen}
        title="Honour Advance Refund Advice & Disburse Payment"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-text-secondary">
            Disburse payment of{' '}
            <span className="font-bold text-text-primary">
              ₹
              {Number(record.totalRefundAmount).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </span>{' '}
            to{' '}
            <span className="font-bold text-text-primary">
              {record.beneficiaryName || record.partyProfileSnapshot?.name}
            </span>{' '}
            from Head Office Bank.
          </p>

          <AsyncSelect
            label="HO Paying Bank Account"
            placeholder="Select Bank Account"
            loadOptions={async (input: string) => ({
              options: hoAccounts
                .map(a => ({ value: a.id, label: `${a.accountCode} - ${a.accountName}` }))
                .filter(o => !input || o.label.toLowerCase().includes(input.toLowerCase())),
            })}
            defaultOptions={hoAccounts.map(a => ({
              value: a.id,
              label: `${a.accountCode} - ${a.accountName}`,
            }))}
            value={
              hoPayingBankAccountId
                ? hoAccounts
                    .filter(a => a.id === hoPayingBankAccountId)
                    .map(a => ({ value: a.id, label: `${a.accountCode} - ${a.accountName}` }))[0]
                : null
            }
            onChange={val => {
              const opt = val as { value: string; label: string } | null;
              setHoPayingBankAccountId(opt?.value || '');
            }}
            isLoading={isAccountsLoading}
          />

          <div className="grid gap-3 grid-cols-2">
            <Input
              label="Cheque / Ref Number"
              placeholder="e.g. 102934"
              value={chequeNumber}
              onChange={e => setChequeNumber(e.target.value)}
            />
            <DatePicker
              label="Cheque Date"
              placeholder="DD/MM/YYYY"
              dateFormat="dd/MM/yyyy"
              selected={chequeDate}
              onChange={d => setChequeDate(d)}
            />
          </div>

          <Input
            label="Drawn On Bank"
            placeholder="Optional"
            value={drawnOn}
            onChange={e => setDrawnOn(e.target.value)}
          />

          <Input
            label="Updated Narration / Remarks"
            placeholder="Remarks"
            value={narration}
            onChange={e => setNarration(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsHonourModalOpen(false)}
              disabled={honourMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleHonourSubmit}
              loading={honourMutation.isPending}
            >
              Confirm Disburse & Post Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default AdvanceRefundDetailView;
