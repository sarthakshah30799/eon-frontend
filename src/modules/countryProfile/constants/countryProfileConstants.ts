export const COUNTRY_PROFILE_TEXTS = {
  LIST_TITLE: 'Country Profile',
  LIST_SUBTITLE:
    'Create and manage country definitions, including validation flags.',
  CREATE_COUNTRY: 'Create Country',
  SAVE_CHANGES: 'Save Changes',
  EDIT_COUNTRY: 'Edit Country',
  FORM_SUBTITLE: 'Fill in the country code, country name, and flags.',
  EMPTY_STATE: 'No countries found. Create your first country.',
  LIST_ERROR: 'Error loading countries',
  CREATE_SUCCESS: 'Country created successfully!',
  UPDATE_SUCCESS: 'Country updated successfully!',
  CREATE_ERROR: 'Failed to create country',
  UPDATE_ERROR: 'Failed to update country',
} as const;

export const riskCategoryOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];