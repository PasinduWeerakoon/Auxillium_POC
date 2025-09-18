/**
 * Role-based access control utilities
 */

/**
 * Default user roles hierarchy (higher level has access to lower levels)
 */
export const USER_ROLES = {
    ADMIN: 'admin',
    SALES: 'sales',
    USER: 'user',
    GUEST: 'guest'
};

/**
 * Role hierarchy levels (higher number = higher privileges)
 */
export const ROLE_LEVELS = {
    [USER_ROLES.GUEST]: 1,
    [USER_ROLES.USER]: 2,
    [USER_ROLES.SALES]: 3,
    [USER_ROLES.ADMIN]: 4,
};

/**
 * Check if user has required role access
 * @param {string} userRole - Current user's role
 * @param {string|Array} requiredRoles - Required role(s) for access
 * @param {boolean} hierarchical - Whether to use hierarchical role checking
 * @returns {boolean} True if user has access
 */
export const hasRoleAccess = (userRole, requiredRoles, hierarchical = true) => {
    if (!requiredRoles) return true;
    if (!userRole) return false;

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const userLevel = ROLE_LEVELS[userRole] || 0;

    return roles.some(role => {
        const requiredLevel = ROLE_LEVELS[role] || 0;

        if (hierarchical) {
            // Higher or equal level has access
            return userLevel >= requiredLevel;
        } else {
            // Exact role match only
            return userRole === role;
        }
    });
};

/**
 * Check if user role is denied access
 * @param {string} userRole - Current user's role
 * @param {string|Array} deniedRoles - Roles that are denied access
 * @returns {boolean} True if user is denied access
 */
export const isRoleDenied = (userRole, deniedRoles) => {
    if (!deniedRoles || !userRole) return false;

    const roles = Array.isArray(deniedRoles) ? deniedRoles : [deniedRoles];
    return roles.includes(userRole);
};

/**
 * Evaluate role-based visibility for a form element
 * @param {string} userRole - Current user's role
 * @param {Object} element - Form element (field, section, tab, step)
 * @returns {boolean} True if element should be visible to user
 */
export const isRoleVisible = (userRole, element) => {
    if (!element) return true;

    const {
        allowedRoles,
        deniedRoles,
        minRole,
        maxRole,
        roleHierarchical = true
    } = element;

    // Check denied roles first
    if (deniedRoles && isRoleDenied(userRole, deniedRoles)) {
        return false;
    }

    // Check allowed roles
    if (allowedRoles && !hasRoleAccess(userRole, allowedRoles, roleHierarchical)) {
        return false;
    }

    // Check minimum role requirement
    if (minRole && !hasRoleAccess(userRole, minRole, true)) {
        return false;
    }

    // Check maximum role restriction
    if (maxRole) {
        const userLevel = ROLE_LEVELS[userRole] || 0;
        const maxLevel = ROLE_LEVELS[maxRole] || 999;
        if (userLevel > maxLevel) {
            return false;
        }
    }

    return true;
};

/**
 * Get user-friendly role display name
 * @param {string} role - Role identifier
 * @returns {string} Display name for role
 */
export const getRoleDisplayName = (role) => {
    const displayNames = {
        [USER_ROLES.ADMIN]: 'Administrator',
        [USER_ROLES.SALES]: 'Sales Representative',
        [USER_ROLES.USER]: 'Regular User',
        [USER_ROLES.GUEST]: 'Guest User',
    };

    return displayNames[role] || role;
};

/**
 * Get all available roles for selection
 * @returns {Array} Array of role objects with value and label
 */
export const getAvailableRoles = () => {
    return Object.values(USER_ROLES).map(role => ({
        value: role,
        label: getRoleDisplayName(role),
        level: ROLE_LEVELS[role] || 0
    })).sort((a, b) => b.level - a.level); // Sort by level descending
};

/**
 * Filter form configuration based on user role
 * @param {Object} config - Form configuration
 * @param {string} userRole - Current user's role
 * @returns {Object} Filtered configuration
 */
export const filterConfigByRole = (config, userRole) => {
    if (!config || !userRole) return config;

    const filteredConfig = { ...config };

    // Filter steps
    if (filteredConfig.steps) {
        filteredConfig.steps = filteredConfig.steps
            .filter(step => isRoleVisible(userRole, step))
            .map(step => filterStepByRole(step, userRole));
    }

    return filteredConfig;
};

/**
 * Filter step configuration based on user role
 * @param {Object} step - Step configuration
 * @param {string} userRole - Current user's role
 * @returns {Object} Filtered step
 */
const filterStepByRole = (step, userRole) => {
    const filteredStep = { ...step };

    // Filter tabs
    if (filteredStep.tabs) {
        filteredStep.tabs = filteredStep.tabs
            .filter(tab => isRoleVisible(userRole, tab))
            .map(tab => filterTabByRole(tab, userRole));
    }

    // Filter sections
    if (filteredStep.sections) {
        filteredStep.sections = filteredStep.sections
            .filter(section => isRoleVisible(userRole, section))
            .map(section => filterSectionByRole(section, userRole));
    }

    // Filter direct fields
    if (filteredStep.fields) {
        filteredStep.fields = filteredStep.fields
            .filter(field => isRoleVisible(userRole, field))
            .map(field => filterFieldByRole(field, userRole));
    }

    return filteredStep;
};

/**
 * Filter tab configuration based on user role
 * @param {Object} tab - Tab configuration
 * @param {string} userRole - Current user's role
 * @returns {Object} Filtered tab
 */
const filterTabByRole = (tab, userRole) => {
    const filteredTab = { ...tab };

    // Filter sections within tab
    if (filteredTab.sections) {
        filteredTab.sections = filteredTab.sections
            .filter(section => isRoleVisible(userRole, section))
            .map(section => filterSectionByRole(section, userRole));
    }

    // Filter direct fields within tab
    if (filteredTab.fields) {
        filteredTab.fields = filteredTab.fields
            .filter(field => isRoleVisible(userRole, field))
            .map(field => filterFieldByRole(field, userRole));
    }

    return filteredTab;
};

/**
 * Filter section configuration based on user role
 * @param {Object} section - Section configuration
 * @param {string} userRole - Current user's role
 * @returns {Object} Filtered section
 */
const filterSectionByRole = (section, userRole) => {
    const filteredSection = { ...section };

    // Filter fields within section
    if (filteredSection.fields) {
        filteredSection.fields = filteredSection.fields
            .filter(field => isRoleVisible(userRole, field))
            .map(field => filterFieldByRole(field, userRole));
    }

    return filteredSection;
};

/**
 * Filter field configuration based on user role
 * @param {Object} field - Field configuration
 * @param {string} userRole - Current user's role
 * @returns {Object} Filtered field
 */
const filterFieldByRole = (field, userRole) => {
    const filteredField = { ...field };

    // Filter nested fields (for group fields)
    if (filteredField.fields) {
        filteredField.fields = filteredField.fields
            .filter(subField => isRoleVisible(userRole, subField))
            .map(subField => filterFieldByRole(subField, userRole));
    }

    // Filter array item schema fields
    if (filteredField.itemSchema && filteredField.itemSchema.fields) {
        filteredField.itemSchema.fields = filteredField.itemSchema.fields
            .filter(subField => isRoleVisible(userRole, subField))
            .map(subField => filterFieldByRole(subField, userRole));
    }

    // Filter table columns
    if (filteredField.columns) {
        filteredField.columns = filteredField.columns
            .filter(column => isRoleVisible(userRole, column));
    }

    return filteredField;
};


