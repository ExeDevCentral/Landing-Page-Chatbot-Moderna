// types/user.ts
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  CLIENT = 'client'
}

export enum Permission {
  // User Management
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  
  // Inventory Management
  CREATE_PRODUCT = 'create_product',
  READ_PRODUCT = 'read_product',
  UPDATE_PRODUCT = 'update_product',
  DELETE_PRODUCT = 'delete_product',
  
  // Sales Management
  CREATE_SALE = 'create_sale',
  READ_SALE = 'read_sale',
  UPDATE_SALE = 'update_sale',
  DELETE_SALE = 'delete_sale',
  
  // Ticket Management
  CREATE_TICKET = 'create_ticket',
  READ_TICKET = 'read_ticket',
  UPDATE_TICKET = 'update_ticket',
  DELETE_TICKET = 'delete_ticket',
  
  // Reports
  VIEW_REPORTS = 'view_reports',
  EXPORT_DATA = 'export_data',
  
  // System Administration
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_LOGS = 'view_logs',
  MANAGE_ROLES = 'manage_roles'
}

export interface User {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  avatar?: string;
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  hireDate?: Date;
  salary?: number;
  notes?: string;
}

export interface RolePermissions {
  [UserRole.SUPER_ADMIN]: Permission[];
  [UserRole.ADMIN]: Permission[];
  [UserRole.EMPLOYEE]: Permission[];
  [UserRole.CLIENT]: Permission[];
}

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: [
    Permission.CREATE_USER,
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.CREATE_PRODUCT,
    Permission.READ_PRODUCT,
    Permission.UPDATE_PRODUCT,
    Permission.DELETE_PRODUCT,
    Permission.CREATE_SALE,
    Permission.READ_SALE,
    Permission.UPDATE_SALE,
    Permission.DELETE_SALE,
    Permission.CREATE_TICKET,
    Permission.READ_TICKET,
    Permission.UPDATE_TICKET,
    Permission.DELETE_TICKET,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_LOGS
  ],
  [UserRole.EMPLOYEE]: [
    Permission.READ_USER,
    Permission.READ_PRODUCT,
    Permission.UPDATE_PRODUCT,
    Permission.CREATE_SALE,
    Permission.READ_SALE,
    Permission.UPDATE_SALE,
    Permission.CREATE_TICKET,
    Permission.READ_TICKET,
    Permission.UPDATE_TICKET,
    Permission.VIEW_REPORTS
  ],
  [UserRole.CLIENT]: [
    Permission.READ_PRODUCT,
    Permission.CREATE_SALE,
    Permission.READ_SALE,
    Permission.CREATE_TICKET,
    Permission.READ_TICKET
  ]
};
