export interface UserRoleFormValues {
  code: string;
  name: string;
  description: string;
}

export interface UserRoleRecord extends UserRoleFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}
