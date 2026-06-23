import { useCallback } from 'react';
import type { Resolver, SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { CardSection } from '@/components/ui';
import { Form, FormFieldInput, FormFieldCheckbox } from '@/components/forms';
import { documentProfileSchema } from '../schema';
import type { IDocumentProfileFormValues } from '../types';
import { DOCUMENT_PROFILE_TEXTS } from '../constants/documentProfileConstants';
import { DocumentProfileRuleRows } from '../components/DocumentProfileRuleRows';
import { documentProfileApi } from '@/api/documentProfile';
import { normalizeCodeValue } from '@/utils';

interface DocumentProfileFormProps {
  defaultValues: IDocumentProfileFormValues;
  onSubmit: (values: IDocumentProfileFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  currentId?: string;
}

export const DocumentProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = DOCUMENT_PROFILE_TEXTS.SAVE_CHANGES,
  isSubmitting = false,
  currentId,
}: DocumentProfileFormProps) => {
  const navigate = useNavigate();
  const validateProfileCode = useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const documents = await documentProfileApi.getDocumentProfiles({
        page: 1,
        limit: 20,
      });

      return documents.some(
        document =>
          normalizeCodeValue(document.profileCode) === normalizedCode &&
          document.id !== currentId
      );
    },
    [currentId]
  );

  const handleSubmitErrors: SubmitErrorHandler<IDocumentProfileFormValues> = errors => {
    console.log('DocumentProfileForm submit errors:', errors);
  };

  return (
    <Form
      id="document-profile-form"
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={yupResolver(documentProfileSchema) as Resolver<IDocumentProfileFormValues>}
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        backLabel: 'Back',
        onBackClick: () => {
          navigate('/admin/document-profile');
        },
        onCancel: () => navigate('/admin/document-profile'),
      }}
    >
      <CardSection heading="Profile Details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="profileCode"
            label="Profile Code"
            placeholder="KYC_MASTER"
            disabled={isSubmitting}
            asyncValidation={{
              enabled: !isSubmitting,
              check: validateProfileCode,
              message: 'Document profile code already exists',
              normalize: normalizeCodeValue,
            }}
          />
          <FormFieldInput
            name="profileName"
            label="Profile Name"
            placeholder="KYC Documents"
            disabled={isSubmitting}
          />
          <div className="md:col-span-2">
            <FormFieldInput
              name="profileDescription"
              label="Profile Description"
              placeholder="Describe where this document profile is used"
              disabled={isSubmitting}
            />
          </div>
          <FormFieldInput
            name="sortOrder"
            label="Sort Order"
            type="number"
            disabled={isSubmitting}
          />
          <div className="flex items-end gap-6">
            <FormFieldCheckbox
              name="active"
              label="Active"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </CardSection>

      <CardSection heading="Document Rule Setup">
        <DocumentProfileRuleRows isSubmitting={isSubmitting} />
      </CardSection>
    </Form>
  );
};
