"use strict";

var mnemonic = "";

chrome.extension.sendMessage("asd");

var buttonSetMnemonic = document.getElementById("buttonSetMnemonic");
buttonSetMnemonic.addEventListener("click", function () {
  console.log('setMnemonic', chrome.extension, chrome.tabs);
  chrome.extension.sendMessage({
    setPrivateMnemonic: true,
    value: mnemonic
  });
});

var buttonConnectBinance = document.getElementById("connectBinance");
buttonConnectBinance.addEventListener("click", function () {
  chrome.extension.sendMessage({
    connectBinance: true
  });
});

var areaMnemonic = document.getElementById("mnemonic");
areaMnemonic.addEventListener("change", function (_ref) {
  var value = _ref.target.value;

  console.log('Mnemonic', value);
  mnemonic = value;
});

var buttonrRejectConnectione = document.getElementById("rejectConnection");
buttonrRejectConnectione.addEventListener("click", function () {
  chrome.extension.sendMessage({
    rejectConnection: true
  });
});

var buttonRejectRequest = document.getElementById("rejectRequest");
buttonRejectRequest.addEventListener("click", function () {
  chrome.extension.sendMessage({
    rejectRequest: true
  });
});

var buttonApproveRequest = document.getElementById("approveRequest");
buttonApproveRequest.addEventListener("click", function () {
  chrome.extension.sendMessage({
    approveRequest: true
  });
});

/**
 * Get state of WalletConnect
 *
 */
setInterval(function () {
  chrome.extension.sendMessage({
    getStates: true,
    name: 'getStates'
  }, function (states) {
    // console.log('->>>>> statets->>', states)
    var isConected = document.getElementById("isConected");
    isConected.innerText = states.connected || '';

    var connectBinance = document.getElementById("connectBinance");
    if (states.connected) {
      connectBinance.style.visibility = 'hidden';
    } else {
      connectBinance.style.visibility = 'visible';
    }

    var nameConect = document.getElementById("nameConect");
    nameConect.innerText = states.peerMeta ? states.peerMeta.name : '';

    var myAddress = document.getElementById("myAddress");
    myAddress.innerText = states.selectedBnbAddress ? states.selectedBnbAddress : '';

    var mnemonic = document.getElementById("mnemonic");
    var buttonSetMnemonic = document.getElementById("buttonSetMnemonic");

    if (states.selectedBnbAddress) {
      mnemonic.style.visibility = 'hidden';
      buttonSetMnemonic.style.visibility = 'hidden';
    } else {
      mnemonic.style.visibility = 'visible';
      buttonSetMnemonic.style.visibility = 'visible';
    }

    var requestId = document.getElementById("requestId");
    requestId.innerText = states.displayRequest ? states.displayRequest.id : '';

    var rowNewId = document.getElementById("rowNewId");
    if (states.displayRequest) {
      rowNewId.style.visibility = 'visible';
    } else {
      rowNewId.style.visibility = 'hidden';
    }
  });
}, 1000);