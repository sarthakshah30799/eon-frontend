import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Button,
  CardSection,
  FileUploader,
  Table,
  type TableColumnDef,
} from '@/components/ui';
import type { CardStockUploadPreviewRow } from '@/api/cardStock';
import type { IPartyProfile } from '@/modules/partyProfiles/types';
import { CARD_STOCK_UPLOAD_TEXT } from '../constants/cardStockConstants';
import {
  useDownloadCardStockTemplate,
  usePreviewCardStockUpload,
} from '../hooks';
import type { ICardStockFormValues } from '../types';

export const CardStockUploadSection = ({
  itemIndex,
  readOnly,
  issuer,
}: {
  itemIndex: number;
  readOnly: boolean;
  issuer?: IPartyProfile;
}) => {
  const form = useFormContext<ICardStockFormValues>();
  const [fileName, setFileName] = useState('');
  const [previewRows, setPreviewRows] = useState<CardStockUploadPreviewRow[]>(
    []
  );
  const [error, setError] = useState('');
  const { previewUpload, isPending } = usePreviewCardStockUpload();
  const { downloadTemplate, isPending: isDownloading } =
    useDownloadCardStockTemplate();

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setError('');
    setPreviewRows([]);
    try {
      setPreviewRows(
        await previewUpload({ file, issuerPartyProfileId: issuer?.id })
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : CARD_STOCK_UPLOAD_TEXT.readFailed
      );
    }
  };

  const applyValidRows = () => {
    const validRows = previewRows
      .filter(row => !row.error)
      .map(row => ({
        series: row.series,
        kitNumber: row.kitNumber,
        cardNumber: row.cardNumber,
        denomination: row.denomination,
        amount: row.amount,
        expirationDate: row.expirationDate,
      }));
    if (validRows.length === 0) return;
    const cardsPath = `items.${itemIndex}.cards` as never;
    form.setValue(cardsPath, validRows as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
    void form.trigger(cardsPath);
  };

  const columns: TableColumnDef<CardStockUploadPreviewRow>[] = [
    { accessorKey: 'rowNumber', header: 'Row' },
    { accessorKey: 'series', header: 'Series' },
    { accessorKey: 'kitNumber', header: 'Kit Number' },
    { accessorKey: 'cardNumber', header: 'Card Number' },
    { accessorKey: 'denomination', header: 'Denomination' },
    { accessorKey: 'amount', header: 'Amount' },
    {
      id: 'expirationDate',
      header: 'Expiration (dd/mm/yyyy)',
      cell: ({ row }) =>
        row.original.expirationDate
          ? row.original.expirationDate.split('-').reverse().join('/')
          : '',
    },
    { accessorKey: 'error', header: 'Validation' },
  ];

  return (
    <CardSection
      heading={CARD_STOCK_UPLOAD_TEXT.heading(itemIndex)}
      className="space-y-4"
    >
      <div className="grid items-end gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <FileUploader
          className="max-w-none"
          label={CARD_STOCK_UPLOAD_TEXT.fileLabel}
          value={fileName}
          fileName={fileName}
          previewType="file"
          accept=".csv,.xls,.xlsx"
          placeholder={CARD_STOCK_UPLOAD_TEXT.placeholder}
          helperText={CARD_STOCK_UPLOAD_TEXT.helperText}
          onChange={() => undefined}
          onClear={() => {
            setFileName('');
            setPreviewRows([]);
            setError('');
          }}
          onFileSelect={file => void handleFile(file)}
          disabled={readOnly || isPending}
        />
        <Button
          type="button"
          variant="outline"
          disabled={readOnly || isDownloading}
          onClick={() => void downloadTemplate()}
        >
          {CARD_STOCK_UPLOAD_TEXT.downloadTemplate}
        </Button>
        {previewRows.some(row => !row.error) && (
          <Button type="button" disabled={readOnly} onClick={applyValidRows}>
            {CARD_STOCK_UPLOAD_TEXT.useValidRows}
          </Button>
        )}
      </div>
      {error ? <p className="text-sm text-error-600">{error}</p> : null}
      {previewRows.length > 0 ? (
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={previewRows}
            enableSorting={false}
            enableFiltering={false}
            enablePagination={false}
            enableRowSelection={false}
            enableColumnVisibility={false}
            getRowId={row => String(row.rowNumber)}
            emptyMessage="No upload rows found"
          />
        </div>
      ) : null}
    </CardSection>
  );
};

export default CardStockUploadSection;
