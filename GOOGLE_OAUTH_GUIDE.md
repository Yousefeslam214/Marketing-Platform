# Google OAuth 2.0 Popup Implementation Guide

## Overview

This implementation provides a complete Google OAuth 2.0 flow using popup windows instead of full-page redirects. This creates a smoother user experience as the main application remains open while authentication happens in a small popup.

## Frontend Implementation

### 1. Auth Context (`auth-context.tsx`)

- **Popup Creation**: Opens a 500x600px popup window with Google OAuth URL
- **Message Handling**: Listens for postMessage from popup with authentication results
- **Security**: Validates message origin to prevent XSS attacks
- **Error Handling**: Handles popup blocking, timeouts, and user cancellation
- **Auto-cleanup**: Removes event listeners and closes popup on completion

### 2. Google Callback Component (`google-callback.tsx`)

- **Code Exchange**: Receives authorization code from Google redirect
- **API Communication**: Calls backend `/api/auth/google/callback` to exchange code for tokens
- **Parent Communication**: Sends success/error messages back to opener window
- **Auto-close**: Automatically closes popup after processing

### 3. Auth Service (`auth.ts`)

- **URL Generation**: Requests Google OAuth URL from backend with correct redirect URI
- **Token Management**: Handles JWT token storage and user session management

## How It Works

### User Flow:

1. User clicks "Continue with Google" button
2. Frontend calls backend `/api/auth/google/generateAuthUrl?redirect_uri=http://localhost:3000/google/callback`
3. Backend generates Google OAuth URL with frontend callback route
4. Frontend opens popup window with Google OAuth URL
5. User authenticates with Google in popup
6. Google redirects to `http://localhost:3000/google/callback?code=...`
7. Callback component exchanges code for tokens via backend API
8. Backend returns JWT token and user data
9. Callback component sends token to parent window via postMessage
10. Parent window receives token, stores it, and redirects to dashboard
11. Popup automatically closes

### Technical Flow:

```
Main Window                 Popup Window                 Backend
    |                           |                         |
    |-- Open popup ------------>|                         |
    |                           |-- GET /generateAuthUrl -->|
    |                           |<-- Google OAuth URL -----|
    |                           |-- Redirect to Google --->|
    |                           |<-- Redirect with code ---|
    |                           |-- POST /callback ------->|
    |                           |<-- JWT token + user -----|
    |<-- postMessage(token) ----|                         |
    |-- Store token & redirect  |-- Close popup          |
```

## Security Features

1. **Origin Validation**: All postMessage communications validate `event.origin`
2. **Popup Detection**: Callback page checks for `window.opener` to ensure popup context
3. **Timeout Protection**: 5-minute timeout prevents hanging popups
4. **Error Handling**: Comprehensive error handling with user feedback

## Backend Requirements

Your backend needs to implement these endpoints:

### 1. `/api/auth/google/generateAuthUrl`

- Accept `redirect_uri` query parameter
- Generate Google OAuth URL with correct redirect URI
- Return OAuth URL for popup to navigate to

### 2. `/api/auth/google/callback`

- Accept authorization code from Google
- Exchange code for access token
- Fetch user info from Google APIs
- Create/update user in your database
- Generate JWT token for your application
- Return user data and JWT token

## Environment Setup

### Frontend Environment Variables:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Backend Environment Variables:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
```

### Google Cloud Console Configuration:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API and Google OAuth2 API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:3000/google/callback` (development)
   - `https://yourdomain.com/google/callback` (production)

## Testing the Flow

### 1. Start Your Development Servers:

```bash
# Backend
npm run dev

# Frontend
npm run dev
```

### 2. Test the Complete Flow:

1. Navigate to login page (`http://localhost:3000/login`)
2. Click "Continue with Google" button
3. Verify popup opens with Google OAuth page
4. Complete Google authentication
5. Verify popup closes automatically
6. Verify redirect to dashboard with success message
7. Check that user is properly authenticated

### 3. Debugging Tips:

- Open browser DevTools in both main window and popup
- Check console logs for detailed flow information
- Verify network requests to backend APIs
- Check localStorage for stored tokens

## Error Scenarios Handled

1. **Popup Blocked**: Shows error message asking user to allow popups
2. **Network Errors**: Handles API failures with user-friendly messages
3. **User Cancellation**: Detects popup closure without authentication
4. **Timeout**: Prevents hanging popups with 5-minute timeout
5. **Invalid Response**: Validates all API responses before processing

## Production Considerations

1. **HTTPS Required**: Google OAuth requires HTTPS in production
2. **CORS Configuration**: Ensure proper CORS setup for popup communication
3. **CSP Headers**: Configure Content Security Policy for popup windows
4. **Error Monitoring**: Add error tracking for OAuth failures
5. **Rate Limiting**: Implement rate limiting on OAuth endpoints

## Browser Compatibility

This implementation works on:

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

Note: Some browsers may block popups by default. Users will need to allow popups for your domain.

## Advantages of Popup Flow

1. **Better UX**: Main application state is preserved
2. **Faster**: No full page reload required
3. **Mobile Friendly**: Works well on mobile devices
4. **Secure**: Same security as full redirect flow
5. **Flexible**: Easy to integrate into existing applications

## Next Steps

1. Implement the backend routes using the provided example
2. Configure your Google Cloud Console OAuth settings
3. Test the complete flow in development
4. Deploy and test in production environment
5. Add error monitoring and analytics
