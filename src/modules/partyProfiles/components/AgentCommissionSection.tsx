import { useMemo, useRef, type ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { Button, CardSection, Table, type TableColumnDef } from '@/components/ui';
import { partyProfileApi } from '@/api/partyProfile';
import {
  useUploadAgentCommissionTemplate,
} from '../hooks';
import type { IPartyProfileCommissionRule } from '../types/partyProfileTypes';

interface AgentCommissionSectionProps {
  partyProfileId: string;
  commissionRules: IPartyProfileCommissionRule[];
  canModify?: boolean;
  isBusy?: boolean;
}

const formatCommissionType = (value: string) =>
  value === 'PAISA' ? 'paisa' : 'percentage';

export const AgentCommissionSection = ({
  partyProfileId,
  commissionRules,
  canModify = false,
  isBusy = false,
}: AgentCommissionSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { uploadAgentCommissionTemplate, isPending } =
    useUploadAgentCommissionTemplate(partyProfileId);

  const columns = useMemo<TableColumnDef<IPartyProfileCommissionRule>[]>(() => {
    return [
      {
        accessorKey: 'currencyCode',
        header: 'Currency',
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-semibold text-text-primary">
              {row.original.currencyCode}
            </div>
            <div className="text-xs text-text-tertiary">
              {row.original.currencyName || '-'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'productCode',
        header: 'Product',
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-semibold text-text-primary">
              {row.original.productCode}
            </div>
            <div className="text-xs text-text-tertiary">
              {row.original.productDescription || '-'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'commissionType',
        header: 'Commission Type',
        cell: ({ row }) => formatCommissionType(row.original.commissionType),
      },
      {
        accessorKey: 'commissionValue',
        header: 'Value',
      },
    ];
  }, []);

  const handleDownloadTemplate = async () => {
    try {
      const csv = await partyProfileApi.getAgentCommissionTemplate(partyProfileId);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'agent-commission-template.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to download template'
      );
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await uploadAgentCommissionTemplate(file);
    event.target.value = '';
  };

  return (
    <CardSection heading="Agent Commission" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          Download the template, update commission rows, then upload it again.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleDownloadTemplate()}
          >
            Download Current Template
          </Button>
          <Button
            type="button"
            disabled={!canModify || isPending || isBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Commission CSV
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        disabled={!canModify || isPending || isBusy}
        onChange={event => {
          void handleFileChange(event);
        }}
      />

      <Table
        columns={columns}
        data={commissionRules}
        enableSorting={false}
        enableFiltering={false}
        enablePagination={false}
        loading={false}
        emptyMessage="No commission rules added yet."
        getRowId={row => `${row.currencyCode}:${row.productCode}`}
      />
    </CardSection>
  );
};

export default AgentCommissionSection;
