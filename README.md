# Example of Chrome extension for WalletConnect

## Core characteristics

- Support WalletConnect
- Read QR-code from Binance Dex
- Auto connect to Binance dex
- Auto approve session from WalletConnect
- Approve / reject request from WalletConnect
- Kill session 

## Install dependencies
The wallet is developed on `Nodejs`, which is required for installation.
```
npm install
```

## Run the Wallet Extension
```
npm run build
```

## Get started 👩‍🏫

Once it is running, you need to enable "Developer mode" inside your Chrome Browser`s extension settings
```
Once enabled, click "Load Unpacked", then navigate to the "exampleWalletConnect/" folder to load the Example extension
```

## Language
  - JavaScript ES6
  
## Structure
  - src - source code
    - bg - background code of extension
      - background.js - send and receive messages from browser popup, inject and communicate with WalletConnectController
      - WalletConnectController.js - controller to communicate with WalletController
    - browser_action - popup widget
      - browser_action.html - html of popup window chrome extension
      - browser_action.js - sending messages to extension 
    - inject - inject code into current tab to show notification or confirmation dialog.
  - manifest.json - config of chrome extension

## Dependencies
  - @binance-chain/javascript-sdk - Javascript SDK to communicate with Binance Chain.
  - @walletconnect/browser - Browser SDK for WalletConnect
  - jsqr - A pure javascript QR code reading library.