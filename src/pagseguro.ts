import { stringify as qsStringify, parse as qsParse } from "querystring";
import * as xmlParser from 'xml2json'
import * as request from 'request';
import * as qs from 'qs';
import * as removeAccents from 'remove-accents';

const endPoints = {
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

export namespace constants {
	export const PAGESEGURO_PREAPPROVAL_CHARGE = { AUTO: 'AUTO', MANUAL: 'MANUAL' };
	export const PAGESEGURO_PREAPPROVAL_PERIOD = {
		ANUAL: 'YEARLY', MENSAL: 'MONTHLY',
		BIMESTRAL: 'BIMONTHLY', TRIMESTRAL: 'TRIMONTHLY',
		SEMESTRAL: 'SEMIANNUALLY', SEMANAL: 'WEEKLY'
	};

}
export type PagSeguroPreApprovalRequestStatus = 'ACTIVE' | 'INACTIVE';
export type Charge = 'AUTO' | 'MANUAL';
export type PagSeguroCheckoutPaymentMethodType = 'CREDIT_CARD' | 'BOLETO' | 'DEBITO_ITAU';
export type PagSeguroPreApprovalPaymentMethodType = 'CREDITCARD';
export type Period = 'YEARLY' | 'MONTHLY' | 'BIMONTHLY' | 'TRIMONTHLY' | 'SEMIANNUALLY' | 'WEEKLY'
export namespace PagSeguro {
	interface IGetPreApprovals {
		resultsInThisPage: number;
		currentPage: number;
		totalPages: number;
		date: Date;
		preApprovalList: Array<IPreApprovalInstance>
	}
	interface IPreApprovalInstance {
		name: string,
		code: string,
		tracker: string,
		status: string,
		lastEventDate: Date,
		charge: string,
		sender: PagSeguroPreApprovalSender,
		date: Date
	}
	interface IGetPreApprovalRequests {
		resultsInThisPage: number;
		currentPage: number;
		totalPages: number;
		date: Date;
		preApprovalRequest: Array<IPreApprovalRequestInstance>
	}
	interface IPreApprovalRequestInstance {
		code: string;
		creationDate: Date;
		status: PagSeguroPreApprovalRequestStatus;
		name: string;
		description?: string;
		reference?: string;
		charge: Charge;
		period: Period;
		amountPerPayment: number;
		trialPeriodDuration?: number;
		membershipFee: number;
		maxUses?: number;
		cancelURL?: string;
		redirectURL?: string;
	}
	interface IPreApprovalRequestResponse {
		code: string;
		date: Date;
	}
	interface ICreatePreApprovalRequest {
		code: string;
		date: Date;
	}
	interface ICreateTransactionResponse {
		checkout: ICreateTransactionResponseCheckout;
	}
	interface ICreateTransactionResponseCheckout {
		code: string;
		date: Date;
	}
	interface ITransactionObjectPaymentMethod {
		type: number;
		code: number;
	}
	interface ITransactionObjectCreditorFees {
		intermediationRateAmount: PagSeguroAmount;
		intermediationFeeAmount: PagSeguroAmount;
	}
	interface ITransactionObject {
		date: Date;
		code: string;
		reference: string;
		type: number;
		status: number;
		paymentMethod: ITransactionObjectPaymentMethod;
		grossAmount: PagSeguroAmount;
		discountAmount: PagSeguroAmount;
		creditorFees: ITransactionObjectCreditorFees;
		netAmount: PagSeguroAmount;
		extraAmount: PagSeguroAmount;
		installmentCount: number;
		itemCount: number;
		items: Array<PagSeguroCheckoutItem>;
		sender: PagSeguroCheckoutSender;
		shipping: PagSeguroCheckoutShipping;
	}
	interface IGetCheckoutTransactionResponse {
		transaction: ITransactionObject
	}
	interface IRefundCheckoutTransactionResponse { }
	interface ICancelCheckoutTransactionResponse { }
	type PagSeguroCurrency = 'BRL';
	type EnvironmentType = 'production' | 'sandbox';
	/** Must have 2 decimal places: 10.00
	 *
	 * If data type is 'number': it will be automatically 'fixed' to 2 decimal places
	 */
	type PagSeguroAmount = string | number;
	type PagSeguroCheckoutMode = 'redirect' | 'lightbox';
	export interface IParameters {
		environment: string | "sandbox" | "production";
		email: string;
		appKey?: string;
		appId?: string;
		token: string;
		currency?: PagSeguroCurrency;
		verbose?: boolean;
	}
	class Parameters implements IParameters {
		/** Default: 'sandbox'
		 *
		 * Options: 'sandbox' or 'production'
		 */
		environment: EnvironmentType = 'sandbox';
		email: string;
		appKey?: string;
		appId?: string;
		token: string;
		currency?: "BRL";
		verbose?: boolean;


	}

	export class PagSeguroHolder {
		name: string;
		email: string;
		area_code: string;
		phone: string;
		birth_date: string;

	}
	type ExpirationUnit = 'YEARS' | 'MONTHS' | 'DAYS' | 'WEEKS';

	export class PagSeguroPreApprovalRequestDataReceiver {
		/** Especifica o e-mail que deve aparecer na tela de pagamento.
		 * Formato: Um e-mail válido, com limite de 60 caracteres.
		 * O e-mail informado deve estar vinculado á conta PagSeguro que está realizando a chamada á API. */
		email: string
	}
	export class PagSeguroPreApprovalRequestDataAuto {
		/** REQUIRED
		 * Nome/Identificador do plano. Formato: Livre, com limite de 100 caracteres. */
		name: string;
		/** REQUIRED
		 * Indica o modelo de cobrança do pagamento recorrente pré-pago (AUTO) */
		charge: 'AUTO' = 'AUTO';
		/** REQUIRED
		 * Periodicidade da cobrança.
		 * Utilizar um dos valores da constante PAGESEGURO_PREAPPROVAL_PERIOD */
		period: Period;
		/** Valor exato de cada cobrança.
		 * Obriagtório para o modelo AUTO.
		 * Formato: Decimal, com duas casas decimais separadas por ponto (p.e, 1234.56).
		 * Deve ser um valor maior ou igual a 1.00 e menor ou igual a 2000.00. */
		amountPerPayment: number | string;
		/** Valor da taxa de adesão.
		 * Sempre será cobrada juntamente com a primeira parcela do pagamento,
		 * independente se o plano é pré-pago ou pós-pago.
		 * Formato: Decimal, com duas casas decimais separadas por ponto (p.e, 1234.56),
		 * maior ou igual a 0.00 e menor ou igual a 1000000.00. */
		membershipFee: number | string;
		/** período de teste, em dias.
		 * A recorrência mantém o status INITIATED durante o período de testes,
		 * de modo que a primeira cobrança só ocorrerá após esse período,
		 * permitindo que a recorrência mude para ACTIVE.
		 *
		 * A cobrança se dá imediatamente após o fim do período de testes;
		 * Formato: Inteiro, maior ou igual a 1 e menor ou igual a 1000000. */
		trialPeriodDuration?: number;
		/** Duração de cada recorrência. Obriagtório se initialDate e finalDate forem nulos. Proibido se initialDate ou finalDate não forem nulos. */
		expiration?: PagSeguroPreApprovalRequestDataExpiration;
		/** Descrição do plano. */
		details?: string;
		/** Valor máximo que pode ser cobrado durante a vigência da assinatura. */
		maxTotalAmount?: number;
		/**
		 * Url para onde o assinante será redirecionado caso este solicite o cancelamento da assinatura no site do PagSeguro (fluxo de retenção).
		 * */
		cancelURL?: string;
		/** URL para onde o assinante será redirecionado, durante o fluxo de pagamento,
		 * caso o mesmo queira alterar/revisar as regras da assinatura.
		 * Este valor somente será utilizado caso queira utilizar este plano em um Pagamento Recorrente via botão. */
		reviewURL?: string;
		/** Quantidade máxima de consumidores que podem aderir ao plano. */
		maxUses?: number;
		/**
		 * Especifica o e-mail que deve aparecer na tela de pagamento.
		 * Formato: Um e-mail válido, com limite de 60 caracteres.
		 * O e-mail informado deve estar vinculado á conta PagSeguro que está realizando a chamada á API.
		 * */
		receiver?: PagSeguroPreApprovalRequestDataReceiver;

	}
	export class PagSeguroPreApprovalRequestDataExpiration {
		/** REQUIRED
		 * Um Número inteiro maior ou igual a 1 e menor ou igual a 1000000. */
		value: 0;
		/** REQUIRED
		 * Combine com value para obter a duração da recorrência, ex: 2 YEARS. */
		unit: ExpirationUnit;
	}
	export class PagSeguroPreApprovalRequestDataManual {
		/** REQUIRED
		 * Nome/Identificador do plano. Formato: Livre, com limite de 100 caracteres. */
		name: string;
		/** REQUIRED
		 * Indica o modelo de cobrança do pagamento recorrente pós-pago (MANUAL).*/
		charge: 'MANUAL' = 'MANUAL';
		/** REQUIRED
		 * Periodicidade da cobrança.
		 * Utilizar um dos valores da constante PAGESEGURO_PREAPPROVAL_PERIOD */
		period: string;
		/** Valor exato de cada cobrança.
		 * Obriagtório para o modelo AUTO.
		 * Formato: Decimal, com duas casas decimais separadas por ponto (p.e, 1234.56).
		 * Deve ser um valor maior ou igual a 1.00 e menor ou igual a 2000.00. */
		amountPerPayment?: number | string;
		/** Valor da taxa de adesão.
		 * Sempre será cobrada juntamente com a primeira parcela do pagamento,
		 * independente se o plano é pré-pago ou pós-pago.
		 * Formato: Decimal, com duas casas decimais separadas por ponto (p.e, 1234.56),
		 * maior ou igual a 0.00 e menor ou igual a 1000000.00. */
		membershipFee?: number | string;
		/** período de teste, em dias.
		 * A recorrência mantém o status INITIATED durante o período de testes,
		 * de modo que a primeira cobrança só ocorrerá após esse período,
		 * permitindo que a recorrência mude para ACTIVE.
		 *
		 * No caso de pagamento pré-pago, a cobrança se dá imediatamente após o fim
		 * do período de testes;
		 * no caso de pagamento pós-pago, a cobrança ocorre após o período de cobrança
		 * somado ao período de testes.
		 * Formato: Inteiro, maior ou igual a 1 e menor ou igual a 1000000. */
		trialPeriodDuration: number;
		/** Duração de cada recorrência. Obriagtório se initialDate e finalDate forem nulos. Proibido se initialDate ou finalDate não forem nulos. */
		expiration?: PagSeguroPreApprovalRequestDataExpiration;
		/** Descrição do plano. */
		details?: string;
		/** Valor máximo que pode ser cobrado por mês de vigência da assinatura, independente de sua periodicidade.
		 * Proibido se charge for AUTO. */
		maxAmountPerPeriod?: number;
		/** Valor máximo de cada cobrança.
		 * Proibido se charge for AUTO. */
		maxAmountPerPayment?: number;
		/** Valor máximo que pode ser cobrado durante a vigência da assinatura. */
		maxTotalAmount?: number;
		/** Número máximo de cobranças que podem ser realizadas por período.
		 * Proibido se charge for AUTO. */
		maxPaymentsPerPeriod?: number;
		/**
		 * > Proibido se charge for AUTO.
		 * > Obriagtório se expiration for nulo, proibido se expiration não for nulo.
		 * Início da vigência do plano.
		 * As cobranças somente serão iniciadas após esta data.
		 * Formato: YYYY-MM-DDThh:mm:ss.sTZD.
		 * Valores aceitos: data atual <= preApprovalInitialDate <= data atual + 2 anos.
		 * */
		initialDate?: Date;
		/**
		 * > Obriagtório se expiration for nulo, proibido se expiration não for nulo.
		 * Fim da vigência do plano.
		 * As cobranças cessarão após esta data.
		 * Formato: YYYY-MM-DDThh:mm:ss.sTZD.
		 * Valores aceitos:
		 * Se preApprovalInitialDate for informado entáo preApprovalInitialDate < preApprovalFinalDate <= preApprovalInitialDate + valor definido no perfil, caso contrário, data atual < preApprovalFinalDate <= data atual + valor definido no perfil.
		 * */
		finalDate?: string;
		/**
		 * Dia do ano em que a cobrança será realizada.
		 * Formato: MM-dd.
		 * Obs: não pode ser utilizado em conjunto com dayOfWeek ou dayOfMonth.
		 * Se presente, period deve ser informado como YEARLY.
		 * não pode ser utilizado em conjunto com charge = AUTO.
		 * */
		dayOfYear?: string;
		/**
		 * Dia do mês em que a cobrança será realizada.
		 * Obs: não pode ser utilizado em conjunto com dayOfWeek ou dayOfYear.
		 * Se presente, period deve ser informado como MONTHLY, BIMONTHLY, TRIMONTHLY ou SEMIANNUALLY.
		 * não pode ser utilizado em conjunto charge = AUTO.
		 * */
		dayOfMonth?: number;
		/**
		 * Dia da semana em que a cobrança será realizada.
		 * Obs: não pode ser utilizado em conjunto com dayOfMonth ou dayOfYear.
		 * Se presente, period deve ser informado como WEEKLY.
		 * não pode ser utilizado em conjunto com charge = AUTO.
		 * */
		dayOfWeek?: string;
		/**
		 * Url para onde o assinante será redirecionado caso este solicite o cancelamento da assinatura no site do PagSeguro (fluxo de retenção).
		 * */
		cancelURL: string;
		/** URL para onde o assinante será redirecionado, durante o fluxo de pagamento,
		 * caso o mesmo queira alterar/revisar as regras da assinatura.
		 * Este valor somente será utilizado caso queira utilizar este plano em um Pagamento Recorrente via botão. */
		reviewURL: string;
		/** Quantidade máxima de consumidores que podem aderir ao plano. */
		maxUses: number;
		/**
		 * Especifica o e-mail que deve aparecer na tela de pagamento.
		 * Formato: Um e-mail válido, com limite de 60 caracteres.
		 * O e-mail informado deve estar vinculado á conta PagSeguro que está realizando a chamada á API.
		 * */
		receiver?: PagSeguroPreApprovalRequestDataReceiver;
		constructor() {
			this.membershipFee = 0;
		}
	}
	export class PagSeguroPreApprovalRequest {
		redirectURL?: string;
		reference: string;
		preApproval: PagSeguroPreApprovalRequestDataManual | PagSeguroPreApprovalRequestDataAuto;
		constructor(charge: Charge) {
			this.preApproval = charge === 'AUTO' ? new PagSeguroPreApprovalRequestDataAuto() : new PagSeguroPreApprovalRequestDataManual();
		}
	}
	export class PagSeguroAddress {
		street: string;
		number: string;
		complement: string;
		district: string;
		city: string;
		state: string;
		country: string;
		postalCode: string;
	}
	export class PagSeguroPhone {
		areaCode: string
		number: ''

	}
	export type PagSeguroDocumentType = 'CNPJ' | 'CPF'
	export class PagSeguroDocument {
		type: PagSeguroDocumentType;
		value: string;
	}
	/** Dados do Assinante */
	export class PagSeguroPreApprovalSender {
		name: string;
		email: string;
		ip: string;
		hash: string;
		phone: PagSeguroPhone;
		address: PagSeguroAddress;
		documents: Array<PagSeguroDocument>;
		constructor() {
			/** Telefone do consumidor. */
			this.phone = new PagSeguroPhone();
			this.address = new PagSeguroAddress();
			this.documents = [new PagSeguroDocument()];
		}
	}
	export class PagSeguroPaymentMethodCreditCardHolder {
		name: string;
		birthDate: string | Date;
		documents: Array<PagSeguroDocument>;
		phone: PagSeguroPhone;
		billingAddress: PagSeguroAddress;
		constructor() {
			this.documents = [new PagSeguroDocument()];
			this.billingAddress = new PagSeguroAddress();
			this.phone = new PagSeguroPhone();

		}

	}
	export class PagSeguroPaymentMethodCreditCard {
		token: string;
		holder: PagSeguroPaymentMethodCreditCardHolder;
		constructor() {
			this.holder = new PagSeguroPaymentMethodCreditCardHolder();
		}
	}
	export class PagSeguroPreApprovalPaymentMethod {
		type: PagSeguroPreApprovalPaymentMethodType;
		creditCard: PagSeguroPaymentMethodCreditCard;
	}
	export class PagSeguroPaymentMethod {
		type: PagSeguroCheckoutPaymentMethodType;
		creditCard: PagSeguroPaymentMethodCreditCard;
	}
	export class PagSeguroPreApprovalPaymentItem {
		id: string;
		description: string;
		quantity: number;
		amount: number;
		weight: number;
		shippingCost: number;
	}
	export class PagSeguroPreApprovalPayment {
		preApprovalCode: string;
		reference: string;
		senderHash: string;
		senderIp: string;
		items: Array<PagSeguroPreApprovalPaymentItem>;
		constructor() {
			this.items = new Array<PagSeguroPreApprovalPaymentItem>();
		}

	}
	export class PagSeguroPreApproval {
		plan: string;
		reference: string;
		sender: PagSeguroPreApprovalSender;
		paymentMethod: PagSeguroPreApprovalPaymentMethod;
		constructor() {
			this.sender = new PagSeguroPreApprovalSender();
			this.paymentMethod = new PagSeguroPreApprovalPaymentMethod();
		}
	}
	export class PagSeguroCheckoutSender {
		name: string;
		email: string;
		phone: PagSeguroPhone = new PagSeguroPhone();
		documents: Array<PagSeguroDocument> = [];
	}
	export class PagSeguroCheckoutItem {
		id: string;
		description: string;
		amount: PagSeguroAmount;
		quantity: number;
		weight: number;
		shippingCost?: PagSeguroAmount;
	}
	type PagSeguroCheckoutType = 1;
	export class PagSeguroCheckoutShipping {
		address: PagSeguroAddress;
		type: PagSeguroCheckoutType;
		cost: PagSeguroAmount;
		addressRequired: boolean;
	}
	export class PagSeguroCheckoutReceiver {
		email: string;
	}
	export class PagSeguroCheckoutAcceptedPaymentMethods {
		exclude: Array<PagSeguroCheckoutAcceptedPaymentMethod>
	}
	export class PagSeguroCheckoutAcceptedPaymentMethod {
		group: PagSeguroCheckoutPaymentMethodType
	}
	export class PagSeguroCheckoutPaymentMethodConfig {
		paymentMethod: PagSeguroCheckoutAcceptedPaymentMethod;
		configs: Array<PagSeguroCheckoutPaymentMethodConfigEntry>
	}
	type PagSeguroCheckoutPaymentMethodConfigType = 'DISCOUNT_PERCENT' | 'MAX_INSTALLMENTS_NO_INTEREST' | 'MAX_INSTALLMENTS_LIMIT';
	export class PagSeguroCheckoutPaymentMethodConfigEntry {
		key: PagSeguroCheckoutPaymentMethodConfigType;
		value: string;
	}
	export class PagSeguroCheckout {
		public sender: PagSeguroCheckoutSender;
		public currency: PagSeguroCurrency;
		public items: Array<PagSeguroCheckoutItem>;
		public redirectURL: string;
		public notificationURL: string;
		public extraAmount?: PagSeguroAmount;
		public reference?: string;
		public shipping: PagSeguroCheckoutShipping;
		/** Default is 25 */
		public timeout: number;
		/** Max Value is: 999999999 */
		public maxAge?: number;
		/** Max Value is: 999 */
		public maxUses?: number;
		public receiver?: PagSeguroCheckoutReceiver;
		public acceptedPaymentMethods?: PagSeguroCheckoutAcceptedPaymentMethods;
		public paymentMethodConfigs?: Array<PagSeguroCheckoutPaymentMethodConfig>;
		public enableRecovery: boolean;
	}
	export class Client {
		private baseUrl: string = "https://ws.sandbox.pagseguro.uol.com.br";
		private paymentUrl: string = "https://sandbox.pagseguro.uol.com.br";
		private scriptBaseUrl: string = "https://stc.sandbox.pagseguro.uol.com.br/pagseguro/api";
		private parameters: Parameters = { appId: "", appKey: "", currency: "BRL", email: "", environment: "sandbox", token: "", verbose: false };
		constructor(parameters: Parameters) {
			this.parameters = parameters;
			if (this.parameters.environment === 'production') {
				this.baseUrl = 'https://ws.pagseguro.uol.com.br';
				this.scriptBaseUrl = 'https://stc.pagseguro.uol.com.br/pagseguro/api';
				this.paymentUrl = 'https://pagseguro.uol.com.br';
			}
		}
		private redirectUrlGen(route: string, queryStringParameters = {}) {
			let queryParams = {};
			if (typeof queryStringParameters === "string") { queryStringParameters = qsParse(queryStringParameters); }
			if (typeof queryStringParameters === "object" && !Array.isArray(queryStringParameters)) {
				const params = route.match(/\:([^\/]+)/g);
				if (params) {
					for (let param of params) {
						param = param.substr(1);
						route = route.replace(`:${param}`, queryStringParameters[param]);
						delete queryStringParameters[param];
					}
				}
				queryParams = Object.assign(queryParams, queryStringParameters);
			}
			return `${this.baseUrl}${route}?${qsStringify(queryParams)}`;
		}
		private paymentUrlGen(route: string, queryStringParameters = {}) {
			let queryParams = ((): any => {
				return {};
			})();
			if (typeof queryStringParameters === "string") { queryStringParameters = qsParse(queryStringParameters); }
			if (typeof queryStringParameters === "object" && !Array.isArray(queryStringParameters)) {
				const params = route.match(/\:([^\/]+)/g);
				if (params) {
					for (let param of params) {
						param = param.substr(1);
						route = route.replace(`:${param}`, queryStringParameters[param]);
						delete queryStringParameters[param];
					}
				}
				queryParams = Object.assign(queryParams, queryStringParameters);
			}
			return `${this.paymentUrl}${route}?${qsStringify(queryParams)}`;
		}
		private urlGen(route: string, queryStringParameters = {}) {
			let queryParams = ((): any => {
				return { email: this.parameters.email, token: this.parameters.token };
			})();
			if (typeof queryStringParameters === "string") { queryStringParameters = qsParse(queryStringParameters); }
			if (typeof queryStringParameters === "object" && !Array.isArray(queryStringParameters)) {
				const params = route.match(/\:([^\/]+)/g);
				if (params) {
					for (let param of params) {
						param = param.substr(1);
						route = route.replace(`:${param}`, queryStringParameters[param]);
						delete queryStringParameters[param];
					}
				}
				queryParams = Object.assign(queryParams, queryStringParameters);
			}
			return `${this.baseUrl}${route}?${qsStringify(queryParams)}`;
		}
		private scriptUrlGen(route: string) {
			return `${this.scriptBaseUrl}${route}`;
		}
		getScriptUrlForDirectPayment(){
			return this.scriptUrlGen('/pagseguro/api/v2/checkout/pagseguro.directpayment.js');
		}
		private async doRequest(method: string, url: string, body: any, cb: Function, contentType: string = null, accept: string = null) {
			if (typeof cb === 'undefined') cb = () => { };
			/**
	*
	* @param {any} err
	* @param {request.Response} response
	* @param {any} body response body
	*/
			const responseHandler = function (err, response, body) {
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
					} catch (e) {
						try {
							body = JSON.parse(xmlParser.toJson(body));
							//console.log('[PagSeguro Response] XML Body parsed!');
						} catch (e) {
						}
					}
				}
				if (err) {
					//console.log('[PagSeguro Response] Error:', err);
					return cb(err, body, response);
				} else if (response.statusCode == 200 || response.statusCode == 204) {
					return cb(null, body, response);
				} else {
					try {
						if (body) {
							//console.log('[PagSeguro Response] Response Body:', body);
							const json = body;
							if (json.errors && json.errors.error) {
								return cb(json.errors.error, json, response);
							}
							return cb(json, undefined, response);
						}
						else return (cb(response.statusMessage, undefined, response));
					} catch (e) {
						try {
							const json = JSON.parse(body);
							if (json.errors && json.errors.error) {
								return cb(json.errors.error, json, response);
							}

						} catch (e) {
							throw e;
							//console.log(body);
						}
					}
					return cb(body, undefined, response);
				}
			}

			switch (method.toUpperCase()) {
				case 'GET':
					{
						return await request.get({
							url, headers: { accept: accept === null ? 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1' : accept }
						}, responseHandler);
					}
				case 'POST':
					{
						return await request.post({
							url, body, headers: { accept: accept === null ? 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1' : accept, 'content-type': contentType }
						}, responseHandler);
					}
				case 'PUT':
					{
						let options = {
							url, body, headers: { accept: accept === null ? 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1' : accept, 'content-type': contentType }
						};
						if(Object.hasOwnProperty.call(options,'body') && !options.body) delete options.body;
						if(Object.hasOwnProperty.call(options.headers,'content-type') && !options.headers['content-type']) delete options.headers['content-type'];
						return await request.put(options, responseHandler);
					}
				case 'DELETE':
					{
						return await request.delete({
							url, body, headers: { accept: accept === null ? 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1' : accept, 'content-type': contentType }
						}, responseHandler);
					}

				default:
			}
		}
		async sessionId(cb: (err: any, sessionId: string) => any) {
			const url = this.urlGen(endPoints.sessionId.url);
			//console.log('[PagSeguro] Session Id Url:', url);
			return await this.doRequest(endPoints.sessionId.method, url, null, (err, response) =>
				cb(err, !response || !response.session || !response.session.id ? null : response.session.id)
				, 'application/xml; charset=ISO-8859-1', 'application/xml; charset=ISO-8859-1');
		}
		async criarTransacao(checkout: PagSeguroCheckout, callback?: (err, response: ICreateTransactionResponse, xmlRequestBody?: string) => void, mode: PagSeguroCheckoutMode = 'redirect') {
			let url = this.urlGen(endPoints.pagamentoAvulso.criarTransacao.url, {});
			if (!checkout) throw new Error('missing argument: checkout');
			if (!checkout.sender) throw new Error('missing property: sender');
			if (!checkout.items) throw new Error('missing property: items');
			if (!checkout.currency) throw new Error('missing property: currency');
			if (checkout.items.length === 0) throw new Error('no items');
			if (!checkout.shipping) throw new Error('missing property: shipping');
			if (!checkout.shipping.address && checkout.shipping.addressRequired) throw new Error('missing address field');
			for (let i = 0; i < checkout.items.length; i++) {
				if (typeof checkout.items[i].amount === 'number') checkout.items[i].amount = (checkout.items[i].amount as number).toFixed(2);
			}
			if (typeof checkout.extraAmount === 'number')
				checkout.extraAmount = checkout.extraAmount.toFixed(2);
			if (typeof checkout.shipping.cost === 'number')
				checkout.shipping.cost = checkout.shipping.cost.toFixed(2);
			let body = `<?xml version="1.0" encoding="ISO-8859-1" standalone="yes" ?>
<checkout>
    <sender>
        <name>${removeAccents.remove(checkout.sender.name)}</name>
        <email>${checkout.sender.email}</email>
        <phone>
            <areaCode>${checkout.sender.phone.areaCode}</areaCode>
            <number>${checkout.sender.phone.number}</number>
        </phone>
		<documents>`+
				checkout.sender.documents.map(doc => `
			<document>
                <type>${doc.type}</type>
                <value>${doc.value}</value>
            </document>`).join('')
				+ `
        </documents>
    </sender>
    <currency>BRL</currency>
    <items>`+
				checkout.items.map(item => `
        <item>
            <id>${item.id}</id>
            <description>${removeAccents.remove(item.description)}</description>
            <amount>${item.amount}</amount>
            <quantity>${item.quantity}</quantity>
            <weight>${item.weight}</weight>
            `+ (item.shippingCost ? `<shippingCost>${item.shippingCost}</shippingCost>` : '') + `
        </item>`).join('')
				+ `
    </items>`+ (checkout.redirectURL ? `
    <redirectURL>${checkout.redirectURL}</redirectURL>` : '') + (checkout.notificationURL ? `
    <notificationURL>${checkout.notificationURL}</notificationURL>` : '') + `
    <extraAmount>${checkout.extraAmount}</extraAmount>
    <reference>${checkout.reference}</reference>
    <shipping>
        <address>
            <street>${removeAccents.remove(checkout.shipping.address.street)}</street>
            <number>${removeAccents.remove(checkout.shipping.address.number)}</number>
            <complement>${removeAccents.remove(checkout.shipping.address.complement)}</complement>
            <district>${removeAccents.remove(checkout.shipping.address.district)}</district>
            <city>${removeAccents.remove(checkout.shipping.address.city)}</city>
            <state>${removeAccents.remove(checkout.shipping.address.state)}</state>
            <country>${removeAccents.remove(checkout.shipping.address.country)}</country>
            <postalCode>${checkout.shipping.address.postalCode}</postalCode>
        </address>
        <type>${checkout.shipping.type}</type>
        <cost>${checkout.shipping.cost}</cost>
        <addressRequired>${checkout.shipping.addressRequired}</addressRequired>
    </shipping>
    <timeout>${checkout.timeout}</timeout>
    <maxAge>${checkout.maxAge}</maxAge>
    <maxUses>${checkout.maxUses}</maxUses>` + (checkout.receiver ? `
    <receiver>
        <email>${checkout.receiver.email}</email>
    </receiver>`: '') + `
    <enableRecovery>${checkout.enableRecovery || false}</enableRecovery>` + (checkout.acceptedPaymentMethods && checkout.acceptedPaymentMethods.exclude ? `
	<acceptedPaymentMethods>`+ (checkout.acceptedPaymentMethods.exclude ? `
		<exclude>`+ (checkout.acceptedPaymentMethods.exclude.map(pm => `
			<paymentMethod>
				<group>${pm.group}</group>
			</paymentMethod>`).join('')) + `
		</exclude>`: '') + `
	</acceptedPaymentMethods>`: '') + (checkout.paymentMethodConfigs && checkout.paymentMethodConfigs.length > 0 ? `
    <paymentMethodConfigs>`+ (checkout.paymentMethodConfigs.map(pmc => `
        <paymentMethodConfig>
            <paymentMethod>
                <group>${pmc.paymentMethod.group}</group>
            </paymentMethod>
            <configs>`+ (pmc.configs.map(pmce => `
                <config>
                    <key>${pmce.key}</key>
                    <value>${pmce.value}</value>
                </config>`).join('')) + `
            </configs>
        </paymentMethodConfig>`).join('')) + `
    </paymentMethodConfigs>`: '') + `
</checkout>`;

			return new Promise<ICreateTransactionResponse>((resolve, reject) => {
				this.doRequest(endPoints.pagamentoAvulso.criarTransacao.method, url, body, (err, resp) => {
					if (err) {
						if (callback) callback(err, resp, body);
						else reject(err);

					}
					else {
						resp.checkout.date = new Date(Date.parse(resp.checkout.date));
						if (mode === 'redirect') resp.checkout.redirectUrl = this.paymentUrlGen(endPoints.pagamentoAvulso.redirectToPayment.url, { code: resp.checkout.code });
						if (mode === 'lightbox') resp.checkout.scriptUrl = this.scriptUrlGen(endPoints.pagamentoAvulso.lightboxPayment.url);
						resolve(resp);
						if (callback) callback(err, resp, body);
					}
				}, 'application/xml; charset=ISO-8859-1', 'application/xml; charset=ISO-8859-1');
			});
		}
		async consultaRetornoTransacaoCheckout(notificationCode: string, callback?: (err, response: IGetCheckoutTransactionResponse) => void) {
			return new Promise<IGetCheckoutTransactionResponse>((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoAvulso.consultaRetornoTransacao.url, { notificationCode });
					await this.doRequest(endPoints.pagamentoAvulso.consultaRetornoTransacao.method, url, {}, (err, resp) => {
						if (callback) callback(err, resp);
						if (err) {
							if (!callback) reject(err);
						}
						else {
							resolve(resp);
						}
					}, 'application/x-www-form-urlencoded', 'application/xml;charset=ISO-8859-1');

				})();
			});
		}
		async estornarTransacaoParcialCheckout(transactionCode: string, refundValue: PagSeguroAmount, callback?: (err, response: IRefundCheckoutTransactionResponse) => void) {
			return new Promise<IRefundCheckoutTransactionResponse>((resolve, reject) => {
				(async () => {
					if (typeof refundValue === 'number') refundValue = refundValue.toFixed(2);
					const url = this.urlGen(endPoints.pagamentoAvulso.estornarTransacaoCheckout.url, { transactionCode });
					await this.doRequest(endPoints.pagamentoAvulso.estornarTransacaoCheckout.method, url, {}, (err, resp) => {
						if (callback) callback(err, resp);
						if (err) {
							if (!callback) reject(err);
						}
						else {
							resolve(resp);
						}
					}, 'application/x-www-form-urlencoded', 'application/xml;charset=ISO-8859-1');
				})();
			});
		}
		async estornarTransacaoCheckout(transactionCode: string, callback?: (err, response: IRefundCheckoutTransactionResponse) => void) {
			return new Promise<IRefundCheckoutTransactionResponse>((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoAvulso.estornarTransacaoCheckout.url, { transactionCode });
					await this.doRequest(endPoints.pagamentoAvulso.estornarTransacaoCheckout.method, url, {}, (err, resp) => {
						if (callback) callback(err, resp);
						if (err) {
							if (!callback) reject(err);
						}
						else {
							resolve(resp);
						}
					}, 'application/x-www-form-urlencoded', 'application/xml;charset=ISO-8859-1');
				})().catch(e => reject(e));
			});
		}
		async cancelarTransacaoCheckout(transactionCode: string, callback?: (err, response: ICancelCheckoutTransactionResponse) => void) {
			return new Promise<ICancelCheckoutTransactionResponse>((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoAvulso.cancelarTransacaoCheckout.url, { transactionCode });
					await this.doRequest(endPoints.pagamentoAvulso.cancelarTransacaoCheckout.method, url, {},
						(err, resp) => {
							if (callback) callback(err, resp);
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resolve(resp);
							}
						}, 'application/x-www-form-urlencoded', 'application/xml;charset=ISO-8859-1');
				})();
			});
		}
		/**
		 *
		 * @param plano
		 * @param callback
		 */
		async criarPlano(plano: PagSeguroPreApprovalRequest, callback?: (err, response) => void) {
			return new Promise<ICreatePreApprovalRequest>((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.criarPlano.url, {});
					if (plano.preApproval.charge === constants.PAGESEGURO_PREAPPROVAL_CHARGE.AUTO) {
						if (plano.preApproval.maxTotalAmount) delete plano.preApproval.maxTotalAmount;
						if (plano.preApproval.expiration) {
							if (!plano.preApproval.expiration.unit && !plano.preApproval.expiration.value) delete plano.preApproval.expiration;
						}
						else delete plano.preApproval.expiration;
						if (!plano.preApproval.maxUses) delete plano.preApproval.maxUses;
						if (!plano.preApproval.membershipFee) delete plano.preApproval.membershipFee;
						if (!plano.preApproval.reviewURL) delete plano.preApproval.reviewURL;
						if (!plano.preApproval.trialPeriodDuration) delete plano.preApproval.trialPeriodDuration;
					}
					if (typeof plano.preApproval.amountPerPayment === 'number')
						plano.preApproval.amountPerPayment = (plano.preApproval.amountPerPayment * 1 || 0).toFixed(2);
					if (typeof plano.preApproval.membershipFee === 'number') plano.preApproval.membershipFee = (plano.preApproval.membershipFee * 1 || 0).toFixed(2);
					var body = JSON.stringify(plano);// xmlParser.toXml({ preApprovalRequest: plano });
					return await this.doRequest(endPoints.pagamentoRecorrente.criarPlano.method, url, body,
						(err, resp: ICreatePreApprovalRequest) => {
							if (callback) callback(err, resp);
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resp.date = new Date(Date.parse(resp.date as any));
								resolve(resp);
							}
						}
						, 'application/json');
				})();
			});
		};
		/**
		 * @param info
		 * @param callback
		 */
		async aderirPlano(info: PagSeguroPreApproval, callback?: (err, response: IPreApprovalRequestResponse) => void) {
			return new Promise<IPreApprovalRequestResponse>((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.aderirPlano.url, {});
					if (info.paymentMethod && info.paymentMethod.creditCard) {
						if (info.paymentMethod.creditCard.holder) {
							if (info.sender) {
								if (info.sender.email) {
									if (this.parameters.environment === 'sandbox') {
										info.sender.email = info.sender.email.replace(/\@[\w\W]+/i, '@sandbox.pagseguro.com.br');
									}
								}
								if (info.sender.address) {
									if (!info.sender.address.country) info.sender.address.country = 'BRA';
								}
							}
							if (!info.paymentMethod.creditCard.holder.birthDate) {
								if (info.paymentMethod.creditCard.holder.birthDate !== null) info.paymentMethod.creditCard.holder.birthDate = null;
							}
							else if (typeof info.paymentMethod.creditCard.holder.birthDate === 'string') {
								let birthDate = info.paymentMethod.creditCard.holder.birthDate;
								if (birthDate.match(/^\d\d\d\d\-\d\d\-\d\d$/)) {
									let d = (new Date(Date.parse(birthDate + 'T00:00:00.000-03:00')));
									info.paymentMethod.creditCard.holder.birthDate = `${d.getDate().toString().padStart(2, '0')}/${(1 + d.getMonth()).toString().padStart(2, '0')}/${d.getFullYear()}`;
								}
							}
							else if (typeof info.paymentMethod.creditCard.holder.birthDate === 'object' && Object.getPrototypeOf(info.paymentMethod.creditCard.holder.birthDate) == Date.prototype) {
								let d = info.paymentMethod.creditCard.holder.birthDate;
								info.paymentMethod.creditCard.holder.birthDate = `${d.getDate().toString().padStart(2, '0')}/${(1 + d.getMonth()).toString().padStart(2, '0')}/${d.getFullYear()}`;
							}
							if (info.paymentMethod.creditCard.holder.billingAddress) {
								if (!info.paymentMethod.creditCard.holder.billingAddress.country) info.paymentMethod.creditCard.holder.billingAddress.country = 'BRA';

							}
						}

					}
					var body = JSON.stringify(info);
					return await this.doRequest(endPoints.pagamentoRecorrente.aderirPlano.method, url, body,
						(err, resp) => {
							if (callback) { callback(err, resp); Object.defineProperty(callback, 'called', { value: true }); };
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resp.date = new Date(Date.parse(resp.date as any));
								resolve(resp);
							}
						}
						, 'application/json');
				})().catch(e => {
					if (callback && !callback['called']) callback(e, null);
					else throw e;
				});
			});
		};

		async alterarMeioPagtoPlano(callback?: (err, response) => void) {
			return new Promise((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.alterarMeioPagtoPlano.url, {});
					return await this.doRequest(endPoints.pagamentoRecorrente.alterarMeioPagtoPlano.method, url, null, (err, resp) => {
						if (callback) callback(err, resp);
						if (err) {
							if (!callback) reject(err);
						}
						else {
							resolve(resp);
						}
					});
				})();
			});
		};
		async alterarStatusAdesao(callback?: (err, response) => void) {
			return new Promise((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.alterarStatusAdesao.url, {});
					return await this.doRequest(endPoints.pagamentoRecorrente.alterarStatusAdesao.method, url, null,
						(err, resp) => {
							if (callback) callback(err, resp);
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resolve(resp);
							}
						});
				})();
			});
		};
		async alterarValorPlano(callback?: (err, response) => void) {
			return new Promise((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.alterarValorPlano.url, {});
					return await this.doRequest(endPoints.pagamentoRecorrente.alterarValorPlano.method, url, null,
						(err, resp) => {
							if (callback) callback(err, resp);
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resolve(resp);
							}
						});
				})();
			});
		};
		async cancelarAdesao(preApprovalCode: string, callback?: (err, response: boolean) => void) {
			return new Promise<boolean>((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.cancelarAdesao.url, { preApprovalCode });
					return await this.doRequest(endPoints.pagamentoRecorrente.cancelarAdesao.method, url, undefined,
						(err, resp, response) => {
							if (callback) callback(err, response.statusCode === 204);
							if (err) {
								if (!callback) reject(err);
								resolve(response.statusCode === 204);
							}
							else {
								resolve(response.statusCode === 204);
							}
						});
				})();
			});
		};
		async cobrancaManual(callback?: (err, response) => void) {
			return new Promise((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.cobrancaManual.url, {});
					return await this.doRequest(endPoints.pagamentoRecorrente.cobrancaManual.method, url, null,
						(err, resp) => {
							if (callback) callback(err, resp);
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resolve(resp);
							}
						});
				})();
			});
		};
		async concederDescontoProxCob(callback?: (err, response) => void) {
			return new Promise((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.concederDescontoProxCob.url, {});
					return await this.doRequest(endPoints.pagamentoRecorrente.concederDescontoProxCob.method, url, null,
						(err, resp) => {
							if (callback) callback(err, resp);
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resolve(resp);
							}
						});
				})();
			});
		};
		async getAdesao(callback?: (err, response) => void) {
			return new Promise((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.getAdesao.url, {});
					return await this.doRequest(endPoints.pagamentoRecorrente.getAdesao.method, url, null,
						(err, resp) => {
							if (callback) callback(err, resp);
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resolve(resp);
							}
						});
				})();
			});
		};
		async getAdesoes(parameters: { preApprovalRequest?: string, maxPageResults?: number, initialDate?: Date | number | string, finalDate?: Date | number | string, senderEmail?: string, status?: string }, callback?: (err, response) => void) {
			let { initialDate, finalDate, maxPageResults, preApprovalRequest, senderEmail, status } = parameters || {};
			if (typeof initialDate === 'undefined') {
				initialDate = new Date();
				initialDate.setHours(0);
				initialDate.setMinutes(0);
				initialDate.setSeconds(0);
				initialDate.setMilliseconds(0);
			}
			else if (typeof initialDate === 'number') {
				initialDate = new Date(initialDate);
			}
			else if (typeof initialDate === 'string') {
				initialDate = new Date(Date.parse(initialDate));
			}
			if (typeof finalDate === 'undefined') {
				finalDate = initialDate;
			}
			else if (typeof finalDate === 'number') {
				finalDate = new Date(finalDate);
			}
			else if (typeof finalDate === 'string') {
				finalDate = new Date(Date.parse(finalDate));
			}
			if (Object.getPrototypeOf(initialDate) !== Date.prototype) throw new Error(`'initialDate' parameter is invalid`);
			if (Object.getPrototypeOf(finalDate) !== Date.prototype) throw new Error(`'finalDate' parameter is invalid`);
			initialDate = (initialDate as Date).toJSON();
			finalDate = (finalDate as Date).toJSON();

			parameters = JSON.parse(JSON.stringify({ initialDate, finalDate, maxPageResults, preApprovalRequest, senderEmail, status }));

			return new Promise<IGetPreApprovals>((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.getAdesoes.url, parameters);
					return await this.doRequest(endPoints.pagamentoRecorrente.getAdesoes.method, url, null,
						(err, resp: IGetPreApprovals) => {
							if (callback) callback(err, resp);
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resp.preApprovalList = resp.preApprovalList.map(a => {
									if (typeof a.date === 'string') a.date = new Date(Date.parse(a.date));
									if (typeof a.lastEventDate === 'string') a.lastEventDate = new Date(Date.parse(a.lastEventDate));
									return a;
								})
								resolve(resp);
							}
						});
				})();
			});
		};
		async getNotificacoesRecorrencias(callback?: (err, response) => void) {
			return new Promise((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.getNotificacoes.url, {});
					return await this.doRequest(endPoints.pagamentoRecorrente.getNotificacoes.method, url, null,
						(err, resp) => {
							if (callback) callback(err, resp);
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resolve(resp);
							}
						});
				})();
			});
		};

		/**
		 *
		 * @param status Default: ACTIVE
		 * @param startCreationDate Default: Today
		 * @param endCreationDate Default: Today
		 * @param callback
		 */
		async getPlanos(status: PagSeguroPreApprovalRequestStatus, startCreationDate: Date | number | string, endCreationDate: Date | number | string, callback: (err: any, responseBody: any) => void) {
			if (typeof status === 'undefined') status = 'ACTIVE';
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

			if (Object.getPrototypeOf(startCreationDate) !== Date.prototype) throw new Error(`'startCreationDate' parameter is invalid`);
			if (Object.getPrototypeOf(endCreationDate) !== Date.prototype) throw new Error(`'endCreationDate' parameter is invalid`);
			startCreationDate = (startCreationDate as Date).toJSON();
			endCreationDate = (endCreationDate as Date).toJSON();
			const url = this.urlGen(endPoints.pagamentoRecorrente.getPlanos.url, { status, startCreationDate, endCreationDate });
			//console.log(url);
			return new Promise<IGetPreApprovalRequests>((resolve, reject) => {
				(async () => {
					return await this.doRequest('GET', url, null,
						(err, resp: IGetPreApprovalRequests) => {
							if (callback) callback(err, resp);
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resp.date = new Date(Date.parse((resp as any).date));
								resp.preApprovalRequest = resp.preApprovalRequest.map(v => {
									v.creationDate = new Date(Date.parse(v.creationDate as any));
									if (typeof v.amountPerPayment === 'string') v.amountPerPayment = parseFloat(v.amountPerPayment) || 0;
									if (typeof v.trialPeriodDuration === 'string') v.trialPeriodDuration = parseInt(v.amountPerPayment as any) || null;
									if (typeof v.membershipFee === 'string') v.membershipFee = parseFloat(v.membershipFee as any) || 0;
									return v;
								});
								resolve(resp);
							}
						});
				})();
			})
		};

		async getRecorrenciaPorNotificacao(callback?: (err, response) => void) {
			return new Promise((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.getRecorrenciaPorNotificacao.url, {});
					return await this.doRequest(endPoints.pagamentoRecorrente.getRecorrenciaPorNotificacao.method, url, null,
						(err, resp) => {
							if (callback) callback(err, resp);
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resolve(resp);
							}
						});
				})();
			});
		};
		async listarOrdensPagto(callback?: (err, response) => void) {
			return new Promise((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.listarOrdensPagto.url, {});
					return await this.doRequest(endPoints.pagamentoRecorrente.listarOrdensPagto.method, url, null,
						(err, resp) => {
							if (callback) callback(err, resp);
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resolve(resp);
							}
						});
				})();
			});
		};
		async retentarCobranca(callback?: (err, response) => void) {
			return new Promise((resolve, reject) => {
				(async () => {
					const url = this.urlGen(endPoints.pagamentoRecorrente.retentarCobranca.url, {});
					return await this.doRequest(endPoints.pagamentoRecorrente.retentarCobranca.method, url, null,
						(err, resp) => {
							if (callback) callback(err, resp);
							if (err) {
								if (!callback) reject(err);
							}
							else {
								resolve(resp);
							}
						});
				})();
			});
		};
	}
}
