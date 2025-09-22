import {
    hasRoleAccess,
    isRoleDenied,
    isRoleVisible,
    filterConfigByRole,
    USER_ROLES,
    ROLE_LEVELS
} from '../lib/roles';
describe('Role-based Access Control', () => {
    describe('hasRoleAccess', () => {
        test('should allow access for exact role match', () => {
            expect(hasRoleAccess(USER_ROLES.USER, USER_ROLES.USER)).toBe(true);
            expect(hasRoleAccess(USER_ROLES.ADMIN, USER_ROLES.ADMIN)).toBe(true);
        });
        test('should allow hierarchical access', () => {
            expect(hasRoleAccess(USER_ROLES.ADMIN, USER_ROLES.USER)).toBe(true);
            expect(hasRoleAccess(USER_ROLES.SALES, USER_ROLES.USER)).toBe(true);
            expect(hasRoleAccess(USER_ROLES.USER, USER_ROLES.ADMIN)).toBe(false);
        });
        test('should handle array of required roles', () => {
            expect(hasRoleAccess(USER_ROLES.SALES, [USER_ROLES.SALES, USER_ROLES.ADMIN])).toBe(true);
            expect(hasRoleAccess(USER_ROLES.USER, [USER_ROLES.SALES, USER_ROLES.ADMIN])).toBe(false);
        });
        test('should handle non-hierarchical mode', () => {
            expect(hasRoleAccess(USER_ROLES.ADMIN, USER_ROLES.USER, false)).toBe(false);
            expect(hasRoleAccess(USER_ROLES.USER, USER_ROLES.USER, false)).toBe(true);
        });
    });
    describe('isRoleDenied', () => {
        test('should deny access for denied roles', () => {
            expect(isRoleDenied(USER_ROLES.GUEST, USER_ROLES.GUEST)).toBe(true);
            expect(isRoleDenied(USER_ROLES.USER, USER_ROLES.GUEST)).toBe(false);
        });
        test('should handle array of denied roles', () => {
            expect(isRoleDenied(USER_ROLES.GUEST, [USER_ROLES.GUEST, USER_ROLES.USER])).toBe(true);
            expect(isRoleDenied(USER_ROLES.ADMIN, [USER_ROLES.GUEST, USER_ROLES.USER])).toBe(false);
        });
    });
    describe('isRoleVisible', () => {
        test('should be visible when no role restrictions', () => {
            const element = { type: 'text', name: 'test' };
            expect(isRoleVisible(USER_ROLES.USER, element)).toBe(true);
        });
        test('should respect allowedRoles', () => {
            const element = {
                type: 'text',
                name: 'test',
                allowedRoles: [USER_ROLES.ADMIN]
            };
            expect(isRoleVisible(USER_ROLES.ADMIN, element)).toBe(true);
            expect(isRoleVisible(USER_ROLES.USER, element)).toBe(false);
        });
        test('should respect deniedRoles', () => {
            const element = {
                type: 'text',
                name: 'test',
                deniedRoles: [USER_ROLES.GUEST]
            };
            expect(isRoleVisible(USER_ROLES.GUEST, element)).toBe(false);
            expect(isRoleVisible(USER_ROLES.USER, element)).toBe(true);
        });
        test('should respect minRole', () => {
            const element = {
                type: 'text',
                name: 'test',
                minRole: USER_ROLES.SALES
            };
            expect(isRoleVisible(USER_ROLES.ADMIN, element)).toBe(true);
            expect(isRoleVisible(USER_ROLES.SALES, element)).toBe(true);
            expect(isRoleVisible(USER_ROLES.USER, element)).toBe(false);
        });
        test('should respect maxRole', () => {
            const element = {
                type: 'text',
                name: 'test',
                maxRole: USER_ROLES.SALES
            };
            expect(isRoleVisible(USER_ROLES.USER, element)).toBe(true);
            expect(isRoleVisible(USER_ROLES.SALES, element)).toBe(true);
            expect(isRoleVisible(USER_ROLES.ADMIN, element)).toBe(false);
        });
    });
    describe('filterConfigByRole', () => {
        const testConfig = {
            meta: { title: 'Test Form' },
            steps: [
                {
                    id: 'step1',
                    title: 'Public Step',
                    fields: [
                        { type: 'text', name: 'public', label: 'Public Field' },
                        {
                            type: 'text',
                            name: 'admin',
                            label: 'Admin Field',
                            allowedRoles: [USER_ROLES.ADMIN]
                        }
                    ]
                },
                {
                    id: 'step2',
                    title: 'Admin Step',
                    allowedRoles: [USER_ROLES.ADMIN],
                    fields: [
                        { type: 'text', name: 'secret', label: 'Secret Field' }
                    ]
                }
            ]
        };
        test('should filter steps based on role', () => {
            const userConfig = filterConfigByRole(testConfig, USER_ROLES.USER);
            expect(userConfig.steps).toHaveLength(1);
            expect(userConfig.steps[0].id).toBe('step1');
        });
        test('should filter fields within steps', () => {
            const userConfig = filterConfigByRole(testConfig, USER_ROLES.USER);
            expect(userConfig.steps[0].fields).toHaveLength(1);
            expect(userConfig.steps[0].fields[0].name).toBe('public');
        });
        test('should keep all content for admin', () => {
            const adminConfig = filterConfigByRole(testConfig, USER_ROLES.ADMIN);
            expect(adminConfig.steps).toHaveLength(2);
            expect(adminConfig.steps[0].fields).toHaveLength(2);
        });
        test('should handle null config gracefully', () => {
            expect(filterConfigByRole(null, USER_ROLES.USER)).toBeNull();
            expect(filterConfigByRole(testConfig, null)).toBe(testConfig);
        });
    });
    describe('Role hierarchy levels', () => {
        test('should have correct hierarchy levels', () => {
            expect(ROLE_LEVELS[USER_ROLES.GUEST]).toBeLessThan(ROLE_LEVELS[USER_ROLES.USER]);
            expect(ROLE_LEVELS[USER_ROLES.USER]).toBeLessThan(ROLE_LEVELS[USER_ROLES.SALES]);
            expect(ROLE_LEVELS[USER_ROLES.SALES]).toBeLessThan(ROLE_LEVELS[USER_ROLES.ADMIN]);
        });
    });
});
