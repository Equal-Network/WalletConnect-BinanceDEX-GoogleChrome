
var mnemonic = "";

chrome.extension.sendMessage("asd")

var buttonSetMnemonic = document.getElementById("buttonSetMnemonic")
buttonSetMnemonic.addEventListener("click", () => {
  console.log('setMnemonic', chrome.extension, chrome.tabs);
  chrome.extension.sendMessage({ 
    setPrivateMnemonic: true,
    value: mnemonic, 
  });
})

var buttonConnectBinance = document.getElementById("connectBinance")
buttonConnectBinance.addEventListener("click", () => {
  chrome.extension.sendMessage({ 
    connectBinance: true,
  })
});

var areaMnemonic = document.getElementById("mnemonic")
areaMnemonic.addEventListener("change", ({ target: { value }}) => {
  console.log('Mnemonic', value);
  mnemonic = value
})

var buttonrRejectConnectione = document.getElementById("rejectConnection")
buttonrRejectConnectione.addEventListener("click", () => {
  chrome.extension.sendMessage({ 
    rejectConnection: true,
  })
});

var buttonRejectRequest = document.getElementById("rejectRequest")
buttonRejectRequest.addEventListener("click", () => {
  chrome.extension.sendMessage({ 
    rejectRequest: true,
  })
});

var buttonApproveRequest = document.getElementById("approveRequest")
buttonApproveRequest.addEventListener("click", () => {
  chrome.extension.sendMessage({ 
    approveRequest: true,
  })
});


/**
 * Get state of WalletConnect
 *
 */
setInterval(() => {
  chrome.extension.sendMessage({ 
    getStates: true,
    name: 'getStates',
  }, (states) => {
    // console.log('->>>>> statets->>', states)
    const isConected = document.getElementById("isConected")
    isConected.innerText = states.connected || ''; 

    const connectBinance = document.getElementById("connectBinance") 
    if(states.connected) {
      connectBinance.style.visibility = 'hidden'
    } else {
      connectBinance.style.visibility = 'visible'
    }

    const nameConect = document.getElementById("nameConect")
    nameConect.innerText = states.peerMeta ? states.peerMeta.name : '';  

    const myAddress = document.getElementById("myAddress")
    myAddress.innerText = states.selectedBnbAddress ? states.selectedBnbAddress : '';

    const mnemonic = document.getElementById("mnemonic") 
    const buttonSetMnemonic = document.getElementById("buttonSetMnemonic") 

    if(states.selectedBnbAddress) {
      mnemonic.style.visibility = 'hidden'
      buttonSetMnemonic.style.visibility = 'hidden'
    } else {
      mnemonic.style.visibility = 'visible'
      buttonSetMnemonic.style.visibility = 'visible'
    }

    const requestId = document.getElementById("requestId")
    requestId.innerText = states.displayRequest ? states.displayRequest.id : ''

    const rowNewId = document.getElementById("rowNewId")
    if(states.displayRequest) {
      rowNewId.style.visibility = 'visible'
    } else {
      rowNewId.style.visibility = 'hidden'
    }
  });

}, 1000)

