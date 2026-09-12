/**
 * RBAC seed data — matches ADD_RBAC_SUPPORT.sql
 */
module.exports = {
  roles: [
    { name: 'admin', description: 'Full system access, manage users and records' },
    { name: 'moderator', description: 'Review and verify submitted information' },
    { name: 'contributor', description: 'Add and edit family records' },
    { name: 'viewer', description: 'Read-only access to heritage data' }
  ],
  permissions: [
    { name: 'create_record', description: 'Can create new family records' },
    { name: 'edit_record', description: 'Can edit existing records' },
    { name: 'delete_record', description: 'Can delete records' },
    { name: 'approve_record', description: 'Can approve/verify submitted records' },
    { name: 'manage_users', description: 'Can manage user accounts' },
    { name: 'view_all_records', description: 'Can view all records in system' },
    { name: 'export_data', description: 'Can export heritage data' }
  ],
  rolePermissions: {
    admin: [
      'create_record', 'edit_record', 'delete_record', 'approve_record',
      'manage_users', 'view_all_records', 'export_data'
    ],
    moderator: ['view_all_records', 'approve_record', 'edit_record'],
    contributor: ['create_record', 'edit_record', 'view_all_records', 'export_data'],
    viewer: ['view_all_records']
  }
};
