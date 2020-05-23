if(typeof clevertap === "undefined"){
    var clevertap = {
        event: [],
        profile: [],
        account: [],
        notifications: [],
        onUserLogin: []
    };
}

function wzrkShopify(id) {
    clevertap.account.push({
        "id": id
    });
    clevertap.enablePersonalization = true; // enables Personalization
    clevertap.plugin = "shop";
    var wzrk = document.createElement('script');
    wzrk.type = 'text/javascript';
    wzrk.async = true;
    wzrk.src = ('https:' == document.location.protocol ? 'https://d2r1yp2w7bby2u.cloudfront.net' : 'http://static.clevertap.com') + '/js/a.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wzrk, s);

    var removeUnwantedinPrice = function(price){
        var nums = price.split(".");
        nums[0] = nums[0].replace(/\D+/g, '');

        if(nums.length > 1){
            nums[1] = nums[1].replace(/\D+/g, '');
            return (nums[0] + "." + nums[1]);
        }

        return nums[0];
    };

    var fixPrice = function(product_price){
        var price_arr = product_price.split(" ");
        if(price_arr.length > 1){
            return parseFloat(parseFloat(removeUnwantedinPrice(price_arr[1])).toFixed(2));
        }
        return parseFloat(parseFloat(removeUnwantedinPrice(product_price)).toFixed(2));
    };

    var push_product_viewed = function() {
        clevertap.event.push("Product Viewed", {
            "Product name": __wzrk_product_title,
            "Category": __wzrk_product_category_name,
            "Price": fixPrice(__wzrk_product_price),
            "Currency": __wzrk_currency
        });
    };

    var category_viewed = function() {
        clevertap.event.push("Category Viewed", {
            "Category name": __wzrk_collection_name
        });
    };

    var push_search = function() {
        clevertap.event.push("Searched", {
            "Term": __wzrk_searchterm
        });
    };

    var push_add_to_cart = function() {
        clevertap.event.push("Added To Cart", {
            "Product name": __wzrk_product_title,
            "Category": __wzrk_product_category_name,
            "Price": fixPrice(__wzrk_product_price),
            "Currency": __wzrk_currency
        });
    };

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
                    "Items": items
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
                    "Items": items
                });
            }
        }
    };

    var profile_push_checkout = function() {
        if(Shopify.checkout != null){
            if(Shopify.checkout.billing_address != null){
                clevertap.profile.push({
                    "Site": {
                        "Name": Shopify.checkout.billing_address.first_name,
                        "Email": Shopify.checkout.email
                    }
                });
            } else{
                clevertap.profile.push({
                    "Site": {
                        "Email": Shopify.checkout.email
                    }
                });
            }
        }
    };

    if (typeof __wzrk_product_json != "undefined") {
        push_product_viewed();
        if(document.getElementsByName("add").length > 0){
            document.getElementsByName("add")[0].onclick = push_add_to_cart;
            console.log("added to cart");
        }else{
            var addedToCart = false;
            var forms = document.getElementsByTagName("form");
            var patt = /cart\/add$/i;
            for (var i = 0; i < forms.length; i++) {
                if(patt.test(forms[i].action)){
                    var inputs = forms[i].getElementsByTagName("input");
                    for (var j = 0; j < inputs.length; j++) {
                        if(inputs[j].type == "submit"){
                            console.log("added to cart");
                            inputs[j].onclick = push_add_to_cart;
                            addedToCart = true;
                        }
                    }
                    if(!addedToCart){
                        var buttons = forms[i].getElementsByTagName("button");
                        for(j =0; j < buttons.length; j++){
                            if(buttons[j].type == "submit"){
                                console.log("added to cart");
                                buttons[j].onclick = push_add_to_cart;
                                addedToCart = true;
                            }
                        }
                    }
                }
            }
        }
    }

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
    if (typeof __wzrk_collection_name !== "undefined") {
        category_viewed();
    }
    if (typeof __wzrk_searchterm !== "undefined") {
        push_search();
    }
}

if (typeof __wzrk_account_id !== "undefined") {
    wzrkShopify(__wzrk_account_id);
} else {
    if (typeof Shopify !== "undefined") {
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
