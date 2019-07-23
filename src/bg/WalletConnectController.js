const WalletConnect = require("@walletconnect/browser").default;
const jsQR = require("jsqr");
const { crypto, utils } = require("@binance-chain/javascript-sdk");

// const NETWORK = "testnet";
const NETWORK = "mainnet";
// const RPC_URI = "https://data-seed-pre-0-s3.binance.org";
const RPC_URI = "https://dataseed1.binance.org";
// const BNC_URI = "https://testnet-dex-asiapacific.binance.org";
const BNC_URI = "https://dex.binance.org";

/**
 * Controller for provide connect, reject, aprrove request for WalletConnect.
 */
class WalletConnectController {
  state = {
    uri: null,
    connected: false,
    peerMeta: null,
    displayRequest: null,
    isLoadingWalletConnect: false,
    selectedBnbAddress: "",
  };

  /**
   * Init connect.
   * @param tabId tab id.
   * @param mnemonic mnemonic of wallet of Binance, 12 words.
   *
   */
  constructor(tabId, mnemonic) {
    this.tabId = tabId;
    this.mnemonic = mnemonic;
    this.openWalletTabsIDs = {};

    this.initWallet();

    this.state.selectedBnbAddress = crypto.getAddressFromPrivateKey(
      crypto.getPrivateKeyFromMnemonic(mnemonic),
      "bnb"
    );

    this.checkQrModal = setInterval(() => {
      if (this.tabId) {
        const tabId = this.tabId;

        chrome.tabs.sendMessage(tabId, { checkQrModalBox: true }, result => {
          const { walletConnector } = this;
          console.log("checkQrModalBox", result, this.startScanQrCode);
          const isConnected = walletConnector && walletConnector.connected;
          console.log("isConnected->>", isConnected);
          if (result && !this.startScanQrCode && !isConnected) {
            this.startScanQrCode = true;
            this.scanQrCodeWithOpenModal();
          }
        });
      }
    }, 3000);
  }

  /**
   * Get mnemonic.
   * @return mnemonic of wallet of Binance, 12 words.
   *
   */
  getMnemonic() {
    return this.mnemonic;
  }

