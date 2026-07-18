<?php
/**
 * Plugin Name: Sysblok Headless Auth
 * Description: Authentication bridge for headless Next.js frontend. Handles login redirect, session tokens, and REST API authentication.
 * Version: 1.0.0
 * Author: Sysblok
 * License: GPLv2 or later
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Sysblok_Headless_Auth {
    private $option_name = 'sysblok_headless_auth_settings';
    private $options;

    // Transient prefixes
    const AUTH_CODE_PREFIX = 'sysblok_auth_code_';
    const SESSION_PREFIX = 'sysblok_session_';
    const USER_SESSIONS_PREFIX = 'sysblok_user_sessions_';

    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_menu', array($this, 'add_admin_menu'));

        // REST API endpoints
        add_action('rest_api_init', array($this, 'register_rest_routes'));

        // Authenticate REST API requests via session token
        add_filter('determine_current_user', array($this, 'authenticate_rest_request'), 20);

        // Login redirect hook — fires after successful WP login (including 2FA)
        add_filter('login_redirect', array($this, 'handle_login_redirect'), 10, 3);

        // Security: invalidate tokens on password reset/change
        add_action('after_password_reset', array($this, 'invalidate_user_sessions'), 10, 1);
        add_action('profile_update', array($this, 'on_profile_update'), 10, 2);
    }

    public function init() {
        $this->options = get_option($this->option_name, array());
    }

    // -------------------------------------------------------------------------
    // Admin Settings
    // -------------------------------------------------------------------------

    public function register_settings() {
        register_setting(
            'sysblok_headless_auth_group',
            $this->option_name,
            array($this, 'sanitize_settings')
        );

        add_settings_section(
            'sysblok_headless_auth_section',
            'Headless Auth Settings',
            function () {
                echo '<p>Configure authentication for the headless Next.js frontend.</p>';
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

    public function sanitize_settings($input) {
        $new_input = array();

        if (isset($input['allowed_redirect_origin'])) {
            $new_input['allowed_redirect_origin'] = esc_url_raw(
                rtrim(trim($input['allowed_redirect_origin']), '/')
            );
        }

        if (isset($input['auth_shared_secret'])) {
            $new_input['auth_shared_secret'] = sanitize_text_field($input['auth_shared_secret']);
        }

        if (isset($input['token_ttl'])) {
            $ttl = intval($input['token_ttl']);
            $new_input['token_ttl'] = max(300, min(604800, $ttl)); // 5 min to 7 days
        }

        return $new_input;
    }

    public function field_allowed_redirect_origin() {
        $value = isset($this->options['allowed_redirect_origin'])
            ? esc_attr($this->options['allowed_redirect_origin'])
            : '';
        echo '<input type="url" name="' . $this->option_name . '[allowed_redirect_origin]" value="' . $value . '" class="regular-text" placeholder="https://next.sysblok.team" />';
        echo '<p class="description">The origin URL of your Next.js frontend (no trailing slash). Only this origin will be allowed as a redirect target after login.</p>';
    }

    public function field_auth_shared_secret() {
        $value = isset($this->options['auth_shared_secret'])
            ? esc_attr($this->options['auth_shared_secret'])
            : '';
        echo '<input type="text" name="' . $this->option_name . '[auth_shared_secret]" value="' . $value . '" class="regular-text" />';
        echo '<p class="description">Must match WP_AUTH_SHARED_SECRET in the Next.js environment. Generate with: <code>openssl rand -base64 32</code></p>';
    }

    public function field_token_ttl() {
        $value = isset($this->options['token_ttl'])
            ? intval($this->options['token_ttl'])
            : 86400;
        echo '<input type="number" min="300" max="604800" name="' . $this->option_name . '[token_ttl]" value="' . $value . '" class="small-text" />';
        echo '<p class="description">How long session tokens remain valid (default: 86400 = 24 hours). Token TTL is refreshed on each valid API request (sliding expiration).</p>';
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
            <h1>Headless Auth Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('sysblok_headless_auth_group');
                do_settings_sections('sysblok-headless-auth');
                submit_button('Save Settings');
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

        $allowed_origin = isset($this->options['allowed_redirect_origin'])
            ? $this->options['allowed_redirect_origin']
            : '';

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
        $expected_secret = isset($this->options['auth_shared_secret'])
            ? $this->options['auth_shared_secret']
            : '';

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
        $ttl = isset($this->options['token_ttl']) ? intval($this->options['token_ttl']) : 86400;

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
        $expected_secret = isset($this->options['auth_shared_secret'])
            ? $this->options['auth_shared_secret']
            : '';

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
        $ttl = isset($this->options['token_ttl']) ? intval($this->options['token_ttl']) : 86400;
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
        $ttl = isset($this->options['token_ttl']) ? intval($this->options['token_ttl']) : 86400;
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
        $ttl = isset($this->options['token_ttl']) ? intval($this->options['token_ttl']) : 86400;
        set_transient(self::USER_SESSIONS_PREFIX . $user_id, array_values($sessions), $ttl + 3600);
    }

    /**
     * Invalidate all session tokens for a user.
     * Called on password reset and password change.
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
}

// Initialize the plugin
new Sysblok_Headless_Auth();
