import { useCallback, useEffect, useState } from 'react';
import { useFormContext, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, CardSection } from '@/components/ui';
import {
  Form,
  FormFieldCheckbox,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import {
  PRODUCT_PROFILE_ACCOUNTING_FIELDS,
  PRODUCT_PROFILE_DETAIL_CHECKBOXES,
} from '../constants';
import { productProfileSchema } from '../schema';
import type { ICreateProductProfile, IUpdateProductProfilePayload } from '../types';
import { useNavigate } from 'react-router-dom';
import { productProfileApi } from '@/api/productProfile';
import { partyProfileApi } from '@/api/partyProfile';
import { accountProfileApi } from '@/api/accountProfile';
import { normalizeCodeValue } from '@/utils';
import { SelectPartyProfiles } from '@/modules/partyProfiles/components';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types';
import type { IPartyProfile } from '@/modules/partyProfiles/types';

const ACCOUNT_PROFILE_OPTION_PAGE_SIZE = 30;

const ACCOUNT_PROFILE_SELECT_FIELDS: ReadonlySet<keyof ICreateProductProfile> =
  new Set([
    'acOfIssuer',
    'commissionAc',
    'fakeAccount',
    'lossAccount',
    'bulkPurAc',
    'openAc',
    'closingAc',
    'expenseAc',
    'bulkSaleAc',
    'purchaseAc',
    'saleAc',
    'profitAc',
    'bulkProficAc',
    'purchaseRetCancAc',
    'purchaseBlkCancAc',
    'saleRetCancAc',
    'saleBlkCancAc',
    'branchPurAc',
    'branchSaleAc',
    'profitAcBrnSale',
  ]);

const isAccountProfileSelectField = (
  fieldName: keyof ICreateProductProfile
) => ACCOUNT_PROFILE_SELECT_FIELDS.has(fieldName);

interface ProductProfileFormProps {
  defaultValues: ICreateProductProfile;
  onSubmit: (
    values: ICreateProductProfile | IUpdateProductProfilePayload
  ) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  currentId?: string;
}

const CardIssuerField = ({
  isSubmitting,
}: {
  isSubmitting: boolean;
}) => {
  const { watch, setValue } = useFormContext<ICreateProductProfile>();
  const issuerIds = watch('cardIssuerProfileIds') ?? [];
  const [selectedProfiles, setSelectedProfiles] = useState<IPartyProfile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSelectedProfiles = async () => {
      if (issuerIds.length === 0) {
        setSelectedProfiles([]);
        return;
      }

      const profiles = await Promise.all(
        issuerIds.map(id => partyProfileApi.getPartyProfileById(id).catch(() => undefined))
      );
      if (active) {
        setSelectedProfiles(
          profiles.filter((profile): profile is IPartyProfile => Boolean(profile))
        );
      }
    };

    void loadSelectedProfiles();
    return () => {
      active = false;
    };
  }, [issuerIds.join('|')]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">Card Issuers</p>
          <p className="text-xs text-text-secondary">
            Select active and approved card issuer profiles.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => setIsModalOpen(true)}
        >
          Select Card Issuers
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedProfiles.length === 0 ? (
          <span className="text-sm text-text-tertiary">No card issuers selected.</span>
        ) : selectedProfiles.map(profile => (
          <span
            key={profile.id}
            className="inline-flex items-center rounded-full border border-border-secondary bg-surface-secondary px-3 py-1 text-sm"
          >
            {profile.code} - {profile.name}
          </span>
        ))}
      </div>

      <SelectPartyProfiles
        open={isModalOpen}
        types={PartyProfileTypeEnum.CARD_ISSUER_PROFILE}
        selectable
        multiple
        title="Select Card Issuers"
        description="Select active and approved card issuer profiles for this product."
        initialSelectedProfiles={selectedProfiles}
        onContinue={profiles => {
          setSelectedProfiles(profiles);
          setValue('cardIssuerProfileIds', profiles.map(profile => profile.id), {
            shouldDirty: true,
            shouldValidate: true,
          });
          setIsModalOpen(false);
        }}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

