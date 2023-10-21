var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
import { decodeUrlOrAddress, isOnionUrl, checkedToSats, getJson, isUrl, } from './utils';
var TAG_PAY_REQUEST = 'payRequest';
export var requestPayServiceParams = function (_a) {
    var lnUrlOrAddress = _a.lnUrlOrAddress, _b = _a.onionAllowed, onionAllowed = _b === void 0 ? false : _b, _c = _a.fetchGet, fetchGet = _c === void 0 ? getJson : _c;
    return __awaiter(void 0, void 0, void 0, function () {
        var url, json, params;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    url = decodeUrlOrAddress(lnUrlOrAddress);
                    if (!isUrl(url))
                        throw new Error('Invalid lnUrlOrAddress');
                    if (!onionAllowed && isOnionUrl(url))
                        throw new Error('Onion requests not allowed');
                    return [4 /*yield*/, fetchGet({ url: url })];
                case 1:
                    json = _d.sent();
                    params = parseLnUrlPayServiceResponse(json);
                    if (!params)
                        throw new Error('Invalid pay service params');
                    return [2 /*return*/, params];
            }
        });
    });
};
/**
 * Parse the ln service response to LnUrlPayServiceResponse
 * @method parseLnUrlPayServiceResponse
 * @param  data object to parse
 * @return  LnUrlPayServiceResponse
 */
var parseLnUrlPayServiceResponse = function (data) {
    if (data.tag !== TAG_PAY_REQUEST)
        return null;
    var callback = (data.callback + '').trim();
    if (!isUrl(callback))
        return null;
    var min = checkedToSats(Math.ceil(Number(data.minSendable || 0) / 1000));
    var max = checkedToSats(Math.floor(Number(data.maxSendable) / 1000));
    if (!(min && max) || min > max)
        return null;
    var metadata;
    try {
        metadata = JSON.parse(data.metadata + '');
    }
    catch (_a) {
        metadata = [];
    }
    var image = '';
    var description = '';
    var identifier = '';
    for (var i = 0; i < metadata.length; i++) {
        var _b = metadata[i], k = _b[0], v = _b[1];
        switch (k) {
            case 'text/plain':
                description = v;
                break;
            case 'text/identifier':
                identifier = v;
                break;
            case 'image/png;base64':
            case 'image/jpeg;base64':
                image = 'data:' + k + ',' + v;
                break;
        }
    }
    var domainMatch = callback.match(/(?:[A-Za-z0-9-]+\.)+[A-Za-z0-9]{1,3}/);
    return {
        callback: callback,
        fixed: min === max,
        min: min,
        max: max,
        domain: (domainMatch && domainMatch[0]) || undefined,
        metadata: metadata,
        identifier: identifier,
        description: description,
        image: image,
        commentAllowed: Number(data.commentAllowed) || 0,
    };
};
