import { useNavigate } from 'react-router-dom';
import { COUNTRY_GROUP_TEXTS } from '../constants';
import { createEmptyCountryGroupFormValues } from '../utils';
import { useCreateCountryGroup } from '../hooks';
import { CountryGroupEditorView } from './CountryGroupEditorView';
import type { ICreateCountryGroup } from '../types';

export const CountryGroupCreateView = () => {
  const navigate = useNavigate();
  const { submitCountryGroup, isPending } = useCreateCountryGroup();

  const handleSubmit = async (values: ICreateCountryGroup) => {
    await submitCountryGroup(values);
    navigate('/admin/country-group');
  };

  return (
    <div className="space-y-4">
      <CountryGroupEditorView
        submitLabel={COUNTRY_GROUP_TEXTS.CREATE_BUTTON}
        defaultValues={createEmptyCountryGroupFormValues()}
        onSubmitCountryGroup={handleSubmit}
        isSubmitting={isPending}
        onCancel={() => navigate('/admin/country-group')}
      />
    </div>
  );
};

export default CountryGroupCreateView;
