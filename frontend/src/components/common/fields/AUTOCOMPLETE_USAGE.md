# Autocomplete Component

A reusable, searchable, paginated autocomplete field component that matches the design of Input and Select components.

## Features

- ✅ **Same Design** - Matches Input and Select styling exactly
- ✅ **Same Height** - Consistent padding and sizing
- ✅ **Searchable** - Debounced search (300ms)
- ✅ **Paginated** - Infinite scroll with lazy loading
- ✅ **Customizable** - Custom formatters and renderers
- ✅ **Modal-friendly** - Stays within modal boundaries
- ✅ **Accessible** - Built on MUI Autocomplete

## Basic Usage

```jsx
import Autocomplete from "../components/common/fields/Autocomplete";

function MyComponent() {
  const [selectedId, setSelectedId] = useState("");

  const fetchOptions = async ({ search, page, limit }) => {
    const response = await myService.getItems({ search, page, limit });
    return response;
  };

  return (
    <Autocomplete
      label="Select Item"
      placeholder="Search items..."
      value={selectedId}
      onChange={setSelectedId}
      fetchOptions={fetchOptions}
      required
    />
  );
}
```

## Props

| Prop               | Type           | Default            | Description                                    |
| ------------------ | -------------- | ------------------ | ---------------------------------------------- |
| `label`            | string         | -                  | Label for the field                            |
| `placeholder`      | string         | "Search..."        | Placeholder text                               |
| `value`            | string\|object | -                  | Selected value (ID or full object)             |
| `onChange`         | function       | -                  | Callback when selection changes                |
| `fetchOptions`     | function       | -                  | **Required** - Async function to fetch options |
| `fetchSingleItem`  | function       | -                  | Optional - Fetch single item by ID             |
| `getOptionLabel`   | function       | -                  | Format option label                            |
| `renderOption`     | function       | -                  | Custom render for options                      |
| `getOptionKey`     | function       | `(opt) => opt._id` | Get unique key from option                     |
| `required`         | boolean        | false              | Whether field is required                      |
| `disabled`         | boolean        | false              | Whether field is disabled                      |
| `pageSize`         | number         | 20                 | Items per page                                 |
| `returnFullObject` | boolean        | false              | Return full object or just ID                  |
| `noOptionsText`    | string         | "No options found" | Text when no options                           |
| `className`        | string         | ""                 | Additional CSS classes                         |

## Examples

### Example 1: User Autocomplete

```jsx
import Autocomplete from "../components/common/fields/Autocomplete";
import userService from "../services/userService";

function UserAutocomplete({ value, onChange }) {
  const fetchUsers = async ({ search, page, limit }) => {
    return await userService.getUsers({ search, page, limit });
  };

  const fetchSingleUser = async (id) => {
    return await userService.getUser(id);
  };

  const getOptionLabel = (user) => {
    return `${user.name} (${user.email})`;
  };

  const renderOption = (props, user) => (
    <Box component="li" {...props} key={user._id}>
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="body2"
          fontWeight={500}
          sx={{ fontSize: "0.875rem" }}
        >
          {user.name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "0.75rem" }}
        >
          {user.email} • {user.role}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Autocomplete
      label="Select User"
      placeholder="Search by name or email..."
      value={value}
      onChange={onChange}
      fetchOptions={fetchUsers}
      fetchSingleItem={fetchSingleUser}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      required
    />
  );
}
```

### Example 2: Product Autocomplete

```jsx
function ProductAutocomplete({ value, onChange }) {
  const fetchProducts = async ({ search, page, limit }) => {
    return await productService.getProducts({ search, page, limit });
  };

  return (
    <Autocomplete
      label="Select Product"
      placeholder="Search products..."
      value={value}
      onChange={onChange}
      fetchOptions={fetchProducts}
      getOptionLabel={(p) => `${p.name} - $${p.price}`}
      returnFullObject={true}
      pageSize={15}
    />
  );
}
```

### Example 3: Simple Category Autocomplete

```jsx
function CategoryAutocomplete({ value, onChange }) {
  const fetchCategories = async ({ search, page, limit }) => {
    return await categoryService.getCategories({ search, page, limit });
  };

  return (
    <Autocomplete
      label="Category"
      value={value}
      onChange={onChange}
      fetchOptions={fetchCategories}
      getOptionLabel={(cat) => cat.name}
    />
  );
}
```

## Design Consistency

The Autocomplete component matches the exact design of Input and Select:

```jsx
// All these have the same height and styling
<Input label="Name" value={name} onChange={setName} />
<Select label="Status" value={status} onChange={setStatus} options={["Active", "Inactive"]} />
<Autocomplete label="User" value={userId} onChange={setUserId} fetchOptions={fetchUsers} />
```

### Styling Details:

- **Height**: Same as Input/Select (`py-1.5 md:py-2`)
- **Border**: Gray (#d1d5db) with black focus
- **Border Radius**: 0.5rem (rounded-lg)
- **Focus Ring**: 2px black with shadow
- **Font Size**: 0.875rem (text-sm)
- **Padding**: 6px-12px (mobile), 8px-12px (desktop)

## Backend Requirements

Your backend API should support:

1. **Pagination**: `page` and `limit` query parameters
2. **Search**: `search` query parameter
3. **Response format**:
   ```json
   {
     "success": true,
     "data": [...],
     "pagination": {
       "total": 100,
       "page": 1,
       "pages": 5
     }
   }
   ```

## Pre-built Components

- **LeadAutocomplete** - Pre-configured for leads
- You can create similar specialized components for other entities

## Notes

- Server-side filtering for better performance
- Debounced search (300ms) to reduce API calls
- Infinite scroll loads more data when scrolling
- Dropdown stays within modal boundaries
- Works on mobile and desktop
