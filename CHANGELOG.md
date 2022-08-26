# Change Log
All notable changes to this project will be documented in this file.

## [1.3.0] - 26 Aug, 2022
- Introduces custom HTML click tracking in Web pop up and Web exit intent.
- Adds public methods to increment/decrement values set via User profile properties.
- Adds public methods to handle multi values set via User profile properties.
- Adds flag to dismiss spam control for Web pop up and Web exit intent.
- Introduces the new templates for banner and carousel in "Web Native Display”.
- Fixed a bug where Push Unregistered event was getting triggered even when token was not available.

## [1.2.1] - 11 Aug, 2022
- Fixed a bug where useIP value was not getting updated.
- Event name updated to "CT_web_native_display" for key-value templates.

## [1.2.0] - 28 Jun, 2022
- Introduces the new "Web Personalization" channel with support for key-value templates.
- Adds new method renderNotificationViewed to capture Notification Viewed events.
- Adds new method renderNotificationClicked to capture Notification Clicked events.
- Adds analytics support for upcoming CleverTap Direct Call Web SDK.

## [1.1.3] - 14 Jun, 2022
- Fixed a bug where multiple CleverTap IDs were generated due to a variable name mismatch.

## [1.1.2] - 27 Dec, 2021
- Fixed a bug where trim method was used for non string values.

## [1.1.1] - 13 Dec, 2021
- Fixed a bug where default region was prefixed for custom domain.

## [1.1.0] - 1 Dec, 2021
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
