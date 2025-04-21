<p align="center">
  <img src="https://github.com/CleverTap/clevertap-ios-sdk/blob/master/docs/images/clevertap-logo.png" width = "50%"/>
</p>

# CleverTap Web SDK 

![npm version](https://img.shields.io/npm/v/clevertap-web-sdk)
<a href="https://github.com/CleverTap/clevertap-web-sdk/releases">
    <img src="https://img.shields.io/github/release/CleverTap/clevertap-web-sdk.svg" />
</a>
[![npm downloads](https://img.shields.io/npm/dm/clevertap-web-sdk.svg)](https://www.npmjs.com/package/clevertap-web-sdk)

## 👋 Introduction

The CleverTap Web SDK for Customer Engagement and Analytics

CleverTap brings together real-time user insights, an advanced segmentation engine, and easy-to-use marketing tools in one mobile marketing platform — giving your team the power to create amazing experiences that deepen customer relationships. Our intelligent mobile marketing platform provides the insights you need to keep users engaged and drive long-term retention and growth.

For more information check out our  [website](https://clevertap.com/ "CleverTap")  and  [documentation](https://developer.clevertap.com/docs/ "CleverTap Technical Documentation").

To get started, sign up [here](https://clevertap.com/live-product-demo/)

## 🎉 Installation

CleverTap Web SDK is available as an npm package or as a script to manually add to your website.

### Use a package manager

```npm install clevertap-web-sdk --save```

or

```yarn add clevertap-web-sdk```

### Manually add the script

```html
<script type="text/javascript">
     var clevertap = {event:[], profile:[], account:[], onUserLogin:[], notifications:[], privacy:[]};
 // replace with the CLEVERTAP_ACCOUNT_ID with the actual ACCOUNT ID value from your Dashboard -> Settings page
clevertap.account.push({"id": "CLEVERTAP_ACCOUNT_ID"});
clevertap.privacy.push({optOut: false}); //set the flag to true, if the user of the device opts out of sharing their data
clevertap.privacy.push({useIP: false}); //set the flag to true, if the user agrees to share their IP data
 (function () {
		 var wzrk = document.createElement('script');
		 wzrk.type = 'text/javascript';
		 wzrk.async = true;
		 wzrk.src = 'https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js';
		 var s = document.getElementsByTagName('script')[0];
		 s.parentNode.insertBefore(wzrk, s);
  })();
</script>
```

## 🚀 Basic Initialization

### Add your CleverTap account credentials

Only in case you are using a package manager
```javascript
import clevertap from 'clevertap-web-sdk'
clevertap.privacy.push({optOut: false}) // Set the flag to true, if the user of the device opts out of sharing their data
clevertap.privacy.push({useIP: false})  // Set the flag to true, if the user agrees to share their IP data
clevertap.init('ACCOUNT_ID', 'REGION', 'TARGET_DOMAIN') // Replace with values applicable to you. Refer below
```
Here: \
```ACCOUNT_ID``` (mandatory): This value can be got from Projects page on the CleverTap Dashboard.\
```REGION``` (optional): This will be same as the region of the CleverTap Dashboard. Possible values: (in1/us1/sg1/aps3/mec1).\
```TARGET_DOMAIN``` (optional): domain of the proxy server.

For SPAs you need to also set the following:
```javascript
clevertap.spa = true
```

### 

### Event Push

Events track what individual actions users perform in your app or website. Some examples of events include a user launching an app, viewing a product, listening to a song, sharing a photo, making a purchase, or favoriting an item.

```javascript
// event without properties
clevertap.event.push("Product viewed");

// event with properties
clevertap.event.push("Product viewed", {
    "Product name": "Casio Chronograph Watch",
    "Category": "Mens Accessories",
    "Price": 59.99,
    "Date": new Date()
});
```

### Profile Push

After you integrate our SDK, we will create a user profile for each person who launches your app or visits your website.

```javascript
// each of the below mentioned fields are optional
// if set, these populate demographic information in the Dashboard
clevertap.profile.push({
 "Site": {
   "Name": "Jack Montana",                  // String
   "Identity": 61026032,                    // String or number
   "Email": "jack@gmail.com",               // Email address of the user
   "Phone": "+14155551234",                 // Phone (with the country code)
   "Gender": "M",                           // Can be either M or F
   "DOB": new Date(), // Date of Birth. Javascript Date object
   "Photo": 'www.foobar.com/image.jpeg',    // URL to the Image

// optional fields. controls whether the user will be sent email, push etc.
   "MSG-email": false,                      // Disable email notifications
   "MSG-push": true,                        // Enable push notifications
   "MSG-sms": true                          // Enable sms notifications
   "MSG-whatsapp": true,                    // Enable whatsapp notifications
 }
})
```

### Maintaining Multiple User Profiles on the Same Device using OnUserLogin

If multiple users on the same device use your app, you can use the `clevertap.onUserLogin` method to assign them each a unique profile to track them separately.

Here is an example showing how to add a name and an email to a user’s profile:

```javascript
// with the exception of one of Identity, Email, or FBID
// each of the following fields is optional

clevertap.onUserLogin.push({
 "Site": {
   "Name": "Jack Montana",            // String
   "Identity": 61026032,              // String or number
   "Email": "jack@gmail.com",         // Email address of the user
   "Phone": "+14155551234",           // Phone (with the country code)
   "Gender": "M",                     // Can be either M or F
   "DOB": new Date(),                 // Date of Birth. Date object
// optional fields. controls whether the user will be sent email, push etc.
   "MSG-email": false,                // Disable email notifications
   "MSG-push": true,                  // Enable push notifications
   "MSG-sms": true,                   // Enable sms notifications
   "MSG-whatsapp": true,              // Enable WhatsApp notifications
 }
})
```

### Web Push

Web push notifications provide the ability to communicate brief, yet important alerts to your users while CleverTap’s rich segmentation and powerful infrastructure can help send time-sensitive, relevant, and personalized push messages at scale.

To know more on how to configure web push notifications for Chrome, Firefox and Safari, checkout [CleverTap Web Push guide](https://developer.clevertap.com/docs/web#section-web-push).


### Offline Mode

The offline mode allows setting CleverTap SDK to offline. The `setOffline` method determines the SDK online state. By default the offline state of the sdk is set to `false`.

However, once the `setOffline` method is passed with `true` as described below, the CleverTap SDK goes offline. All the events are recorded and queued locally, but they are not sent to the CleverTap server.

When the `setOffline` method is passed with `false`, as described below, the CleverTap SDK goes online, and the queued events are sent to the server immediately.

```javascript
  clevertap.setOffline(true) // sets the sdk in offline mode.Events will be queued locally and will be fired only when offline mode is set to false
  clevertap.setOffline(false) // disables the offline mode. Events will now get fired immediately

```

### Debugging

This section is applicable for all browsers such as, Chrome, Firefox, and Safari. Error messages and warnings are logged to the JS console of the browser.

For verbose logging, enable verbose logging of all communication with the CleverTap servers by setting the ```WZRK_D``` variable in sessionStorage. In the developer console of your browser type, ```sessionStorage['WZRK_D'] = '';```

Alternatively, you can also set the log levels after calling ```clevertap.init()``` in the following way:

```javascript
clevertap.setLogLevel(LOG_LEVEL)
// Here Log Levels is an integer that can be any of the folowing: 
//  0: disable all logs
//  1: display only errors
//  2: display errors and info
//  3: display all logs
```


## 𝌡 Example Usage
* A [React Application](/example-apps/react) showing the integration of our SDK in a create react app project.
* An [Angular Application](/example-apps/angular) showing the integration of our SDK in an Angular CLI generated project.


## 🆕 Change Log

Refer to the [CleverTap Web SDK Change Log](/CHANGELOG.md).

## 📄 License

CleverTap Web SDK is released under the MIT license. See [LICENSE](/LICENSE) for details.


