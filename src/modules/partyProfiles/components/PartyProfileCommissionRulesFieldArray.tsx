import { useCallback, useRef, type ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button, CardSection, type AsyncSelectResponse } from '@/components/ui';
import { FormFieldInput, FormFieldSelect } from '@/components/forms';
import { currencyProfileApi } from '@/api/currencyProfile/currencyProfile.api';
import { productProfileApi } from '@/api/productProfile/productProfile.api';
import { partyProfileApi } from '@/api/partyProfile';
import { useUploadAgentCommissionTemplate } from '../hooks';
import type {
  ICreatePartyProfile,
  IPartyProfileCommissionRule,
} from '../types/partyProfileTypes';

const commissionTypeOptions = [
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'PAISA', label: 'Paisa' },
] as const;

const createEmptyCommissionRule = (): IPartyProfileCommissionRule => ({
  currencyCode: '',
  currencyName: '',
  productCode: '',
  productDescription: '',
  commissionType: 'PERCENTAGE',
  commissionValue: '',
});

const CommissionRuleRow = ({
  arrayName,
  index,
  disabled = false,
  onRemove,
  canRemove,
}: {
  arrayName: string;
  index: number;
  disabled?: boolean;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) => {
  const loadCurrencyOptions = useCallback(async (inputValue: string): Promise<AsyncSelectResponse> => {
    const currencies = await currencyProfileApi.getCurrencyProfiles(inputValue);
    return {
      options: currencies.map(currency => ({
        value: currency.currencyCode,
        label: `${currency.currencyCode}${currency.currencyName ? ` - ${currency.currencyName}` : ''}`,
      })),
    };
  }, []);

  const loadProductOptions = useCallback(async (inputValue: string): Promise<AsyncSelectResponse> => {
    const products = await productProfileApi.getProductProfiles();
    const filteredProducts = inputValue
      ? products.filter(product =>
          `${product.productCode} ${product.productDescription}`.toLowerCase().includes(inputValue.toLowerCase())
        )
      : products;

    return {
      options: filteredProducts.map(product => ({
        value: product.productCode,
        label: `${product.productCode}${product.productDescription ? ` - ${product.productDescription}` : ''}`,
      })),
    };
  }, []);

  const loadCommissionTypeOptions = useCallback(async (): Promise<AsyncSelectResponse> => {
    return {
      options: commissionTypeOptions.map(option => ({
        value: option.value,
        label: option.label,
      })),
    };
  }, []);

  return (
    <div className="grid gap-3 rounded-sm border border-border-secondary bg-surface-secondary p-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1.2fr_0.8fr_0.8fr_auto]">
      <FormFieldSelect
        name={`${arrayName}.${index}.currencyCode`}
        label="Currency"
        placeholder="Select currency"
        loadOptions={loadCurrencyOptions}
        disabled={disabled}
        isSearchable
      />
      <FormFieldSelect
        name={`${arrayName}.${index}.productCode`}
        label="Product"
        placeholder="Select product"
        loadOptions={loadProductOptions}
        disabled={disabled}
        isSearchable
      />
      <FormFieldSelect
        name={`${arrayName}.${index}.commissionType`}
        label="Type"
        placeholder="Select type"
        loadOptions={loadCommissionTypeOptions}
        disabled={disabled}
        isSearchable={false}
        isCreatable={false}
      />
      <FormFieldInput
        name={`${arrayName}.${index}.commissionValue`}
        label="Value"
        placeholder="Enter commission value"
        type="number"
        disabled={disabled}
      />
      <div className="flex items-start justify-end pt-7">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          disabled={!canRemove || disabled}
          onClick={() => onRemove(index)}
          aria-label="Remove commission rule"
        >
          <TrashIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export const PartyProfileCommissionRulesFieldArray = ({
  name = 'commissionRules',
  disabled = false,
  partyProfileId,
  canModify = false,
  isBusy = false,
}: {
  name?: 'commissionRules';
  disabled?: boolean;
  partyProfileId?: string;
  canModify?: boolean;
  isBusy?: boolean;
}) => {
  const form = useFormContext<ICreatePartyProfile>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { uploadAgentCommissionTemplate, isPending } =
    useUploadAgentCommissionTemplate(partyProfileId || '');
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });

  const canRemove = fields.length > 1;

  const handleDownloadTemplate = async () => {
    if (!partyProfileId) {
      return;
    }

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
    if (!file || !partyProfileId) {
      return;
    }

    await uploadAgentCommissionTemplate(file);
    event.target.value = '';
  };

  return (
    <CardSection heading="Agent Commission" className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">
            Add commission rules for the selected agent profile.
          </p>
          <div className="flex flex-wrap gap-2">
            {partyProfileId ? (
              <>
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
              </>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => append(createEmptyCommissionRule())}
              disabled={disabled}
            >
              <PlusIcon className="mr-2 h-4 w-4" aria-hidden="true" />
              Add Rule
            </Button>
          </div>
        </div>

        {fields.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border-secondary bg-surface-secondary p-4 text-sm text-text-tertiary">
            No commission rules added yet. Click Add Rule to start.
          </div>
        ) : null}

        {fields.map((field, index) => (
          <CommissionRuleRow
            key={field.id}
            arrayName={name}
            index={index}
            disabled={disabled}
            onRemove={remove}
            canRemove={canRemove}
          />
        ))}
      </div>

      {partyProfileId ? (
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
      ) : null}
    </CardSection>
  );
};

export default PartyProfileCommissionRulesFieldArray;
