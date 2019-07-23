'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var WalletController = require("./WalletConnectController").default;

var mnemonic = null;
var tab = null;
var walletConnect = null;
var state = {
  uri: null,
  connected: false,
  peerMeta: null,
  displayRequest: null,
  isLoadingWalletConnect: false
};

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var _tabs = _slicedToArray(tabs, 1),
        tabItem = _tabs[0];

    tab = tabItem;
  });

  if (message && message.setPrivateMnemonic) {
    console.log('setPrivateMnemonic', message);
    mnemonic = message.value;

    console.log('tab.id', tab);
    console.log('mnemonic', mnemonic);

    walletConnect = new WalletController(tab.id, mnemonic);
    states = walletConnect.states;
    console.log('states->>!!!!!!!!!!', states);
  }

  if (message && message.connectBinance) {
    console.log('connectBinance', message, walletConnect);

    walletConnect.scanQRCode();
  }

  if (message && message.rejectConnection) {
    console.log('rejectConnection', message, walletConnect);
    walletConnect.killSession();
  }

  if (message && message.rejectRequest) {
    console.log('rejectRequest', message, walletConnect);
    walletConnect.rejectRequest();
  }

  if (message && message.approveRequest) {
    console.log('approveRequest', message, walletConnect);
    walletConnect.approveRequest();
  }

  if (message && message.getStates) {
    if (walletConnect) {
      state = walletConnect.state;
    }
    sendResponse(state);
  }
});

console.log('background');

chrome.browserAction.onClicked.addListener(function (tab) {
  console.log('tab -> ', tab);
});