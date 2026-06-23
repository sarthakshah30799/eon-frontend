import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { CURRENCY_PROFILE_TEXTS } from '../constants';
import { useGetCurrencyProfile, useUpdateCurrencyProfile } from '../hooks';
import {
  createEmptyCurrencyProfileFormValues,
  mapRecordToFormValues,
} from '../utils';
import type { ICreateCurrencyProfile } from '../types';
import { CurrencyProfileEditorView } from './CurrencyProfileEditorView';

export const CurrencyProfileEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: currency, isLoading } = useGetCurrencyProfile(id);
  const { submitCurrencyProfile, isPending } = useUpdateCurrencyProfile(id);

  if (isLoading) {
    return <Loader />;
  }

  if (!currency) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-center text-text-secondary">Currency not found</p>
      </div>
    );
  }

  const handleSubmit = async (values: ICreateCurrencyProfile) => {
    await submitCurrencyProfile(values);
    navigate('/currency-profile');
  };

  return (
    <div className="space-y-4">
      <CurrencyProfileEditorView
        submitLabel={CURRENCY_PROFILE_TEXTS.SAVE_CHANGES}
        defaultValues={
          currency
            ? mapRecordToFormValues(currency)
            : createEmptyCurrencyProfileFormValues()
        }
        onSubmitCurrency={handleSubmit}
        isSubmitting={isPending}
        currentId={id}
      />
    </div>
  );
};

export default CurrencyProfileEditView;
