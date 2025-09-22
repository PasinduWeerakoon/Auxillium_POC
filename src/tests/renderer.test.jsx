import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import JsonFormRenderer from '../components/JsonFormRenderer';
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ onChange, value }) => (
    <textarea 
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  ),
}));
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    request: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));
const TestWrapper = ({ children }) => (
  <ConfigProvider>
    {children}
  </ConfigProvider>
);
describe('JsonFormRenderer', () => {
  const basicConfig = {
    meta: { title: 'Test Form' },
    steps: [
      {
        id: 'step1',
        title: 'Step 1',
        fields: [
          {
            type: 'text',
            name: 'firstName',
            label: 'First Name',
            required: true
          },
          {
            type: 'text',
            name: 'lastName',
            label: 'Last Name',
            required: true
          }
        ],
        actions: [
          {
            id: 'submit',
            type: 'submit',
            label: 'Submit'
          }
        ]
      }
    ],
    initialValues: {
      firstName: '',
      lastName: ''
    }
  };
  it('should render form with basic fields', () => {
    render(
      <TestWrapper>
        <JsonFormRenderer config={basicConfig} />
      </TestWrapper>
    );
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
  it('should handle form input changes', async () => {
    render(
      <TestWrapper>
        <JsonFormRenderer config={basicConfig} />
      </TestWrapper>
    );
    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    expect(firstNameInput.value).toBe('John');
    expect(lastNameInput.value).toBe('Doe');
  });
  it('should show validation errors for required fields', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <TestWrapper>
        <JsonFormRenderer config={basicConfig} onSubmit={mockOnSubmit} />
      </TestWrapper>
    );
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('First Name is required')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  it('should submit form with valid data', async () => {
    const mockOnSubmit = jest.fn();
    render(
      <TestWrapper>
        <JsonFormRenderer config={basicConfig} onSubmit={mockOnSubmit} />
      </TestWrapper>
    );
    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe'
        })
      );
    });
  });
  it('should handle multi-step forms', () => {
    const multiStepConfig = {
      ...basicConfig,
      steps: [
        {
          id: 'step1',
          title: 'Personal Info',
          fields: [
            {
              type: 'text',
              name: 'firstName',
              label: 'First Name',
              required: true
            }
          ],
          actions: [
            {
              id: 'next',
              type: 'next',
              label: 'Next'
            }
          ]
        },
        {
          id: 'step2',
          title: 'Contact Info',
          fields: [
            {
              type: 'text',
              name: 'email',
              label: 'Email',
              required: true
            }
          ],
          actions: [
            {
              id: 'prev',
              type: 'prev',
              label: 'Previous'
            },
            {
              id: 'submit',
              type: 'submit',
              label: 'Submit'
            }
          ]
        }
      ]
    };
    render(
      <TestWrapper>
        <JsonFormRenderer config={multiStepConfig} />
      </TestWrapper>
    );
    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });
  it('should handle conditional field visibility', () => {
    const conditionalConfig = {
      ...basicConfig,
      steps: [
        {
          id: 'step1',
          title: 'Conditional Fields',
          fields: [
            {
              type: 'switch',
              name: 'hasEmail',
              label: 'Has Email'
            },
            {
              type: 'text',
              name: 'email',
              label: 'Email',
              visibleWhen: [
                {
                  op: 'truthy',
                  left: 'hasEmail'
                }
              ]
            }
          ],
          actions: [
            {
              id: 'submit',
              type: 'submit',
              label: 'Submit'
            }
          ]
        }
      ],
      initialValues: {
        hasEmail: false
      }
    };
    render(
      <TestWrapper>
        <JsonFormRenderer config={conditionalConfig} />
      </TestWrapper>
    );
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
  it('should handle invalid configuration gracefully', () => {
    const invalidConfig = {};
    render(
      <TestWrapper>
        <JsonFormRenderer config={invalidConfig} />
      </TestWrapper>
    );
    expect(screen.getByText('Invalid configuration: No steps defined')).toBeInTheDocument();
  });
});
