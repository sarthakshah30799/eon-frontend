export interface UserRoleFormValues {
  roleCode: string;
  roleName: string;
  description: string;
}

export interface UserRoleRecord extends UserRoleFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}
