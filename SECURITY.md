# Security Documentation

## Overview
This document outlines the security controls implemented in the Gayatri Power hydroelectric plant management system.

## Authentication & Authorization

### Role-Based Access Control (RBAC)
- **Two roles**: `admin` and `operator`
- Roles stored in separate `user_roles` table (not in auth.users)
- Server-side role verification using `has_role()` security definer function

### JWT Authentication
- All admin edge functions require valid JWT tokens
- Tokens validated via Supabase Auth
- Admin role verification before sensitive operations

### Login Security
- **Client-side lockout**: 5 failed attempts = 15 minute lockout (UX only)
- **Backend protection**: Supabase Auth rate limiting (real security)
- Account lockout tracked per email address

## Edge Function Security

### Rate Limiting (Supabase Config)
- `create-user`: 5 requests/minute
- `update-user`: 20 requests/minute  
- `get-users`: 15 requests/minute
- `admin-query`: 10 requests/minute (AI expensive)
- `generate-daily-summary`: 5 requests/minute
- `predictive-analytics`: 5 requests/minute

### Input Validation (Zod)
All user management functions validate:
- Email format and length
- Password complexity (8+ chars, uppercase, lowercase, number)
- Name sanitization (only letters, spaces, hyphens, apostrophes)
- Employee ID format (uppercase, numbers, hyphens only)
- Role enum validation

### Audit Logging
All admin actions logged to `admin_audit_log`:
- User creation/updates
- User directory access
- AI queries
- Analytics generation
- IP address and user agent captured

## Row-Level Security (RLS)

### Enabled Tables
- `checklists` - Users see only their data
- `transformer_logs` - Users see only their data
- `generator_logs` - Users see only their data
- `flagged_issues` - Users see only their data
- `admin_audit_log` - Admins only, immutable

### Storage Buckets
- `checklist-media`: Private bucket
- Photos accessible via 24-hour signed URLs
- RLS policies enforce user-scoped access

## Data Protection

### Sensitive Data Handling
- No passwords stored in logs
- Email addresses sanitized in error messages
- Console logs contain metadata only (counts, timestamps)

### Pagination
- `get-users` returns max 100 users per page
- Prevents memory exhaustion
- Search filtering server-side

## Operational Security

### Monitoring
- Real-time audit dashboard
- Admin activity tracking
- Anomaly detection (high-frequency actions)

### Known Limitations
1. Client-side login lockout is UX only (easily bypassed)
2. Signed storage URLs expire in 24 hours (acceptable for operational data)
3. Gateway server credentials in .env file (not in repo)

## Security Checklist for Developers

Before deploying changes:
- [ ] All new edge functions have rate limiting
- [ ] Input validation uses Zod schemas
- [ ] Admin actions logged to audit table
- [ ] RLS policies tested with test users
- [ ] Console logs sanitized (no sensitive data)
- [ ] Storage buckets are private by default

## Incident Response

If security issue detected:
1. Check audit logs in Admin > Audit tab
2. Review flagged user actions
3. Disable compromised accounts via User Management
4. Rotate credentials if needed
5. Review and update RLS policies

## Contact

For security concerns, contact system administrator immediately.