# React JSON Form Renderer

A production-ready React application that renders multi-step UIs (forms, tabs, lists, tables, and buttons) from JSON configuration of any nesting depth.

## Features

- 🚀 **Production Ready** - Built with Create React App (JavaScript template)
- 📝 **Dynamic Forms** - Render complex multi-step forms from JSON configuration
- 🎯 **Field Types** - 14+ field types including text, number, select, date, arrays, tables
- 🔧 **Conditional Logic** - Show/hide, enable/disable, require fields based on conditions
- 🧮 **Computed Fields** - Auto-calculated fields with expression evaluation
- 📊 **Tables & Arrays** - Editable tables and dynamic arrays with validation
- 🎨 **Theming** - Ant Design integration with customizable themes
- 🧪 **Playground** - Interactive JSON editor with live preview
- ✅ **Validation** - Yup schema validation with custom rules
- 📱 **Responsive** - Mobile-first design that works on all devices

## Tech Stack

- **React 18** - Modern React with hooks
- **Formik** - Form state management
- **Yup** - Schema validation
- **Ant Design** - UI component library
- **Monaco Editor** - Code editor for JSON playground
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **expr-eval** - Expression evaluation for computed fields

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser** to `http://localhost:3000`

### Available Scripts

- `npm start` - Development server
- `npm build` - Production build
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Project Structure

```
src/
├── index.js                     # Application entry point
├── App.jsx                      # Main app with routing
├── app/
│   └── routes.jsx              # Route configuration
├── pages/
│   ├── Playground.jsx          # JSON editor + live preview
│   └── Preview.jsx             # Sample form previews
├── components/
│   ├── JsonFormRenderer/       # Core form renderer
│   │   ├── JsonFormRenderer.jsx
│   │   ├── StepWizard.jsx
│   │   ├── TabContainer.jsx
│   │   ├── Section.jsx
│   │   ├── FieldRenderer.jsx
│   │   ├── ArrayField.jsx
│   │   ├── TableRenderer.jsx
│   │   └── ActionsBar.jsx
│   └── Fields/                 # Field components
│       ├── TextField.jsx
│       ├── SelectField.jsx
│       ├── DateField.jsx
│       └── ... (14+ field types)
├── lib/                        # Core utilities
│   ├── validation.js           # JSON → Yup schema
│   ├── conditions.js           # Conditional logic
│   ├── registry.js             # Field type registry
│   ├── api.js                  # API client
│   ├── theming.js              # Theme utilities
│   └── utils.js                # Helper functions
├── config/                     # Sample configurations
│   ├── sample.basic.json
│   └── sample.advanced.json
├── styles/
│   └── index.css               # Global styles
└── tests/                      # Test files
    ├── validation.test.js
    ├── conditions.test.js
    └── renderer.test.jsx
```

## Usage

### Basic Form Configuration

```json
{
  "meta": { "title": "Contact Form" },
  "theme": {
    "primaryColor": "#1677ff",
    "size": "middle"
  },
  "steps": [
    {
      "id": "contact",
      "title": "Contact Information",
      "fields": [
        {
          "type": "text",
          "name": "firstName",
          "label": "First Name",
          "required": true
        },
        {
          "type": "text",
          "name": "email",
          "label": "Email",
          "validation": { "email": true }
        }
      ],
      "actions": [
        { "type": "submit", "label": "Submit" }
      ]
    }
  ]
}
```

### Advanced Features

#### Conditional Logic
```json
{
  "type": "text",
  "name": "email",
  "label": "Email",
  "visibleWhen": [
    { "op": "truthy", "left": "wantsNewsletter" }
  ]
}
```

#### Computed Fields
```json
{
  "type": "text",
  "name": "total",
  "label": "Total",
  "computed": {
    "expr": "price * quantity",
    "deps": ["price", "quantity"],
    "readOnly": true
  }
}
```

#### Dynamic Arrays
```json
{
  "type": "array",
  "name": "items",
  "itemLabel": "Item",
  "itemSchema": {
    "fields": [
      { "type": "text", "name": "name", "label": "Name" },
      { "type": "number", "name": "price", "label": "Price" }
    ]
  }
}
```

#### Editable Tables
```json
{
  "type": "table",
  "name": "products",
  "editable": true,
  "columns": [
    { "key": "name", "title": "Name", "type": "text" },
    { "key": "price", "title": "Price", "type": "number" }
  ]
}
```

## Field Types

| Type | Description | Features |
|------|-------------|----------|
| `text` | Text input | Variants: password, search |
| `textarea` | Multi-line text | Auto-resize, character count |
| `number` | Numeric input | Min/max, step, formatting |
| `select` | Dropdown select | Static/API options, search |
| `radio` | Radio buttons | Horizontal/vertical, button style |
| `checkbox` | Checkboxes | Single or group |
| `switch` | Toggle switch | Custom labels |
| `date` | Date picker | Various modes, min/max |
| `time` | Time picker | 12/24 hour, step intervals |
| `datetime` | Date + time | Combined picker |
| `slider` | Range slider | Marks, dual range, input |
| `color` | Color picker | Presets, hex input |
| `upload` | File upload | Drag & drop, validation |
| `richtext` | Rich text editor | Toolbar, formatting |
| `array` | Dynamic arrays | Add/remove items |
| `table` | Editable tables | CRUD operations |

## API Integration

### Dynamic Options
```json
{
  "type": "select",
  "name": "country",
  "options": {
    "source": "api",
    "api": {
      "url": "/api/countries",
      "valueKey": "code",
      "labelKey": "name"
    }
  }
}
```

### Custom Actions
```json
{
  "type": "custom",
  "label": "Save Draft",
  "action": "apiCall",
  "api": {
    "url": "/api/drafts",
    "method": "POST"
  }
}
```

## Testing

Run the test suite:
```bash
npm test
```

Test coverage includes:
- Validation schema generation
- Conditional logic evaluation
- Form rendering and interaction
- Field components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

