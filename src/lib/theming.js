/**
 * Theme configuration and utilities for Ant Design
 */

/**
 * Default theme configuration
 */
export const defaultTheme = {
    primaryColor: '#1677ff',
    size: 'middle',
    labelAlign: 'right',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    colon: true,
    layout: 'horizontal',
    requiredMark: true,
    validateMessages: {
        required: '${label} is required',
        string: {
            min: '${label} must be at least ${min} characters',
            max: '${label} cannot exceed ${max} characters',
        },
        number: {
            min: '${label} must be at least ${min}',
            max: '${label} cannot exceed ${max}',
        },
        pattern: {
            mismatch: '${label} format is invalid',
        },
    },
};

/**
 * Convert JSON theme config to Ant Design theme
 * @param {Object} themeConfig - Theme configuration from JSON
 * @returns {Object} Ant Design theme object
 */
export const createAntdTheme = (themeConfig = {}) => {
    const {
        primaryColor = defaultTheme.primaryColor,
        errorColor,
        warningColor,
        successColor,
        infoColor,
        borderRadius,
        fontSize,
        fontFamily,
    } = themeConfig;

    const theme = {
        token: {
            colorPrimary: primaryColor,
        },
    };

    // Add optional colors
    if (errorColor) theme.token.colorError = errorColor;
    if (warningColor) theme.token.colorWarning = warningColor;
    if (successColor) theme.token.colorSuccess = successColor;
    if (infoColor) theme.token.colorInfo = infoColor;
    if (borderRadius) theme.token.borderRadius = borderRadius;
    if (fontSize) theme.token.fontSize = fontSize;
    if (fontFamily) theme.token.fontFamily = fontFamily;

    return theme;
};

/**
 * Convert JSON form config to Ant Design Form props
 * @param {Object} themeConfig - Theme configuration from JSON
 * @returns {Object} Ant Design Form props
 */
export const createFormConfig = (themeConfig = {}) => {
    const {
        size = defaultTheme.size,
        labelAlign = defaultTheme.labelAlign,
        labelCol = defaultTheme.labelCol,
        wrapperCol = defaultTheme.wrapperCol,
        colon = defaultTheme.colon,
        layout = defaultTheme.layout,
        requiredMark = defaultTheme.requiredMark,
        validateMessages = defaultTheme.validateMessages,
    } = themeConfig;

    return {
        size,
        labelAlign,
        labelCol,
        wrapperCol,
        colon,
        layout,
        requiredMark,
        validateMessages,
    };
};

/**
 * Get responsive column configuration
 * @param {Object} layoutConfig - Layout configuration
 * @returns {Object} Responsive column config
 */
export const getResponsiveColumns = (layoutConfig = {}) => {
    const { columns = 1, gutter = 16 } = layoutConfig;

    // Default responsive breakpoints
    const responsiveConfig = {
        xs: 1, // < 576px
        sm: Math.min(columns, 1), // ≥ 576px
        md: Math.min(columns, 2), // ≥ 768px
        lg: Math.min(columns, 3), // ≥ 992px
        xl: Math.min(columns, 4), // ≥ 1200px
        xxl: columns, // ≥ 1600px
    };

    return {
        gutter: [gutter, gutter],
        ...responsiveConfig,
    };
};

/**
 * Create CSS variables from theme config
 * @param {Object} themeConfig - Theme configuration
 * @returns {Object} CSS variables object
 */
export const createCssVariables = (themeConfig = {}) => {
    const variables = {};

    if (themeConfig.primaryColor) {
        variables['--primary-color'] = themeConfig.primaryColor;
    }

    if (themeConfig.errorColor) {
        variables['--error-color'] = themeConfig.errorColor;
    }

    if (themeConfig.warningColor) {
        variables['--warning-color'] = themeConfig.warningColor;
    }

    if (themeConfig.successColor) {
        variables['--success-color'] = themeConfig.successColor;
    }

    if (themeConfig.fontSize) {
        variables['--font-size'] = themeConfig.fontSize;
    }

    if (themeConfig.fontFamily) {
        variables['--font-family'] = themeConfig.fontFamily;
    }

    if (themeConfig.borderRadius) {
        variables['--border-radius'] = themeConfig.borderRadius;
    }

    return variables;
};

/**
 * Apply CSS variables to document root
 * @param {Object} variables - CSS variables object
 */
export const applyCssVariables = (variables) => {
    const root = document.documentElement;
    Object.entries(variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });
};

/**
 * Size configurations for different components
 */
export const SIZE_CONFIG = {
    small: {
        inputHeight: 24,
        fontSize: 12,
        padding: '4px 8px',
        buttonHeight: 24,
    },
    middle: {
        inputHeight: 32,
        fontSize: 14,
        padding: '6px 12px',
        buttonHeight: 32,
    },
    large: {
        inputHeight: 40,
        fontSize: 16,
        padding: '8px 16px',
        buttonHeight: 40,
    },
};

/**
 * Get size configuration
 * @param {string} size - Size name (small, middle, large)
 * @returns {Object} Size configuration
 */
export const getSizeConfig = (size = 'middle') => {
    return SIZE_CONFIG[size] || SIZE_CONFIG.middle;
};

/**
 * Layout breakpoints
 */
export const BREAKPOINTS = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
};

/**
 * Get current breakpoint based on window width
 * @param {number} width - Window width
 * @returns {string} Current breakpoint
 */
export const getCurrentBreakpoint = (width) => {
    if (width >= BREAKPOINTS.xxl) return 'xxl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
};

/**
 * Custom theme presets
 */
export const THEME_PRESETS = {
    default: {
        primaryColor: '#1677ff',
        size: 'middle',
        labelAlign: 'right',
    },
    compact: {
        primaryColor: '#1677ff',
        size: 'small',
        labelAlign: 'top',
        labelCol: { span: 24 },
        wrapperCol: { span: 24 },
    },
    spacious: {
        primaryColor: '#1677ff',
        size: 'large',
        labelAlign: 'left',
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
    },
    dark: {
        primaryColor: '#177ddc',
        backgroundColor: '#141414',
        textColor: '#ffffff',
        size: 'middle',
    },
};

/**
 * Get theme preset
 * @param {string} presetName - Preset name
 * @returns {Object} Theme configuration
 */
export const getThemePreset = (presetName) => {
    return THEME_PRESETS[presetName] || THEME_PRESETS.default;
};
