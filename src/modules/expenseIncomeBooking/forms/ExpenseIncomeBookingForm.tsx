import { useCallback } from 'react';
import type { SubmitErrorHandler } from 'react-hook-form';
import { useWatch, useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { CardSection } from '@/components/ui';
import {
  Form,
  FormFieldInput,
  FormFieldCheckbox,
  FormFieldSelect,
  FormFieldDatePicker,
  FormFieldTextarea,
} from '@/components/forms';
import { expenseIncomeBookingSchema } from '../schema/expenseIncomeBookingSchema';
import type { ICreateExpenseIncomeBookingMaster } from '../types/expenseIncomeBookingTypes';
import { accountProfileApi } from '@/api/accountProfile/accountProfile.api';
import { normalizeCodeValue } from '@/utils';
import { expenseIncomeBookingApi } from '@/api/expenseIncomeBooking/expenseIncomeBooking.api';
 
interface ExpenseIncomeBookingFormProps {
  type: 'EXPENSE' | 'INCOME';
  defaultValues: ICreateExpenseIncomeBookingMaster;
  onSubmit: (values: ICreateExpenseIncomeBookingMaster) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
  currentId?: string;
}
 
const CodeField = ({
  isDisabled,
  currentId,
  type,
}: {
  isDisabled: boolean;
  currentId?: string;
  type: 'EXPENSE' | 'INCOME';
}) => {
  const validateCode = useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }
 
      const res = await expenseIncomeBookingApi.getBookingMasters({
        type,
      });
 
      return (res ?? []).some(
        item =>
          normalizeCodeValue(item.code) === normalizedCode &&
          item.id !== currentId
      );
    },
    [currentId, type]
  );
 
  return (
    <FormFieldInput
      name="code"
      label="Code"
      placeholder="e.g. EXP-001"
      disabled={isDisabled}
      asyncValidation={{
        enabled: !isDisabled,
        check: validateCode,
        message: 'Code already exists for this type',
        normalize: normalizeCodeValue,
      }}
    />
  );
};
 
const TdsFieldsSection = ({
  isDisabled,
  loadAccountOptions,
}: {
  isDisabled: boolean;
  loadAccountOptions: (inputValue: string) => Promise<{ options: { value: string; label: string }[] }>;
}) => {
  const tdsApplicable = useWatch({ name: 'tdsApplicable' }) as boolean;

  return (
    <CardSection heading="TDS Configuration">
      <div className="space-y-4">
        <FormFieldCheckbox
          name="tdsApplicable"
          label="TDS Applicable"
          disabled={isDisabled}
        />

        <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-border-primary">
          {tdsApplicable && (
            <FormFieldInput
              name="tdsValue"
              label="TDS Value (%)"
              type="number"
              placeholder="0.00"
              disabled={isDisabled}
            />
          )}
          <FormFieldSelect
            name="tdsAccountId"
            label="Account Profile"
            placeholder="Select account profile"
            loadOptions={loadAccountOptions}
            disabled={isDisabled}
            pagination={false}
          />
        </div>
      </div>
    </CardSection>
  );
};

const ApplicabilitySection = ({
  type,
  isDisabled,
}: {
  type: 'EXPENSE' | 'INCOME';
  isDisabled: boolean;
}) => {
  const { setValue } = useFormContext();

  const handleCheckboxChange = (fieldName: string) => (checked: boolean) => {
    if (checked) {
      if (type === 'EXPENSE') {
        const fields = [
          'applicableVendor',
          'applicableCardIssuer',
          'applicableAgent',
          'applicableEmployee',
        ];
        fields.forEach(field => {
          if (field !== fieldName) {
            setValue(field, false);
          }
        });
      } else {
        const fields = ['applicableCustomer', 'applicableCardIssuer'];
        fields.forEach(field => {
          if (field !== fieldName) {
            setValue(field, false);
          }
        });
      }
    }
  };

  return (
    <CardSection heading="Applicability">
      <div className="flex flex-wrap gap-6">
        {type === 'EXPENSE' ? (
          <>
            <FormFieldCheckbox
              name="applicableVendor"
              label="Vendor"
              disabled={isDisabled}
              onChange={handleCheckboxChange('applicableVendor')}
            />
            <FormFieldCheckbox
              name="applicableCardIssuer"
              label="Card Issuer"
              disabled={isDisabled}
              onChange={handleCheckboxChange('applicableCardIssuer')}
            />
            <FormFieldCheckbox
              name="applicableAgent"
              label="Agent"
              disabled={isDisabled}
              onChange={handleCheckboxChange('applicableAgent')}
            />
            <FormFieldCheckbox
              name="applicableEmployee"
              label="Employee"
              disabled={isDisabled}
              onChange={handleCheckboxChange('applicableEmployee')}
            />
          </>
        ) : (
          <>
            <FormFieldCheckbox
              name="applicableCustomer"
              label="Customer"
              disabled={isDisabled}
              onChange={handleCheckboxChange('applicableCustomer')}
            />
            <FormFieldCheckbox
              name="applicableCardIssuer"
              label="Card Issuer"
              disabled={isDisabled}
              onChange={handleCheckboxChange('applicableCardIssuer')}
            />
          </>
        )}
      </div>
    </CardSection>
  );
};

