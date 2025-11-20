# useDebounce Hook Documentation

## Overview

A reusable custom React hook that debounces any value, reducing the frequency of updates. Perfect for search inputs, API calls, and any scenario where you want to wait for user input to stabilize before taking action.

## Location

`/hooks/useDebounce.ts`

## Usage

### Basic Example

```typescript
import { useDebounce } from '@/hooks/useDebounce';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    // API call will only happen 500ms after user stops typing
    if (debouncedSearchTerm) {
      searchAPI(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}
```

### Parameters

- `value: T` - The value to debounce (can be any type)
- `delay: number` - The delay in milliseconds (default: 500ms)

### Returns

- Returns the debounced value that updates only after the delay period

## Implementation Examples in the App

### 1. Username Availability Check

**File**: `/components/settings/personal-info-tab.tsx`

```typescript
const [formData, setFormData] = useState({ username: '' });
const debouncedUsername = useDebounce(formData.username, 500);

useEffect(() => {
  checkUsernameAvailability(debouncedUsername);
}, [debouncedUsername]);
```

Benefits:

- Reduces database queries
- Only checks availability after user stops typing
- Improves UX by preventing too many requests

### 2. Movie Search

**File**: `/components/tabs/movies/movie-search.tsx`

```typescript
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 500);

useEffect(() => {
  handleSearch(debouncedQuery);
}, [debouncedQuery]);
```

Benefits:

- Reduces API calls to TMDB
- Better performance
- Smoother user experience

## Benefits

1. **Performance**: Reduces unnecessary function calls and API requests
2. **UX**: Provides a better user experience by waiting for input to stabilize
3. **Reusability**: Single implementation used across the entire app
4. **Type-Safe**: Full TypeScript support with generic types
5. **Clean Code**: Replaces manual timeout management with a declarative hook

## Best Practices

- Use 300-500ms delay for search inputs
- Use 500-1000ms delay for expensive operations
- Always cleanup in the useEffect to prevent memory leaks (handled automatically by the hook)
- Consider using shorter delays (200-300ms) for better perceived performance
- Use longer delays (1000ms+) for very expensive operations like image processing

## Before vs After

### Before (Manual Timeout)

```typescript
const [query, setQuery] = useState('');
const timeoutRef = useRef<NodeJS.Timeout | null>(null);

const handleChange = (value: string) => {
  setQuery(value);

  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }

  timeoutRef.current = setTimeout(() => {
    search(value);
  }, 500);
};

useEffect(() => {
  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}, []);
```

### After (useDebounce Hook)

```typescript
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 500);

useEffect(() => {
  search(debouncedQuery);
}, [debouncedQuery]);
```

Much cleaner and easier to maintain!
