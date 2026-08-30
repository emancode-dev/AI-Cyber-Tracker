# AI Cyber Tracker API Contract — Through Day 20

## Response envelope

Success:

```json
{ "success": true, "data": {} }
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

## Public

### GET `/api/health`
Checks the Express API and reports whether server-side Supabase variables are configured.

## Authenticated

All authenticated endpoints require `Authorization: Bearer <Supabase access token>`.

### GET `/api/me`
Verifies the Supabase JWT and returns the current user plus the public profile row.

### POST `/api/websites`
Body:

```json
{
  "name": "Portfolio",
  "url": "https://example.com",
  "authorizationConfirmed": true
}
```

The server derives `user_id` from the verified session; it never trusts a client-supplied owner ID.

### GET `/api/websites`
Lists only rows visible to the current user under RLS.

### GET `/api/websites/:id`
Reads one owned website.

### PATCH `/api/websites/:id`
Updates supported website fields after backend ownership verification.

### DELETE `/api/websites/:id`
Deletes one owned website.

## Scanner boundary through Day 20

The safe scanner modules exist server-side and can be run only through the explicit authorized CLI practice command. The public `POST /api/websites/:id/scans` endpoint is intentionally not exposed until Day 21, when rate limits, scan endpoint protection, request limits and scan/finding persistence are added.
