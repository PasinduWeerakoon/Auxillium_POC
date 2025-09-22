export const USER_ROLES = {
    ADMIN: 'admin',
    SALES: 'sales',
    USER: 'user',
    GUEST: 'guest'
};
export const ROLE_LEVELS = {
    [USER_ROLES.GUEST]: 1,
    [USER_ROLES.USER]: 2,
    [USER_ROLES.SALES]: 3,
    [USER_ROLES.ADMIN]: 4,
};
export const hasRoleAccess = (userRole, requiredRoles, hierarchical = true) => {
    if (!requiredRoles) return true;
    if (!userRole) return false;
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const userLevel = ROLE_LEVELS[userRole] || 0;
    return roles.some(role => {
        const requiredLevel = ROLE_LEVELS[role] || 0;
        if (hierarchical) {
            return userLevel >= requiredLevel;
        } else {
            return userRole === role;
        }
    });
};
export const isRoleDenied = (userRole, deniedRoles) => {
    if (!deniedRoles || !userRole) return false;
    const roles = Array.isArray(deniedRoles) ? deniedRoles : [deniedRoles];
    return roles.includes(userRole);
};
export const isRoleVisible = (userRole, element) => {
    if (!element) return true;
    const {
        allowedRoles,
        deniedRoles,
        minRole,
        maxRole,
        roleHierarchical = true
    } = element;
    if (deniedRoles && isRoleDenied(userRole, deniedRoles)) {
        return false;
    }
    if (allowedRoles && !hasRoleAccess(userRole, allowedRoles, roleHierarchical)) {
        return false;
    }
    if (minRole && !hasRoleAccess(userRole, minRole, true)) {
        return false;
    }
    if (maxRole) {
        const userLevel = ROLE_LEVELS[userRole] || 0;
        const maxLevel = ROLE_LEVELS[maxRole] || 999;
        if (userLevel > maxLevel) {
            return false;
        }
    }
    return true;
};
export const getRoleDisplayName = (role) => {
    const displayNames = {
        [USER_ROLES.ADMIN]: 'Administrator',
        [USER_ROLES.SALES]: 'Sales Representative',
        [USER_ROLES.USER]: 'Regular User',
        [USER_ROLES.GUEST]: 'Guest User',
    };
    return displayNames[role] || role;
};
export const getAvailableRoles = () => {
    return Object.values(USER_ROLES).map(role => ({
        value: role,
        label: getRoleDisplayName(role),
        level: ROLE_LEVELS[role] || 0
    })).sort((a, b) => b.level - a.level); 
};
export const filterConfigByRole = (config, userRole) => {
    if (!config || !userRole) return config;
    const filteredConfig = { ...config };
    if (filteredConfig.steps) {
        filteredConfig.steps = filteredConfig.steps
            .filter(step => isRoleVisible(userRole, step))
            .map(step => filterStepByRole(step, userRole));
    }
    return filteredConfig;
};
const filterStepByRole = (step, userRole) => {
    const filteredStep = { ...step };
    if (filteredStep.tabs) {
        filteredStep.tabs = filteredStep.tabs
            .filter(tab => isRoleVisible(userRole, tab))
            .map(tab => filterTabByRole(tab, userRole));
    }
    if (filteredStep.sections) {
        filteredStep.sections = filteredStep.sections
            .filter(section => isRoleVisible(userRole, section))
            .map(section => filterSectionByRole(section, userRole));
    }
    if (filteredStep.fields) {
        filteredStep.fields = filteredStep.fields
            .filter(field => isRoleVisible(userRole, field))
            .map(field => filterFieldByRole(field, userRole));
    }
    return filteredStep;
};
const filterTabByRole = (tab, userRole) => {
    const filteredTab = { ...tab };
    if (filteredTab.sections) {
        filteredTab.sections = filteredTab.sections
            .filter(section => isRoleVisible(userRole, section))
            .map(section => filterSectionByRole(section, userRole));
    }
    if (filteredTab.fields) {
        filteredTab.fields = filteredTab.fields
            .filter(field => isRoleVisible(userRole, field))
            .map(field => filterFieldByRole(field, userRole));
    }
    return filteredTab;
};
const filterSectionByRole = (section, userRole) => {
    const filteredSection = { ...section };
    if (filteredSection.fields) {
        filteredSection.fields = filteredSection.fields
            .filter(field => isRoleVisible(userRole, field))
            .map(field => filterFieldByRole(field, userRole));
    }
    return filteredSection;
};
const filterFieldByRole = (field, userRole) => {
    const filteredField = { ...field };
    if (filteredField.fields) {
        filteredField.fields = filteredField.fields
            .filter(subField => isRoleVisible(userRole, subField))
            .map(subField => filterFieldByRole(subField, userRole));
    }
    if (filteredField.itemSchema && filteredField.itemSchema.fields) {
        filteredField.itemSchema.fields = filteredField.itemSchema.fields
            .filter(subField => isRoleVisible(userRole, subField))
            .map(subField => filterFieldByRole(subField, userRole));
    }
    if (filteredField.columns) {
        filteredField.columns = filteredField.columns
            .filter(column => isRoleVisible(userRole, column));
    }
    return filteredField;
};
