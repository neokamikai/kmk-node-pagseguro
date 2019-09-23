"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var querystring_1 = require("querystring");
var xmlParser = require("xml2json");
var request = require("request");
var removeAccents = require("remove-accents");
var endPoints = {
    sessionId: { method: 'POST', url: '/v2/sessions' },
    pagamentoRecorrente: {
        criarPlano: { method: 'POST', url: '/pre-approvals/request' },
        aderirPlano: { method: 'POST', url: '/pre-approvals' },
        cobrancaManual: { method: 'POST', url: '/pre-approvals/payment' },
        alterarStatusAdesao: { method: 'PUT', url: '/pre-approvals/:preApprovalCode/status' },
        cancelarAdesao: { method: 'PUT', url: '/pre-approvals/:preApprovalCode/cancel' },
        alterarValorPlano: { method: 'PUT', url: '/pre-approvals/request/:preApprovalRequestCode/payment' },
        concederDescontoProxCob: { method: 'PUT', url: '/pre-approvals/:preApprovalCode/discount' },
        alterarMeioPagtoPlano: { method: 'PUT', url: '/pre-approvals/:preApprovalCode/payment-method' },
        listarOrdensPagto: { method: 'GET', url: '/pre-approvals/:preApprovalCode/payment-orders' },
        retentarCobranca: { method: 'POST', url: '/pre-approvals/:preApprovalCode/payment-orders/:paymentOrderCode/payment' },
        getPlanos: {
            method: 'GET', url: '/pre-approvals/request'
        },
        getPlano: {
            method: 'GET', url: '/pre-approvals/request/:id'
        },
        getAdesoes: {
            method: 'GET', url: '/pre-approvals'
        },
        getAdesao: {
            method: 'GET', url: '/pre-approvals/:preApprovalCode'
        },
        getRecorrenciaPorNotificacao: {
            method: 'GET', url: '/pre-approvals/notifications/:notificationCode'
        },
        getNotificacoes: {
            method: 'GET', url: '/pre-approvals/notifications'
        },
    },
    pagamentoAvulso: {
        criarTransacao: { method: 'POST', url: '/v2/checkout' },
        redirectToPayment: { method: 'GET', url: '/v2/checkout/payment.html' },
        lightboxPayment: { method: 'GET', url: '/v2/checkout/pagseguro.lightbox.js' },
        consultaRetornoTransacao: { method: 'GET', url: '/v3/transactions/notifications/:notificationCode' },
        consultaTransacao: { method: 'GET', url: '/v3/transactions/:transactionCode' },
        cancelarTransacaoCheckout: { method: 'POST', url: '/v2/transactions/cancels' },
        estornarTransacaoCheckout: { method: 'POST', url: '/v2/transactions/refunds' },
    }
};
var constants;
(function (constants) {
    constants.PAGESEGURO_PREAPPROVAL_CHARGE = { AUTO: 'AUTO', MANUAL: 'MANUAL' };
    constants.PAGESEGURO_PREAPPROVAL_PERIOD = {
        ANUAL: 'YEARLY', MENSAL: 'MONTHLY',
        BIMESTRAL: 'BIMONTHLY', TRIMESTRAL: 'TRIMONTHLY',
        SEMESTRAL: 'SEMIANNUALLY', SEMANAL: 'WEEKLY'
    };
})(constants = exports.constants || (exports.constants = {}));
var PagSeguro;
(function (PagSeguro) {
    var Parameters = /** @class */ (function () {
        function Parameters() {
            /** Default: 'sandbox'
             *
             * Options: 'sandbox' or 'production'
             */
            this.environment = 'sandbox';
        }
        return Parameters;
    }());
    var PagSeguroHolder = /** @class */ (function () {
        function PagSeguroHolder() {
        }
        return PagSeguroHolder;
    }());
    PagSeguro.PagSeguroHolder = PagSeguroHolder;
    var PagSeguroPreApprovalRequestDataReceiver = /** @class */ (function () {
        function PagSeguroPreApprovalRequestDataReceiver() {
        }
        return PagSeguroPreApprovalRequestDataReceiver;
    }());
    PagSeguro.PagSeguroPreApprovalRequestDataReceiver = PagSeguroPreApprovalRequestDataReceiver;
    var PagSeguroPreApprovalRequestDataAuto = /** @class */ (function () {
        function PagSeguroPreApprovalRequestDataAuto() {
            /** REQUIRED
             * Indica o modelo de cobrança do pagamento recorrente pré-pago (AUTO) */
            this.charge = 'AUTO';
        }
        return PagSeguroPreApprovalRequestDataAuto;
    }());
    PagSeguro.PagSeguroPreApprovalRequestDataAuto = PagSeguroPreApprovalRequestDataAuto;
    var PagSeguroPreApprovalRequestDataExpiration = /** @class */ (function () {
        function PagSeguroPreApprovalRequestDataExpiration() {
        }
        return PagSeguroPreApprovalRequestDataExpiration;
    }());
    PagSeguro.PagSeguroPreApprovalRequestDataExpiration = PagSeguroPreApprovalRequestDataExpiration;
    var PagSeguroPreApprovalRequestDataManual = /** @class */ (function () {
        function PagSeguroPreApprovalRequestDataManual() {
            /** REQUIRED
             * Indica o modelo de cobrança do pagamento recorrente pós-pago (MANUAL).*/
            this.charge = 'MANUAL';
            this.membershipFee = 0;
        }
        return PagSeguroPreApprovalRequestDataManual;
    }());
    PagSeguro.PagSeguroPreApprovalRequestDataManual = PagSeguroPreApprovalRequestDataManual;
    var PagSeguroPreApprovalRequest = /** @class */ (function () {
        function PagSeguroPreApprovalRequest(charge) {
            this.preApproval = charge === 'AUTO' ? new PagSeguroPreApprovalRequestDataAuto() : new PagSeguroPreApprovalRequestDataManual();
        }
        return PagSeguroPreApprovalRequest;
    }());
    PagSeguro.PagSeguroPreApprovalRequest = PagSeguroPreApprovalRequest;
    var PagSeguroAddress = /** @class */ (function () {
        function PagSeguroAddress() {
        }
        return PagSeguroAddress;
    }());
    PagSeguro.PagSeguroAddress = PagSeguroAddress;
    var PagSeguroPhone = /** @class */ (function () {
        function PagSeguroPhone() {
        }
        return PagSeguroPhone;
    }());
    PagSeguro.PagSeguroPhone = PagSeguroPhone;
    var PagSeguroDocument = /** @class */ (function () {
        function PagSeguroDocument() {
        }
        return PagSeguroDocument;
    }());
    PagSeguro.PagSeguroDocument = PagSeguroDocument;
    /** Dados do Assinante */
    var PagSeguroPreApprovalSender = /** @class */ (function () {
        function PagSeguroPreApprovalSender() {
            /** Telefone do consumidor. */
            this.phone = new PagSeguroPhone();
            this.address = new PagSeguroAddress();
            this.documents = [new PagSeguroDocument()];
        }
        return PagSeguroPreApprovalSender;
    }());
    PagSeguro.PagSeguroPreApprovalSender = PagSeguroPreApprovalSender;
    var PagSeguroPaymentMethodCreditCardHolder = /** @class */ (function () {
        function PagSeguroPaymentMethodCreditCardHolder() {
            this.documents = [new PagSeguroDocument()];
            this.billingAddress = new PagSeguroAddress();
            this.phone = new PagSeguroPhone();
        }
        return PagSeguroPaymentMethodCreditCardHolder;
    }());
    PagSeguro.PagSeguroPaymentMethodCreditCardHolder = PagSeguroPaymentMethodCreditCardHolder;
    var PagSeguroPaymentMethodCreditCard = /** @class */ (function () {
        function PagSeguroPaymentMethodCreditCard() {
            this.holder = new PagSeguroPaymentMethodCreditCardHolder();
        }
        return PagSeguroPaymentMethodCreditCard;
    }());
    PagSeguro.PagSeguroPaymentMethodCreditCard = PagSeguroPaymentMethodCreditCard;
    var PagSeguroPreApprovalPaymentMethod = /** @class */ (function () {
        function PagSeguroPreApprovalPaymentMethod() {
        }
        return PagSeguroPreApprovalPaymentMethod;
    }());
    PagSeguro.PagSeguroPreApprovalPaymentMethod = PagSeguroPreApprovalPaymentMethod;
    var PagSeguroPaymentMethod = /** @class */ (function () {
        function PagSeguroPaymentMethod() {
        }
        return PagSeguroPaymentMethod;
    }());
    PagSeguro.PagSeguroPaymentMethod = PagSeguroPaymentMethod;
    var PagSeguroPreApprovalPaymentItem = /** @class */ (function () {
        function PagSeguroPreApprovalPaymentItem() {
        }
        return PagSeguroPreApprovalPaymentItem;
    }());
    PagSeguro.PagSeguroPreApprovalPaymentItem = PagSeguroPreApprovalPaymentItem;
    var PagSeguroPreApprovalPayment = /** @class */ (function () {
        function PagSeguroPreApprovalPayment() {
            this.items = new Array();
        }
        return PagSeguroPreApprovalPayment;
    }());
    PagSeguro.PagSeguroPreApprovalPayment = PagSeguroPreApprovalPayment;
    var PagSeguroPreApproval = /** @class */ (function () {
        function PagSeguroPreApproval() {
            this.sender = new PagSeguroPreApprovalSender();
            this.paymentMethod = new PagSeguroPreApprovalPaymentMethod();
        }
        return PagSeguroPreApproval;
    }());
    PagSeguro.PagSeguroPreApproval = PagSeguroPreApproval;
    var PagSeguroCheckoutSender = /** @class */ (function () {
        function PagSeguroCheckoutSender() {
            this.phone = new PagSeguroPhone();
            this.documents = [];
        }
        return PagSeguroCheckoutSender;
    }());
    PagSeguro.PagSeguroCheckoutSender = PagSeguroCheckoutSender;
    var PagSeguroCheckoutItem = /** @class */ (function () {
        function PagSeguroCheckoutItem() {
        }
        return PagSeguroCheckoutItem;
    }());
    PagSeguro.PagSeguroCheckoutItem = PagSeguroCheckoutItem;
    var PagSeguroCheckoutShipping = /** @class */ (function () {
        function PagSeguroCheckoutShipping() {
        }
        return PagSeguroCheckoutShipping;
    }());
    PagSeguro.PagSeguroCheckoutShipping = PagSeguroCheckoutShipping;
    var PagSeguroCheckoutReceiver = /** @class */ (function () {
        function PagSeguroCheckoutReceiver() {
        }
        return PagSeguroCheckoutReceiver;
    }());
    PagSeguro.PagSeguroCheckoutReceiver = PagSeguroCheckoutReceiver;
    var PagSeguroCheckoutAcceptedPaymentMethods = /** @class */ (function () {
        function PagSeguroCheckoutAcceptedPaymentMethods() {
        }
        return PagSeguroCheckoutAcceptedPaymentMethods;
    }());
    PagSeguro.PagSeguroCheckoutAcceptedPaymentMethods = PagSeguroCheckoutAcceptedPaymentMethods;
    var PagSeguroCheckoutAcceptedPaymentMethod = /** @class */ (function () {
        function PagSeguroCheckoutAcceptedPaymentMethod() {
        }
        return PagSeguroCheckoutAcceptedPaymentMethod;
    }());
    PagSeguro.PagSeguroCheckoutAcceptedPaymentMethod = PagSeguroCheckoutAcceptedPaymentMethod;
    var PagSeguroCheckoutPaymentMethodConfig = /** @class */ (function () {
        function PagSeguroCheckoutPaymentMethodConfig() {
        }
        return PagSeguroCheckoutPaymentMethodConfig;
    }());
    PagSeguro.PagSeguroCheckoutPaymentMethodConfig = PagSeguroCheckoutPaymentMethodConfig;
    var PagSeguroCheckoutPaymentMethodConfigEntry = /** @class */ (function () {
        function PagSeguroCheckoutPaymentMethodConfigEntry() {
        }
        return PagSeguroCheckoutPaymentMethodConfigEntry;
    }());
    PagSeguro.PagSeguroCheckoutPaymentMethodConfigEntry = PagSeguroCheckoutPaymentMethodConfigEntry;
    var PagSeguroCheckout = /** @class */ (function () {
        function PagSeguroCheckout() {
        }
        return PagSeguroCheckout;
    }());
    PagSeguro.PagSeguroCheckout = PagSeguroCheckout;
    var Client = /** @class */ (function () {
        function Client(parameters) {
            this.baseUrl = "https://ws.sandbox.pagseguro.uol.com.br";
            this.paymentUrl = "https://sandbox.pagseguro.uol.com.br";
            this.scriptBaseUrl = "https://stc.sandbox.pagseguro.uol.com.br/pagseguro/api";
            this.parameters = { appId: "", appKey: "", currency: "BRL", email: "", environment: "sandbox", token: "", verbose: false };
            this.parameters = parameters;
            if (this.parameters.environment === 'production') {
                this.baseUrl = 'https://ws.pagseguro.uol.com.br';
                this.scriptBaseUrl = 'https://stc.pagseguro.uol.com.br/pagseguro/api';
                this.paymentUrl = 'https://pagseguro.uol.com.br';
            }
        }
        Client.prototype.redirectUrlGen = function (route, queryStringParameters) {
            if (queryStringParameters === void 0) { queryStringParameters = {}; }
            var queryParams = {};
            if (typeof queryStringParameters === "string") {
                queryStringParameters = querystring_1.parse(queryStringParameters);
            }
            if (typeof queryStringParameters === "object" && !Array.isArray(queryStringParameters)) {
                var params = route.match(/\:([^\/]+)/g);
                if (params) {
                    for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
                        var param = params_1[_i];
                        param = param.substr(1);
                        route = route.replace(":" + param, queryStringParameters[param]);
                        delete queryStringParameters[param];
                    }
                }
                queryParams = Object.assign(queryParams, queryStringParameters);
            }
            return "" + this.baseUrl + route + "?" + querystring_1.stringify(queryParams);
        };
        Client.prototype.paymentUrlGen = function (route, queryStringParameters) {
            var _this = this;
            if (queryStringParameters === void 0) { queryStringParameters = {}; }
            var queryParams = (function () {
                return { email: _this.parameters.email, token: _this.parameters.token };
            })();
            if (typeof queryStringParameters === "string") {
                queryStringParameters = querystring_1.parse(queryStringParameters);
            }
            if (typeof queryStringParameters === "object" && !Array.isArray(queryStringParameters)) {
                var params = route.match(/\:([^\/]+)/g);
                if (params) {
                    for (var _i = 0, params_2 = params; _i < params_2.length; _i++) {
                        var param = params_2[_i];
                        param = param.substr(1);
                        route = route.replace(":" + param, queryStringParameters[param]);
                        delete queryStringParameters[param];
                    }
                }
                queryParams = Object.assign(queryParams, queryStringParameters);
            }
            return "" + this.paymentUrl + route + "?" + querystring_1.stringify(queryParams);
        };
        Client.prototype.urlGen = function (route, queryStringParameters) {
            var _this = this;
            if (queryStringParameters === void 0) { queryStringParameters = {}; }
            var queryParams = (function () {
                return { email: _this.parameters.email, token: _this.parameters.token };
            })();
            if (typeof queryStringParameters === "string") {
                queryStringParameters = querystring_1.parse(queryStringParameters);
            }
            if (typeof queryStringParameters === "object" && !Array.isArray(queryStringParameters)) {
                var params = route.match(/\:([^\/]+)/g);
                if (params) {
                    for (var _i = 0, params_3 = params; _i < params_3.length; _i++) {
                        var param = params_3[_i];
                        param = param.substr(1);
                        route = route.replace(":" + param, queryStringParameters[param]);
                        delete queryStringParameters[param];
                    }
                }
                queryParams = Object.assign(queryParams, queryStringParameters);
            }
            return "" + this.baseUrl + route + "?" + querystring_1.stringify(queryParams);
        };
        Client.prototype.scriptUrlGen = function (route) {
            return "" + this.scriptBaseUrl + route;
        };
        Client.prototype.doRequest = function (method, url, body, cb, contentType, accept) {
            if (contentType === void 0) { contentType = null; }
            if (accept === void 0) { accept = null; }
            return __awaiter(this, void 0, void 0, function () {
                var responseHandler, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (typeof cb === 'undefined')
                                cb = function () { };
                            responseHandler = function (err, response, body) {
                                //console.log('[PagSeguro Response] Status:', response.statusCode, response.statusMessage);
                                //console.log('[PagSeguro Response] Content Type:', response.headers["content-type"]);
                                //console.log('[PagSeguro Response] Body:', body);
                                //const fs = require('fs');
                                //fs.writeFileSync('response-body.txt', body);
                                if (body) {
                                    //console.log('[PagSeguro Response] Parsing body...');
                                    try {
                                        body = JSON.parse(body);
                                        //console.log('[PagSeguro Response] JSON Body parsed!');
                                    }
                                    catch (e) {
                                        try {
                                            body = JSON.parse(xmlParser.toJson(body));
                                            //console.log('[PagSeguro Response] XML Body parsed!');
                                        }
                                        catch (e) {
                                        }
                                    }
                                }
                                if (err) {
                                    //console.log('[PagSeguro Response] Error:', err);
                                    return cb(err, body);
                                }
                                else if (response.statusCode == 200) {
                                    return cb(null, body);
                                }
                                else {
                                    try {
                                        if (body) {
                                            //console.log('[PagSeguro Response] Response Body:', body);
                                            var json = body;
                                            if (json.errors && json.errors.error) {
                                                return cb(json.errors.error, json);
                                            }
                                            return cb(json);
                                        }
                                        else
                                            return (cb(response.statusMessage));
                                    }
                                    catch (e) {
                                        try {
                                            var json = JSON.parse(body);
                                            if (json.errors && json.errors.error) {
                                                return cb(json.errors.error, json);
                                            }
                                        }
                                        catch (e) {
                                            throw e;
                                            //console.log(body);
                                        }
                                    }
                                    return cb(body);
                                }
                            };
                            _a = method.toUpperCase();
                            switch (_a) {
                                case 'GET': return [3 /*break*/, 1];
                                case 'POST': return [3 /*break*/, 3];
                                case 'PUT': return [3 /*break*/, 5];
                                case 'DELETE': return [3 /*break*/, 7];
                            }
                            return [3 /*break*/, 9];
                        case 1: return [4 /*yield*/, request.get({
                                url: url, headers: { accept: accept === null ? 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1' : accept }
                            }, responseHandler)];
                        case 2: return [2 /*return*/, _b.sent()];
                        case 3: return [4 /*yield*/, request.post({
                                url: url, body: body, headers: { accept: accept === null ? 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1' : accept, 'content-type': contentType }
                            }, responseHandler)];
                        case 4: return [2 /*return*/, _b.sent()];
                        case 5: return [4 /*yield*/, request.put({
                                url: url, body: body, headers: { accept: 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1', 'content-type': contentType }
                            }, responseHandler)];
                        case 6: return [2 /*return*/, _b.sent()];
                        case 7: return [4 /*yield*/, request.delete({
                                url: url, body: body, headers: { accept: 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1', 'content-type': contentType }
                            }, responseHandler)];
                        case 8: return [2 /*return*/, _b.sent()];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        Client.prototype.sessionId = function (cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.sessionId.url);
                            return [4 /*yield*/, this.doRequest(endPoints.sessionId.method, url, null, function (err, response) {
                                    return cb(err, !response || !response.session || !response.session.id ? null : response.session.id);
                                }, 'application/xml; charset=ISO-8859-1', 'application/xml; charset=ISO-8859-1')];
                        case 1: 
                        //console.log('[PagSeguro] Session Id Url:', url);
                        return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        Client.prototype.criarTransacao = function (checkout, callback, mode) {
            if (mode === void 0) { mode = 'redirect'; }
            return __awaiter(this, void 0, void 0, function () {
                var url, i, body;
                var _this = this;
                return __generator(this, function (_a) {
                    url = this.urlGen(endPoints.pagamentoAvulso.criarTransacao.url, {});
                    if (!checkout)
                        throw new Error('missing argument: checkout');
                    if (!checkout.sender)
                        throw new Error('missing property: sender');
                    if (!checkout.items)
                        throw new Error('missing property: items');
                    if (!checkout.currency)
                        throw new Error('missing property: currency');
                    if (checkout.items.length === 0)
                        throw new Error('no items');
                    if (!checkout.shipping)
                        throw new Error('missing property: shipping');
                    if (!checkout.shipping.address && checkout.shipping.addressRequired)
                        throw new Error('missing address field');
                    for (i = 0; i < checkout.items.length; i++) {
                        if (typeof checkout.items[i].amount === 'number')
                            checkout.items[i].amount = checkout.items[i].amount.toFixed(2);
                    }
                    if (typeof checkout.extraAmount === 'number')
                        checkout.extraAmount = checkout.extraAmount.toFixed(2);
                    if (typeof checkout.shipping.cost === 'number')
                        checkout.shipping.cost = checkout.shipping.cost.toFixed(2);
                    body = "<?xml version=\"1.0\" encoding=\"ISO-8859-1\" standalone=\"yes\" ?>\n<checkout>\n    <sender>\n        <name>" + removeAccents.remove(checkout.sender.name) + "</name>\n        <email>" + checkout.sender.email + "</email>\n        <phone>\n            <areaCode>" + checkout.sender.phone.areaCode + "</areaCode>\n            <number>" + checkout.sender.phone.number + "</number>\n        </phone>\n\t\t<documents>" +
                        checkout.sender.documents.map(function (doc) { return "\n\t\t\t<document>\n                <type>" + doc.type + "</type>\n                <value>" + doc.value + "</value>\n            </document>"; }).join('')
                        + "\n        </documents>\n    </sender>\n    <currency>BRL</currency>\n    <items>" +
                        checkout.items.map(function (item) { return "\n        <item>\n            <id>" + item.id + "</id>\n            <description>" + removeAccents.remove(item.description) + "</description>\n            <amount>" + item.amount + "</amount>\n            <quantity>" + item.quantity + "</quantity>\n            <weight>" + item.weight + "</weight>\n            " + (item.shippingCost ? "<shippingCost>" + item.shippingCost + "</shippingCost>" : '') + "\n        </item>"; }).join('')
                        + "\n    </items>" + (checkout.redirectURL ? "\n    <redirectURL>" + checkout.redirectURL + "</redirectURL>" : '') + (checkout.notificationURL ? "\n    <notificationURL>" + checkout.notificationURL + "</notificationURL>" : '') + ("\n    <extraAmount>" + checkout.extraAmount + "</extraAmount>\n    <reference>" + checkout.reference + "</reference>\n    <shipping>\n        <address>\n            <street>" + removeAccents.remove(checkout.shipping.address.street) + "</street>\n            <number>" + removeAccents.remove(checkout.shipping.address.number) + "</number>\n            <complement>" + removeAccents.remove(checkout.shipping.address.complement) + "</complement>\n            <district>" + removeAccents.remove(checkout.shipping.address.district) + "</district>\n            <city>" + removeAccents.remove(checkout.shipping.address.city) + "</city>\n            <state>" + removeAccents.remove(checkout.shipping.address.state) + "</state>\n            <country>" + removeAccents.remove(checkout.shipping.address.country) + "</country>\n            <postalCode>" + checkout.shipping.address.postalCode + "</postalCode>\n        </address>\n        <type>" + checkout.shipping.type + "</type>\n        <cost>" + checkout.shipping.cost + "</cost>\n        <addressRequired>" + checkout.shipping.addressRequired + "</addressRequired>\n    </shipping>\n    <timeout>" + checkout.timeout + "</timeout>\n    <maxAge>" + checkout.maxAge + "</maxAge>\n    <maxUses>" + checkout.maxUses + "</maxUses>") + (checkout.receiver ? "\n    <receiver>\n        <email>" + checkout.receiver.email + "</email>\n    </receiver>" : '') + ("\n    <enableRecovery>" + (checkout.enableRecovery || false) + "</enableRecovery>") + (checkout.acceptedPaymentMethods && checkout.acceptedPaymentMethods.exclude ? "\n\t<acceptedPaymentMethods>" + (checkout.acceptedPaymentMethods.exclude ? "\n\t\t<exclude>" + (checkout.acceptedPaymentMethods.exclude.map(function (pm) { return "\n\t\t\t<paymentMethod>\n\t\t\t\t<group>" + pm.group + "</group>\n\t\t\t</paymentMethod>"; }).join('')) + "\n\t\t</exclude>" : '') + "\n\t</acceptedPaymentMethods>" : '') + (checkout.paymentMethodConfigs && checkout.paymentMethodConfigs.length > 0 ? "\n    <paymentMethodConfigs>" + (checkout.paymentMethodConfigs.map(function (pmc) { return "\n        <paymentMethodConfig>\n            <paymentMethod>\n                <group>" + pmc.paymentMethod.group + "</group>\n            </paymentMethod>\n            <configs>" + (pmc.configs.map(function (pmce) { return "\n                <config>\n                    <key>" + pmce.key + "</key>\n                    <value>" + pmce.value + "</value>\n                </config>"; }).join('')) + "\n            </configs>\n        </paymentMethodConfig>"; }).join('')) + "\n    </paymentMethodConfigs>" : '') + "\n</checkout>";
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            _this.doRequest(endPoints.pagamentoAvulso.criarTransacao.method, url, body, function (err, resp) {
                                if (err) {
                                    if (callback)
                                        callback(err, resp);
                                    else
                                        reject(err);
                                }
                                else {
                                    resp.checkout.date = new Date(Date.parse(resp.checkout.date));
                                    if (mode === 'redirect')
                                        resp.checkout.redirectUrl = _this.paymentUrlGen(endPoints.pagamentoAvulso.redirectToPayment.url, { code: resp.checkout.code });
                                    if (mode === 'lightbox')
                                        resp.checkout.scriptUrl = _this.scriptUrlGen(endPoints.pagamentoAvulso.lightboxPayment.url);
                                    resolve(resp);
                                    if (callback)
                                        callback(err, resp);
                                }
                            }, 'application/xml; charset=ISO-8859-1', 'application/xml; charset=ISO-8859-1');
                        })];
                });
            });
        };
        Client.prototype.consultaRetornoTransacaoCheckout = function (notificationCode, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoAvulso.consultaRetornoTransacao.url, { notificationCode: notificationCode });
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoAvulso.consultaRetornoTransacao.method, url, {}, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                }, 'application/x-www-form-urlencoded', 'application/xml;charset=ISO-8859-1')];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        Client.prototype.estornarTransacaoParcialCheckout = function (transactionCode, refundValue, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (typeof refundValue === 'number')
                                                refundValue = refundValue.toFixed(2);
                                            url = this.urlGen(endPoints.pagamentoAvulso.estornarTransacaoCheckout.url, { transactionCode: transactionCode });
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoAvulso.estornarTransacaoCheckout.method, url, {}, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                }, 'application/x-www-form-urlencoded', 'application/xml;charset=ISO-8859-1')];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        Client.prototype.estornarTransacaoCheckout = function (transactionCode, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoAvulso.estornarTransacaoCheckout.url, { transactionCode: transactionCode });
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoAvulso.estornarTransacaoCheckout.method, url, {}, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                }, 'application/x-www-form-urlencoded', 'application/xml;charset=ISO-8859-1')];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })().catch(function (e) { return reject(e); });
                        })];
                });
            });
        };
        Client.prototype.cancelarTransacaoCheckout = function (transactionCode, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoAvulso.cancelarTransacaoCheckout.url, { transactionCode: transactionCode });
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoAvulso.cancelarTransacaoCheckout.method, url, {}, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                }, 'application/x-www-form-urlencoded', 'application/xml;charset=ISO-8859-1')];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        /**
         *
         * @param plano
         * @param callback
         */
        Client.prototype.criarPlano = function (plano, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url, body;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.criarPlano.url, {});
                                            if (plano.preApproval.charge === constants.PAGESEGURO_PREAPPROVAL_CHARGE.AUTO) {
                                                if (plano.preApproval.maxTotalAmount)
                                                    delete plano.preApproval.maxTotalAmount;
                                                if (plano.preApproval.expiration) {
                                                    if (!plano.preApproval.expiration.unit && !plano.preApproval.expiration.value)
                                                        delete plano.preApproval.expiration;
                                                }
                                                else
                                                    delete plano.preApproval.expiration;
                                                if (!plano.preApproval.maxUses)
                                                    delete plano.preApproval.maxUses;
                                                if (!plano.preApproval.membershipFee)
                                                    delete plano.preApproval.membershipFee;
                                                if (!plano.preApproval.reviewURL)
                                                    delete plano.preApproval.reviewURL;
                                                if (!plano.preApproval.trialPeriodDuration)
                                                    delete plano.preApproval.trialPeriodDuration;
                                            }
                                            if (typeof plano.preApproval.amountPerPayment === 'number')
                                                plano.preApproval.amountPerPayment = (plano.preApproval.amountPerPayment * 1 || 0).toFixed(2);
                                            if (typeof plano.preApproval.membershipFee === 'number')
                                                plano.preApproval.membershipFee = (plano.preApproval.membershipFee * 1 || 0).toFixed(2);
                                            body = JSON.stringify(plano);
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.criarPlano.method, url, body, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resp.date = new Date(Date.parse(resp.date));
                                                        resolve(resp);
                                                    }
                                                }, 'application/json')];
                                        case 1: // xmlParser.toXml({ preApprovalRequest: plano });
                                        return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        /**
         * @param info
         * @param callback
         */
        Client.prototype.aderirPlano = function (info, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url, birthDate, d, d, body;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.aderirPlano.url, {});
                                            if (info.paymentMethod && info.paymentMethod.creditCard) {
                                                if (info.paymentMethod.creditCard.holder) {
                                                    if (info.sender) {
                                                        if (info.sender.email) {
                                                            if (this.parameters.environment === 'sandbox') {
                                                                info.sender.email = info.sender.email.replace(/\@[\w\W]+/i, '@sandbox.pagseguro.com.br');
                                                            }
                                                        }
                                                        if (info.sender.address) {
                                                            if (!info.sender.address.country)
                                                                info.sender.address.country = 'BRA';
                                                        }
                                                    }
                                                    if (!info.paymentMethod.creditCard.holder.birthDate) {
                                                        if (info.paymentMethod.creditCard.holder.birthDate !== null)
                                                            info.paymentMethod.creditCard.holder.birthDate = null;
                                                    }
                                                    else if (typeof info.paymentMethod.creditCard.holder.birthDate === 'string') {
                                                        birthDate = info.paymentMethod.creditCard.holder.birthDate;
                                                        if (birthDate.match(/^\d\d\d\d\-\d\d\-\d\d$/)) {
                                                            d = (new Date(Date.parse(birthDate + 'T00:00:00.000-03:00')));
                                                            info.paymentMethod.creditCard.holder.birthDate = d.getDate().toString().padStart(2, '0') + "/" + (1 + d.getMonth()).toString().padStart(2, '0') + "/" + d.getFullYear();
                                                        }
                                                    }
                                                    else if (typeof info.paymentMethod.creditCard.holder.birthDate === 'object' && Object.getPrototypeOf(info.paymentMethod.creditCard.holder.birthDate) == Date.prototype) {
                                                        d = info.paymentMethod.creditCard.holder.birthDate;
                                                        info.paymentMethod.creditCard.holder.birthDate = d.getDate().toString().padStart(2, '0') + "/" + (1 + d.getMonth()).toString().padStart(2, '0') + "/" + d.getFullYear();
                                                    }
                                                    if (info.paymentMethod.creditCard.holder.billingAddress) {
                                                        if (!info.paymentMethod.creditCard.holder.billingAddress.country)
                                                            info.paymentMethod.creditCard.holder.billingAddress.country = 'BRA';
                                                    }
                                                }
                                            }
                                            console.log(info.paymentMethod.creditCard.holder);
                                            body = JSON.stringify(info);
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.aderirPlano.method, url, body, function (err, resp) {
                                                    if (callback) {
                                                        callback(err, resp);
                                                        Object.defineProperty(callback, 'called', { value: true });
                                                    }
                                                    ;
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resp.date = new Date(Date.parse(resp.date));
                                                        resolve(resp);
                                                    }
                                                }, 'application/json')];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })().catch(function (e) {
                                if (callback && !callback['called'])
                                    callback(e, null);
                                else
                                    throw e;
                            });
                        })];
                });
            });
        };
        ;
        Client.prototype.alterarMeioPagtoPlano = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.alterarMeioPagtoPlano.url, {});
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.alterarMeioPagtoPlano.method, url, null, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        Client.prototype.alterarStatusAdesao = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.alterarStatusAdesao.url, {});
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.alterarStatusAdesao.method, url, null, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        Client.prototype.alterarValorPlano = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.alterarValorPlano.url, {});
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.alterarValorPlano.method, url, null, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        Client.prototype.cancelarAdesao = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.cancelarAdesao.url, {});
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.cancelarAdesao.method, url, null, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        Client.prototype.cobrancaManual = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.cobrancaManual.url, {});
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.cobrancaManual.method, url, null, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        Client.prototype.concederDescontoProxCob = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.concederDescontoProxCob.url, {});
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.concederDescontoProxCob.method, url, null, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        Client.prototype.getAdesao = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.getAdesao.url, {});
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.getAdesao.method, url, null, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        Client.prototype.getAdesoes = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.getAdesoes.url, {});
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.getAdesoes.method, url, null, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        Client.prototype.getNotificacoesRecorrencias = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.getNotificacoes.url, {});
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.getNotificacoes.method, url, null, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        /**
         *
         * @param status Default: ACTIVE
         * @param startCreationDate Default: Today
         * @param endCreationDate Default: Today
         * @param callback
         */
        Client.prototype.getPlanos = function (status, startCreationDate, endCreationDate, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                var _this = this;
                return __generator(this, function (_a) {
                    if (typeof status === 'undefined')
                        status = 'ACTIVE';
                    if (typeof startCreationDate === 'undefined') {
                        startCreationDate = new Date();
                        startCreationDate.setHours(0);
                        startCreationDate.setMinutes(0);
                        startCreationDate.setSeconds(0);
                        startCreationDate.setMilliseconds(0);
                    }
                    else if (typeof startCreationDate === 'number') {
                        startCreationDate = new Date(startCreationDate);
                    }
                    else if (typeof startCreationDate === 'string') {
                        startCreationDate = new Date(Date.parse(startCreationDate));
                    }
                    if (typeof endCreationDate === 'undefined') {
                        endCreationDate = new Date();
                    }
                    else if (typeof endCreationDate === 'number') {
                        endCreationDate = new Date(endCreationDate);
                    }
                    else if (typeof endCreationDate === 'string') {
                        endCreationDate = new Date(Date.parse(endCreationDate));
                    }
                    if ((Object.getPrototypeOf(startCreationDate).constructor.name).toLocaleLowerCase() !== 'date')
                        throw new Error("'startCreationDate' parameter is invalid");
                    if ((Object.getPrototypeOf(endCreationDate).constructor.name).toLocaleLowerCase() !== 'date')
                        throw new Error("'endCreationDate' parameter is invalid");
                    startCreationDate = startCreationDate.toJSON();
                    endCreationDate = endCreationDate.toJSON();
                    url = this.urlGen(endPoints.pagamentoRecorrente.getPlanos.url, { status: status, startCreationDate: startCreationDate, endCreationDate: endCreationDate });
                    //console.log(url);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.doRequest('GET', url, null, function (err, resp) {
                                                if (callback)
                                                    callback(err, resp);
                                                if (err) {
                                                    if (!callback)
                                                        reject(err);
                                                }
                                                else {
                                                    resp.date = new Date(Date.parse(resp.date));
                                                    resp.preApprovalRequest = resp.preApprovalRequest.map(function (v) {
                                                        v.creationDate = new Date(Date.parse(v.creationDate));
                                                        if (typeof v.amountPerPayment === 'string')
                                                            v.amountPerPayment = parseFloat(v.amountPerPayment) || 0;
                                                        if (typeof v.trialPeriodDuration === 'string')
                                                            v.trialPeriodDuration = parseInt(v.amountPerPayment) || null;
                                                        if (typeof v.membershipFee === 'string')
                                                            v.membershipFee = parseFloat(v.membershipFee) || 0;
                                                        return v;
                                                    });
                                                    resolve(resp);
                                                }
                                            })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        Client.prototype.getRecorrenciaPorNotificacao = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.getRecorrenciaPorNotificacao.url, {});
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.getRecorrenciaPorNotificacao.method, url, null, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        Client.prototype.listarOrdensPagto = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.listarOrdensPagto.url, {});
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.listarOrdensPagto.method, url, null, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        Client.prototype.retentarCobranca = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var url;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = this.urlGen(endPoints.pagamentoRecorrente.retentarCobranca.url, {});
                                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.retentarCobranca.method, url, null, function (err, resp) {
                                                    if (callback)
                                                        callback(err, resp);
                                                    if (err) {
                                                        if (!callback)
                                                            reject(err);
                                                    }
                                                    else {
                                                        resolve(resp);
                                                    }
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })();
                        })];
                });
            });
        };
        ;
        return Client;
    }());
    PagSeguro.Client = Client;
})(PagSeguro = exports.PagSeguro || (exports.PagSeguro = {}));
//# sourceMappingURL=pagseguro.js.map