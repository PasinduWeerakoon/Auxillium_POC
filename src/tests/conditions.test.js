import {
    isVisible,
    isEnabled,
    isRequired,
    evaluateConditions,
    evaluateCondition,
    evaluateComputed
} from '../lib/conditions';
describe('Conditions Utils', () => {
    const mockFormValues = {
        user: {
            name: 'John',
            age: 25,
            active: true,
            country: 'US'
        },
        settings: {
            notifications: false
        }
    };
    describe('evaluateCondition', () => {
        it('should evaluate equality condition', () => {
            const condition = { op: 'eq', left: 'user.name', right: 'John' };
            expect(evaluateCondition(condition, mockFormValues)).toBe(true);
            const falseCondition = { op: 'eq', left: 'user.name', right: 'Jane' };
            expect(evaluateCondition(falseCondition, mockFormValues)).toBe(false);
        });
        it('should evaluate truthy condition', () => {
            const condition = { op: 'truthy', left: 'user.active' };
            expect(evaluateCondition(condition, mockFormValues)).toBe(true);
            const falseCondition = { op: 'truthy', left: 'settings.notifications' };
            expect(evaluateCondition(falseCondition, mockFormValues)).toBe(false);
        });
        it('should evaluate greater than condition', () => {
            const condition = { op: 'gt', left: 'user.age', right: 20 };
            expect(evaluateCondition(condition, mockFormValues)).toBe(true);
            const falseCondition = { op: 'gt', left: 'user.age', right: 30 };
            expect(evaluateCondition(falseCondition, mockFormValues)).toBe(false);
        });
        it('should evaluate in condition', () => {
            const condition = { op: 'in', left: 'user.country', right: ['US', 'CA', 'UK'] };
            expect(evaluateCondition(condition, mockFormValues)).toBe(true);
            const falseCondition = { op: 'in', left: 'user.country', right: ['DE', 'FR'] };
            expect(evaluateCondition(falseCondition, mockFormValues)).toBe(false);
        });
        it('should evaluate empty condition', () => {
            const values = { empty: '', notEmpty: 'value' };
            const emptyCondition = { op: 'empty', left: 'empty' };
            expect(evaluateCondition(emptyCondition, values)).toBe(true);
            const notEmptyCondition = { op: 'empty', left: 'notEmpty' };
            expect(evaluateCondition(notEmptyCondition, values)).toBe(false);
        });
        it('should handle JavaScript expressions', () => {
            const condition = { js: 'user.age > 18 and user.active' };
            expect(evaluateCondition(condition, mockFormValues)).toBe(true);
            const falseCondition = { js: 'user.age < 18' };
            expect(evaluateCondition(falseCondition, mockFormValues)).toBe(false);
        });
    });
    describe('evaluateConditions', () => {
        it('should evaluate multiple conditions with AND logic', () => {
            const conditions = [
                { op: 'eq', left: 'user.name', right: 'John' },
                { op: 'gt', left: 'user.age', right: 18 },
                { op: 'truthy', left: 'user.active' }
            ];
            expect(evaluateConditions(conditions, mockFormValues)).toBe(true);
            conditions.push({ op: 'eq', left: 'user.country', right: 'CA' });
            expect(evaluateConditions(conditions, mockFormValues)).toBe(false);
        });
        it('should return true for empty conditions array', () => {
            expect(evaluateConditions([], mockFormValues)).toBe(true);
        });
        it('should return false for non-array conditions', () => {
            expect(evaluateConditions(null, mockFormValues)).toBe(false);
            expect(evaluateConditions('string', mockFormValues)).toBe(false);
        });
    });
    describe('field visibility functions', () => {
        it('should evaluate field visibility', () => {
            const visibleField = {
                name: 'email',
                visibleWhen: [{ op: 'truthy', left: 'user.active' }]
            };
            expect(isVisible(mockFormValues, visibleField)).toBe(true);
            const hiddenField = {
                name: 'phone',
                visibleWhen: [{ op: 'truthy', left: 'settings.notifications' }]
            };
            expect(isVisible(mockFormValues, hiddenField)).toBe(false);
        });
        it('should default to visible when no visibleWhen condition', () => {
            const field = { name: 'always-visible' };
            expect(isVisible(mockFormValues, field)).toBe(true);
        });
        it('should evaluate field enabled state', () => {
            const enabledField = {
                name: 'submit',
                enabledWhen: [{ op: 'truthy', left: 'user.active' }]
            };
            expect(isEnabled(mockFormValues, enabledField)).toBe(true);
            const disabledField = {
                name: 'restricted',
                enabledWhen: [{ op: 'eq', left: 'user.country', right: 'ADMIN' }]
            };
            expect(isEnabled(mockFormValues, disabledField)).toBe(false);
        });
        it('should evaluate field required state', () => {
            const requiredField = {
                name: 'email',
                required: true
            };
            expect(isRequired(mockFormValues, requiredField)).toBe(true);
            const conditionallyRequiredField = {
                name: 'phone',
                requiredWhen: [{ op: 'truthy', left: 'user.active' }]
            };
            expect(isRequired(mockFormValues, conditionallyRequiredField)).toBe(true);
            const notRequiredField = {
                name: 'optional'
            };
            expect(isRequired(mockFormValues, notRequiredField)).toBe(false);
        });
    });
    describe('evaluateComputed', () => {
        it('should evaluate computed expressions', () => {
            const computed = {
                expr: 'user.age * 2',
                deps: ['user.age']
            };
            const result = evaluateComputed(computed, mockFormValues);
            expect(result).toBe(50);
        });
        it('should handle complex expressions', () => {
            const computed = {
                expr: 'user.active ? user.age + 10 : 0',
                deps: ['user.active', 'user.age']
            };
            const result = evaluateComputed(computed, mockFormValues);
            expect(result).toBe(35);
        });
        it('should return undefined for invalid expressions', () => {
            const computed = {
                expr: 'invalid.expression.syntax',
                deps: ['user.age']
            };
            const result = evaluateComputed(computed, mockFormValues);
            expect(result).toBeUndefined();
        });
        it('should handle missing dependencies gracefully', () => {
            const computed = {
                expr: '5',
                deps: ['missing']
            };
            const result = evaluateComputed(computed, {});
            expect(result).toBe(5);
        });
    });
});
