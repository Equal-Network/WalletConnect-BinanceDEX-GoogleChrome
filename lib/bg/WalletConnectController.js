"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WalletConnect = require("@walletconnect/browser").default;
var jsQR = require("jsqr");

var _require = require("@binance-chain/javascript-sdk"),
    crypto = _require.crypto,
    utils = _require.utils;

// const NETWORK = "testnet";


var NETWORK = "mainnet";
// const RPC_URI = "https://data-seed-pre-0-s3.binance.org";
var RPC_URI = "https://dataseed1.binance.org";
// const BNC_URI = "https://testnet-dex-asiapacific.binance.org";
var BNC_URI = "https://dex.binance.org";

/**
 * Controller for provide connect, reject, aprrove request for WalletConnect.
 */

var WalletConnectController = function () {

  /**
   * Init connect.
   * @param tabId tab id.
   * @param mnemonic mnemonic of wallet of Binance, 12 words.
   *
   */
  function WalletConnectController(tabId, mnemonic) {
    var _this = this;

    _classCallCheck(this, WalletConnectController);

    _initialiseProps.call(this);

    this.tabId = tabId;
    this.mnemonic = mnemonic;
    this.openWalletTabsIDs = {};

    this.initWallet();

    this.state.selectedBnbAddress = crypto.getAddressFromPrivateKey(crypto.getPrivateKeyFromMnemonic(mnemonic), "bnb");

    this.checkQrModal = setInterval(function () {
      if (_this.tabId) {
        var _tabId = _this.tabId;

        chrome.tabs.sendMessage(_tabId, { checkQrModalBox: true }, function (result) {
          var walletConnector = _this.walletConnector;

          console.log("checkQrModalBox", result, _this.startScanQrCode);
          var isConnected = walletConnector && walletConnector.connected;
          console.log("isConnected->>", isConnected);
          if (result && !_this.startScanQrCode && !isConnected) {
            _this.startScanQrCode = true;
            _this.scanQrCodeWithOpenModal();
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


  _createClass(WalletConnectController, [{
    key: "getMnemonic",
    value: function getMnemonic() {
      return this.mnemonic;
    }

    /**
     * Sign transaction.
     * @param rawTx raw transaction from Binance.
     * @return sign transaction
     *
     */

  }, {
    key: "signTx",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(rawTx) {
        var selectedAddressIndex, mnemonic, privKey, pubKey, msg, signature;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                selectedAddressIndex = 0;
                _context.next = 3;
                return this.getMnemonic();

              case 3:
                mnemonic = _context.sent;
                _context.prev = 4;
                privKey = crypto.getPrivateKeyFromMnemonic(mnemonic, true, selectedAddressIndex);
                pubKey = crypto.getPublicKeyFromPrivateKey(privKey);
                msg = Buffer.from(JSON.stringify(rawTx)).toString("hex");
                signature = crypto.generateSignature(msg, privKey).toString("hex");
                return _context.abrupt("return", {
                  publicKey: pubKey,
                  signature: signature
                });

              case 12:
                _context.prev = 12;
                _context.t0 = _context["catch"](4);

                console.log(_context.t0);

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 12]]);
      }));

      function signTx(_x) {
        return _ref.apply(this, arguments);
      }

      return signTx;
    }()

    /**
     * Init walletConnect from localStorage.
     *
     */

  }, {
    key: "initWallet",
    value: function initWallet() {
      var local = localStorage ? localStorage.getItem("walletconnect") : null;

      if (local) {
        var session = void 0;

        try {
          session = JSON.parse(local);
        } catch (error) {
          throw error;
        }

        var walletConnector = new WalletConnect({ session: session });

        walletConnector.killSession();
        walletConnector._removeStorageSession();
      }
    }

    /**
     * Init walletConnect from uri.
     * @param uri uri from Qr code of Binance.
     *
     */

  }, {
    key: "initWalletConnect",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(uri) {
        var walletConnector;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                walletConnector = new WalletConnect({ uri: uri });

                this.walletConnector = walletConnector;

                window.walletConnector = walletConnector;

                if (walletConnector.connected) {
                  _context2.next = 9;
                  break;
                }

                _context2.next = 7;
                return walletConnector.createSession();

              case 7:
                _context2.next = 11;
                break;

              case 9:
                walletConnector.killSession();
                walletConnector._removeStorageSession();

              case 11:
                this.state = _extends({}, this.state, {
                  uri: uri,
                  connected: false,
                  peerMeta: null,
                  displayRequest: null,
                  isLoadingWalletConnect: false
                });
                this.subscribeToEvents();
                _context2.next = 18;
                break;

              case 15:
                _context2.prev = 15;
                _context2.t0 = _context2["catch"](0);
                throw _context2.t0;

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 15]]);
      }));

      function initWalletConnect(_x2) {
        return _ref2.apply(this, arguments);
      }

      return initWalletConnect;
    }()

    /**
     * Subcribe to events from WalletConnect.
     *
     */

  }, {
    key: "subscribeToEvents",
    value: function subscribeToEvents() {
      var _this2 = this;

      var walletConnector = this.walletConnector;

      var tabId = this.tabId;

      if (walletConnector) {
        walletConnector.on("session_request", function (error, payload) {
          console.log('walletConnector.on("session_request")');

          if (error) {
            throw error;
          }

          var peerMeta = payload.params[0].peerMeta;

          _this2.state.peerMeta = peerMeta;
          _this2.state.isLoadingWalletConnect = false;

          // auto approve
          _this2.approveSession();
        });

        walletConnector.on("session_update", function (error, payload) {
          console.log('walletConnector.on("session_update")'); // tslint:disable-line

          if (error) {
            throw error;
          }
        });

        walletConnector.on("call_request", function (error, payload) {
          console.log('walletConnector.on("call_request")', payload); // tslint:disable-line

          if (error) {
            throw error;
          }
          if (payload.method === "bnb_sign") {
            _this2.state.displayRequest = payload;

            chrome.tabs.sendMessage(tabId, {
              showConfirmation: true
            }, function (result) {
              console.log("result ->>>>>", result);

              if (result) {
                _this2.approveRequest(payload);
              } else {
                _this2.rejectRequest(payload);
              }

              chrome.tabs.sendMessage(tabId, {
                hideConfirmation: true
              });
            });
          }
        });

        walletConnector.on("connect", function (error, payload) {
          console.log('walletConnector.on("connect")'); // tslint:disable-line

          if (error) {
            throw error;
          }

          _this2.state.connected = true;
        });

        walletConnector.on("disconnect", function (error, payload) {
          console.log('walletConnector.on("disconnect")', walletConnector); // tslint:disable-line

          if (error) {
            throw error;
          }
          _this2.state.connected = false;
          _this2.state.displayRequest = null;
          _this2.state.peerMeta = null;
          _this2.initWallet();
          _this2.startScanQrCode = false;
        });

        if (walletConnector.connected) {
          var chainId = walletConnector.chainId,
              accounts = walletConnector.accounts;

          var address = accounts[0];

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


    /**
     * Reject session.
     *
     */


    /**
     * Kill session.
     *
     */

  }, {
    key: "loadPageShowModal",


    /**
     * Loading new tab with binance dex.
     *
     */
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var _this3 = this;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", new Promise(function (resolve, reject) {
                  try {
                    chrome.tabs.create({ url: "https://www.binance.org/en/unlock" }, function (newTab) {
                      setTimeout(function () {
                        chrome.tabs.executeScript(newTab.id, { file: "src/inject/inject.js" }, function () {
                          _this3.tabId = newTab.id;
                          chrome.tabs.sendMessage(newTab.id, { hideWallet: true });
                          setTimeout(function () {
                            _this3.openWalletTabsIDs = _defineProperty({}, newTab.id, true);

                            _this3.isStart = true;

                            _this3.interval = setInterval(function () {
                              if (_this3.isStart) {
                                chrome.tabs.sendMessage(newTab.id, { showModalQrCodde: true }, function () {
                                  _this3.isStart = false;
                                  console.log("clear interval");
                                  clearInterval(_this3.interval);
                                  resolve(true);
                                });
                              }
                            }, 1000);
                          }, 200);
                        });
                      }, 1000);
                    });
                  } catch (err) {
                    console.log("err sendMessage", err);
                    resolve(false);
                  }
                }));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function loadPageShowModal() {
        return _ref3.apply(this, arguments);
      }

      return loadPageShowModal;
    }()

    /**
     * Scaning qr code for connect Binance through WalletConnect.
     *
     */

  }, {
    key: "scanQrCodeWithOpenModal",
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var _this4 = this;

        var tabId, imgDataUrl, qrCodeUrlResponse;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                console.log("scanQrCodeWithOpenModal");
                tabId = this.tabId;


                console.log("->>>showNotification>>", tabId);

                this.state.isLoadingWalletConnect = true;
                this.state.connected = false;
                this.state.peerMeta = null;
                this.state.displayRequest = null;

                _context5.prev = 7;

                chrome.tabs.sendMessage(tabId, {
                  showNotification: true
                });
                // chrome.tabs.sendMessage(tabId, { hideWallet: true });
                _context5.next = 11;
                return new Promise(function (resolve, reject) {
                  try {
                    setTimeout(function () {
                      chrome.tabs.captureVisibleTab(null, { format: "png" }, function (imgData) {
                        resolve(imgData);
                      });
                    }, 2000);
                  } catch (err) {
                    console.log("err captureVisibleTab", err);
                    reject(err);
                  }
                });

              case 11:
                imgDataUrl = _context5.sent;
                _context5.next = 14;
                return new Promise(function (resolve, reject) {
                  var img = new Image();
                  img.onload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                    var canvas, ctx, width, height, x1, y1, qrImageData, canvas2, ctx2, code;
                    return regeneratorRuntime.wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            canvas = document.createElement("canvas");

                            canvas.width = this.naturalWidth;
                            canvas.height = this.naturalHeight;
                            ctx = canvas.getContext("2d");

                            ctx.drawImage(this, 0, 0);

                            width = 600 / canvas.width;
                            height = 600 / canvas.height;
                            x1 = (canvas.width / 2 - 300) / canvas.width;
                            y1 = canvas.height * 0.24 / canvas.height;
                            qrImageData = ctx.getImageData(canvas.width * x1, canvas.height * y1, canvas.width * width, canvas.height * height);
                            canvas2 = document.createElement("canvas");

                            canvas2.width = qrImageData.width;
                            canvas2.height = qrImageData.height;
                            ctx2 = canvas2.getContext("2d");

                            ctx2.putImageData(qrImageData, 0, 0);

                            console.log("canvas2.toDataURL", canvas2.toDataURL("image/png"));

                            code = jsQR(qrImageData.data, qrImageData.width, qrImageData.height);

                            console.log("qr code", code);

                            if (!(code && code.data)) {
                              _context4.next = 20;
                              break;
                            }

                            return _context4.abrupt("return", resolve(code.data));

                          case 20:
                            this.startScanQrCode = false;
                            return _context4.abrupt("return", null);

                          case 22:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, _callee4, this);
                  }));
                  img.src = imgDataUrl;
                });

              case 14:
                qrCodeUrlResponse = _context5.sent;

                if (!qrCodeUrlResponse) {
                  _context5.next = 19;
                  break;
                }

                console.log("qrCodeUrlResponse.text", qrCodeUrlResponse);
                _context5.next = 19;
                return this.initWalletConnect(qrCodeUrlResponse);

              case 19:
                setTimeout(function () {
                  _this4.startScanQrCode = false;
                }, 3000);
                _context5.next = 27;
                break;

              case 22:
                _context5.prev = 22;
                _context5.t0 = _context5["catch"](7);

                console.log(_context5.t0);
                setTimeout(function () {
                  _this4.startScanQrCode = false;
                }, 3000);
                throw _context5.t0;

              case 27:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[7, 22]]);
      }));

      function scanQrCodeWithOpenModal() {
        return _ref4.apply(this, arguments);
      }

      return scanQrCodeWithOpenModal;
    }()

    /**
     * Loading new tab and scaning qr code.
     *
     */

  }, {
    key: "scanQRCode",
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                this.startScanQrCode = true;
                console.log("scanQRCode");

                _context6.prev = 2;
                _context6.next = 5;
                return this.loadPageShowModal();

              case 5:
                _context6.next = 7;
                return this.scanQrCodeWithOpenModal();

              case 7:
                _context6.next = 14;
                break;

              case 9:
                _context6.prev = 9;
                _context6.t0 = _context6["catch"](2);

                console.log(_context6.t0);
                this.startScanQrCode = false;
                throw _context6.t0;

              case 14:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this, [[2, 9]]);
      }));

      function scanQRCode() {
        return _ref6.apply(this, arguments);
      }

      return scanQRCode;
    }()

    /**
     * Approve Request from Binance
     *
     */


    /**
     * Reject Request from Binance
     *
     */

  }]);

  return WalletConnectController;
}();

