# OAuth Setup Guide - Swedish Marketplace Flipping Platform

This guide explains how to configure OAuth providers (Google, Facebook, etc.) for social login functionality in the platform.

## Overview

The platform supports multiple OAuth providers to make user registration and login more convenient. Users can sign up/in with their existing social media accounts instead of creating new passwords.

## Supported Providers

- **Google** (Recommended) - Most users have Google accounts
- **Facebook** (Optional) - Good for marketplace users
- **GitHub** (Development) - Developer-friendly, disabled in production
- **Apple** (Production) - iOS users, disabled in development

## Prerequisites

1. **Supabase Project**: You must have a Supabase project set up
2. **Domain**: For production, you need a verified domain
3. **HTTPS**: OAuth providers require HTTPS in production

## Configuration Steps

### Step 1: Enable OAuth in Supabase

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable the providers you want to use
4. Configure each provider with the credentials from the provider

### Step 2: Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Go to APIs & Services → Library
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Flip Platform"
   
4. **Configure Authorized Redirect URIs**
   ```
   Development:
   http://localhost:3000/auth/callback
   
   Production:
   https://yourdomain.com/auth/callback
   ```

5. **Copy Credentials to Supabase**
   - Copy Client ID and Client Secret
   - In Supabase: Authentication → Providers → Google
   - Enable Google provider
   - Paste Client ID and Client Secret
   - Save

6. **Update Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_GOOGLE_ENABLED=true
   ```

### Step 3: Facebook OAuth Setup

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/
   - Create a new app or select existing

2. **Add Facebook Login Product**
   - In your app dashboard, click "Add Product"
   - Select "Facebook Login" → "Set Up"

3. **Configure OAuth Settings**
   - Go to Facebook Login → Settings
   - Add Valid OAuth Redirect URIs:
   ```
   Development:
   http://localhost:3000/auth/callback
   
   Production:
   https://yourdomain.com/auth/callback
   ```

4. **Get App Credentials**
   - Go to Settings → Basic
   - Copy App ID and App Secret

5. **Configure in Supabase**
   - Authentication → Providers → Facebook
   - Enable Facebook provider
   - Paste App ID and App Secret
   - Save

6. **Update Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_FACEBOOK_ENABLED=true
   ```

### Step 4: GitHub OAuth Setup (Development Only)

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/applications/new
   - Create a new OAuth app

2. **Configure App Settings**
   - Application name: "Flip Platform (Dev)"
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/auth/callback

3. **Get Credentials**
   - Copy Client ID and generate Client Secret

4. **Configure in Supabase**
   - Authentication → Providers → GitHub
   - Enable GitHub provider
   - Paste Client ID and Client Secret

5. **Update Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_GITHUB_ENABLED=true
   ```

### Step 5: Apple OAuth Setup (Production Only)

> **Note**: Apple OAuth is complex and requires a paid Apple Developer account. Only set this up for production.

1. **Apple Developer Account Required**
   - You need a paid Apple Developer account ($99/year)

2. **Create App ID**
   - Go to Apple Developer portal
   - Certificates, Identifiers & Profiles → Identifiers
   - Create new App ID with "Sign In with Apple" capability

3. **Configure Service ID**
   - Create a new Service ID
   - Enable "Sign In with Apple"
   - Configure domains and redirect URLs

4. **Generate Keys**
   - Create a new key with "Sign In with Apple" capability
   - Download the private key file

5. **Configure in Supabase**
   - Authentication → Providers → Apple
   - Provide all required credentials
   - This is complex - refer to Supabase Apple OAuth docs

## Environment Configuration

Update your `.env.local` file:

```bash
# Enable the providers you want to use
NEXT_PUBLIC_SUPABASE_GOOGLE_ENABLED=true
NEXT_PUBLIC_SUPABASE_FACEBOOK_ENABLED=true
NEXT_PUBLIC_SUPABASE_GITHUB_ENABLED=true  # Development only
NEXT_PUBLIC_SUPABASE_APPLE_ENABLED=false  # Production only
```

## Testing OAuth Integration

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Visit Login Page**
   - Go to http://localhost:3000/auth/login
   - You should see social login buttons for enabled providers

3. **Test Each Provider**
   - Click on each enabled provider button
   - Complete the OAuth flow
   - Verify you're redirected back and logged in

## Troubleshooting

### Common Issues

1. **"Redirect URI Mismatch"**
   - Ensure callback URLs exactly match in provider settings
   - Include protocol (http/https) and port number

2. **"Provider Not Configured"**
   - Check environment variable is set to 'true'
   - Verify provider is enabled in Supabase dashboard

3. **"Invalid Client ID/Secret"**
   - Double-check credentials in provider dashboard
   - Ensure no extra spaces when copying/pasting

4. **User Profile Not Created**
   - The auth callback automatically creates user profiles
   - Check database for user record after OAuth login

### Debug Mode

Enable debug logging to troubleshoot:

```bash
DEBUG=true
NODE_ENV=development
```

## Security Considerations

1. **Environment Variables**
   - Never commit OAuth credentials to version control
   - Use different credentials for development and production

2. **Redirect URI Validation**
   - Only add trusted domains to redirect URI lists
   - Use HTTPS in production

3. **Scope Permissions**
   - Request minimal necessary permissions
   - Currently requesting: email, profile (basic info)

4. **User Data**
   - Store minimal user data from OAuth providers
   - Comply with provider policies and GDPR

## Production Deployment

When deploying to production:

1. **Update Redirect URIs**
   - Add production domain to all OAuth provider settings
   - Update environment variables for production

2. **SSL Certificate**
   - Ensure HTTPS is working on your domain
   - OAuth providers require HTTPS in production

3. **Domain Verification**
   - Some providers require domain verification
   - Follow provider-specific verification processes

## Support

If you encounter issues:

1. Check Supabase auth logs in dashboard
2. Review browser developer console for errors
3. Verify all configuration steps were followed
4. Test with minimal implementation first

---

**Note**: OAuth setup can be complex. Start with Google (easiest) and add other providers after confirming the first one works.