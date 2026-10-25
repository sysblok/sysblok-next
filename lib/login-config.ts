// Shared login constants. Kept free of env checks so it is safe to import from proxy.ts.

export const LOGIN_SLUG = process.env.LOGIN_SLUG || 'login'

export const WP_ADMIN_URL = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-admin/`
