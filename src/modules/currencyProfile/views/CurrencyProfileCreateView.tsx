import { useNavigate } from 'react-router-dom';
import { CURRENCY_PROFILE_TEXTS } from '../constants';
import { createEmptyCurrencyProfileFormValues } from '../utils';
import { useCreateCurrencyProfile } from '../hooks';
import { CurrencyProfileEditorView } from './CurrencyProfileEditorView';
import type { ICreateCurrencyProfile } from '../types';

export const CurrencyProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitCurrencyProfile, isPending } = useCreateCurrencyProfile();

  const handleSubmit = async (values: ICreateCurrencyProfile) => {
    await submitCurrencyProfile(values);
    navigate('/currency-profile');
  };

  return (
    <div className="space-y-4">
      <CurrencyProfileEditorView
        submitLabel={CURRENCY_PROFILE_TEXTS.CREATE_CURRENCY}
        defaultValues={createEmptyCurrencyProfileFormValues()}
        onSubmitCurrency={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
};

export default CurrencyProfileCreateView;