  /**
   * Sign transaction.
   * @param rawTx raw transaction from Binance.
   * @return sign transaction
   *
   */
  async signTx(rawTx) {
    const selectedAddressIndex = 0;
    const mnemonic = await this.getMnemonic();

    try {
      const privKey = crypto.getPrivateKeyFromMnemonic(
        mnemonic,
        true,
        selectedAddressIndex
      );
      const pubKey = crypto.getPublicKeyFromPrivateKey(privKey);

      const msg = Buffer.from(JSON.stringify(rawTx)).toString("hex");
      const signature = crypto.generateSignature(msg, privKey).toString("hex");

      return {
        publicKey: pubKey,
        signature,
      };
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Init walletConnect from localStorage.
   *
   */
  initWallet() {
    const local = localStorage ? localStorage.getItem("walletconnect") : null;

    if (local) {
      let session;

      try {
        session = JSON.parse(local);
      } catch (error) {
        throw error;
      }

      const walletConnector = new WalletConnect({ session });

      walletConnector.killSession();
      walletConnector._removeStorageSession();
    }
  }

  /**
   * Init walletConnect from uri.
   * @param uri uri from Qr code of Binance.
   *
   */
  async initWalletConnect(uri) {
    try {
      const walletConnector = new WalletConnect({ uri });
      this.walletConnector = walletConnector;

      window.walletConnector = walletConnector;

      if (!walletConnector.connected) {
        await walletConnector.createSession();
      } else {
        walletConnector.killSession();
        walletConnector._removeStorageSession();
      }
      this.state = {
        ...this.state,
        uri,
        connected: false,
        peerMeta: null,
        displayRequest: null,
        isLoadingWalletConnect: false,
      };
      this.subscribeToEvents();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Subcribe to events from WalletConnect.
   *
   */
  subscribeToEvents() {
    const { walletConnector } = this;
    const tabId = this.tabId;

    if (walletConnector) {
      walletConnector.on("session_request", (error, payload) => {
        console.log('walletConnector.on("session_request")');

        if (error) {
          throw error;
        }

        const { peerMeta } = payload.params[0];
        this.state.peerMeta = peerMeta;
        this.state.isLoadingWalletConnect = false;

        // auto approve
        this.approveSession();
      });

      walletConnector.on("session_update", (error, payload) => {
        console.log('walletConnector.on("session_update")'); // tslint:disable-line

        if (error) {
          throw error;
        }
      });

      walletConnector.on("call_request", (error, payload) => {
        console.log('walletConnector.on("call_request")', payload); // tslint:disable-line

        if (error) {
          throw error;
        }
        if (payload.method === "bnb_sign") {
          this.state.displayRequest = payload;

          chrome.tabs.sendMessage(
            tabId,
            {
              showConfirmation: true,
            },
            result => {
              console.log("result ->>>>>", result);

              if (result) {
                this.approveRequest(payload);
              } else {
                this.rejectRequest(payload);
              }

              chrome.tabs.sendMessage(tabId, {
                hideConfirmation: true,
              });
            }
          );
        }
      });

      walletConnector.on("connect", (error, payload) => {
        console.log('walletConnector.on("connect")'); // tslint:disable-line

        if (error) {
          throw error;
        }

        this.state.connected = true;
      });

      walletConnector.on("disconnect", (error, payload) => {
        console.log('walletConnector.on("disconnect")', walletConnector); // tslint:disable-line

        if (error) {
          throw error;
        }
        this.state.connected = false;
        this.state.displayRequest = null;
        this.state.peerMeta = null;
        this.initWallet();
        this.startScanQrCode = false;
      });

      if (walletConnector.connected) {
        const { chainId, accounts } = walletConnector;
        const address = accounts[0];

        this.state.connected = true;
        this.state.address = address;
        this.state.chainId = chainId;
      } else {
        this.state.connected = false;
        this.state.displayRequest = null;
        this.state.peerMeta = null;
      }

      this.walletConnector = walletConnector;
    }
  }

  /**
   * Approve session.
   *
   */
  approveSession = () => {
    const tabId = this.tabId;

    const selectedBnbAddress = crypto.getAddressFromPrivateKey(
      crypto.getPrivateKeyFromMnemonic(this.getMnemonic()),
      "bnb"
    );

    const { walletConnector } = this;

    if (walletConnector) {
      walletConnector.approveSession({
        chainId: 1,
        accounts: [selectedBnbAddress],
      });
    }

    chrome.tabs.sendMessage(tabId, {
      hideNotification: true,
    });

    delete this.openWalletTabsIDs[tabId];

    this.walletConnector = walletConnector;
  };

  /**
   * Reject session.
   *
   */
  rejectSession = () => {
    if (this.walletConnector) {
      this.walletConnector.rejectSession();
    }
  };

  /**
   * Kill session.
   *
   */
  killSession = () => {
    if (this.walletConnector) {
      this.walletConnector.killSession();
    }
  };

  /**
   * Loading new tab with binance dex.
   *
   */
  async loadPageShowModal() {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.create(
          { url: "https://www.binance.org/en/unlock" },
          newTab => {
            setTimeout(() => {
              chrome.tabs.executeScript(
                newTab.id,
                { file: "src/inject/inject.js" },
                () => {
                  this.tabId = newTab.id;
                  chrome.tabs.sendMessage(newTab.id, { hideWallet: true });
                  setTimeout(() => {
                    this.openWalletTabsIDs = {
                      [newTab.id]: true,
                    };

                    this.isStart = true;

                    this.interval = setInterval(() => {
                      if (this.isStart) {
                        chrome.tabs.sendMessage(
                          newTab.id,
                          { showModalQrCodde: true },
                          () => {
                            this.isStart = false;
                            console.log("clear interval");
                            clearInterval(this.interval);
                            resolve(true);
                          }
                        );
                      }
                    }, 1000);
                  }, 200);
                }
              );
            }, 1000);
          }
        );
      } catch (err) {
        console.log("err sendMessage", err);
        resolve(false);
      }
    });
  }

  /**
   * Scaning qr code for connect Binance through WalletConnect.
   *
   */
  async scanQrCodeWithOpenModal() {
    console.log("scanQrCodeWithOpenModal");
    const tabId = this.tabId;

    console.log("->>>showNotification>>", tabId);

    this.state.isLoadingWalletConnect = true;
    this.state.connected = false;
    this.state.peerMeta = null;
    this.state.displayRequest = null;

    try {
      chrome.tabs.sendMessage(tabId, {
        showNotification: true,
      });
      // chrome.tabs.sendMessage(tabId, { hideWallet: true });
      const imgDataUrl = await new Promise((resolve, reject) => {
        try {
          setTimeout(() => {
            chrome.tabs.captureVisibleTab(null, { format: "png" }, imgData => {
              resolve(imgData);
            });
          }, 2000);
        } catch (err) {
          console.log("err captureVisibleTab", err);
          reject(err);
        }
      });

      const qrCodeUrlResponse = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async function() {
          const canvas = document.createElement("canvas");
          canvas.width = this.naturalWidth;
          canvas.height = this.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(this, 0, 0);

          const width = 600 / canvas.width;
          const height = 600 / canvas.height;
          const x1 = (canvas.width / 2 - 300) / canvas.width;
          const y1 = (canvas.height * 0.24) / canvas.height;

          const qrImageData = ctx.getImageData(
            canvas.width * x1,
            canvas.height * y1,
            canvas.width * width,
            canvas.height * height
          );

          const canvas2 = document.createElement("canvas");
          canvas2.width = qrImageData.width;
          canvas2.height = qrImageData.height;
          const ctx2 = canvas2.getContext("2d");
          ctx2.putImageData(qrImageData, 0, 0);

          console.log("canvas2.toDataURL", canvas2.toDataURL("image/png"));

          const code = jsQR(
            qrImageData.data,
            qrImageData.width,
            qrImageData.height
          );
          console.log("qr code", code);
          if (code && code.data) {
            return resolve(code.data);
          }
          this.startScanQrCode = false;
          return null;
        };
        img.src = imgDataUrl;
      });
      if (qrCodeUrlResponse) {
        console.log("qrCodeUrlResponse.text", qrCodeUrlResponse);
        await this.initWalletConnect(qrCodeUrlResponse);
      }
      setTimeout(() => {
        this.startScanQrCode = false;
      }, 3000);
    } catch (err) {
      console.log(err);
      setTimeout(() => {
        this.startScanQrCode = false;
      }, 3000);
      throw err;
    }
  }

  /**
   * Loading new tab and scaning qr code.
   *
   */
  async scanQRCode() {
    this.startScanQrCode = true;
    console.log("scanQRCode");

    try {
      await this.loadPageShowModal();

      await this.scanQrCodeWithOpenModal();
    } catch (err) {
      console.log(err);
      this.startScanQrCode = false;
      throw err;
    }
  }

  /**
   * Approve Request from Binance
   *
   */
  approveRequest = async () => {
    const displayRequest = this.state.displayRequest;
    console.log("approveRequest", displayRequest);

    const tabId = this.tabId;

    switch (displayRequest.method) {
      case "bnb_sign":
        const [rawTx] = displayRequest.params;

        try {
          const txSign = await this.signTx(rawTx);

          await this.walletConnector.approveRequest({
            id: displayRequest.id,
            result: JSON.stringify(txSign),
          });
        } catch (error) {
          console.log("eror", error);
        }

        this.state.displayRequest = null;

        try {
          chrome.tabs.sendMessage(tabId, { hideWallet: true });
        } catch (error) {
          console.log("error- >", error);
        }
        break;
      default:
        break;
    }
  };

  /**
   * Reject Request from Binance
   *
   */
  rejectRequest = async () => {
    const displayRequest = this.state.displayRequest;
    console.log("rejectRequest", displayRequest);

    if (this.walletConnector) {
      this.walletConnector.rejectRequest({
        id: displayRequest.id,
        error: { message: "Failed or Rejected Request" },
      });
    }

    this.state.displayRequest = null;
  };
}

export default WalletConnectController;
