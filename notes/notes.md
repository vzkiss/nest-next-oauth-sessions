### Test Endpoint:

```bash
# 1. Start OAuth flow (open in browser)

http://localhost:3000/auth/login/google

# 2. Get profile (after getting token)

curl -H "Authorization: Bearer YOUR_TOKEN" \
 http://localhost:3000/user/profile


curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYTc1MmU0My1iMmYxLTQzNzEtOTJjZi0zOTFmNzMwYzEwMDgiLCJlbWFpbCI6InZ6a2lzc0BnbWFpbC5jb20iLCJpYXQiOjE3Njc1MDM1MzUsImV4cCI6MTc2ODEwODMzNX0.O06U9xtvzNKEeMYvRr4ZBW4Yk9dRqDDsiSra3g6ZO5M" \
 http://localhost:3000/user/profile

# 3. Update profile

curl -X PUT \
 -H "Authorization: Bearer YOUR_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"name":"Updated Name"}' \
 http://localhost:3000/user/profile
```

```bash
curl -X PUT http://localhost:3000/user/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYTc1MmU0My1iMmYxLTQzNzEtOTJjZi0zOTFmNzMwYzEwMDgiLCJlbWFpbCI6InZ6a2lzc0BnbWFpbC5jb20iLCJpYXQiOjE3Njc1MDM1MzUsImV4cCI6MTc2ODEwODMzNX0.O06U9xtvzNKEeMYvRr4ZBW4Yk9dRqDDsiSra3g6ZO5M" \
  -H "Content-Type: application/json" \
  -d '{"name": "Vilmos Zoltan Kiss", "image": "https://example.com/avatar.jpg"}'
```

# Google Setup

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/validate/google
# ↑ IMPORTANT: Must match challenge requirement
```

---

## Google Cloud Console Setup

### 1. Go to [Google Cloud Console](https://console.cloud.google.com)

### 2. Create OAuth 2.0 Credentials

**APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**

### 3. Configure OAuth Consent Screen

- Application name: XBorg Challenge
- User support email: your email
- Authorized domains: `localhost` (for development)

### 4. Create OAuth Client ID

- Application type: **Web application**
- Name: XBorg Challenge Local

**Authorized JavaScript origins:**

```
http://localhost:3000
http://localhost:4000
```

**Authorized redirect URIs:**

```
http://localhost:3000/auth/validate/google
```
