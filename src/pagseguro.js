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
Object.defineProperty(exports, "__esModule", { value: true });
var querystring_1 = require("querystring");
var xmlParser = require("xml2json");
var request = require("request");
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
        criarTransacao: { method: 'POST', url: '/v2/checkout' }
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
             * Indica o modelo de cobran�a do pagamento recorrente pr�-pago (AUTO) */
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
             * Indica o modelo de cobran�a do pagamento recorrente p�s-pago (MANUAL).*/
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
            this.paymentMethod = new PagSeguroPaymentMethod();
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
    var PagSeguroCheckout = /** @class */ (function () {
        function PagSeguroCheckout() {
        }
        return PagSeguroCheckout;
    }());
    PagSeguro.PagSeguroCheckout = PagSeguroCheckout;
    var Client = /** @class */ (function () {
        function Client(parameters) {
            this.baseUrl = "https://ws.sandbox.pagseguro.uol.com.br";
            this.parameters = { appId: "", appKey: "", currency: "BRL", email: "", environment: "sandbox", token: "", verbose: false };
            this.parameters = parameters;
        }
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
                                console.log('[PagSeguro Response] Status:', response.statusCode, response.statusMessage);
                                console.log('[PagSeguro Response] Content Type:', response.headers["content-type"]);
                                console.log('[PagSeguro Response] Body:', body);
                                var fs = require('fs');
                                fs.writeFileSync('response-body.txt', body);
                                if (body) {
                                    console.log('[PagSeguro Response] Parsing body...');
                                    try {
                                        body = JSON.parse(body);
                                        console.log('[PagSeguro Response] JSON Body parsed!');
                                    }
                                    catch (e) {
                                        try {
                                            body = JSON.parse(xmlParser.toJson(body));
                                            console.log('[PagSeguro Response] XML Body parsed!');
                                        }
                                        catch (e) {
                                        }
                                    }
                                }
                                if (err) {
                                    console.log('[PagSeguro Response] Error:', err);
                                    return cb(err, body);
                                }
                                else if (response.statusCode == 200) {
                                    return cb(null, body);
                                }
                                else {
                                    try {
                                        if (body) {
                                            console.log('[PagSeguro Response] Response Body:', body);
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
                                            console.log(body);
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
                                url: url, headers: { accept: 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1' }
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
        Client.prototype.criarTransacao = function (checkout) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
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
                        throw new Error('missing adress field');
                    return [2 /*return*/];
                });
            });
        };
        /**
         *
         * @param plano
         * @param cb
         */
        Client.prototype.criarPlano = function (plano, cb) {
            return __awaiter(this, void 0, void 0, function () {
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
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.criarPlano.method, url, body, cb, 'application/json')];
                        case 1: // xmlParser.toXml({ preApprovalRequest: plano });
                        return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        /**
         * @param {PagSeguroPreApproval} info
         * @param {(err, response) => void} cb
         */
        Client.prototype.aderirPlano = function (info, cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url, body;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.pagamentoRecorrente.aderirPlano.url, {});
                            body = JSON.stringify(info);
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.aderirPlano.method, url, body, cb, 'application/json')];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        Client.prototype.alterarMeioPagtoPlano = function (cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.pagamentoRecorrente.alterarMeioPagtoPlano.url, {});
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.alterarMeioPagtoPlano.method, url, null, cb)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        Client.prototype.alterarStatusAdesao = function (cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.pagamentoRecorrente.alterarStatusAdesao.url, {});
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.alterarStatusAdesao.method, url, null, cb)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        Client.prototype.alterarValorPlano = function (cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.pagamentoRecorrente.alterarValorPlano.url, {});
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.alterarValorPlano.method, url, null, cb)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        Client.prototype.cancelarAdesao = function (cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.pagamentoRecorrente.cancelarAdesao.url, {});
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.cancelarAdesao.method, url, null, cb)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        Client.prototype.cobrancaManual = function (cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.pagamentoRecorrente.cobrancaManual.url, {});
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.cobrancaManual.method, url, null, cb)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        Client.prototype.concederDescontoProxCob = function (cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.pagamentoRecorrente.concederDescontoProxCob.url, {});
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.concederDescontoProxCob.method, url, null, cb)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        Client.prototype.getAdesao = function (cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.pagamentoRecorrente.getAdesao.url, {});
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.getAdesao.method, url, null, cb)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        Client.prototype.getAdesoes = function (cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.pagamentoRecorrente.getAdesoes.url, {});
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.getAdesoes.method, url, null, cb)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        Client.prototype.getNotificacoes = function (cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.pagamentoRecorrente.getNotificacoes.url, {});
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.getNotificacoes.method, url, null, cb)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        /**
         *
         * @param {'ACTIVE' | 'INACTIVE'} status Default: ACTIVE
         * @param {Date} startCreationDate Default: Today
         * @param {Date} endCreationDate Default: Today
         * @param {(err: any, responseBody: any) => void} cb
         */
        Client.prototype.getPlanos = function (status, startCreationDate, endCreationDate, cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (typeof status === 'undefined')
                                status = 'ACTIVE';
                            if (typeof startCreationDate === 'undefined') {
                                startCreationDate = new Date();
                                startCreationDate.setHours(0);
                                startCreationDate.setMinutes(0);
                                startCreationDate.setSeconds(0);
                                startCreationDate.setMilliseconds(0);
                            }
                            if (typeof endCreationDate === 'undefined') {
                                endCreationDate = new Date();
                            }
                            if (typeof startCreationDate === 'number')
                                startCreationDate = new Date(startCreationDate);
                            if (typeof endCreationDate === 'number')
                                endCreationDate = new Date(endCreationDate);
                            if ((startCreationDate.__proto__.constructor.name).toLocaleLowerCase() !== 'date')
                                throw new Error("'startCreationDate' parameter is invalid");
                            if ((endCreationDate.__proto__.constructor.name).toLocaleLowerCase() !== 'date')
                                throw new Error("'endCreationDate' parameter is invalid");
                            startCreationDate = startCreationDate.toJSON();
                            endCreationDate = endCreationDate.toJSON();
                            url = this.urlGen(endPoints.pagamentoRecorrente.getPlanos.url, { status: status, startCreationDate: startCreationDate, endCreationDate: endCreationDate });
                            console.log(url);
                            return [4 /*yield*/, this.doRequest('GET', url, null, cb)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        Client.prototype.getRecorrenciaPorNotificacao = function (cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.pagamentoRecorrente.getRecorrenciaPorNotificacao.url, {});
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.getRecorrenciaPorNotificacao.method, url, null, cb)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        Client.prototype.listarOrdensPagto = function (cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.pagamentoRecorrente.listarOrdensPagto.url, {});
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.listarOrdensPagto.method, url, null, cb)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        Client.prototype.retentarCobranca = function (cb) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.urlGen(endPoints.pagamentoRecorrente.retentarCobranca.url, {});
                            return [4 /*yield*/, this.doRequest(endPoints.pagamentoRecorrente.retentarCobranca.method, url, null, cb)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        ;
        return Client;
    }());
    PagSeguro.Client = Client;
})(PagSeguro = exports.PagSeguro || (exports.PagSeguro = {}));
//# sourceMappingURL=pagseguro.js.map