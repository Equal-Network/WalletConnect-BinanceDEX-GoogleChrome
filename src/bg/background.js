var WalletController = require("./WalletConnectController").default;

var mnemonic = null;
var tab = null;
var walletConnect = null;
var state = {
  uri: null,
  connected: false,
  peerMeta: null,
  displayRequest: null, 
  isLoadingWalletConnect: false,
};

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const [tabItem] = tabs;
    tab = tabItem
  });

  if (message && message.setPrivateMnemonic) {
    console.log('setPrivateMnemonic', message)
    mnemonic = message.value

    console.log('tab.id', tab)
    console.log('mnemonic', mnemonic)

    walletConnect = new WalletController(tab.id, mnemonic)
    states = walletConnect.states 
    console.log('states->>!!!!!!!!!!', states)
  }

  if (message && message.connectBinance) {
    console.log('connectBinance', message, walletConnect)

    walletConnect.scanQRCode()
  }

  if (message && message.rejectConnection) {
    console.log('rejectConnection', message, walletConnect)
    walletConnect.killSession()
  }

  if (message && message.rejectRequest) {
    console.log('rejectRequest', message, walletConnect)
    walletConnect.rejectRequest()
  }

  if (message && message.approveRequest) {
    console.log('approveRequest', message, walletConnect)
    walletConnect.approveRequest()
  }

  if(message && message.getStates) {
    if (walletConnect) {
      state = walletConnect.state;
    }
    sendResponse(state);
  }
  
});

console.log('background')

chrome.browserAction.onClicked.addListener((tab) => {
  console.log('tab -> ', tab)

})