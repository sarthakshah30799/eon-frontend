import { useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { transactionsApi } from '@/api/transactions';
import {
  FormFieldDatePicker,
  FormFieldInput,
} from '@/components/forms';
import { Button, FileUploader, Modal } from '@/components/ui';
import {
  TOUR_PASSENGER_COLUMNS,
  TOUR_PASSENGER_TEXT,
} from '../constants/tourPassengerConstants';
import type { ITourPassengerFormRow } from '../types/purchaseTypes';
import { createEmptyTourPassengerRow } from '../utils/purchaseUtils';

interface TourPassengerFormValues {
  rows: ITourPassengerFormRow[];
}

interface TourPassengerModalProps {
  open: boolean;
  rows: ITourPassengerFormRow[];
  readOnly?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (rows: ITourPassengerFormRow[]) => void;
}

const textValue = (value: unknown) =>
  value === null || value === undefined ? '' : String(value);

const toFormRow = (
  row: Partial<ITourPassengerFormRow> & { lineNo?: string | number | null },
  index: number
): ITourPassengerFormRow => ({
  ...createEmptyTourPassengerRow(index + 1),
  ...Object.fromEntries(
    TOUR_PASSENGER_COLUMNS.map(column => [
      column.name,
      textValue(row[column.name]),
    ])
  ),
  lineNo: textValue(row.lineNo) || String(index + 1),
});

export const TourPassengerModal = ({
  open,
  rows,
  readOnly = false,
  onOpenChange,
  onSave,
}: TourPassengerModalProps) => {
  const [uploadName, setUploadName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [trackedOpen, setTrackedOpen] = useState(open);
  const [trackedRows, setTrackedRows] = useState(rows);
  if (trackedOpen !== open || trackedRows !== rows) {
    setTrackedOpen(open);
    setTrackedRows(rows);
    if (open) {
      setUploadName('');
    }
  }
  const form = useForm<TourPassengerFormValues>({
    defaultValues: { rows: rows.length ? rows : [createEmptyTourPassengerRow(1)] },
  });
  const fieldArray = useFieldArray({ control: form.control, name: 'rows' });

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset({
      rows: rows.length ? rows.map(toFormRow) : [createEmptyTourPassengerRow(1)],
    });
  }, [form, open, rows]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const parsed = await transactionsApi.parseTourPassengers(file);
      const nextRows = parsed.map(toFormRow);
      fieldArray.replace(
        nextRows.length ? nextRows : [createEmptyTourPassengerRow(1)]
      );
      setUploadName(file.name);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : TOUR_PASSENGER_TEXT.uploadFailed
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = form.handleSubmit(values => {
    const savedRows = values.rows
      .map((row, index) => toFormRow(row, index))
      .filter(row =>
        TOUR_PASSENGER_COLUMNS.some(column => row[column.name].trim())
      )
      .map((row, index) => ({ ...row, lineNo: String(index + 1) }));
    onSave(savedRows);
    onOpenChange(false);
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={TOUR_PASSENGER_TEXT.title}
      description={TOUR_PASSENGER_TEXT.description}
      size="2xl"
      footer={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={readOnly}
            onClick={() =>
              fieldArray.append(
                createEmptyTourPassengerRow(fieldArray.fields.length + 1)
              )
            }
          >
            {TOUR_PASSENGER_TEXT.addRow}
          </Button>
          <Button
            type="submit"
            form="tour-passenger-data-form"
            disabled={readOnly || isUploading}
          >
            {TOUR_PASSENGER_TEXT.save}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {TOUR_PASSENGER_TEXT.cancel}
          </Button>
        </div>
      }
    >
      <FormProvider {...form}>
        <form
          id="tour-passenger-data-form"
          className="space-y-4"
          onSubmit={event => void handleSave(event)}
        >
          <FileUploader
            label={TOUR_PASSENGER_TEXT.upload}
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            previewType="file"
            value={uploadName}
            fileName={uploadName}
            disabled={readOnly || isUploading}
            onChange={setUploadName}
            onClear={() => setUploadName('')}
            onFileSelect={file => {
              void handleUpload(file);
            }}
          />
          <div className="max-h-[50vh] overflow-auto rounded-sm border border-border-primary">
            <table className="min-w-max border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-20 bg-surface-primary">
                <tr>
                  <th className="sticky left-0 z-30 bg-surface-primary px-2 py-2 text-[11px] font-semibold uppercase">
                    SNO
                  </th>
                  {TOUR_PASSENGER_COLUMNS.map(column => (
                    <th
                      key={column.name}
                      className="min-w-40 bg-surface-primary px-2 py-2 text-[11px] font-semibold uppercase"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="sticky right-0 z-30 bg-surface-primary px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {fieldArray.fields.map((field, index) => (
                  <tr key={field.id}>
                    <td className="sticky left-0 z-10 bg-surface-primary px-2 py-2 text-sm">
                      {index + 1}
                    </td>
                    {TOUR_PASSENGER_COLUMNS.map(column => (
                      <td key={column.name} className="px-2 py-2 align-top">
                        {column.kind === 'date' ? (
                          <FormFieldDatePicker
                            name={`rows.${index}.${column.name}`}
                            disabled={readOnly}
                          />
                        ) : (
                          <FormFieldInput
                            name={`rows.${index}.${column.name}`}
                            disabled={readOnly}
                            valueTransform="none"
                            type={column.kind === 'amount' ? 'number' : 'text'}
                          />
                        )}
                      </td>
                    ))}
                    <td className="sticky right-0 z-10 bg-surface-primary px-2 align-middle">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-7.5 py-0"
                        disabled={readOnly}
                        onClick={() => fieldArray.remove(index)}
                      >
                        {TOUR_PASSENGER_TEXT.removeRow}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};
