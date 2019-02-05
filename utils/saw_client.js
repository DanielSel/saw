"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var util_1 = require("util");
var ethers_1 = require("ethers");
var providers_1 = require("ethers/providers");
var utils_1 = require("ethers/utils");
var grpc_1 = require("grpc");
var saw_pop_grpc_pb_1 = require("./grpc/saw_pop_grpc_pb");
var saw_pop_pb_1 = require("./grpc/saw_pop_pb");
var SawClient = /** @class */ (function () {
    function SawClient(ethWallet, sawHost) {
        this.accTime = 0;
        this.ethWallet = ethWallet;
        this.popClient = new saw_pop_grpc_pb_1.SawPopClient(sawHost ? sawHost : "localhost" + ":6666", grpc_1.credentials.createInsecure());
    }
    SawClient.prototype.getSessionId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var newSessionRequest, ethAddress;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.sessionId) {
                            return [2 /*return*/, this.sessionId];
                        }
                        newSessionRequest = new saw_pop_pb_1.SessionIdRequest();
                        return [4 /*yield*/, this.ethWallet.getAddress()];
                    case 1:
                        ethAddress = _a.sent();
                        newSessionRequest.setEthAddress(ethAddress);
                        newSessionRequest.setSignature(this.signMessage(ethAddress));
                        return [4 /*yield*/, util_1.promisify(this.popClient.newSession)(newSessionRequest)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SawClient.prototype.createPop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pop;
            return __generator(this, function (_a) {
                if (!this.sessionId) {
                    console.error("ERROR: No active session! Request a new session first");
                    throw new Error("No active session! Request a new session first");
                }
                pop = new saw_pop_pb_1.Pop();
                pop.setSessionhash(this.sessionId);
                pop.setAccTime(this.accTime);
                pop.setSignature(this.signMessage([this.sessionId, this.accTime]));
                return [2 /*return*/, pop];
            });
        });
    };
    // Utility Functions
    SawClient.prototype.signMessage = function (msg) {
        var messageHash = utils_1.keccak256(msg);
        return utils_1.joinSignature(this.getSigningKey().signDigest(messageHash));
    };
    SawClient.prototype.getSigningKey = function () {
        var key = this.ethWallet.privateKey;
        if (utils_1.SigningKey.isSigningKey(key)) {
            return key;
        }
        else {
            return new utils_1.SigningKey(key);
        }
    };
    return SawClient;
}());
// Test
function simpleTest() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, testMnemonic, testWallet, sawClient, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    provider = module.exports.provider = new providers_1.InfuraProvider("ropsten", "***REMOVED***");
                    testMnemonic = "***REMOVED***";
                    testWallet = ethers_1.Wallet.fromMnemonic(testMnemonic);
                    testWallet.connect(provider);
                    sawClient = new SawClient(testWallet);
                    _b = (_a = console).log;
                    return [4 /*yield*/, sawClient.getSessionId()];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    return [2 /*return*/];
            }
        });
    });
}
simpleTest();
