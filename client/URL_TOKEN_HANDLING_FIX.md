# URL Token Handling Fix

## Problem

Google sign-in was redirecting to malformed URLs like:

```
/dashboard&token=eyJhbGciOiJIUzI1NiIs...
```

Instead of the correct format:

```
/dashboard?token=eyJhbGciOiJIUzI1NiIs...
```

## Solution

Enhanced both User Dashboard and Admin Dashboard to handle both URL formats:

### 1. **Standard Format Detection** (✅ Working)

- Uses `URLSearchParams` to parse `?token=...`
- Standard URL parameter parsing

### 2. **Malformed Format Detection** (🔧 Fixed)

- Detects URLs with `&token=...` instead of `?token=...`
- Extracts token manually from the malformed URL
- Automatically redirects to correct URL format
- Processes authentication seamlessly

## How It Works

### Before Fix:

```javascript
// Only handled standard format
const urlParams = new URLSearchParams(window.location.search);
const tokenFromUrl = urlParams.get("token"); // Would be null for &token=...
```

### After Fix:

```javascript
// Handles both formats
let tokenFromUrl = null;

// Try standard format first
const urlParams = new URLSearchParams(window.location.search);
tokenFromUrl = urlParams.get("token");

// If no token found and URL contains &token=, handle malformed format
if (!tokenFromUrl && window.location.href.includes("&token=")) {
  // Extract token from malformed URL
  const urlParts = window.location.href.split("&token=");
  if (urlParts.length > 1) {
    tokenFromUrl = urlParts[1].split("&")[0];

    // Redirect to correct URL format
    const baseUrl = urlParts[0];
    const correctUrl = `${baseUrl}?token=${tokenFromUrl}`;
    window.location.href = correctUrl;
    return;
  }
}
```

## URL Examples

### ✅ Correctly Handled URLs:

- `/dashboard?token=abc123` (Standard format)
- `/dashboard&token=abc123` (Malformed format - automatically fixed)
- `/admin/dashboard?token=abc123` (Admin standard)
- `/admin/dashboard&token=abc123` (Admin malformed - automatically fixed)

### 🔄 Processing Flow:

1. **Malformed URL**: `/dashboard&token=abc123`
2. **Detection**: Script detects `&token=` in URL
3. **Extraction**: Extracts token `abc123`
4. **Redirect**: Redirects to `/dashboard?token=abc123`
5. **Processing**: Standard token processing takes over
6. **Authentication**: User is logged in
7. **Clean URL**: Final URL becomes `/dashboard`

## Console Logging

Added comprehensive logging for debugging:

```
🔧 Detected incorrect URL format with &token= instead of ?token=
🔧 Extracted token from malformed URL: abc123...
🔧 Redirecting to correct URL format: /dashboard?token=abc123
Token from URL: abc123...
Token from URL detected and set: abc123...
```

## Implementation Details

### Files Modified:

- `/client/src/pages/user/dashboard.tsx` - User dashboard token handling
- `/client/src/pages/admin/AdminDashboard.tsx` - Admin dashboard token handling

### Features:

- ✅ Backward compatible with correct URLs
- ✅ Automatically fixes malformed URLs
- ✅ Secure token handling (removed from URL after processing)
- ✅ Works for both user and admin dashboards
- ✅ Comprehensive logging for debugging
- ✅ No breaking changes to existing functionality

## Testing

To test the fix, try these URLs:

```
# Standard format (should work as before)
http://localhost:3000/dashboard?token=YOUR_TOKEN

# Malformed format (now automatically fixed)
http://localhost:3000/dashboard&token=YOUR_TOKEN

# Admin versions
http://localhost:3000/admin/dashboard?token=YOUR_TOKEN
http://localhost:3000/admin/dashboard&token=YOUR_TOKEN
```

All formats will now work correctly and result in proper authentication!