export const ExpenseIncomeBookingForm = ({
  type,
  defaultValues,
  onSubmit,
  submitLabel = 'Save Changes',
  isSubmitting = false,
  readOnly = false,
  currentId,
}: ExpenseIncomeBookingFormProps) => {
  const navigate = useNavigate();
  const isDisabled = isSubmitting || readOnly;

  const loadAccountOptions = useCallback(
    async (inputValue: string) => {
      try {
        const response = await accountProfileApi.getAccountProfiles({
          limit: 100,
          page: 1,
          active: true,
        });
        const options = (response.data ?? []).map(acc => ({
          value: acc.id,
          label: `${acc.accountCode} - ${acc.accountName}`,
        }));

        const filtered = options.filter(option =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        );

        return {
          options: filtered,
        };
      } catch (err) {
        console.error('Error fetching account profiles:', err);
        return { options: [] };
      }
    },
    []
  );

  const handleSubmitErrors: SubmitErrorHandler<
    ICreateExpenseIncomeBookingMaster
  > = errors => {
    console.log('ExpenseIncomeBookingForm submit errors:', errors);
  };

  const onCancel = () => {
    navigate(type === 'EXPENSE' ? '/expense-booking' : '/income-booking');
  };

  return (
    <Form
      id="expense-income-booking-form"
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={yupResolver(expenseIncomeBookingSchema) as any}
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        backLabel: 'Back',
        onBackClick: onCancel,
        onCancel,
      }}
    >
      <CardSection heading={`${type === 'EXPENSE' ? 'Expense' : 'Income'} Booking Details`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <CodeField isDisabled={isDisabled} currentId={currentId} type={type} />
            <FormFieldCheckbox
              name="active"
              label="Active"
              disabled={isDisabled}
            />
          </div>
          
          <FormFieldTextarea
            name="description"
            label="Description"
            placeholder="Enter description"
            disabled={isDisabled}
            rows={3}
          />
        </div>
      </CardSection>

      <CardSection heading="Additional Settings">
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="totalGst"
            label="Total GST (%)"
            type="number"
            placeholder="0.00"
            disabled={isDisabled}
          />

          <div className="flex items-center gap-6 mt-6">
            <FormFieldCheckbox
              name="interstateTransaction"
              label="Interstate Transaction"
              disabled={isDisabled}
            />
            {type === 'INCOME' && (
              <FormFieldCheckbox
                name="allowRecPay"
                label="Allow Rec Pay"
                disabled={isDisabled}
              />
            )}
          </div>
        </div>
      </CardSection>

      <ApplicabilitySection type={type} isDisabled={isDisabled} />

      <TdsFieldsSection isDisabled={isDisabled} loadAccountOptions={loadAccountOptions} />

      <CardSection heading="Validity Period">
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldDatePicker
            name="from"
            label="From Date"
            placeholder="YYYY-MM-DD"
            disabled={isDisabled}
          />
          <FormFieldDatePicker
            name="to"
            label="To Date"
            placeholder="YYYY-MM-DD"
            disabled={isDisabled}
          />
        </div>
      </CardSection>
    </Form>
  );
};
