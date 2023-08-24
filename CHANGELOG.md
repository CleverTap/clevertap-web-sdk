# Change Log
All notable changes to this project will be documented in this file.

## [1.6.5] - 24 Aug, 2023
- Fixes a bug related to sequence of message in Web Inbox
- Adds the parameter for location.protocol in page request

## [1.6.4] - 27 Jul, 2023
- Fixes a bug related to updating the WZRK_G on onUserLogin.
- Updated WZRK_G cookie expiry to 1 year.

## [1.6.3] - 8 Jul, 2023
- Adds support to store Web Inbox messages per user.

## [1.6.2] - 21 Jun, 2023
- Fixes a bug that causes the Web Inbox campaign to fail rendering upon page load, and ensures that the campaign limit for the inbox is correctly enforced.
- Fixes a bug in the Web Popup Image-only campaign, preventing the popup from scrolling along with the page.
- Fixes a bug where cpg (current page) was inaccurately sent during page transitions.

## [1.6.1] - 13 Jun, 2023
- Fixes a bug related to updating the WZRK_CAMP cookie for Web Popup Image Only campaigns.
- Fixes a bug that causes an 'Uncaught TypeError' when attempting to access the WZRK_CAMP cookie.

## [1.6.0] - 23 May, 2023
- Introduces frequency caps for 'Web Inbox' channel.
- Contains a bug which caused an 'Uncaught TypeError' when attempting to access the WZRK_CAMP cookie. Please update to v1.6.1

## [1.5.2] - 8 May, 2023
- Fixes Web Popup Image Only frequency capping
- Updates divId for Web Native Display Banner and Carousel 

## [1.5.1] - 6 Apr, 2023
- Fixes issue for Web Inbox where DOM was not loaded during searching inbox-selector.

## [1.5.0] - 24 Mar, 2023
- Introduces the new templates 'Image Only' in 'Web pop up'.

## [1.4.2] - 15 Mar, 2023
- Fixes repeated firing of requests from processBackupEvents functionality
- Updates Charged Item count limit to 50
- Fixes Notification rendering in accordance to Delivery preferences

## [1.4.1] - 28 Feb, 2023
- Fixes banner and carousel loading
- Fixes Web Inbox UI

## [1.4.0] - 31 Jan, 2023
- Introduces the new "Web Inbox" channel
- Fixes issue for addMultiValue where property can be added for anonymous profile
- Adds user's location handling by setting latitude and longitude.

## [1.3.5] - 23 Dec, 2022
- Fixes cases where a requests were processed twice from cache
- Multiple On User Login requests can be fired consequtively.
- Dynamic image dimensions for web carousel
- Adds offline mode, where events can be queued and sent at a desired time later
## [1.3.4] - 1 Dec, 2022
- Fixes cases where multiple request can be fired without a gcookie.

## [1.3.3] - 16 Nov, 2022
- Adds mouse cursor as pointer in the banner html
- Adds dynamic height for banner campaigns.
- Adds a minimum width of 480px for the source element in mobile devices.
- Fixes a bug where multiple profiles were created on a slow network due to multiple requests being fired without a gcookie.

## [1.3.2] - 10 Oct, 2022
- Adds 'tries' to url params for logging purpose.
- Fixed a bug where dismiss spam control was not working for web pop up interstitial campaign.
- Renamed methods for DC from 'Direct Call' to 'Signed Call'.

## [1.3.1] - 27 Sept, 2022
- Fixed a bug where request were sent though optOut was true.
- Fixed a bug where multiple GUID were generated in slow network.

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
