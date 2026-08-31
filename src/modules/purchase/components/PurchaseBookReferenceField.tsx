import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  manualBillBookApi,
  type IManualBookPageTracking,
} from '@/api/manual-bill-books/manualBillBook.api';
import { FormFieldSelect } from '@/components/forms';
import type { AsyncSelectResponse } from '@/components/ui';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { SelectUserProfiles } from '@/modules/userProfile/components';
import { useAuth } from '@/lib/AuthContext';
import { TransactionTypeEnum } from '@/modules/transactions';
import type { PurchasePageType } from '@/pages/purchase/[slug]/purchasePage.enum';
import { pageToOffset, toAsyncSelectPage } from '@/utils/paginatedList';
import type { IPurchaseFormValues } from '../types/purchaseTypes';
import {
  createStaticLoadOptions,
  formatPurchaseEntityLabel,
} from '../utils/purchaseUtils';
import { EntityPickerField } from './EntityPickerField';

const formatManualBookPageLabel = (
  page: Pick<IManualBookPageTracking, 'pageNo' | 'manualBook'>,
  isSale: boolean
) =>
  `${page.manualBook?.no || 'Book'} | Page ${page.pageNo}${
    page.manualBook?.transactionType
      ? ` (${page.manualBook.transactionType})`
      : isSale
        ? ' (SELL)'
        : ' (PURCHASE)'
  }`;

const pageMatchesSearch = (
  page: IManualBookPageTracking,
  normalizedSearch: string
) =>
  [
    String(page.pageNo),
    page.manualBook?.no,
    page.manualBook?.transactionType,
  ]
    .filter(Boolean)
    .some(value => String(value).toLowerCase().includes(normalizedSearch));

interface PurchaseBookReferenceFieldProps {
  branchId?: string;
  purchasePageType?: PurchasePageType | null;
  disabled?: boolean;
}

