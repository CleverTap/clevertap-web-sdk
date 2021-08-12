if(typeof clevertap === "undefined"){
    var clevertap = {
        event: [],
        profile: [],
        account: [],
        notifications: [],
        onUserLogin: [],
        privacy: []
    };
}

function handleCharged() {
    if (typeof Shopify.checkout !== "undefined") {
        var shouldPushCharged = true;
        if(localStorage && localStorage.getItem("WZRK_LST_CHID") !== null){
            var lastChargedId = localStorage.getItem("WZRK_LST_CHID");
            var chargedId = "" + Shopify.checkout.order_id;
            if(lastChargedId === chargedId){
                shouldPushCharged = false;
            }
        }
        if(shouldPushCharged){
            profile_push_checkout();
            push_checkout();
            if(localStorage){
                localStorage.setItem("WZRK_LST_CHID", "" + Shopify.checkout.order_id);
            }
        }
    }
}

var push_checkout = function() {
    var len = Shopify.checkout.line_items.length;
    var items = [];
    for (i = 0; i < len; i++) {
        var obj = {};
        obj["Product_id"] = Shopify.checkout.line_items[i].product_id;
        obj["Title"] = Shopify.checkout.line_items[i].title;
        obj["Quantity"] = Shopify.checkout.line_items[i].quantity;
        obj["Vendor"] = Shopify.checkout.line_items[i].vendor;
        items.push(obj);
    }
    var checkout = Shopify.checkout;
    if(typeof checkout !== "undefined"){
        var shipping_address = checkout.shipping_address;
        var amount = checkout.total_price;
        if(typeof amount !== 'number'){
            amount = parseFloat(amount);
        }
        if(typeof shipping_address === "undefined"){
            clevertap.event.push("Charged", {
                "Amount": amount,
                "Currency": checkout.currency,
                "Email": checkout.email,
                "Charged ID": checkout.order_id,
                "Items": items,
                "CT Source": "Shopify"
            });
        } else{
            clevertap.event.push("Charged", {
                "Amount": amount,
                "Currency": checkout.currency,
                "Ship_country": shipping_address.country,
                "Ship_region": shipping_address.province,
                "Ship_city": shipping_address.city,
                "Email": checkout.email,
                "Charged ID": checkout.order_id,
                "Items": items,
                "CT Source": "Shopify"
            });
        }
    }
};

var profile_push_checkout = function() {
    if(Shopify.checkout != null){
        if(Shopify.checkout.billing_address != null){
            clevertap.profile.push({
                "Site": {
                    "Name": Shopify.checkout.billing_address.first_name + " " + Shopify.checkout.billing_address.last_name ,
                    "Email": Shopify.checkout.email,
                    "Phone": Shopify.checkout.phone
                }
            });
        } else{
            clevertap.profile.push({
                "Site": {
                    "Email": Shopify.checkout.email,
                    "Phone": Shopify.checkout.phone
                }
            });
        }
    }
};

function scriptLoad(scriptUrl, scriptLoadedCallback){

    var scriptElement;

    scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';

    if (scriptElement.readyState) {
        scriptElement.onreadystatechange = function(){

            if(scriptElement.readyState === 'loaded' || scriptElement.readyState === 'complete'){
                scriptElement.onreadystatechange = null;
                if (typeof scriptLoadedCallback !== 'undefined' && scriptLoadedCallback !== null) {
                    scriptLoadedCallback();
                }
            }
        };
    } else {

        scriptElement.onload = function(){
            if (typeof scriptLoadedCallback !== 'undefined' && scriptLoadedCallback !== null) {
                scriptLoadedCallback();
            }
        };
    }

    scriptElement.src = scriptUrl;
    document.getElementsByTagName('head')[0].appendChild(scriptElement);
};

function loadWidget() {

    var foundCtServiceWorker = false;

    // "/a/s/" represents the path where our service worker is registered.  This is set in the clevertaps partner account on shopify

    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(function (registration) {
            if (registration.scope.indexOf("/a/s") > -1) {
                foundCtServiceWorker = true;
            }
        })
    });

    if (!foundCtServiceWorker && localStorage) {
        localStorage.removeItem("WZRK_WPR");
    }

    var ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", '/a/s/widget.html');
    ifrm.setAttribute("id", 'clevertap-frame');
    ifrm.setAttribute("frameborder", '0');
    ifrm.style.width = "400px";
    ifrm.style.height = "250px";
    document.body.appendChild(ifrm);

}

function initWebSdk(id, region) {
    clevertap.account.push({
        "id": id
    });
    clevertap.enablePersonalization = true; // enables Personalization
    clevertap.plugin = "shop";
    if (typeof region !== "undefined" && region !== "") {
        clevertap.region = region;
    }

    var wzrk = document.createElement('script');
    wzrk.type = 'text/javascript';
    wzrk.async = true;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wzrk, s);

    // wzrk.src = ('https:' == document.location.protocol ? 'https://d2r1yp2w7bby2u.cloudfront.net' : 'http://static.clevertap.com') + '/js/a.js';
    wzrk.src = 'https://cdn.jsdelivr.net/gh/CleverTap/clevertap-web-sdk@SDK-882-shopify-changes/clevertap.min.js';
}


function wzrkShopify(id, region, webPushEnabled) {

    clevertap.account.push({
        "id": id
    });
    clevertap.enablePersonalization = true; // enables Personalization
    clevertap.plugin = "shop";
    if (typeof region !== "undefined" && region !== "") {
        clevertap.region = region;
    }

    var wzrk = document.createElement('script');
    wzrk.type = 'text/javascript';
    wzrk.async = true;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wzrk, s);


    var isSafari = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    wzrk.onload = function() {
        scriptLoad("/a/s/shopifyEvents.js", (webPushEnabled && !isSafari) ? loadWidget : null);
    };

    // wzrk.src = ('https:' == document.location.protocol ? 'https://d2r1yp2w7bby2u.cloudfront.net' : 'http://static.clevertap.com') + '/js/a.js';
    wzrk.src = 'https://cdn.jsdelivr.net/gh/CleverTap/clevertap-web-sdk@SDK-882-shopify-changes/clevertap.min.js';

}

if (typeof __wzrk_account_id !== "undefined") {
    // SUC-60553. Region introduced
    if (typeof __wzrk_region === "undefined") {
        __wzrk_region = "";
    }
    wzrkShopify(__wzrk_account_id, __wzrk_region, __wzrk_web_push_enabled);
} else {
    if (typeof Shopify !== "undefined") {
        var shopInfo = "";

        if (window.location.href.indexOf("/checkouts/")) {
            if (localStorage) {
                shopInfo = localStorage.getItem("WZRK_SHOP_INFO");
            }
        }

        if (shopInfo !== "") {

            var shop = JSON.parse(shopInfo);
            initWebSdk(shop.acct_id, shop.region);
            handleCharged();

        } else {
            (function(){
                var shop = Shopify.shop;
                var wzrkShopify = document.createElement('script');
                wzrkShopify.type = 'text/javascript';
                wzrkShopify.async = true;
                wzrkShopify.src = "https://api.clevertap.com/js/wzrk-shopify.js?shop=" + shop;
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(wzrkShopify, s);
            }());
        }
    }
};
