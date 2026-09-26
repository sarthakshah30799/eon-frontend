import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FormFieldCategoryOption,
  FormFieldCountryDropdown,
  FormFieldDatePicker,
  FormFieldInput,
  FormFieldTextarea,
} from '@/components/forms';
import { Button, Modal } from '@/components/ui';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import type { IPurchaseTtRemittanceFormValues } from '../types/purchaseTypes';
import {
  createEmptyTtRemittanceValues,
  isTtRemittanceComplete,
  normalizeTtRemittanceFormValues,
} from '../utils/purchaseUtils';

const remittanceSchema = yup.object({
  remitterName: yup.string().trim().required('Remitter name is required'),
  remitterAddress: yup.string().default(''),
  remitterCity: yup.string().default(''),
  remitterCountryId: yup.string().default(''),
  remitterEntityType: yup.string().default(''),
  beneficiaryName: yup.string().trim().required('Beneficiary name is required'),
  beneficiaryAddress: yup.string().default(''),
  beneficiaryCountryId: yup.string().default(''),
  bankName: yup.string().trim().required('Bank name is required'),
  bankAddress: yup.string().default(''),
  accountNumber: yup
    .string()
    .trim()
    .required('Bank account no / IBAN is required'),
  iban: yup.string().default(''),
  swiftCode: yup.string().trim().required('SWIFT code is required'),
  bsbCode: yup.string().default(''),
  sortCode: yup.string().default(''),
  routingNumber: yup.string().default(''),
  transitNumber: yup.string().default(''),
  educationDetails: yup.string().default(''),
  fbBearerOptionId: yup
    .string()
    .trim()
    .required('FB charge bearer is required'),
  intermediaryBankName: yup.string().default(''),
  intermediaryBankAddress: yup.string().default(''),
  intermediaryBankCodes: yup.string().default(''),
  relationship: yup.string().default(''),
  sponsorshipName: yup.string().default(''),
  sponsorshipPan: yup.string().default(''),
  dateOfIncorporation: yup.string().default(''),
  miceAmount: yup.string().default(''),
  miceReference: yup.string().default(''),
});

interface TtRemittanceModalProps {
  open: boolean;
  initialValues?: IPurchaseTtRemittanceFormValues;
  readOnly?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (values: IPurchaseTtRemittanceFormValues) => void;
}

export const TtRemittanceModal = ({
  open,
  initialValues,
  readOnly = false,
  onOpenChange,
  onConfirm,
}: TtRemittanceModalProps) => {
  const form = useForm<IPurchaseTtRemittanceFormValues>({
    resolver: yupResolver(remittanceSchema) as never,
    defaultValues: normalizeTtRemittanceFormValues(
      initialValues ?? createEmptyTtRemittanceValues()
    ),
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (open) {
      form.reset(
        normalizeTtRemittanceFormValues(
          initialValues ?? createEmptyTtRemittanceValues()
        )
      );
    }
  }, [form, initialValues, open]);

  const handleSubmit = form.handleSubmit(values => {
    const normalized = normalizeTtRemittanceFormValues(values);
    if (!isTtRemittanceComplete(normalized)) return;
    onConfirm(normalized);
    onOpenChange(false);
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="TT Remittance Details"
      description="One remittance is shared by all TT lines on this transaction."
      size="xl"
    >
      <FormProvider {...form}>
        <form className="space-y-6" onSubmit={event => void handleSubmit(event)}>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Remitter</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormFieldInput
                name="remitterName"
                label="Remitter Name"
                disabled={readOnly}
              />
              <FormFieldCategoryOption
                name="remitterEntityType"
                label="Entity Type"
                code={CategoryOptionCodeEnum.EntityType}
                isCreatable={false}
                disabled={readOnly}
              />
              <FormFieldInput
                name="remitterCity"
                label="City"
                disabled={readOnly}
              />
              <FormFieldCountryDropdown
                name="remitterCountryId"
                label="Country"
                disabled={readOnly}
              />
              <div className="md:col-span-2">
                <FormFieldTextarea
                  name="remitterAddress"
                  label="Address"
                  disabled={readOnly}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">
              Beneficiary
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormFieldInput
                name="beneficiaryName"
                label="Beneficiary Name"
                disabled={readOnly}
              />
              <FormFieldCountryDropdown
                name="beneficiaryCountryId"
                label="Country"
                disabled={readOnly}
              />
              <div className="md:col-span-2">
                <FormFieldTextarea
                  name="beneficiaryAddress"
                  label="Address"
                  disabled={readOnly}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">
              Beneficiary Bank
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormFieldInput
                name="bankName"
                label="Bank Name"
                disabled={readOnly}
              />
              <FormFieldInput
                name="swiftCode"
                label="SWIFT Code"
                disabled={readOnly}
              />
              <FormFieldInput
                name="accountNumber"
                label="Bank Account No / IBAN"
                disabled={readOnly}
              />
              <FormFieldInput
                name="bsbCode"
                label="BSB / Sort / Routing / Transit Code"
                disabled={readOnly}
              />
              <FormFieldCategoryOption
                name="fbBearerOptionId"
                label="FB Charge Bearer"
                code={CategoryOptionCodeEnum.FbChargeBearer}
                disabled={readOnly}
              />
              <div className="md:col-span-2">
                <FormFieldTextarea
                  name="bankAddress"
                  label="Bank Address"
                  disabled={readOnly}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">
              Intermediary / Relationship
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormFieldInput
                name="intermediaryBankName"
                label="Intermediary Bank Name"
                disabled={readOnly}
              />
              <FormFieldInput
                name="intermediaryBankCodes"
                label="SWIFT / Sort / BSB / ABA / Transit / Fed Wire Code"
                disabled={readOnly}
              />
              <FormFieldCategoryOption
                name="relationship"
                label="Relationship"
                code={CategoryOptionCodeEnum.Relationship}
                isCreatable={false}
                disabled={readOnly}
              />
              <div className="md:col-span-2">
                <FormFieldTextarea
                  name="intermediaryBankAddress"
                  label="Intermediary Bank Address"
                  disabled={readOnly}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">
              Education / Sponsorship / MICE (optional)
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FormFieldTextarea
                  name="educationDetails"
                  label="Education Details"
                  disabled={readOnly}
                />
              </div>
              <FormFieldInput
                name="sponsorshipName"
                label="Sponsorship Name"
                disabled={readOnly}
              />
              <FormFieldInput
                name="sponsorshipPan"
                label="Sponsorship PAN"
                disabled={readOnly}
              />
              <FormFieldDatePicker
                name="dateOfIncorporation"
                label="Date of Incorporation"
                disabled={readOnly}
              />
              <FormFieldInput
                name="miceAmount"
                label="MICE Amount"
                disabled={readOnly}
              />
              <FormFieldInput
                name="miceReference"
                label="MICE Reference"
                disabled={readOnly}
              />
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            {!readOnly ? (
              <Button type="submit">Save Remittance</Button>
            ) : null}
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default TtRemittanceModal;