export const PurchaseBookReferenceField = ({
  branchId,
  purchasePageType,
  disabled = false,
}: PurchaseBookReferenceFieldProps) => {
  const form = useFormContext<IPurchaseFormValues>();
  const { user, activeBranchId } = useAuth();
  const [deliveryBoyPickerOpen, setDeliveryBoyPickerOpen] = useState(false);
  const [cashierPickerOpen, setCashierPickerOpen] = useState(false);
  const canOverrideWorkplace = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const resolvedBranchId = branchId?.trim() || activeBranchId || undefined;

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
  const cashierUserId = useWatch({
    control: form.control,
    name: 'cashierUserId',
  });
  const cashierUserCode = useWatch({
    control: form.control,
    name: 'cashierUserCode',
  });
  const cashierUserName = useWatch({
    control: form.control,
    name: 'cashierUserName',
  });
  const manualBookPageId = useWatch({
    control: form.control,
    name: 'manualBookPageId',
  });
  const manualBookPageSnapshot = useWatch({
    control: form.control,
    name: 'manualBookPageSnapshot',
  });
  const manualBookNo = useWatch({
    control: form.control,
    name: 'manualBookNo',
  });
  const transactionType = useWatch({
    control: form.control,
    name: 'transactionType',
  });
  const deliveryBoyAssigneeId =
    manualBookReferenceType === 'DELIVERY_BOY' ? deliveryBoyUserId || '' : '';
  const cashierAssigneeId =
    manualBookReferenceType === 'CASHIER' ? cashierUserId || '' : '';
  const previousReferenceTypeRef = useRef<string>(manualBookReferenceType);
  const previousTransactionTypeRef = useRef<string>(transactionType);
  const previousBranchRef = useRef<string | undefined>(resolvedBranchId);
  const pageCacheRef = useRef(new Map<string, IManualBookPageTracking>());
  const pageQueryKeyRef = useRef('');
  const [isBookPagesLoading, setIsBookPagesLoading] = useState(false);
  const [pagesAvailabilityByKey, setPagesAvailabilityByKey] = useState<{
    key: string;
    value: 'unknown' | 'empty' | 'hasPages';
  }>({ key: '', value: 'unknown' });

  const isDeliveryBoyMode = manualBookReferenceType === 'DELIVERY_BOY';
  const isSale = transactionType === TransactionTypeEnum.SALE;
  const selectedReferenceUserId = isDeliveryBoyMode
    ? deliveryBoyAssigneeId
    : cashierAssigneeId;
  const resolvedTransactionType =
    purchasePageType ?? (transactionType || undefined);
  const pageQueryKey = useMemo(
    () =>
      [
        manualBookReferenceType,
        resolvedBranchId ?? '',
        resolvedTransactionType ?? '',
        selectedReferenceUserId,
      ].join('::'),
    [
      manualBookReferenceType,
      resolvedBranchId,
      resolvedTransactionType,
      selectedReferenceUserId,
    ]
  );
  const pagesAvailability =
    pagesAvailabilityByKey.key === pageQueryKey
      ? pagesAvailabilityByKey.value
      : 'unknown';
  const hasPageSelectionPrerequisites =
    Boolean(resolvedBranchId) &&
    (!isDeliveryBoyMode || Boolean(deliveryBoyAssigneeId)) &&
    (!canOverrideWorkplace || isDeliveryBoyMode || Boolean(cashierAssigneeId));
  const hasNoBookPagesAvailable =
    hasPageSelectionPrerequisites &&
    !isBookPagesLoading &&
    pagesAvailability === 'empty';

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
    form.setValue('cashierUserId', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue('cashierUserCode', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('cashierUserName', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  }, [form, manualBookReferenceType]);

  useEffect(() => {
    if (previousTransactionTypeRef.current === transactionType) {
      return;
    }

    previousTransactionTypeRef.current = transactionType;
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
  }, [form, transactionType]);

  useEffect(() => {
    if (previousBranchRef.current === resolvedBranchId) {
      return;
    }

    previousBranchRef.current = resolvedBranchId;
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
    form.setValue('cashierUserId', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue('cashierUserCode', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('cashierUserName', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  }, [form, resolvedBranchId]);

  const applySelectedPage = useCallback(
    (pageId: string | null) => {
      if (!pageId) {
        return;
      }

      const selectedPage = pageCacheRef.current.get(pageId);
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
    },
    [form]
  );

  const loadReferenceTypeOptions = useMemo(
    () =>
      createStaticLoadOptions([
        { value: 'CASHIER', label: 'Cashier' },
        { value: 'DELIVERY_BOY', label: 'Delivery Boy' },
      ]),
    []
  );

  const loadManualBookPageOptions = useCallback(
    async (inputValue: string, page = 1): Promise<AsyncSelectResponse> => {
      if (!hasPageSelectionPrerequisites) {
        return { options: [], hasMore: false };
      }

      const normalizedSearch = inputValue.trim().toLowerCase();
      const limit = PAGINATION_DEFAULTS.LIMIT;

      if (pageQueryKeyRef.current !== pageQueryKey) {
        pageCacheRef.current.clear();
        pageQueryKeyRef.current = pageQueryKey;
      }

      setIsBookPagesLoading(true);
      try {
        const response = await manualBillBookApi.getSelectablePages({
          userId: selectedReferenceUserId || undefined,
          transactionType: resolvedTransactionType,
          limit,
          offset: pageToOffset(page, limit),
        });

        (response.data ?? []).forEach(item => {
          pageCacheRef.current.set(item.id, item);
        });

        if (page === 1 && !normalizedSearch) {
          setPagesAvailabilityByKey({
            key: pageQueryKey,
            value: (response.total ?? 0) > 0 ? 'hasPages' : 'empty',
          });
        }

        const sourcePages = normalizedSearch
          ? (response.data ?? []).filter(item =>
              pageMatchesSearch(item, normalizedSearch)
            )
          : (response.data ?? []);

        return toAsyncSelectPage(
          {
            ...response,
            data: sourcePages,
          },
          item => ({
            value: item.id,
            label: formatManualBookPageLabel(item, isSale),
          })
        );
      } finally {
        setIsBookPagesLoading(false);
      }
    },
    [
      hasPageSelectionPrerequisites,
      isSale,
      pageQueryKey,
      resolvedTransactionType,
      selectedReferenceUserId,
    ]
  );

  const manualBookPageDefaultOptions = useMemo(() => {
    if (!manualBookPageId) {
      return undefined;
    }

    const snapshot = manualBookPageSnapshot as IManualBookPageTracking | null;
    if (!snapshot?.id) {
      return undefined;
    }

    return [
      {
        value: String(snapshot.id),
        label: formatManualBookPageLabel(snapshot, isSale),
      },
    ];
  }, [isSale, manualBookPageId, manualBookPageSnapshot]);

  useEffect(() => {
    const snapshot = manualBookPageSnapshot as IManualBookPageTracking | null;
    if (snapshot?.id) {
      pageCacheRef.current.set(String(snapshot.id), snapshot);
    }
  }, [manualBookPageSnapshot]);

  const getManualBookPageEmptyMessage = useCallback(
    ({ inputValue }: { inputValue: string }) => {
      if (hasNoBookPagesAvailable) {
        return 'No bill books available. Please ask your manager.';
      }

      if (inputValue.trim()) {
        return 'No options found';
      }

      return 'Start typing to search...';
    },
    [hasNoBookPagesAvailable]
  );

  const handleDeliveryBoyContinue = (
    users: Array<{ id: string; code: string; name: string }>
  ) => {
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

  const handleCashierContinue = (
    users: Array<{ id: string; code: string; name: string }>
  ) => {
    const selectedUser = users[0];
    if (!selectedUser) {
      return;
    }

    form.setValue('cashierUserId', selectedUser.id, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue('cashierUserCode', selectedUser.code, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    form.setValue('cashierUserName', selectedUser.name, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    setCashierPickerOpen(false);
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

        {!isDeliveryBoyMode && canOverrideWorkplace ? (
          <div className="min-w-0 lg:w-[280px]">
            <EntityPickerField
              label="Cashier"
              value={formatPurchaseEntityLabel(
                cashierUserCode,
                cashierUserName
              )}
              placeholder="Select cashier"
              onClick={() => setCashierPickerOpen(true)}
              disabled={disabled}
              helperText="Select a cashier from the chosen branch before choosing the book reference."
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1 lg:max-w-[360px]">
          <FormFieldSelect
            key={`manual-book-page-${manualBookReferenceType}-${transactionType}-${selectedReferenceUserId || 'cashier'}-${resolvedBranchId || 'branch'}`}
            name="manualBookPageId"
            label={isDeliveryBoyMode ? 'Delivery Boy Page' : 'Cashier Page'}
            isLoading={isBookPagesLoading}
            placeholder={'Select bill book page'}
            loadOptions={loadManualBookPageOptions}
            defaultOptions={manualBookPageDefaultOptions ?? true}
            pagination
            pageSize={PAGINATION_DEFAULTS.LIMIT}
            noOptionsMessage={getManualBookPageEmptyMessage}
            onValueChange={value =>
              applySelectedPage(typeof value === 'string' ? value : null)
            }
            disabled={
              disabled ||
              !resolvedBranchId ||
              (isDeliveryBoyMode && !deliveryBoyUserId) ||
              (!isDeliveryBoyMode && canOverrideWorkplace && !cashierUserId)
            }
            isSearchable
            cacheOptions={false}
          />
          <p className="mt-1 text-xs text-text-tertiary">
            {isBookPagesLoading
              ? 'Loading available bill book pages...'
              : hasNoBookPagesAvailable
                ? 'No bill books available. Please ask your manager.'
                : manualBookNo
                  ? `Selected book: ${manualBookNo}`
                  : 'Choose a page from the filtered list.'}
          </p>
        </div>
      </div>

      <SelectUserProfiles
        open={deliveryBoyPickerOpen}
        branchId={branchId}
        roleFilter="DELIVERY_BOY"
        selectable
        multiple={false}
        title="Select Delivery Boy"
        description="Choose a delivery boy from the current branch."
        onContinue={handleDeliveryBoyContinue}
        onClose={() => setDeliveryBoyPickerOpen(false)}
      />

      <SelectUserProfiles
        open={cashierPickerOpen}
        branchId={resolvedBranchId}
        roleFilter="CASHIER"
        selectable
        multiple={false}
        title="Select Cashier"
        description="Choose a cashier from the selected branch."
        onContinue={handleCashierContinue}
        onClose={() => setCashierPickerOpen(false)}
      />
    </>
  );
};

export default PurchaseBookReferenceField;
