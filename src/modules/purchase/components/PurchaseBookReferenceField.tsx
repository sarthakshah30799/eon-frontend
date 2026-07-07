import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormFieldSelect } from '@/components/forms';
import { manualBillBookApi, type IManualBookPageTracking } from '@/api';
import { SelectUserProfiles } from '@/modules/userProfile/components';
import { useAuth } from '@/lib/AuthContext';
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
  const { activeBranchId } = useAuth();
  const [deliveryBoyPickerOpen, setDeliveryBoyPickerOpen] = useState(false);
  const [pageOptions, setPageOptions] = useState<IManualBookPageTracking[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);

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
  const manualBookPageId = useWatch({
    control: form.control,
    name: 'manualBookPageId',
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
    form.setValue('manualBookPageId', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue('manualBookPageSnapshot', null, {
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

  useEffect(() => {
    let isActive = true;
    const assigneeId =
      manualBookReferenceType === 'DELIVERY_BOY'
        ? deliveryBoyUserId || ''
        : '';

    const loadPages = async () => {
      if (!activeBranchId) {
        setPageOptions([]);
        return;
      }

      if (isDeliveryBoyMode && !assigneeId) {
        setPageOptions([]);
        return;
      }

      try {
        setIsLoadingPages(true);
        const pages = await manualBillBookApi.getSelectablePages(
          isDeliveryBoyMode
            ? {
                userId: assigneeId,
              }
            : undefined
        );

        if (isActive) {
          setPageOptions(pages);
        }
      } catch (error) {
        if (isActive) {
          setPageOptions([]);
        }
        console.error('Failed to load selectable manual book pages:', error);
      } finally {
        if (isActive) {
          setIsLoadingPages(false);
        }
      }
    };

    void loadPages();

    return () => {
      isActive = false;
    };
  }, [activeBranchId, deliveryBoyUserId, isDeliveryBoyMode, manualBookReferenceType]);

  useEffect(() => {
    const selectedPage = pageOptions.find(page => page.id === String(manualBookPageId || ''));
    if (!selectedPage) {
      return;
    }

    const selectedBook = selectedPage.manualBook;
    const nextManualBookId = selectedPage.manualBookId;
    const nextManualBookNo = selectedBook?.no ?? '';
    const nextSnapshot = {
      ...selectedPage,
    };

    if (form.getValues('manualBookId') !== nextManualBookId) {
      form.setValue('manualBookId', nextManualBookId, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }

    if (form.getValues('manualBookNo') !== nextManualBookNo) {
      form.setValue('manualBookNo', nextManualBookNo, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
    }

    if (
      JSON.stringify(form.getValues('manualBookPageSnapshot')) !==
      JSON.stringify(nextSnapshot)
    ) {
      form.setValue('manualBookPageSnapshot', nextSnapshot, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
    }
  }, [form, manualBookPageId, pageOptions]);

  const loadReferenceTypeOptions = useMemo(
    () =>
      createStaticLoadOptions([
        { value: 'CASHIER', label: 'Cashier' },
        { value: 'DELIVERY_BOY', label: 'Delivery Boy' },
      ]),
    []
  );

  const loadManualBookPageOptions = useCallback(
    async (inputValue: string) => {
      const normalized = inputValue.trim().toLowerCase();
      const options = pageOptions
        .filter(page => {
          if (!normalized) {
            return true;
          }

          return [
            String(page.pageNo),
            page.manualBook?.no,
            page.manualBook?.transactionType,
          ]
            .filter(Boolean)
            .some(value => String(value).toLowerCase().includes(normalized));
        })
        .map(page => ({
          value: page.id,
          label: `${page.manualBook?.no || 'Book'} | Page ${page.pageNo}`,
        }));

      return { options, hasMore: false };
    },
    [pageOptions]
  );

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
            key={`manual-book-type-${pageOptions.length}`}
            name="manualBookReferenceType"
            label="Manual Book Reference Type"
            loadOptions={loadReferenceTypeOptions}
            disabled={disabled}
            cacheOptions={false}
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

        <div className="min-w-0 flex-1 lg:max-w-[360px]">
          <FormFieldSelect
            key={`manual-book-page-${manualBookReferenceType}-${deliveryBoyUserId || 'cashier'}-${pageOptions.length}`}
            name="manualBookPageId"
            label={
              isDeliveryBoyMode
                ? 'Delivery Boy Page'
                : 'Cashier Page'
            }
            placeholder="Select bill book page"
            loadOptions={loadManualBookPageOptions}
            disabled={disabled || !activeBranchId || (isDeliveryBoyMode && !deliveryBoyUserId) || isLoadingPages}
            isSearchable
            cacheOptions={false}
          />
          <p className="mt-1 text-xs text-text-tertiary">
            {manualBookNo
              ? `Selected book: ${manualBookNo}`
              : 'Choose a page from the filtered list.'}
          </p>
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

    </>
  );
};

export default PurchaseBookReferenceField;
