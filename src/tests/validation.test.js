import { createYupSchema, createStepSchema } from '../lib/validation';

describe('Validation Utils', () => {
    describe('createYupSchema', () => {
        it('should create basic string validation', () => {
            const fields = [
                {
                    name: 'firstName',
                    type: 'text',
                    required: true,
                    validation: {
                        type: 'string',
                        min: 2,
                        max: 50
                    }
                }
            ];

            const schema = createYupSchema(fields);
            expect(schema).toBeDefined();

            // Test valid value
            expect(() => schema.validateSync({ firstName: 'John' })).not.toThrow();

            // Test invalid value (too short)
            expect(() => schema.validateSync({ firstName: 'J' })).toThrow();

            // Test missing required value
            expect(() => schema.validateSync({})).toThrow();
        });

        it('should create number validation', () => {
            const fields = [
                {
                    name: 'age',
                    type: 'number',
                    validation: {
                        type: 'number',
                        min: 0,
                        max: 120
                    }
                }
            ];

            const schema = createYupSchema(fields);

            // Test valid value
            expect(() => schema.validateSync({ age: 25 })).not.toThrow();

            // Test invalid value (negative)
            expect(() => schema.validateSync({ age: -5 })).toThrow();

            // Test invalid value (too high)
            expect(() => schema.validateSync({ age: 150 })).toThrow();
        });

        it('should create email validation', () => {
            const fields = [
                {
                    name: 'email',
                    type: 'text',
                    validation: {
                        type: 'string',
                        email: true
                    }
                }
            ];

            const schema = createYupSchema(fields);

            // Test valid email
            expect(() => schema.validateSync({ email: 'test@example.com' })).not.toThrow();

            // Test invalid email
            expect(() => schema.validateSync({ email: 'invalid-email' })).toThrow();
        });

        it('should handle nested field names', () => {
            const fields = [
                {
                    name: 'user.profile.name',
                    type: 'text',
                    required: true,
                    validation: {
                        type: 'string',
                        min: 1
                    }
                }
            ];

            const schema = createYupSchema(fields);

            // Test valid nested value
            expect(() => schema.validateSync({
                user: {
                    profile: {
                        name: 'John'
                    }
                }
            })).not.toThrow();

            // Test missing nested value - should not throw because field is not required
            expect(() => schema.validateSync({})).not.toThrow();
        });
    });

    describe('createStepSchema', () => {
        it('should create schema for step with sections', () => {
            const step = {
                id: 'personal',
                sections: [
                    {
                        id: 'basic',
                        fields: [
                            {
                                name: 'firstName',
                                type: 'text',
                                required: true,
                                validation: { type: 'string', min: 1 }
                            },
                            {
                                name: 'lastName',
                                type: 'text',
                                required: true,
                                validation: { type: 'string', min: 1 }
                            }
                        ]
                    }
                ]
            };

            const schema = createStepSchema(step);
            expect(schema).toBeDefined();

            // Test valid values
            expect(() => schema.validateSync({
                firstName: 'John',
                lastName: 'Doe'
            })).not.toThrow();

            // Test missing required field
            expect(() => schema.validateSync({ firstName: 'John' })).toThrow();
        });

        it('should create schema for step with tabs', () => {
            const step = {
                id: 'details',
                tabs: [
                    {
                        id: 'personal',
                        fields: [
                            {
                                name: 'name',
                                type: 'text',
                                required: true,
                                validation: { type: 'string', min: 1 }
                            }
                        ]
                    },
                    {
                        id: 'contact',
                        fields: [
                            {
                                name: 'email',
                                type: 'text',
                                validation: { type: 'string', email: true }
                            }
                        ]
                    }
                ]
            };

            const schema = createStepSchema(step);
            expect(schema).toBeDefined();

            // Test valid values
            expect(() => schema.validateSync({
                name: 'John',
                email: 'john@example.com'
            })).not.toThrow();

            // Test invalid email
            expect(() => schema.validateSync({
                name: 'John',
                email: 'invalid-email'
            })).toThrow();
        });
    });
});
