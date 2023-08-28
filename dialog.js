/** wizAlert();
 parameter: 1 object to specify title etc.
 title, body, confirmButtonText, rejectButtonText, confirmButtonColor
 function to yield to on click

 <div id="wzrk_wrapper">
 <div class="wzrk-overlay wzrk-hidden"></div>
 <div class="wzrk-alert wzrk-hidden">
 <div class="wzrk-alert-heading">Would you like to Set Up Push Notifications</div>
 <div class="wzrk-alert-body">We promise to only send you relevant content and give you great updates</div>
 <div class="wzrk-button-container"> <button id="wzrk-cancel" class="cancel">No thanks</button> <button id="wzrk-confirm" class="confirm">Sign me Up!</button> </div>
 <div class="wzrk-powered">Powered by <a href="https://clevertap.com" target="_blank"><img src="https://d2r1yp2w7bby2u.cloudfront.net/js/ct_logo.svg" height="9" style="height:9px;"></a></div>
 </div>
 </div>

 */

function getwzrkPermissionPopup(){
    var wzrkPermissionPopup = {
        'dialogCss': '<style>.wzrk-overlay{background-color:rgba(0,0,0,.15);position:fixed;left:0;right:0;top:0;bottom:0;z-index:10000}.wzrk-hidden{display:none}.wzrk-alert{background-color:#fbfbfb;border:1px solid #f0f0f0;font-family: Arial,sans-serif;width:346px;padding:15px 15px 5px;border-radius:6px;text-align:center;position:fixed;right:20px;top:20px;margin-left:0;margin-top:0;overflow:hidden;z-index:99999}@media screen and (max-width:540px){.wzrk-alert{width:auto;margin:auto 0;top:35%;left:15px;right:15px}}.wzrk-alert-heading{color:#606060;font-size:20px;width:250px;animation:none;text-align:center;font-weight:700;margin:0 auto 10px;display:block}.wzrk-alert-body{color:#939393;font-size:14px;font-weight:300;animation:none;margin-bottom:10px}.wzrk-button-container button{background-color:#dbdbdb;color:#fff;border:none!important;box-shadow:none!important;min-width:130px;font-size:14px;animation:none;font-weight:100;border-radius:3px;padding:8px 10px;margin:0 7px;cursor:pointer}.wzrk-alert button:focus{outline:0}.wzrk-alert button:active{background:#5dc241}.wzrk-alert button.confirm{background-color:#f28046}.wzrk-button-container button.cancel{background-color:#dbdbdb;color:#7c7c7c}.wzrk-button-container button.cancel:hover{background-color:#d7d7d7}.wzrk-powered{font-family: Arial,sans-serif;font-size:9px;color:#777;animation:none;margin-top:12px;margin-right:2px;text-align:right}.wzrk-powered img{display:inline-block;animation:none;margin-bottom:-2px;-webkit-filter:contrast(10%);filter:grayscale(150%)}@-webkit-keyframes showWizAlert{0%{transform:scale(.7);-webkit-transform:scale(.7)}45%{transform:scale(1.05);-webkit-transform:scale(1.05)}80%{transform:scale(.95);-webkit-transform:scale(.95)}100%{transform:scale(1);-webkit-transform:scale(1)}}@-webkit-keyframes hideWizAlert{0%{transform:scale(1);-webkit-transform:scale(1)}100%{transform:scale(.5);-webkit-transform:scale(.5)}}.wiz-show-animate{animation:showWizAlert .3s}.wiz-hide-animate{animation:hideWizAlert .2s}</style>'

    };

// dialog css is taken from the minified main.css
    wzrkPermissionPopup.wzrkCreatePopDiv = function(hidePoweredByCT) {

        function createButton (id, text, cls) {
            var btn = document.createElement("BUTTON");
            btn.id = id;
            btn.setAttribute('class', cls);
            var t = document.createTextNode(text);
            btn.appendChild(t);
            return btn;
        }

        function createDiv(id, parent, cls, content) {

            var div = document.createElement('div');
            if(id !== undefined) {
                div.id = id;
            }
            if(cls !== undefined){
                div.setAttribute('class', cls);
            }
            if(content !== undefined){
                div.innerHTML = content;
            }
            if(parent !== undefined){
                parent.appendChild(div);
            }
            return div;

        }

        // wrapper
        var msgDiv = createDiv('wzrk_wrapper', undefined, undefined, wzrkPermissionPopup['dialogCss']);

        // overlay div
        createDiv(undefined, msgDiv, 'wzrk-overlay wzrk-hidden',undefined);

        // alert wrapper
        var msgAlert = createDiv(undefined, msgDiv, 'wzrk-alert wzrk-hidden',undefined);

        // alert title
        createDiv(undefined, msgAlert, 'wzrk-alert-heading', 'Would you like to Set Up Push Notifications');

        // alert body
        createDiv(undefined, msgAlert, 'wzrk-alert-body', 'We promise to only send you relevant content and give you great updates');

        // alert button
        var buttonWrapper = createDiv(undefined, msgAlert, 'wzrk-button-container',undefined);
        buttonWrapper.appendChild(createButton('wzrk-cancel', 'cancel', 'No thanks'));
        buttonWrapper.appendChild(createButton('wzrk-confirm', 'confirm', 'Sign me Up!'));

        if(!hidePoweredByCT){
            // alert powered by
            createDiv(undefined, msgAlert, 'wzrk-powered', '<a href="https://clevertap.com/website-push-notifications?utm_medium=ref&utm_campaign=poweredBy" target="_blank">Powered by <img src="https://d2r1yp2w7bby2u.cloudfront.net/js/ct_logo.svg" height="9" style="height:9px;"></a>');
        }

        return msgDiv;

    };


// function to darken color for ok button text
    wzrkPermissionPopup.colorLuminance = function(hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }

        return rgb;
    };

    wzrkPermissionPopup.showElements = function() {
        // set up animations on the parent div
        var alertBox = document.getElementsByClassName('wzrk-alert')[0];
        var hiddenElems = document.getElementsByClassName('wzrk-hidden');
        alertBox.classList.add('wiz-show-animate');
        while (hiddenElems.length != 0) {
            hiddenElems[0].classList.remove('wzrk-hidden');
        }
    };

    wzrkPermissionPopup.hideElements = function() {
        var alertBox = document.getElementsByClassName('wzrk-alert')[0];
        var overlay = document.getElementsByClassName('wzrk-overlay')[0]

        alertBox.classList.remove('wiz-show-animate');
        alertBox.classList.add('wiz-hide-animate');
        overlay.classList.add('wzrk-hidden');

        setTimeout(function() {
            alertBox.classList.add('wzrk-hidden');
            // remove html
            var wrapper = document.getElementById('wzrk_wrapper');
            wrapper.parentNode.removeChild(wrapper);
        }, 100);

    };

