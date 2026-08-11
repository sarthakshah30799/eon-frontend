import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, CardSection, FileUploader, Table, type TableColumnDef } from '@/components/ui';
import type { ICardStockFormCard, ICardStockFormValues } from '../types';

interface PreviewRow extends ICardStockFormCard {
  id: string;
  rowNumber: number;
  error: string;
}

const requiredHeaders = ['series', 'quantity', 'kit number', 'card number', 'denomination', 'expiration date'];

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += character;
    }
  }
  values.push(value.trim());
  return values;
};

const isFutureDate = (value: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Boolean(value) && new Date(`${value}T00:00:00`) > today;
};

const parseCsv = (content: string): PreviewRow[] => {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) throw new Error('CSV must contain a header and at least one data row.');
  const headers = parseCsvLine(lines[0]).map(header => header.toLowerCase());
  const missing = requiredHeaders.filter(header => !headers.includes(header));
  if (missing.length > 0) throw new Error(`Missing column(s): ${missing.join(', ')}`);

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const get = (header: string) => values[headers.indexOf(header)] ?? '';
    const card: ICardStockFormCard = {
      series: get('series'), quantity: get('quantity') || '1', kitNumber: get('kit number'),
      cardNumber: get('card number'), denomination: get('denomination'), amount: '', expirationDate: get('expiration date'),
    };
    card.amount = (Number(card.quantity) * Number(card.denomination)).toFixed(2);
    const errors: string[] = [];
    if (!/^[A-Za-z0-9]{6}$/.test(card.series)) errors.push('Series must be exactly 6 alphanumeric characters (for example, CC0000)');
    if (card.quantity !== '1') errors.push('Quantity must be 1');
    if (!card.kitNumber) errors.push('Kit number is required');
    if (!/^(\d{8}|\d{16}|\d{4}X+\d{4})$/.test(card.cardNumber)) errors.push('Card number must be 8/16 digits or masked');
    if (!(Number(card.denomination) > 0)) errors.push('Denomination must be greater than zero');
    if (!isFutureDate(card.expirationDate)) errors.push('Expiration date must be in the future');
    return { ...card, id: `upload-${index}`, rowNumber: index + 2, error: errors.join('; ') };
  });
};

export const CardStockUploadSection = ({ itemIndex, readOnly }: { itemIndex: number; readOnly: boolean }) => {
  const form = useFormContext<ICardStockFormValues>();
  const [fileName, setFileName] = useState('');
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setError('');
    setPreviewRows([]);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Excel file selected. Excel parsing will be enabled with the API upload integration; please use CSV for this frontend preview.');
      return;
    }
    try {
      const rows = parseCsv(await file.text());
      setPreviewRows(rows);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to read this file.');
    }
  };

  const applyValidRows = () => {
    const validRows = previewRows
      .filter(row => !row.error)
      .map(row => ({
        series: row.series,
        quantity: row.quantity,
        kitNumber: row.kitNumber,
        cardNumber: row.cardNumber,
        denomination: row.denomination,
        amount: row.amount,
        expirationDate: row.expirationDate,
      }));
    if (validRows.length === 0) return;
    const cardsPath = `items.${itemIndex}.cards` as never;
    form.setValue(cardsPath, validRows as never, { shouldDirty: true, shouldValidate: true });
    void form.trigger(cardsPath);
  };

  const downloadTemplate = () => {
    const content = 'series,quantity,kit number,card number,denomination,expiration date\nCC0000,1,KIT-001,1234567890123456,1000,2030-12-31\n';
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'card-stock-upload-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: TableColumnDef<PreviewRow>[] = [
    { accessorKey: 'rowNumber', header: 'Row' },
    { accessorKey: 'series', header: 'Series' },
    { accessorKey: 'quantity', header: 'Quantity' },
    { accessorKey: 'kitNumber', header: 'Kit Number' },
    { accessorKey: 'cardNumber', header: 'Card Number' },
    { accessorKey: 'denomination', header: 'Denomination' },
    { accessorKey: 'amount', header: 'Amount' },
    { accessorKey: 'expirationDate', header: 'Expiration' },
    { accessorKey: 'error', header: 'Validation' },
  ];

  return <CardSection heading={`Upload Cards for Item ${itemIndex + 1}`} className="space-y-4"><div className="grid items-end gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]"><FileUploader className="max-w-none" label="CSV / Excel file" value={fileName} fileName={fileName} previewType="file" accept=".csv,.xls,.xlsx" placeholder="Choose card stock file" helperText="Upload kit numbers and card numbers for this item. CSV preview is available now." onChange={() => undefined} onClear={() => { setFileName(''); setPreviewRows([]); setError(''); }} onFileSelect={file => void handleFile(file)} disabled={readOnly} /><Button type="button" variant="outline" disabled={readOnly} onClick={downloadTemplate}>Download Template</Button>{previewRows.some(row => !row.error) && <Button type="button" disabled={readOnly} onClick={applyValidRows}>Use Valid Rows</Button>}</div>{error ? <p className="text-sm text-error-600">{error}</p> : null}{previewRows.length > 0 ? <div className="overflow-x-auto"><Table columns={columns} data={previewRows} enableSorting={false} enableFiltering={false} enablePagination={false} enableRowSelection={false} enableColumnVisibility={false} getRowId={row => row.id} emptyMessage="No upload rows found" /></div> : null}</CardSection>;
};

export default CardStockUploadSection;
