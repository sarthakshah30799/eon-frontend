import { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormFieldSelect } from '@/components/forms';
import { SelectManualBillBooks } from '@/modules/manual-bill-books/components/SelectManualBillBooks';
import { SelectUserProfiles } from '@/modules/userProfile/components';
import type { IPurchaseFormValues } from '../types/purchaseTypes';
import { formatPurchaseEntityLabel } from '../utils/purchaseUtils';
import { EntityPickerField } from './EntityPickerField';

interface PurchaseBookReferenceFieldProps {
  branchId?: string;
  disabled?: boolean;
}

const createStaticLoadOptions = (options: { value: string; label: string }[]) =>
  async () => ({
    options,
    hasMore: false,
  });

export const PurchaseBookReferenceField = ({
  branchId,
  disabled = false,
}: PurchaseBookReferenceFieldProps) => {
  const form = useFormContext<IPurchaseFormValues>();
  const [bookPickerOpen, setBookPickerOpen] = useState(false);
  const [deliveryBoyPickerOpen, setDeliveryBoyPickerOpen] = useState(false);

  const manualBookReferenceType = useWatch({
    control: form.control,
    name: 'manualBookReferenceType',
  });
  const deliveryBoyUserId = useWatch({
    control: form.control,
    name: 'deliveryBoyUserId',
  });
  const deliveryBoyUserCode = useWatch({
    control: form.control,
    name: 'deliveryBoyUserCode',
  });
  const deliveryBoyUserName = useWatch({
    control: form.control,
    name: 'deliveryBoyUserName',
  });
  const manualBookNo = useWatch({
    control: form.control,
    name: 'manualBookNo',
  });
  const previousReferenceTypeRef = useRef<string>(manualBookReferenceType);

  const isDeliveryBoyMode = manualBookReferenceType === 'DELIVERY_BOY';

  useEffect(() => {
    if (previousReferenceTypeRef.current === manualBookReferenceType) {
      return;
    }

    previousReferenceTypeRef.current = manualBookReferenceType;
    form.setValue('manualBookId', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue('manualBookNo', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('deliveryBoyUserId', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue('deliveryBoyUserCode', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('deliveryBoyUserName', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  }, [form, manualBookReferenceType]);

  const loadReferenceTypeOptions = createStaticLoadOptions([
    { value: 'CASHIER', label: 'Cashier' },
    { value: 'DELIVERY_BOY', label: 'Delivery Boy' },
  ]);

  const handleBookContinue = (books: Array<{ id: string; no: string }>) => {
    const selectedBook = books[0];
    if (!selectedBook) {
      return;
    }

    form.setValue('manualBookId', selectedBook.id, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue('manualBookNo', selectedBook.no, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    setBookPickerOpen(false);
  };

  const handleDeliveryBoyContinue = (users: Array<{ id: string; code: string; name: string }>) => {
    const selectedUser = users[0];
    if (!selectedUser) {
      return;
    }

    form.setValue('deliveryBoyUserId', selectedUser.id, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue('deliveryBoyUserCode', selectedUser.code, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('deliveryBoyUserName', selectedUser.name, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    setDeliveryBoyPickerOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start">
        <div className="lg:w-[260px]">
          <FormFieldSelect
            name="manualBookReferenceType"
            label="Manual Book Reference Type"
            loadOptions={loadReferenceTypeOptions}
            disabled={disabled}
          />
        </div>

        {isDeliveryBoyMode ? (
          <div className="min-w-0 lg:w-[280px]">
            <EntityPickerField
              label="Delivery Boy"
              value={formatPurchaseEntityLabel(
                deliveryBoyUserCode,
                deliveryBoyUserName
              )}
              placeholder="Select delivery boy"
              onClick={() => setDeliveryBoyPickerOpen(true)}
              disabled={disabled}
              helperText="Select a delivery boy from the current branch before choosing the book reference."
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1 lg:max-w-[320px]">
          <EntityPickerField
            label={
              isDeliveryBoyMode
                ? 'Delivery Boy Book Reference'
                : 'Cashier Book Reference'
            }
            value={manualBookNo}
            placeholder="Select manual bill book"
            onClick={() => setBookPickerOpen(true)}
            disabled={disabled || (isDeliveryBoyMode && !deliveryBoyUserId)}
            helperText={
              isDeliveryBoyMode
                ? 'Select delivery boy first, then choose the delivery book reference.'
                : 'Select a bill book number from the current branch.'
            }
          />
        </div>
      </div>

      <SelectUserProfiles
        open={deliveryBoyPickerOpen}
        branchId={branchId}
        roleCode="DELIVERY_BOY"
        selectable
        multiple={false}
        title="Select Delivery Boy"
        description="Choose a delivery boy from the current branch."
        onContinue={handleDeliveryBoyContinue}
        onClose={() => setDeliveryBoyPickerOpen(false)}
      />

      <SelectManualBillBooks
        open={bookPickerOpen}
        branchId={branchId}
        selectable
        multiple={false}
        title={
          isDeliveryBoyMode
            ? 'Select Delivery Boy Book Reference'
            : 'Select Cashier Book Reference'
        }
        description="Choose a bill book number from the current branch."
        onContinue={handleBookContinue}
        onClose={() => setBookPickerOpen(false)}
      />
    </>
  );
};

export default PurchaseBookReferenceField;
