chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      // ----------------------------------------------------------
      // This part of the script triggers when page is done loading
      console.log("Hello. This message was sent from scripts/inject.js");
      // ----------------------------------------------------------
    }
  }, 10);
});

var callBackResponse = function() {};

console.log("client inject");
chrome.extension.sendMessage({ name: "client inject" });

function genCssPanel(element) {
  element.style.setProperty("background-color", "#fff", "important")
  element.style.setProperty("height", "34px", "important");
  element.style.setProperty("width", "325px", "important");
  element.style.setProperty("top", "-140px", "important");
  element.style.setProperty("right", "20px", "important")
  element.style.setProperty("border-radius", "8px", "important");
  element.style.setProperty("box-shadow", "rgba(0, 0, 0, 0.2) 0px 1px 23px", "important");
  // notification.style.setProperty("opacity", "1", "important");
  element.style.setProperty("transition", "0.2s", "important");
  element.style.setProperty("overflow", "auto", "important");
  element.style.setProperty("position", "fixed", "important");
  element.style.setProperty("padding", "18px 20px", "important");
  element.style.setProperty("z-index", "99999999999999999999", "important");
  // element.style.setProperty("display", "none", "important");
}

var notificationTint = document.createElement('div');
notificationTint.id = 'notificationTint';
notificationTint.style.setProperty("background-color", "#00000082", "important");
notificationTint.style.setProperty("position", "absolute", "important");
notificationTint.style.setProperty("top", "0px", "important");
notificationTint.style.setProperty("left", "0px", "important");
notificationTint.style.setProperty("right", "0px", "important");
notificationTint.style.setProperty("bottom", "0px", "important");
notificationTint.style.setProperty("z-index", "1111", "important");
// notification.body.appendChild(button);


var notification = document.createElement('div');
notification.id = 'notification';
// notification.hidden = true;
genCssPanel(notification)

var wrapperNotification = document.createElement('div');
wrapperNotification.id = 'wrapperNotification';
var textNotification = document.createTextNode("Connecting please wait...")
wrapperNotification.appendChild(textNotification)
wrapperNotification.style.setProperty("margin-top", "5px", "important");
wrapperNotification.style.setProperty("margin-left", "80px", "important");
wrapperNotification.style.setProperty("font-size", "1.0rem", "important");


  // Confirmation 
  var confirmation = document.createElement('div');
  confirmation.id = 'confirmation';
  // notification.hidden = true;
  genCssPanel(confirmation)

  var cssButton = '#buttonApprove:hover{ background-color: #000; transition: 0.25s; transform: scale(0.95); cursor: pointer;} #buttonReject:hover{ background-color: #000; transition: 0.25s; transform: scale(0.95); cursor: pointer;}';
  var buttonStyle = document.createElement('style');

  if (buttonStyle.styleSheet) {
      buttonStyle.styleSheet.cssText = cssButton;
  } else {
      buttonStyle.appendChild(document.createTextNode(cssButton));
  }
  document.getElementsByTagName('head')[0].appendChild(buttonStyle);

  // Button approve
  var buttonApprove = document.createElement('button');
  buttonApprove.id = 'buttonApprove';
  buttonApprove.style.setProperty("transition", "0.25s", "important");
  buttonApprove.style.setProperty("height", "2.1rem", "important");
  buttonApprove.style.setProperty("background-color", "#7055e9", "important");
  buttonApprove.style.setProperty("color", "#fff", "important");
  buttonApprove.style.setProperty("border-radius", "6px", "important");
  buttonApprove.style.setProperty("border", "none", "important");
  buttonApprove.style.setProperty("font-size", "1rem", "important");
  buttonApprove.style.setProperty("padding", "5px 20px", "important");
  buttonApprove.style.setProperty("float", "right", "important");
  buttonApprove.style.setProperty('box-shadow', 'rgba(112, 85, 233, 0.35) 0px 3px 4px 0px', 'important');

  var textApprove = document.createTextNode("Approve")
  buttonApprove.appendChild(textApprove);

  buttonApprove.addEventListener("click", function () {
    console.log('click buttonApprove', callBackResponse)
    callBackResponse(true,);
  })

  // Button reject
  var buttonReject = document.createElement('button');
  buttonReject.id = 'buttonReject';
  buttonReject.style.setProperty("transition", "0.25s", "important");
  buttonReject.style.setProperty("height", "2.1rem", "important");
  buttonReject.style.setProperty("background-color", "rgba(228, 228, 228, 0.71)", "important");
  buttonReject.style.setProperty("color", "#11161b94", "important");
  buttonReject.style.setProperty("border-radius", "6px", "important");
  buttonReject.style.setProperty("border", "none", "important");
  buttonReject.style.setProperty("font-size", "1rem", "important");
  buttonReject.style.setProperty("padding", "5px 25px", "important");
  buttonReject.style.setProperty("float", "right", "important");
  buttonReject.style.setProperty("margin-right", "10px", "important");
  // buttonReject.style.setProperty('box-shadow', 'rgba(144, 140, 140, 0.35) 0px 3px 14px 0px', 'important');

  var textReject = document.createTextNode("Reject")
  buttonReject.appendChild(textReject);

  buttonReject.addEventListener("click", () => {
    console.log('click buttonReject', callBackResponse)
    callBackResponse(false,);

  })


/**
 * Listening message from chrome extension
 *
 */
chrome.runtime.onMessage.addListener((message, _, callBack) => {
  // console.log('inject receive message->>', message)
  
  if (message && message.showModalQrCodde) {
    const button = document.getElementById("Unlock_Wallet_Connect");
    if(button) {
      button.click()
      callBack() 
    }
    return true;
  }


  if (message && message.hideNotification) {
    notification.style.setProperty("opacity", "0", "important");
    notification.style.setProperty("top", "-140px", "important");
    
    setTimeout(() => {
      notification.remove();
      notificationTint.remove()
    }, 250)

  }

  if (message && message.showNotification) {
    document.body.appendChild(notification)
    notification.appendChild(wrapperNotification)

    const button = document.getElementById("Unlock_Wallet_Connect");
    if(button) {
      button.click()
    }
    
    setTimeout(() => {
      notification.style.setProperty("opacity", "1", "important");
      notification.style.setProperty("top", "20px", "important");

      const button = document.getElementById("Unlock_Wallet_Connect");
      if(button) {
        button.click()
      }
      
    }, 100)

    // wrapper.hidden = true;

    callBackResponse = callBack;
    return true;
  }

  if (message && message.hideConfirmation) {
    confirmation.style.setProperty("opacity", "0", "important");
    confirmation.style.setProperty("top", "-140px", "important");
    
    setTimeout(() => {
      confirmation.remove();
      notificationTint.remove()
    }, 250)

  }

  if (message && message.showConfirmation) {
    document.body.appendChild(confirmation)
    confirmation.appendChild(buttonApprove);
    confirmation.appendChild(buttonReject);

    document.body.appendChild(notificationTint);

    setTimeout(() => {
      confirmation.style.setProperty("opacity", "1", "important");
      confirmation.style.setProperty("top", "20px", "important");
    }, 100)

    callBackResponse = callBack;
    return true;
  }


  if (message && message.checkQrModalBox) {
    const qrBox1 = document.getElementsByClassName("gebWbn")
    if (qrBox1.length > 0) {
      callBack(true) 
      return true;
    }
    const qrBox2 = document.getElementsByClassName("TmNzu")
    if (qrBox2.length > 0) {
      callBack(true) 
      return true;
    }

    callBack(false) 
    return false;

  }
})