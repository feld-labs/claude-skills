# Permissions Matrix Template

Use this template when defining user roles and permissions for a multi-sided platform.

## Step 1: Identify All Roles

List every distinct user type. Consider:
- Can one person hold multiple roles? (many-to-many)
- Are roles scoped per-organization or global?
- Is there a platform admin role separate from business roles?

## Step 2: List All Actions

Every action the system supports goes in this list. Group by area:

### Organization Management
- Create/edit organization
- Delete organization
- Manage subscription/billing
- Invite/remove users (by target role level)
- View organization settings

### Core Entity CRUD (customize per product)
- Create [entity]
- Read [entity] (all vs. assigned vs. own)
- Update [entity]
- Delete/archive [entity]

### Financial
- Create quotes/estimates
- Create invoices
- View all financial data
- View own financial data
- Make payments
- View payroll

### Communication
- Message within the platform
- Receive notifications
- Configure notification preferences

### Reporting
- View dashboards
- View analytics
- Export data

## Step 3: Build the Matrix

| Action | Role A | Role B | Role C | Role D | Role E |
|---|---|---|---|---|---|
| Action 1 | ✅ | ✅ | ❌ | ❌ | ❌ |
| Action 2 | ✅ | ✅ | ✅ | ❌ | ❌ |

## Step 4: Define Role Hierarchy

```
Role A (highest)
  └── can manage -> Role B
      └── can manage -> Role C
          └── can manage -> Role D
```

Rules:
- A role can only manage roles below it in the hierarchy
- No role can modify itself (prevents lockouts)
- The top role (owner/creator) cannot be removed except by platform admin
- Accepting an invite should not require approval from the invitee's current org (people can hold multiple roles)

## Step 5: Map to RLS Policies

Each row in the matrix becomes one or more RLS policies:

```sql
-- Pattern: org-scoped read by role
create policy "[role]_read_[table]" on [table]
  for select using (
    organization_id in (
      select om.organization_id from organization_members om
      join users u on u.id = om.user_id
      where u.auth_id = auth.uid()
      and om.role in ([allowed_roles])
      and om.deleted_at is null
    )
  );

-- Pattern: user-scoped read (customer sees own data)
create policy "customer_read_own" on [table]
  for select using (
    customer_id = (select u.id from users u where u.auth_id = auth.uid() limit 1)
  );
```
