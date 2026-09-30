<?php
/**
 * Plugin Name: Sysblok Headless Auth
 * Description: Authentication bridge for headless Next.js frontend. Handles login redirect, session tokens, and REST API authentication.
 * Version: 1.1.0
 * Author: Sysblok
 * License: GPLv2 or later
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Sysblok_Headless_Auth {
    const OPTION_REDIRECT_ORIGIN = 'sysblok_auth_redirect_origin';
    const OPTION_SHARED_SECRET   = 'sysblok_auth_shared_secret';
    const OPTION_TOKEN_TTL       = 'sysblok_auth_token_ttl';

    // Transient prefixes
    const AUTH_CODE_PREFIX       = 'sysblok_auth_code_';
    const SESSION_PREFIX         = 'sysblok_session_';
    const USER_SESSIONS_PREFIX   = 'sysblok_user_sessions_';

    public function __construct() {
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_menu', array($this, 'add_admin_menu'));

        // REST API endpoints
        add_action('rest_api_init', array($this, 'register_rest_routes'));

        // Authenticate REST API requests via session token
        add_filter('determine_current_user', array($this, 'authenticate_rest_request'), 20);

        // Login redirect hook — fires after successful WP login (including 2FA)
        add_filter('login_redirect', array($this, 'handle_login_redirect'), 10, 3);

        // Security: invalidate tokens on password reset/change/logout
        add_action('after_password_reset', array($this, 'invalidate_user_sessions'), 10, 1);
        add_action('profile_update', array($this, 'on_profile_update'), 10, 2);
        add_action('wp_logout', array($this, 'on_user_logout'), 10, 1);
    }

    // -------------------------------------------------------------------------
    // Helpers: get option with env var fallback
    // -------------------------------------------------------------------------

    /**
     * Get the allowed redirect origin.
     * Falls back to NEXT_PUBLIC_URL env var if not set in admin.
     */
    private function get_redirect_origin() {
        return get_option(self::OPTION_REDIRECT_ORIGIN, getenv('NEXT_PUBLIC_URL') ?: '');
    }

    /**
     * Get the shared secret for auth code exchange.
     * Falls back to WP_AUTH_SHARED_SECRET env var if not set in admin.
     */
    private function get_shared_secret() {
        return get_option(self::OPTION_SHARED_SECRET, getenv('WP_AUTH_SHARED_SECRET') ?: '');
    }

    /**
     * Get the session token TTL in seconds.
     * Falls back to WP_AUTH_TOKEN_TTL env var, then to 86400 (24 hours).
     */
    private function get_token_ttl() {
        $env_ttl = getenv('WP_AUTH_TOKEN_TTL');
        $default = $env_ttl ? intval($env_ttl) : 86400;
        return intval(get_option(self::OPTION_TOKEN_TTL, $default));
    }

    // -------------------------------------------------------------------------
    // Admin Settings
    // -------------------------------------------------------------------------

    public function register_settings() {
        register_setting(
            'sysblok_headless_auth_group',
            self::OPTION_REDIRECT_ORIGIN,
            array(
                'type'              => 'string',
                'sanitize_callback' => array($this, 'sanitize_redirect_origin'),
                'default'           => getenv('NEXT_PUBLIC_URL') ?: '',
            )
        );

        register_setting(
            'sysblok_headless_auth_group',
            self::OPTION_SHARED_SECRET,
            array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => getenv('WP_AUTH_SHARED_SECRET') ?: '',
            )
        );

        $env_ttl = getenv('WP_AUTH_TOKEN_TTL');
        register_setting(
            'sysblok_headless_auth_group',
            self::OPTION_TOKEN_TTL,
            array(
                'type'              => 'integer',
                'sanitize_callback' => array($this, 'sanitize_token_ttl'),
                'default'           => $env_ttl ? intval($env_ttl) : 86400,
            )
        );

        add_settings_section(
            'sysblok_headless_auth_section',
            'Настройки авторизации',
            function () {
                echo '<p>Настройка авторизации для headless-фронтенда на Next.js. ';
                echo 'Значения по умолчанию берутся из переменных окружения, если не заданы явно.</p>';
            },
            'sysblok-headless-auth'
        );

        add_settings_field(
            'allowed_redirect_origin',
            'Allowed Redirect Origin',
            array($this, 'field_allowed_redirect_origin'),
            'sysblok-headless-auth',
            'sysblok_headless_auth_section'
        );

        add_settings_field(
            'auth_shared_secret',
            'Auth Shared Secret',
            array($this, 'field_auth_shared_secret'),
            'sysblok-headless-auth',
            'sysblok_headless_auth_section'
        );

        add_settings_field(
            'token_ttl',
            'Session Token TTL (seconds)',
            array($this, 'field_token_ttl'),
            'sysblok-headless-auth',
            'sysblok_headless_auth_section'
        );
    }

    public function sanitize_redirect_origin($value) {
        return esc_url_raw(rtrim(trim($value), '/'));
    }

    public function sanitize_token_ttl($value) {
        $ttl = intval($value);
        return max(300, min(604800, $ttl)); // 5 min to 7 days
    }

    public function field_allowed_redirect_origin() {
        $value = esc_attr($this->get_redirect_origin());
        $env_value = getenv('NEXT_PUBLIC_URL') ?: '';
        echo '<input type="url" name="' . self::OPTION_REDIRECT_ORIGIN . '" value="' . $value . '" class="regular-text" placeholder="https://next.sysblok.team" />';
        echo '<p class="description">URL фронтенда Next.js (без завершающего слеша). Только этот источник будет разрешён для редиректа после входа.';
        if ($env_value) {
            echo ' <br><em>Значение из окружения (NEXT_PUBLIC_URL): <code>' . esc_html($env_value) . '</code></em>';
        }
        echo '</p>';
    }

    public function field_auth_shared_secret() {
        $value = esc_attr($this->get_shared_secret());
        $has_env = (bool) getenv('WP_AUTH_SHARED_SECRET');
        echo '<input type="text" name="' . self::OPTION_SHARED_SECRET . '" value="' . $value . '" class="regular-text" />';
        echo '<p class="description">Должен совпадать с WP_AUTH_SHARED_SECRET в окружении Next.js. Сгенерировать: <code>openssl rand -base64 32</code>';
        if ($has_env) {
            echo ' <br><em>Значение из окружения (WP_AUTH_SHARED_SECRET) задано.</em>';
        }
        echo '</p>';
    }

    public function field_token_ttl() {
        $value = intval($this->get_token_ttl());
        $env_value = getenv('WP_AUTH_TOKEN_TTL');
        echo '<input type="number" min="300" max="604800" name="' . self::OPTION_TOKEN_TTL . '" value="' . $value . '" class="small-text" />';
        echo '<p class="description">Как долго токены сессии остаются действительными (по умолчанию: 86400 = 24 часа). TTL обновляется при каждом валидном запросе (скользящий срок действия).';
        if ($env_value) {
            echo ' <br><em>Значение из окружения (WP_AUTH_TOKEN_TTL): <code>' . esc_html($env_value) . '</code></em>';
        }
        echo '</p>';
    }

    public function add_admin_menu() {
        // Try to add as submenu under the Next.js Revalidation menu
        $parent_slug = 'next-revalidation-settings';
        $parent_exists = !empty($GLOBALS['admin_page_hooks'][$parent_slug]);

        if ($parent_exists) {
            add_submenu_page(
                $parent_slug,
                'Headless Auth',
                'Auth',
                'manage_options',
                'sysblok-headless-auth',
                array($this, 'admin_page')
            );
        } else {
            // Fallback: create own top-level menu
            add_menu_page(
                'Headless Auth',
                'Headless Auth',
                'manage_options',
                'sysblok-headless-auth',
                array($this, 'admin_page'),
                'dashicons-lock',
                101
            );
        }
    }

    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>Настройки авторизации</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('sysblok_headless_auth_group');
                do_settings_sections('sysblok-headless-auth');
                submit_button('Сохранить настройки');
                ?>
            </form>
        </div>
        <?php
    }

    // -------------------------------------------------------------------------
    // Login Redirect
    // -------------------------------------------------------------------------

    /**
     * After successful WordPress login (including 2FA), if the redirect_to
     * points to our Next.js callback, generate a one-time auth code and redirect.
     */
    public function handle_login_redirect($redirect_to, $requested_redirect_to, $user) {
        // Only proceed if the user logged in successfully
        if (is_wp_error($user) || !($user instanceof WP_User)) {
            return $redirect_to;
        }

        $allowed_origin = $this->get_redirect_origin();

        if (empty($allowed_origin)) {
            return $redirect_to;
        }

        // Check if the redirect_to URL starts with our allowed origin
        $parsed = wp_parse_url($requested_redirect_to);
        $allowed_parsed = wp_parse_url($allowed_origin);

        if (
            !$parsed || !$allowed_parsed ||
            !isset($parsed['host']) || !isset($allowed_parsed['host']) ||
            $parsed['host'] !== $allowed_parsed['host']
        ) {
            // Not a headless auth redirect, use default behavior
            return $redirect_to;
        }

        // Security: verify scheme matches (both should be https in production)
        $parsed_scheme = isset($parsed['scheme']) ? $parsed['scheme'] : 'https';
        $allowed_scheme = isset($allowed_parsed['scheme']) ? $allowed_parsed['scheme'] : 'https';
        if ($parsed_scheme !== $allowed_scheme) {
            return $redirect_to;
        }

        // Generate one-time auth code
        $code = bin2hex(random_bytes(32));

        // Store in transient: code → user_id (60 second TTL)
        set_transient(self::AUTH_CODE_PREFIX . $code, $user->ID, 60);

        // Append the code to the redirect URL
        $callback_url = add_query_arg('code', $code, $requested_redirect_to);

        return $callback_url;
    }

    // -------------------------------------------------------------------------
    // REST API Routes
    // -------------------------------------------------------------------------

    public function register_rest_routes() {
        // Exchange auth code for session token
        register_rest_route('sysblok/v1', '/auth/verify', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_verify_code'),
            'permission_callback' => '__return_true',
        ));

        // Logout (invalidate session token)
        register_rest_route('sysblok/v1', '/auth/logout', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_logout'),
            'permission_callback' => '__return_true',
        ));
    }

    /**
     * POST /wp-json/sysblok/v1/auth/verify
     * Exchange a one-time auth code for a session token.
     */
    public function rest_verify_code($request) {
        $code = sanitize_text_field($request->get_param('code'));
        $secret = sanitize_text_field($request->get_param('secret'));

        // Validate shared secret
        $expected_secret = $this->get_shared_secret();

        if (empty($expected_secret) || !hash_equals($expected_secret, $secret)) {
            return new WP_REST_Response(
                array('error' => 'Invalid secret'),
                403
            );
        }

        if (empty($code)) {
            return new WP_REST_Response(
                array('error' => 'Missing auth code'),
                400
            );
        }

        // Look up the auth code
        $user_id = get_transient(self::AUTH_CODE_PREFIX . $code);

        if (false === $user_id) {
            return new WP_REST_Response(
                array('error' => 'Invalid or expired auth code'),
                401
            );
        }

        // Delete the code immediately (one-time use)
        delete_transient(self::AUTH_CODE_PREFIX . $code);

        // Get user data
        $user = get_userdata($user_id);
        if (!$user) {
            return new WP_REST_Response(
                array('error' => 'User not found'),
                404
            );
        }

        // Generate session token
        $token = bin2hex(random_bytes(32));
        $ttl = $this->get_token_ttl();

        // Store session: token → user_id
        set_transient(self::SESSION_PREFIX . $token, $user_id, $ttl);

        // Track this token for the user (for mass invalidation)
        $this->track_user_session($user_id, $token);

        return new WP_REST_Response(array(
            'user' => array(
                'id' => $user->ID,
                'display_name' => $user->display_name,
                'email' => $user->user_email,
                'roles' => array_values($user->roles),
            ),
            'token' => $token,
            'expires_in' => $ttl,
        ), 200);
    }

    /**
     * POST /wp-json/sysblok/v1/auth/logout
     * Invalidate a session token.
     */
    public function rest_logout($request) {
        $token = sanitize_text_field($request->get_param('token'));
        $secret = sanitize_text_field($request->get_param('secret'));

        // Validate shared secret
        $expected_secret = $this->get_shared_secret();

        if (empty($expected_secret) || !hash_equals($expected_secret, $secret)) {
            return new WP_REST_Response(
                array('error' => 'Invalid secret'),
                403
            );
        }

        if (!empty($token)) {
            // Remove user tracking for this token
            $user_id = get_transient(self::SESSION_PREFIX . $token);
            if (false !== $user_id) {
                $this->untrack_user_session($user_id, $token);
            }
            delete_transient(self::SESSION_PREFIX . $token);
        }

        return new WP_REST_Response(array('success' => true), 200);
    }

    // -------------------------------------------------------------------------
    // REST API Authentication (token → user context)
    // -------------------------------------------------------------------------

    /**
     * Check for Bearer token in REST API requests and set the current user.
     * This makes WordPress permission checks work automatically.
     */
    public function authenticate_rest_request($user_id) {
        // Don't override if already authenticated
        if ($user_id) {
            return $user_id;
        }

        // Only run during REST API requests
        if (!defined('REST_REQUEST') || !REST_REQUEST) {
            return $user_id;
        }

        // Check for Authorization: Bearer {token}
        $auth_header = '';
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        if (empty($auth_header) || 0 !== strpos($auth_header, 'Bearer ')) {
            return $user_id;
        }

        $token = substr($auth_header, 7);

        if (empty($token)) {
            return $user_id;
        }

        // Look up the session token
        $stored_user_id = get_transient(self::SESSION_PREFIX . $token);

        if (false === $stored_user_id) {
            return $user_id;
        }

        // Sliding expiration: refresh the TTL
        $ttl = $this->get_token_ttl();
        set_transient(self::SESSION_PREFIX . $token, $stored_user_id, $ttl);

        return intval($stored_user_id);
    }

    // -------------------------------------------------------------------------
    // Security: session invalidation
    // -------------------------------------------------------------------------

    /**
     * Track a session token for a user (for mass invalidation on password reset).
     */
    private function track_user_session($user_id, $token) {
        $sessions = get_transient(self::USER_SESSIONS_PREFIX . $user_id);
        if (!is_array($sessions)) {
            $sessions = array();
        }
        $sessions[] = $token;
        // Store for slightly longer than token TTL to ensure cleanup
        $ttl = $this->get_token_ttl();
        set_transient(self::USER_SESSIONS_PREFIX . $user_id, $sessions, $ttl + 3600);
    }

    /**
     * Remove a single token from user's session tracking.
     */
    private function untrack_user_session($user_id, $token) {
        $sessions = get_transient(self::USER_SESSIONS_PREFIX . $user_id);
        if (!is_array($sessions)) {
            return;
        }
        $sessions = array_filter($sessions, function ($t) use ($token) {
            return $t !== $token;
        });
        $ttl = $this->get_token_ttl();
        set_transient(self::USER_SESSIONS_PREFIX . $user_id, array_values($sessions), $ttl + 3600);
    }

    /**
     * Invalidate all session tokens for a user.
     * Called on password reset, password change, and logout.
     */
    public function invalidate_user_sessions($user) {
        $user_id = ($user instanceof WP_User) ? $user->ID : intval($user);
        $sessions = get_transient(self::USER_SESSIONS_PREFIX . $user_id);

        if (is_array($sessions)) {
            foreach ($sessions as $token) {
                delete_transient(self::SESSION_PREFIX . $token);
            }
        }

        delete_transient(self::USER_SESSIONS_PREFIX . $user_id);
    }

    /**
     * On profile update, invalidate sessions only if the password was changed.
     */
    public function on_profile_update($user_id, $old_user_data) {
        $user = get_userdata($user_id);
        if ($user && $old_user_data && $user->user_pass !== $old_user_data->user_pass) {
            $this->invalidate_user_sessions($user);
        }
    }

    /**
     * On WordPress logout, invalidate all session tokens for the user.
     */
    public function on_user_logout($user_id) {
        $this->invalidate_user_sessions($user_id);
    }
}

// Initialize the plugin
new Sysblok_Headless_Auth();
