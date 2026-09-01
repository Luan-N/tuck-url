# Privacy Policy for Tuck URL

**Last Updated:** September 1, 2026

## Overview

Tuck URL is a Chrome extension that shortens URLs. We collect minimal data to provide this functionality.

## Data We Collect

### Current URL
- When you click the extension, we access the current webpage URL (including query parameters)
- This is processed by your browser before being sent to our server

### Shortened URL Mappings
- We store the mapping between your original URL and the short code in our database (Cloudflare D1)
- This enables the redirect functionality when someone visits your short link

## Data We Do NOT Collect

- ❌ Personal identification information (names, emails, etc.)
- ❌ Browsing history beyond the current page when extension is used
- ❌ Keystroke logging or user activity tracking
- ❌ Analytics or usage data about your behavior

## How Data is Stored

- **Location**: Cloudflare D1 (SQLite database)
- **Duration**: Until the link expires (as configured by you) or indefinitely if set to "never expire"
- **Access**: Only to provide redirect functionality

## Cloudflare Data Handling

We use Cloudflare Workers and D1, which are subject to Cloudflare's privacy practices. Cloudflare's privacy policy can be found at: https://www.cloudflare.com/en-gb/privacy/

We do not access or store Cloudflare logs for tracking or analytics purposes.

## User Control

- You can delete any shortened link by not using it
- You control expiration times (1 hour to 1 year, or never)
- You can clear the browser cache to remove stored data

## Changes to This Policy

We may update this privacy policy as needed. Changes will be reflected on this page.

## Contact

For questions about this privacy policy, please open an issue on the GitHub repository.
