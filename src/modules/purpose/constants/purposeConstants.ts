export const PURPOSE_TEXTS = {
  LIST_TITLE: 'Purpose Master',
  LIST_SUBTITLE: 'Manage TCS purpose thresholds and slab definitions.',
  CREATE_TITLE: 'Create Purpose',
  EDIT_TITLE: 'Edit Purpose',
  CREATE_BUTTON: 'Create Purpose',
  SAVE_CHANGES: 'Save Changes',
  SAVE_PURPOSE: 'Save Purpose',
  CREATE_SUCCESS: 'Purpose created successfully!',
  CREATE_ERROR: 'Failed to create purpose',
  UPDATE_SUCCESS: 'Purpose updated successfully!',
  UPDATE_ERROR: 'Failed to update purpose',
  DELETE_SUCCESS: 'Purpose deleted successfully!',
  DELETE_ERROR: 'Failed to delete purpose',
  LIST_ERROR: 'Error loading purposes',
  EMPTY_STATE: 'No purposes found. Create your first purpose.',
  SLABS_TITLE: 'Slabs',
  SLABS_SUBTITLE: 'Add one or more slab rows when the purpose uses bracket-based TCS.',
  ADD_SLAB: 'Add Slab',
} as const;

export const PURPOSE_RATE_TYPE_OPTIONS = [
  { value: 'PERCENT', label: 'PERCENT' },
  { value: 'RUPEES', label: 'RUPEES' },
] as const;
