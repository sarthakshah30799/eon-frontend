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
    navigate('/master/system-setups/currency-profile');
  };

  return (
    <CurrencyProfileEditorView
      heading={CURRENCY_PROFILE_TEXTS.CREATE_CURRENCY}
      description={CURRENCY_PROFILE_TEXTS.FORM_SUBTITLE}
      submitLabel={CURRENCY_PROFILE_TEXTS.CREATE_CURRENCY}
      defaultValues={createEmptyCurrencyProfileFormValues()}
      onSubmitCurrency={handleSubmit}
      isSubmitting={isPending}
    />
  );
};

export default CurrencyProfileCreateView;