const RetailTransactionConfig = ({
  isSubmitting,
}: {
  isSubmitting: boolean;
}) => {
  const { watch, setValue } = useFormContext();

  const availableInRetailBuying = watch('availableInRetailBuying');
  const availableInRetailSelling = watch('availableInRetailSelling');
  const availableInBulkBuying = watch('availableInBulkBuying');
  const availableInBulkSelling = watch('availableInBulkSelling');
  const availableInOtherTransaction = watch('availableInOtherTransaction');

  const retailBuyingSeriesApplicable = watch('retailBuyingSeriesApplicable');
  const retailSellingSeriesApplicable = watch('retailSellingSeriesApplicable');
  const bulkBuyingSeriesApplicable = watch('bulkBuyingSeriesApplicable');
  const bulkSellingSeriesApplicable = watch('bulkSellingSeriesApplicable');

  useEffect(() => {
    if (!availableInRetailBuying) {
      setValue('retailBuyingSeriesApplicable', false);
    }
  }, [availableInRetailBuying, setValue]);

  useEffect(() => {
    if (!availableInRetailSelling) {
      setValue('retailSellingSeriesApplicable', false);
    }
  }, [availableInRetailSelling, setValue]);

  useEffect(() => {
    if (!availableInBulkBuying) {
      setValue('bulkBuyingSeriesApplicable', false);
    }
  }, [availableInBulkBuying, setValue]);

  useEffect(() => {
    if (!availableInBulkSelling) {
      setValue('bulkSellingSeriesApplicable', false);
    }
  }, [availableInBulkSelling, setValue]);

  return (
    <div className="space-y-6">
      {/* Availability cards with nested series toggles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Retail Buying Card */}
        <div
          className={`rounded-md border p-4 flex flex-col justify-between h-36 transition-all duration-300 ${
            availableInRetailBuying
              ? 'border-primary-500 bg-surface-primary shadow-sm ring-1 ring-primary-500/20'
              : 'border-border-primary bg-surface-secondary/50 opacity-80'
          }`}
        >
          <FormFieldCheckbox
            name="availableInRetailBuying"
            label="Available in Retail Buying"
            disabled={isSubmitting}
          />
          {availableInRetailBuying ? (
            <div className="pt-2 border-t border-dashed border-border-secondary flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                Series Applicable
              </span>
              <div className="inline-flex rounded-full bg-surface-secondary p-0.5 border border-border-primary">
                <Button
                  type="button"
                  variant={retailBuyingSeriesApplicable ? 'default' : 'ghost'}
                  disabled={isSubmitting}
                  onClick={() => setValue('retailBuyingSeriesApplicable', true)}
                  className="rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!retailBuyingSeriesApplicable ? 'default' : 'ghost'}
                  disabled={isSubmitting}
                  onClick={() =>
                    setValue('retailBuyingSeriesApplicable', false)
                  }
                  className="rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200"
                >
                  No
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-tertiary italic leading-relaxed">
              Product cannot be bought in retail transactions. Check to enable
              series configurations.
            </p>
          )}
        </div>

        {/* Retail Selling Card */}
        <div
          className={`rounded-md border p-4 flex flex-col justify-between h-36 transition-all duration-300 ${
            availableInRetailSelling
              ? 'border-primary-500 bg-surface-primary shadow-sm ring-1 ring-primary-500/20'
              : 'border-border-primary bg-surface-secondary/50 opacity-80'
          }`}
        >
          <FormFieldCheckbox
            name="availableInRetailSelling"
            label="Available in Retail Selling"
            disabled={isSubmitting}
          />
          {availableInRetailSelling ? (
            <div className="pt-2 border-t border-dashed border-border-secondary flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                Series Applicable
              </span>
              <div className="inline-flex rounded-full bg-surface-secondary p-0.5 border border-border-primary">
                <Button
                  type="button"
                  variant={retailSellingSeriesApplicable ? 'default' : 'ghost'}
                  disabled={isSubmitting}
                  onClick={() =>
                    setValue('retailSellingSeriesApplicable', true)
                  }
                  className="rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!retailSellingSeriesApplicable ? 'default' : 'ghost'}
                  disabled={isSubmitting}
                  onClick={() =>
                    setValue('retailSellingSeriesApplicable', false)
                  }
                  className="rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200"
                >
                  No
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-tertiary italic leading-relaxed">
              Product cannot be sold in retail transactions. Check to enable
              series configurations.
            </p>
          )}
        </div>

        {/* Bulk Buying Card */}
        <div
          className={`rounded-md border p-4 flex flex-col justify-between h-36 transition-all duration-300 ${
            availableInBulkBuying
              ? 'border-primary-500 bg-surface-primary shadow-sm ring-1 ring-primary-500/20'
              : 'border-border-primary bg-surface-secondary/50 opacity-80'
          }`}
        >
          <FormFieldCheckbox
            name="availableInBulkBuying"
            label="Available in Bulk Buying"
            disabled={isSubmitting}
          />
          {availableInBulkBuying ? (
            <div className="pt-2 border-t border-dashed border-border-secondary flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                Series Applicable
              </span>
              <div className="inline-flex rounded-full bg-surface-secondary p-0.5 border border-border-primary">
                <Button
                  type="button"
                  variant={bulkBuyingSeriesApplicable ? 'default' : 'ghost'}
                  disabled={isSubmitting}
                  onClick={() => setValue('bulkBuyingSeriesApplicable', true)}
                  className="rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!bulkBuyingSeriesApplicable ? 'default' : 'ghost'}
                  disabled={isSubmitting}
                  onClick={() => setValue('bulkBuyingSeriesApplicable', false)}
                  className="rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200"
                >
                  No
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-tertiary italic leading-relaxed">
              Product cannot be bought in bulk transactions. Check to enable
              series configurations.
            </p>
          )}
        </div>

        {/* Bulk Selling Card */}
        <div
          className={`rounded-md border p-4 flex flex-col justify-between h-36 transition-all duration-300 ${
            availableInBulkSelling
              ? 'border-primary-500 bg-surface-primary shadow-sm ring-1 ring-primary-500/20'
              : 'border-border-primary bg-surface-secondary/50 opacity-80'
          }`}
        >
          <FormFieldCheckbox
            name="availableInBulkSelling"
            label="Available in Bulk Selling"
            disabled={isSubmitting}
          />
          {availableInBulkSelling ? (
            <div className="pt-2 border-t border-dashed border-border-secondary flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                Series Applicable
              </span>
              <div className="inline-flex rounded-full bg-surface-secondary p-0.5 border border-border-primary">
                <Button
                  type="button"
                  variant={bulkSellingSeriesApplicable ? 'default' : 'ghost'}
                  disabled={isSubmitting}
                  onClick={() => setValue('bulkSellingSeriesApplicable', true)}
                  className="rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!bulkSellingSeriesApplicable ? 'default' : 'ghost'}
                  disabled={isSubmitting}
                  onClick={() => setValue('bulkSellingSeriesApplicable', false)}
                  className="rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200"
                >
                  No
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-tertiary italic leading-relaxed">
              Product cannot be sold in bulk transactions. Check to enable
              series configurations.
            </p>
          )}
        </div>

        {/* Other Transactions Card (AD1) */}
        <div
          className={`rounded-md border p-4 flex flex-col justify-between h-36 transition-all duration-300 ${
            availableInOtherTransaction
              ? 'border-primary-500 bg-surface-primary shadow-sm ring-1 ring-primary-500/20'
              : 'border-border-primary bg-surface-secondary/50 opacity-80'
          }`}
        >
          <FormFieldCheckbox
            name="availableInOtherTransaction"
            label="Other Transactions (AD1)"
            disabled={isSubmitting}
          />
          {availableInOtherTransaction ? (
            <p className="text-[11px] text-text-tertiary italic leading-relaxed">
              Product is available for AD1 and similar transactions.
            </p>
          ) : (
            <p className="text-[11px] text-text-tertiary italic leading-relaxed">
              Product will not appear in AD1 transaction product lists.
            </p>
          )}
        </div>
      </div>

      {/* Remaining checkboxes */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
          <FormFieldCheckbox
            name="allowProductCancellation"
            label="Allow Product Cancellation"
            disabled={isSubmitting}
          />
        </div>
        <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
          <FormFieldCheckbox
            name="maintainBlankStockOfProduct"
            label="Maintain Blank Stock of Product?"
            disabled={isSubmitting}
          />
        </div>
        <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
          <FormFieldCheckbox
            name="denominationApplicable"
            label="Denomination Applicable"
            disabled={isSubmitting}
          />
        </div>
        <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
          <FormFieldCheckbox
            name="allowAddOnLinking"
            label="Allow Add-On Linking"
            disabled={isSubmitting}
          />
        </div>
        <div className="rounded-sm border border-border-primary bg-surface-primary p-3 hover:border-border-secondary transition-all">
          <FormFieldCheckbox
            name="instrumentIssuingAuthorityRequired"
            label="Instrument Issuing Authority Required"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export const ProductProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Create Product',
  isSubmitting = false,
  currentId,
}: ProductProfileFormProps) => {
  const navigate = useNavigate();

  const loadAccountProfileOptions = useCallback(
    async (inputValue: string, page = 1) => {
      const response = await accountProfileApi.getAccountProfiles({
        page,
        limit: ACCOUNT_PROFILE_OPTION_PAGE_SIZE,
        search: inputValue,
      });

      return {
        options: (response.data ?? []).map(account => ({
          value: account.id,
          label: `${account.accountCode} - ${account.accountName}`,
        })),
        hasMore: (response.data ?? []).length === ACCOUNT_PROFILE_OPTION_PAGE_SIZE,
      };
    },
    []
  );

  const validateProductCode = useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const products = await productProfileApi.getProductProfiles();
      return products.some(
        product =>
          normalizeCodeValue(product.productCode) === normalizedCode &&
          product.id !== currentId
      );
    },
    [currentId]
  );

  const onCancel = () => {
    navigate('/admin/product-profile');
  };

  const handleFormSubmit = useCallback(
    (values: ICreateProductProfile) => {
      const currentIds = values.cardIssuerProfileIds ?? [];
      const initialIds = defaultValues.cardIssuerProfileIds ?? [];
      const initialIdSet = new Set(initialIds);
      const currentIdSet = new Set(currentIds);

      if (!currentId) {
        return onSubmit({ ...values, cardIssuerProfileIds: currentIds });
      }

      return onSubmit({
        ...values,
        cardIssuerProfileIds: currentIds.filter(id => !initialIdSet.has(id)),
        removedCardIssuerProfileIds: initialIds.filter(id => !currentIdSet.has(id)),
      });
    },
    [currentId, defaultValues.cardIssuerProfileIds, onSubmit]
  );

  return (
    <Form
      id="product-profile-form"
      onSubmit={handleFormSubmit}
      resolver={
        yupResolver(productProfileSchema) as Resolver<ICreateProductProfile>
      }
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        onBackClick: () => {
          void onCancel?.();
        },
        onCancel,
      }}
    >
      <CardSection heading="Product Info">
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="productCode"
            label="Product Code"
            disabled={isSubmitting || Boolean(currentId)}
            maxLength={2}
            asyncValidation={{
              enabled: !isSubmitting,
              check: validateProductCode,
              message: 'Product code already exists',
              normalize: normalizeCodeValue,
            }}
          />
          <FormFieldInput
            name="productDescription"
            label="Product Description"
            disabled={isSubmitting}
          />
        </div>
        <div className="mt-4">
          <CardIssuerField isSubmitting={isSubmitting} />
        </div>
      </CardSection>

      <CardSection heading="Accounting Configuration">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_PROFILE_ACCOUNTING_FIELDS.map(field => (
            isAccountProfileSelectField(field.name) ? (
              <FormFieldSelect
                key={field.name}
                name={field.name}
                label={field.label}
                placeholder={`Select ${field.label.toLowerCase()}`}
                loadOptions={loadAccountProfileOptions}
                pagination
                pageSize={ACCOUNT_PROFILE_OPTION_PAGE_SIZE}
                disabled={isSubmitting}
              />
            ) : (
              <FormFieldInput
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.inputType ?? 'text'}
                inputMode={field.inputType === 'number' ? 'decimal' : undefined}
                step={field.inputType === 'number' ? 'any' : undefined}
                disabled={isSubmitting}
              />
            )
          ))}
        </div>
      </CardSection>

      <CardSection heading="Product Details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="levelPriority"
            label="Level / Priority"
            disabled={isSubmitting}
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_PROFILE_DETAIL_CHECKBOXES.map(option => (
            <div
              key={option.name}
              className="rounded-sm border border-border-primary bg-surface-primary p-3"
            >
              <FormFieldCheckbox
                name={option.name}
                label={option.label}
                disabled={isSubmitting}
              />
            </div>
          ))}
        </div>
      </CardSection>

      <CardSection heading="Configuration for Retails Transactions">
        <RetailTransactionConfig isSubmitting={isSubmitting} />
      </CardSection>
    </Form>
  );
};
