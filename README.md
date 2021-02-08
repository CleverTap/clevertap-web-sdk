# CleverTap Web SDK 

![beta](https://img.shields.io/static/v1?label=status&message=beta&color=red)


## 🚀 Release Plan

This is a "Feature complete" release and we now have a freeze on any new code, aside from fixing issues raised during the beta testing phase. Post evaluating all the feedback, if no critical issues arise we will release to production in March 2021.

## 👋 Introduction

The CleverTap Web SDK for Customer Engagement and Analytics

CleverTap brings together real-time user insights, an advanced segmentation engine, and easy-to-use marketing tools in one mobile marketing platform — giving your team the power to create amazing experiences that deepen customer relationships. Our intelligent mobile marketing platform provides the insights you need to keep users engaged and drive long-term retention and growth.

For more information check out our  [website](https://clevertap.com/ "CleverTap")  and  [documentation](https://developer.clevertap.com/docs/ "CleverTap Technical Documentation").

To get started, sign up [here](https://clevertap.com/live-product-demo/)

## 🎉 Installation

CleverTap Web SDK is available as an npm package or as a script to manually add to your website.

### ___Use a package manager___

```npm install clevertap-web-sdk --save```

or

```yarn add clevertap-web-sdk```

### ___Manually add the script___

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
		 wzrk.src = ('https:' == document.location.protocol ? 'https://d2r1yp2w7bby2u.cloudfront.net' : 'http://static.clevertap.com') + '/js/a.js';
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
```REGION``` (optional): This will be same as the region of the CleverTap Dashboard. Possible values: (in1/us1/sg1).\
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

## 𝌡 Example Usage
* A [react application](https://github.com/CleverTap/clevertap-web-sdk/tree/master/example-apps/react) showing the integration of our SDK in a create react app project.
* An [angular application](https://github.com/CleverTap/clevertap-web-sdk/tree/master/example-apps/angular) showing the integration of our SDK in an Angular CLI generated project.


## 🆕 Change Log

Refer to the [CleverTap Web SDK Change Log](https://github.com/CleverTap/clevertap-web-sdk/blob/master/CHANGELOG.md).

## 📄 License

CleverTap Web SDK is released under the MIT license. See [LICENSE](https://github.com/CleverTap/clevertap-web-sdk/blob/master/LICENSE) for details.