var _initialiseProps = function _initialiseProps() {
  var _this5 = this;

  this.state = {
    uri: null,
    connected: false,
    peerMeta: null,
    displayRequest: null,
    isLoadingWalletConnect: false,
    selectedBnbAddress: ""
  };

  this.approveSession = function () {
    var tabId = _this5.tabId;

    var selectedBnbAddress = crypto.getAddressFromPrivateKey(crypto.getPrivateKeyFromMnemonic(_this5.getMnemonic()), "bnb");

    var walletConnector = _this5.walletConnector;


    if (walletConnector) {
      walletConnector.approveSession({
        chainId: 1,
        accounts: [selectedBnbAddress]
      });
    }

    chrome.tabs.sendMessage(tabId, {
      hideNotification: true
    });

    delete _this5.openWalletTabsIDs[tabId];

    _this5.walletConnector = walletConnector;
  };

  this.rejectSession = function () {
    if (_this5.walletConnector) {
      _this5.walletConnector.rejectSession();
    }
  };

  this.killSession = function () {
    if (_this5.walletConnector) {
      _this5.walletConnector.killSession();
    }
  };

  this.approveRequest = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
    var displayRequest, tabId, _displayRequest$param, rawTx, txSign;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            displayRequest = _this5.state.displayRequest;

            console.log("approveRequest", displayRequest);

            tabId = _this5.tabId;
            _context7.t0 = displayRequest.method;
            _context7.next = _context7.t0 === "bnb_sign" ? 6 : 21;
            break;

          case 6:
            _displayRequest$param = _slicedToArray(displayRequest.params, 1), rawTx = _displayRequest$param[0];
            _context7.prev = 7;
            _context7.next = 10;
            return _this5.signTx(rawTx);

          case 10:
            txSign = _context7.sent;
            _context7.next = 13;
            return _this5.walletConnector.approveRequest({
              id: displayRequest.id,
              result: JSON.stringify(txSign)
            });

          case 13:
            _context7.next = 18;
            break;

          case 15:
            _context7.prev = 15;
            _context7.t1 = _context7["catch"](7);

            console.log("eror", _context7.t1);

          case 18:

            _this5.state.displayRequest = null;

            try {
              chrome.tabs.sendMessage(tabId, { hideWallet: true });
            } catch (error) {
              console.log("error- >", error);
            }
            return _context7.abrupt("break", 22);

          case 21:
            return _context7.abrupt("break", 22);

          case 22:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, _this5, [[7, 15]]);
  }));
  this.rejectRequest = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
    var displayRequest;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            displayRequest = _this5.state.displayRequest;

            console.log("rejectRequest", displayRequest);

            if (_this5.walletConnector) {
              _this5.walletConnector.rejectRequest({
                id: displayRequest.id,
                error: { message: "Failed or Rejected Request" }
              });
            }

            _this5.state.displayRequest = null;

          case 4:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, _this5);
  }));
};

exports.default = WalletConnectController;