# Sysblok Headless Auth Plugin

Authentication bridge for the headless Next.js frontend. Enables WordPress users to log in via the Next.js site and access private/draft content based on their WordPress roles.

## Installation

1. Copy the `sysblok-headless-auth` folder to your `/wp-content/plugins/` directory
2. Activate the plugin through the WordPress admin interface
3. Go to the **Headless Auth** menu in the WordPress admin to configure settings

If the Next.js Revalidation plugin is also active, the settings page appears under **Next.js > Auth** instead.

## Configuration

### 1. WordPress Plugin Settings

After activating:

1. Go to **Headless Auth** (or **Next.js > Auth**) in the WordPress admin
2. Set **Allowed Redirect Origin** to your Next.js frontend URL (e.g., `https://next.sysblok.team` or `http://localhost:3000` for local dev)
3. Set **Auth Shared Secret** -- must match `WP_AUTH_SHARED_SECRET` in Next.js
4. Optionally adjust **Session Token TTL** (default: 86400 = 24 hours)

### 2. Next.js Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_WP_LOGIN_URL="https://your-wordpress-site.com/wp-login.php"
WP_AUTH_SHARED_SECRET="same-secret-as-in-wordpress-plugin"
AUTH_SESSION_SECRET="random-string-for-cookie-encryption"
```

Generate secrets with: `openssl rand -base64 32`

## How It Works

1. User clicks "Login" on the Next.js site
2. Browser redirects to the WordPress login page (with 2FA if configured)
3. After successful login, the WP plugin generates a one-time auth code and redirects back to Next.js
4. Next.js exchanges the code for a session token via a REST API call
5. The session token is stored in an encrypted cookie
6. On subsequent requests, Next.js sends the token to the WP REST API, which sets the user context
7. WordPress handles permission checks normally (private posts, drafts, etc.)

## Security Features

- One-time auth codes expire in 60 seconds
- Session tokens use 256-bit entropy
- Shared secret required for all API calls
- CSRF protection via state parameter
- Sliding token expiration (refreshed on each valid request)
- Tokens invalidated on password reset/change
- Redirect URL whitelist prevents open redirect attacks
- Encrypted session cookies (httpOnly, secure, sameSite=lax)
