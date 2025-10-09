# TokenAuth Component

A reusable React component that handles automatic authentication from URL parameters across the application.

## Overview

The `TokenAuth` component provides a clean, reusable solution for automatic user authentication via URL token parameters. It's currently used in both the user dashboard and admin dashboard.

## Features

- 🔍 **Automatic Detection**: Scans URL for `token` parameter
- 💾 **Secure Storage**: Saves token to localStorage via TokenManager
- 🧹 **URL Cleanup**: Removes token from URL after detection for security
- 🔄 **Data Refresh**: Triggers data refetch when new token is detected
- 📝 **Logging**: Comprehensive console logging for debugging
- 🎯 **Callbacks**: Supports custom callbacks for token detection

## Usage

### Basic Usage

```tsx
import { TokenAuth } from "@/components/auth/TokenAuth";

function Dashboard() {
  const { refetch } = useApiQuery({
    key: ["/api/dashboard/user"],
    url: "/api/dashboard/user",
  });

  return (
    <div>
      <TokenAuth onRefetch={refetch} />
      {/* Your dashboard content */}
    </div>
  );
}
```

### With Custom Callback

```tsx
<TokenAuth 
  onRefetch={refetch}
  onTokenDetected={(token) => {
    console.log("Custom handling for token:", token);
    // Perform additional actions when token is detected
  }}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onRefetch` | `() => void` | No | Function to call when token is detected to refresh data |
| `onTokenDetected` | `(token: string) => void` | No | Custom callback when token is detected |

## How It Works

1. **URL Scanning**: Component checks `window.location.search` for `token` parameter
2. **Token Storage**: If token found, saves it using `TokenManager.setTokens()`
3. **URL Cleanup**: Removes token from URL using `history.replaceState()`
4. **Data Refresh**: Calls `onRefetch()` after a 100ms delay to allow token to be stored
5. **Callbacks**: Triggers `onTokenDetected()` if provided

## Implementation Details

### Current Usage

- **User Dashboard** (`/client/src/pages/user/dashboard.tsx`)
- **Admin Dashboard** (`/client/src/pages/admin/AdminDashboard.tsx`)

### URL Format

Users can access dashboards directly with:
```
/dashboard?token=eyJhbGciOiJIUzI1NiIs...
/admin/dashboard?token=eyJhbGciOiJIUzI1NiIs...
```

### Security Features

- Token is immediately removed from URL after detection
- Uses secure TokenManager for localStorage operations
- No sensitive data is exposed in browser history

## Example Workflow

1. User receives link: `https://app.com/dashboard?token=abc123`
2. User clicks link and lands on dashboard
3. TokenAuth component detects token parameter
4. Token is saved to localStorage
5. URL becomes clean: `https://app.com/dashboard`
6. Dashboard data is refetched with new authentication
7. User is now logged in and sees their data

## Development Notes

### Console Logging

The component includes comprehensive logging:
- "TokenAuth - URL Parameters: ..." 
- "TokenAuth - Token detected from URL: ..."
- "TokenAuth - Token saved and URL cleaned"
- "TokenAuth - Triggering data refetch"

### Performance

- Component renders `null` (no visual impact)
- useEffect only runs once on mount
- Minimal performance overhead

### Testing

Test URLs for development:
```
http://localhost:3000/dashboard?token=YOUR_TEST_TOKEN
http://localhost:3000/admin/dashboard?token=YOUR_ADMIN_TOKEN
```

## Future Enhancements

- Support for multiple token types (refresh tokens, etc.)
- Token validation before storage
- Expiration handling
- Error handling for invalid tokens
- Support for different authentication schemes