// main function to call
    wzrkPermissionPopup.wizAlert = function(displayOptions, callbackFunction) {
        // inject our (hidden) html into the document
        document.getElementsByTagName('body')[0].appendChild(wzrkPermissionPopup.wzrkCreatePopDiv(displayOptions['hidePoweredByCT']));
        // set up the heading text
        var heading = document.getElementsByClassName('wzrk-alert-heading')[0];
        heading.innerHTML = displayOptions['title'];

        // set up the body text
        var body = document.getElementsByClassName('wzrk-alert-body')[0];
        body.innerHTML = displayOptions['body'];

        // set up the text for the buttons
        var confirmButton = document.getElementById('wzrk-confirm');
        confirmButton.innerHTML = displayOptions['confirmButtonText'];

        var rejectButton = document.getElementById('wzrk-cancel');
        rejectButton.innerHTML = displayOptions['rejectButtonText'];

        // add event listeners for the callbackfunction on the button
        confirmButton.addEventListener('click', function() {
            wzrkPermissionPopup.hideElements();
            // give the animation some time to complete
            setTimeout(function() {
                callbackFunction(true);
            }, 100);
        });

        rejectButton.addEventListener('click', function() {
            wzrkPermissionPopup.hideElements();
            // give time for the animation to complete
            setTimeout(function() {
                callbackFunction(false);
            }, 100);
        });

        // set up the custom confirm button color
        confirmButton.style.backgroundColor = displayOptions['confirmButtonColor'];

        confirmButton.onmouseover = function() {
            confirmButton.style.backgroundColor =
                wzrkPermissionPopup.colorLuminance(displayOptions['confirmButtonColor'], -0.04);
        };

        confirmButton.onmouseout = function() {
            confirmButton.style.backgroundColor = displayOptions['confirmButtonColor'] || '#f28046';
        };

        // finally display the popup
        wzrkPermissionPopup.showElements();

    };

    return wzrkPermissionPopup;
}

window['wzrkPermissionPopup'] = getwzrkPermissionPopup();
window['wzrkPermissionPopup']['wizAlert'] = window['wzrkPermissionPopup'].wizAlert;