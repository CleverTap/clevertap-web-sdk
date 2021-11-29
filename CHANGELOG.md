# Change Log
All notable changes to this project will be documented in this file.

## [1.1.0] - 2 Dec, 2021
- Adds new Public API to record Notification Clicked Event for Custom Web Popups
- Handle Shopify websites for serviceworker registration ready state
- Use `clevertap-prod.com` instead of `wzrkt.com` as endpoint
- Fixed a bug where the push token wasn't being transfered/registered right after a new user logs in.
- Fixed a bug where the useIP flag value being not considered.
- Fixed a bug where the service worker was never ready when it wasn't at root location.

## [1.0.0] - 22 Apr, 2021
We are super excited to announce the launch of `CleverTap Web SDK`.
This release is fully compatible with the existing `a.js` provided by CleverTap for web analytics and engagement.

### Added
 - Support page tracking for Single Page Applications (SPA).
 - Bypass adblockers by specifying endpoint of your proxy server.
