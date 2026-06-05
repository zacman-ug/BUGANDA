# Role-Based Access Control (RBAC) Implementation Guide

## Overview
Your Buganda Heritage application now has complete role-based authentication. Users are assigned roles that determine what actions they can perform in the system.

## Available Roles

### 1. **Admin**
- **Permissions**: Full system access
- **Capabilities**: 
  - Create, edit, delete family records
  - Approve/verify submitted records
  - Manage all user accounts and roles
  - Export data
  - Access admin dashboard

### 2. **Moderator**
- **Permissions**: Content moderation and verification
- **Capabilities**:
  - View all records
  - Approve and verify submissions
  - Edit records
  - Cannot delete records or manage users

### 3. **Contributor**
- **Permissions**: Content creation and management
- **Capabilities**:
  - Create new family records
  - Edit their own records
  - View all records
  - Export data
  - Cannot delete records or approve submissions

### 4. **Viewer** (Default)
- **Permissions**: Read-only access
- **Capabilities**:
  - View all heritage data
  - Cannot create, edit, or delete records
  - Cannot approve submissions
  - Limited export capabilities

## Database Changes

Run the migration SQL file `ADD_RBAC_SUPPORT.sql` in MySQL Workbench:

```sql
-- The migration adds:
-- 1. 'role' column to users table with ENUM('admin', 'contributor', 'viewer', 'moderator')
-- 2. roles table with role definitions
-- 3. permissions table with granular permissions
-- 4. role_permissions junction table for mapping roles to permissions
-- 5. audit_log table for tracking changes
```

### Steps to Apply Migration:
1. Open MySQL Workbench
2. Connect to your database
3. Open the file: `ADD_RBAC_SUPPORT.sql`
4. Click "Execute All" or press `Ctrl+Shift+Enter`
5. Verify the changes with:
   ```sql
   DESCRIBE users;
   SELECT * FROM roles;
   SELECT * FROM permissions;
   ```

## Backend Changes

### New Middleware

#### `verifyToken` (Updated)
- Now extracts both userId and role from JWT
- Stores role in `req.userRole`

#### `verifyRole` (New)
- Middleware to check if user has required role(s)
- Usage: `app.get('/endpoint', verifyToken, verifyRole(['admin']), handler)`

### New Authentication Endpoints

#### Login (Updated)
```
POST /api/auth/login
Response includes: token, user { id, full_name, email, role }
```

#### Profile (Updated)
```
GET /api/auth/profile
Response includes: role field
```

### New Admin Endpoints

#### Get All Users
```
GET /api/admin/users
Requires: admin role
Returns: List of all users with id, full_name, email, role, phone, created_at
```

#### Update User Role
```
PUT /api/admin/users/:id/role
Requires: admin role
Body: { "role": "moderator" }
Valid roles: "admin", "contributor", "viewer", "moderator"
```

#### Delete User
```
DELETE /api/admin/users/:id
Requires: admin role
Note: Cannot delete your own account
```

#### Get All Roles
```
GET /api/admin/roles
Requires: authenticated user
Returns: List of roles with descriptions
```

#### Get Permissions for a Role
```
GET /api/admin/permissions/:role
Requires: authenticated user
Returns: Permissions assigned to the role
```

## Frontend Changes

### Context Updates (`HeritageContext.jsx`)

New utility functions available throughout your app:

```javascript
// Check user role
hasRole('admin')                 // returns boolean
hasRole(['admin', 'moderator'])  // returns boolean if user has any of these

// Check specific permissions
canCreateRecord()   // admin, contributor, moderator
canEditRecord()     // admin, contributor, moderator
canDeleteRecord()   // admin only
canApproveRecord()  // admin, moderator
canManageUsers()    // admin only
canExportData()     // admin, contributor, moderator
```

### Using RBAC in Components

```javascript
import React, { useContext } from 'react';
import { HeritageContext } from '../context/HeritageContext';

const MyComponent = () => {
  const { user, canCreateRecord, canDeleteRecord, hasRole } = useContext(HeritageContext);

  return (
    <>
      <p>Current role: {user?.role}</p>
      
      {canCreateRecord() && (
        <button>Add New Member</button>
      )}
      
      {canDeleteRecord() && (
        <button>Delete Record</button>
      )}
      
      {hasRole(['admin', 'moderator']) && (
        <div>Admin/Moderator Panel</div>
      )}
    </>
  );
};
```

## Setting Up Initial Admin User

### Option 1: Direct Database Update
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Option 2: Via API (when first admin already exists)
```javascript
// Make PUT request
fetch('http://localhost:5000/api/admin/users/1/role', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({ role: 'admin' })
});
```

## Testing Role-Based Access

### Test Cases

1. **Admin User**:
   - Can access all admin endpoints
   - Can manage users and roles
   - Can delete records

2. **Moderator User**:
   - Can view all records
   - Can approve submissions
   - Cannot delete records
   - Cannot manage users

3. **Contributor User**:
   - Can create new records
   - Can edit records
   - Cannot delete records
   - Cannot approve submissions

4. **Viewer User**:
   - Can only view records
   - Cannot create, edit, or delete
   - Cannot approve submissions

### Test API Call Examples

```bash
# Login as user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Check permissions
curl -X GET http://localhost:5000/api/admin/roles \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update user role (admin only)
curl -X PUT http://localhost:5000/api/admin/users/2/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"moderator"}'

# Get all users (admin only)
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## User Registration Flow

1. New user registers → Default role: **'viewer'**
2. Admin can then upgrade role via admin panel
3. User must log in again to receive updated JWT with new role

## Security Considerations

1. **JWT Token**: Includes role information, so role changes require re-login
2. **Admin Accounts**: Only admins can manage user roles
3. **Audit Log**: All changes are logged to `audit_log` table
4. **Self-Delete Prevention**: Admins cannot delete their own account
5. **Role Validation**: Only valid roles can be assigned

## Next Steps

1. **Apply Database Migration**: Run `ADD_RBAC_SUPPORT.sql`
2. **Test Backend**: Use provided test cases
3. **Create Admin Panel Component**: Build UI for user management
4. **Add Protected Routes**: Update frontend navigation based on roles
5. **Implement Audit Logging**: Enhance audit_log table with more details

## Common Issues & Solutions

### Issue: "Access denied. Insufficient permissions."
**Solution**: User doesn't have the required role. Update via admin endpoint or database.

### Issue: User role not changing after API call
**Solution**: User needs to log in again to receive updated JWT with new role.

### Issue: Admin endpoints returning 403
**Solution**: Ensure the token includes the admin role. Check JWT_SECRET matches in .env

## Support

For questions about implementation, check:
- Backend error logs: `console.error()` outputs in terminal
- Database structure: Verify columns exist in users table
- JWT token: Decode token to verify role is included
