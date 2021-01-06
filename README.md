# CleverTap web SDK 

![experimental code](https://img.shields.io/static/v1?label=status&message=beta&color=red)

Experimental code, not suitable for production environments

## 👋 Introduction

The CleverTap web SDK for Customer Engagement and Analytics

CleverTap brings together real-time user insights, an advanced segmentation engine, and easy-to-use marketing tools in one mobile marketing platform — giving your team the power to create amazing experiences that deepen customer relationships. Our intelligent mobile marketing platform provides the insights you need to keep users engaged and drive long-term retention and growth.

For more information check out our  [website](https://clevertap.com/ "CleverTap")  and  [documentation](https://developer.clevertap.com/docs/ "CleverTap Technical Documentation").

To get started, sign up [here](https://clevertap.com/live-product-demo/)

## 🎉 Installation

CleverTap web SDK is available as an npm package or as a script to manually add to your website

### ___Use a package manager___

```npm install clevertap-web-sdk --save```

or

```yarn add clevertap-web-sdk```

### ___Manually add the script___

```
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
```
import clevertap from 'clevertap-web-sdk'
clevertap.init('YOUR_ACCOUNT_ID')
```

### Event Push

Events track what individual actions users perform in your app or website. Some examples of events include a user launching an app, viewing a product, listening to a song, sharing a photo, making a purchase, or favoriting an item.

```
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

```
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


## 🆕 Change Log

Refer to the [CleverTap web SDK Change Log](https://github.com/CleverTap/clevertap-web-sdk/blob/master/CHANGELOG.md).

## 📄 License

CleverTap web SDK is released under the MIT license. See [LICENSE](https://github.com/CleverTap/clevertap-web-sdk/blob/master/LICENSE) for details.

