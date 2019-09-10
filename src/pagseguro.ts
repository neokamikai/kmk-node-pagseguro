import { stringify as qsStringify, parse as qsParse } from "querystring";
import * as xmlParser from 'xml2json'
import * as request from 'request';
import * as qs from 'qs';
import {Iconv} from 'iconv';
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
		consultaRetornoTransacao: { method: 'GET', url:'/v3/transactions/notifications/:notificationCode'},
		consultaTransacao: { method: 'GET', url:'/v3/transactions/:transactionCode'},

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
export type Charge = 'AUTO' | 'MANUAL';
export type PagSeguroCheckoutPaymentMethod = 'CREDIT_CARD' | 'BOLETO' |'DEBITO_ITAU';
export type Period = 'YEARLY' | 'MONTHLY' | 'BIMONTHLY' | 'TRIMONTHLY' | 'SEMIANNUALLY' | 'WEEKLY'
export namespace PagSeguro {

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
		status:number;
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
		 * Formato: Um e-mail v�lido, com limite de 60 caracteres.
		 * O e-mail informado deve estar vinculado � conta PagSeguro que est� realizando a chamada � API. */
		email: string
	}
	export class PagSeguroPreApprovalRequestDataAuto {
		/** REQUIRED
		 * Nome/Identificador do plano. Formato: Livre, com limite de 100 caracteres. */
		name: string;
		/** REQUIRED
		 * Indica o modelo de cobran�a do pagamento recorrente pr�-pago (AUTO) */
		charge: 'AUTO' = 'AUTO';
		/** REQUIRED
		 * Periodicidade da cobran�a.
		 * Utilizar um dos valores da constante PAGESEGURO_PREAPPROVAL_PERIOD */
		period: Period;
		/** Valor exato de cada cobran�a.
		 * Obrigat�rio para o modelo AUTO.
		 * Formato: Decimal, com duas casas decimais separadas por ponto (p.e, 1234.56).
		 * Deve ser um valor maior ou igual a 1.00 e menor ou igual a 2000.00. */
		amountPerPayment: number | string;
		/** Valor da taxa de ades�o.
		 * Sempre ser� cobrada juntamente com a primeira parcela do pagamento,
		 * independente se o plano � pr�-pago ou p�s-pago.
		 * Formato: Decimal, com duas casas decimais separadas por ponto (p.e, 1234.56),
		 * maior ou igual a 0.00 e menor ou igual a 1000000.00. */
		membershipFee: number | string;
		/** Per�odo de teste, em dias.
		 * A recorr�ncia mant�m o status INITIATED durante o per�odo de testes,
		 * de modo que a primeira cobran�a s� ocorrer� ap�s esse per�odo,
		 * permitindo que a recorr�ncia mude para ACTIVE.
		 *
		 * A cobran�a se d� imediatamente ap�s o fim do per�odo de testes;
		 * Formato: Inteiro, maior ou igual a 1 e menor ou igual a 1000000. */
		trialPeriodDuration?: number;
		/** Dura��o de cada recorr�ncia. Obrigat�rio se initialDate e finalDate forem nulos. Proibido se initialDate ou finalDate n�o forem nulos. */
		expiration?: PagSeguroPreApprovalRequestDataExpiration;
		/** Descri��o do plano. */
		details?: string;
		/** Valor m�ximo que pode ser cobrado durante a vig�ncia da assinatura. */
		maxTotalAmount?: number;
		/**
		 * Url para onde o assinante ser� redirecionado caso este solicite o cancelamento da assinatura no site do PagSeguro (fluxo de reten��o).
		 * */
		cancelURL?: string;
		/** URL para onde o assinante ser� redirecionado, durante o fluxo de pagamento,
		 * caso o mesmo queira alterar/revisar as regras da assinatura.
		 * Este valor somente ser� utilizado caso queira utilizar este plano em um Pagamento Recorrente via bot�o. */
		reviewURL?: string;
		/** Quantidade m�xima de consumidores que podem aderir ao plano. */
		maxUses?: number;
		/**
		 * Especifica o e-mail que deve aparecer na tela de pagamento.
		 * Formato: Um e-mail v�lido, com limite de 60 caracteres.
		 * O e-mail informado deve estar vinculado � conta PagSeguro que est� realizando a chamada � API.
		 * */
		receiver?: PagSeguroPreApprovalRequestDataReceiver;

	}
	export class PagSeguroPreApprovalRequestDataExpiration {
		/** REQUIRED
		 * Um n�mero inteiro maior ou igual a 1 e menor ou igual a 1000000. */
		value: 0;
		/** REQUIRED
		 * Combine com value para obter a dura��o da recorr�ncia, ex: 2 YEARS. */
		unit: ExpirationUnit;
	}
	export class PagSeguroPreApprovalRequestDataManual {
		/** REQUIRED
		 * Nome/Identificador do plano. Formato: Livre, com limite de 100 caracteres. */
		name: string;
		/** REQUIRED
		 * Indica o modelo de cobran�a do pagamento recorrente p�s-pago (MANUAL).*/
		charge: 'MANUAL' = 'MANUAL';
		/** REQUIRED
		 * Periodicidade da cobran�a.
		 * Utilizar um dos valores da constante PAGESEGURO_PREAPPROVAL_PERIOD */
		period: string;
		/** Valor exato de cada cobran�a.
		 * Obrigat�rio para o modelo AUTO.
		 * Formato: Decimal, com duas casas decimais separadas por ponto (p.e, 1234.56).
		 * Deve ser um valor maior ou igual a 1.00 e menor ou igual a 2000.00. */
		amountPerPayment?: number | string;
		/** Valor da taxa de ades�o.
		 * Sempre ser� cobrada juntamente com a primeira parcela do pagamento,
		 * independente se o plano � pr�-pago ou p�s-pago.
		 * Formato: Decimal, com duas casas decimais separadas por ponto (p.e, 1234.56),
		 * maior ou igual a 0.00 e menor ou igual a 1000000.00. */
		membershipFee?: number | string;
		/** Per�odo de teste, em dias.
		 * A recorr�ncia mant�m o status INITIATED durante o per�odo de testes,
		 * de modo que a primeira cobran�a s� ocorrer� ap�s esse per�odo,
		 * permitindo que a recorr�ncia mude para ACTIVE.
		 *
		 * No caso de pagamento pr�-pago, a cobran�a se d� imediatamente ap�s o fim
		 * do per�odo de testes;
		 * no caso de pagamento p�s-pago, a cobran�a ocorre ap�s o per�odo de cobran�a
		 * somado ao per�odo de testes.
		 * Formato: Inteiro, maior ou igual a 1 e menor ou igual a 1000000. */
		trialPeriodDuration: number;
		/** Dura��o de cada recorr�ncia. Obrigat�rio se initialDate e finalDate forem nulos. Proibido se initialDate ou finalDate n�o forem nulos. */
		expiration?: PagSeguroPreApprovalRequestDataExpiration;
		/** Descri��o do plano. */
		details?: string;
		/** Valor m�ximo que pode ser cobrado por m�s de vig�ncia da assinatura, independente de sua periodicidade.
		 * Proibido se charge for AUTO. */
		maxAmountPerPeriod?: number;
		/** Valor m�ximo de cada cobran�a.
		 * Proibido se charge for AUTO. */
		maxAmountPerPayment?: number;
		/** Valor m�ximo que pode ser cobrado durante a vig�ncia da assinatura. */
		maxTotalAmount?: number;
		/** N�mero m�ximo de cobran�as que podem ser realizadas por per�odo.
		 * Proibido se charge for AUTO. */
		maxPaymentsPerPeriod?: number;
		/**
		 * > Proibido se charge for AUTO.
		 * > Obrigat�rio se expiration for nulo, proibido se expiration n�o for nulo.
		 * In�cio da vig�ncia do plano.
		 * As cobran�as somente ser�o iniciadas ap�s esta data.
		 * Formato: YYYY-MM-DDThh:mm:ss.sTZD.
		 * Valores aceitos: data atual <= preApprovalInitialDate <= data atual + 2 anos.
		 * */
		initialDate?: Date;
		/**
		 * > Obrigat�rio se expiration for nulo, proibido se expiration n�o for nulo.
		 * Fim da vig�ncia do plano.
		 * As cobran�as cessar�o ap�s esta data.
		 * Formato: YYYY-MM-DDThh:mm:ss.sTZD.
		 * Valores aceitos:
		 * Se preApprovalInitialDate for informado ent�o preApprovalInitialDate < preApprovalFinalDate <= preApprovalInitialDate + valor definido no perfil, caso contr�rio, data atual < preApprovalFinalDate <= data atual + valor definido no perfil.
		 * */
		finalDate?: string;
		/**
		 * Dia do ano em que a cobran�a ser� realizada.
		 * Formato: MM-dd.
		 * Obs: N�o pode ser utilizado em conjunto com dayOfWeek ou dayOfMonth.
		 * Se presente, period deve ser informado como YEARLY.
		 * N�o pode ser utilizado em conjunto com charge = AUTO.
		 * */
		dayOfYear?: string;
		/**
		 * Dia do m�s em que a cobran�a ser� realizada.
		 * Obs: N�o pode ser utilizado em conjunto com dayOfWeek ou dayOfYear.
		 * Se presente, period deve ser informado como MONTHLY, BIMONTHLY, TRIMONTHLY ou SEMIANNUALLY.
		 * N�o pode ser utilizado em conjunto charge = AUTO.
		 * */
		dayOfMonth?: number;
		/**
		 * Dia da semana em que a cobran�a ser� realizada.
		 * Obs: N�o pode ser utilizado em conjunto com dayOfMonth ou dayOfYear.
		 * Se presente, period deve ser informado como WEEKLY.
		 * N�o pode ser utilizado em conjunto com charge = AUTO.
		 * */
		dayOfWeek?: string;
		/**
		 * Url para onde o assinante ser� redirecionado caso este solicite o cancelamento da assinatura no site do PagSeguro (fluxo de reten��o).
		 * */
		cancelURL: string;
		/** URL para onde o assinante ser� redirecionado, durante o fluxo de pagamento,
		 * caso o mesmo queira alterar/revisar as regras da assinatura.
		 * Este valor somente ser� utilizado caso queira utilizar este plano em um Pagamento Recorrente via bot�o. */
		reviewURL: string;
		/** Quantidade m�xima de consumidores que podem aderir ao plano. */
		maxUses: number;
		/**
		 * Especifica o e-mail que deve aparecer na tela de pagamento.
		 * Formato: Um e-mail v�lido, com limite de 60 caracteres.
		 * O e-mail informado deve estar vinculado � conta PagSeguro que est� realizando a chamada � API.
		 * */
		receiver?: PagSeguroPreApprovalRequestDataReceiver;
		constructor() {
			this.membershipFee = 0;
		}
	}
	export class PagSeguroPreApprovalRequest {
		redirectURL: string;
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
		birthDate: string;
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
	export class PagSeguroPaymentMethod {
		type: string;
		credit: PagSeguroPaymentMethodCreditCard;
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
		paymentMethod: PagSeguroPaymentMethod;
		constructor() {
			this.sender = new PagSeguroPreApprovalSender();
			this.paymentMethod = new PagSeguroPaymentMethod();
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
		group: PagSeguroCheckoutPaymentMethod
	}
	export class PagSeguroCheckoutPaymentMethodConfig {
		paymentMethod: PagSeguroCheckoutAcceptedPaymentMethod;
		configs: Array<PagSeguroCheckoutPaymentMethodConfigEntry>
	}
	type PagSeguroCheckoutPaymentMethodConfigType = 'DISCOUNT_PERCENT' | 'MAX_INSTALLMENTS_NO_INTEREST' | 'MAX_INSTALLMENTS';
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
					return cb(err, body);
				} else if (response.statusCode == 200) {
					return cb(null, body);
				} else {
					try {
						if (body) {
							//console.log('[PagSeguro Response] Response Body:', body);
							const json = body;
							if (json.errors && json.errors.error) {
								return cb(json.errors.error, json);
							}
							return cb(json);
						}
						else return (cb(response.statusMessage));
					} catch (e) {
						try {
							const json = JSON.parse(body);
							if (json.errors && json.errors.error) {
								return cb(json.errors.error, json);
							}

						} catch (e) {
							throw e;
							//console.log(body);
						}
					}
					return cb(body);
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
						return await request.put({
							url, body, headers: { accept: 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1', 'content-type': contentType }
						}, responseHandler);
					}
				case 'DELETE':
					{
						return await request.delete({
							url, body, headers: { accept: 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1', 'content-type': contentType }
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
		async criarTransacao(checkout: PagSeguroCheckout, callback?: (err, response: ICreateTransactionResponse) => void, mode: PagSeguroCheckoutMode = 'redirect') {
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
    <enableRecovery>${checkout.enableRecovery || false}</enableRecovery>` + (checkout.acceptedPaymentMethods && checkout.acceptedPaymentMethods.exclude ?`
	<acceptedPaymentMethods>`+ (checkout.acceptedPaymentMethods.exclude ?`
		<exclude>`+ (checkout.acceptedPaymentMethods.exclude.map(pm =>`
			<paymentMethod>
				<group>${pm.group}</group>
			</paymentMethod>`).join(''))+`
		</exclude>`:'')+`
	</acceptedPaymentMethods>`: '') + (checkout.paymentMethodConfigs && checkout.paymentMethodConfigs.length > 0 ?`
    <paymentMethodConfigs>`+ (checkout.paymentMethodConfigs.map(pmc => `
        <paymentMethodConfig>
            <paymentMethod>
                <group>${pmc.paymentMethod.group}</group>
            </paymentMethod>
            <configs>`+(pmc.configs.map(pmce => `
                <config>
                    <key>${pmce.key}</key>
                    <value>${pmce.value}</value>
                </config>`).join(''))+`
            </configs>
        </paymentMethodConfig>`).join(''))+`
    </paymentMethodConfigs>`:'')+`
</checkout>`;

			return new Promise<ICreateTransactionResponse>((resolve, reject) => {
				this.doRequest(endPoints.pagamentoAvulso.criarTransacao.method, url, body, (err, resp) => {
					if (err) {
						if(callback) callback(err, resp);
						else reject(err);

					}
					else {
						resp.checkout.date = new Date(Date.parse(resp.checkout.date));
						if (mode === 'redirect') resp.checkout.redirectUrl = this.paymentUrlGen(endPoints.pagamentoAvulso.redirectToPayment.url, { code: resp.checkout.code });
						if (mode === 'lightbox') resp.checkout.scriptUrl = this.scriptUrlGen(endPoints.pagamentoAvulso.lightboxPayment.url);
						resolve(resp);
						if(callback)callback(err, resp);
					}
				}, 'application/xml; charset=ISO-8859-1', 'application/xml; charset=ISO-8859-1');
			});
		}
		async consultaRetornoTransacaoCheckout(notificationCode: string, callback?:(err, response: IGetCheckoutTransactionResponse) => void){
			return new Promise<IGetCheckoutTransactionResponse>((resolve, reject) => {
				(async ()=>{
					const url = this.urlGen(endPoints.pagamentoAvulso.consultaRetornoTransacao.url, { notificationCode });
					await this.doRequest(endPoints.pagamentoAvulso.consultaRetornoTransacao.method, url, {}, (err, resp) => {
						if(callback) callback(err, resp);
						if(err){
							reject(err);
						}
						else{
							resolve(resp);
						}
					}, 'application/x-www-form-urlencoded', 'application/xml;charset=ISO-8859-1');

				})();
			});
		}
		/**
		 *
		 * @param plano
		 * @param cb
		 */
		async criarPlano(plano: PagSeguroPreApprovalRequest, cb: (err, response) => void) {
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
			return await this.doRequest(endPoints.pagamentoRecorrente.criarPlano.method, url, body, cb, 'application/json');
		};
		/**
		 * @param {PagSeguroPreApproval} info
		 * @param {(err, response) => void} cb
		 */
		async aderirPlano(info, cb) {
			const url = this.urlGen(endPoints.pagamentoRecorrente.aderirPlano.url, {});
			var body = JSON.stringify(info);
			return await this.doRequest(endPoints.pagamentoRecorrente.aderirPlano.method, url, body, cb, 'application/json');
		};

		async alterarMeioPagtoPlano(cb) {
			const url = this.urlGen(endPoints.pagamentoRecorrente.alterarMeioPagtoPlano.url, {});
			return await this.doRequest(endPoints.pagamentoRecorrente.alterarMeioPagtoPlano.method, url, null, cb);
		};
		async alterarStatusAdesao(cb) {
			const url = this.urlGen(endPoints.pagamentoRecorrente.alterarStatusAdesao.url, {});
			return await this.doRequest(endPoints.pagamentoRecorrente.alterarStatusAdesao.method, url, null, cb);
		};
		async alterarValorPlano(cb) {
			const url = this.urlGen(endPoints.pagamentoRecorrente.alterarValorPlano.url, {});
			return await this.doRequest(endPoints.pagamentoRecorrente.alterarValorPlano.method, url, null, cb);
		};
		async cancelarAdesao(cb) {
			const url = this.urlGen(endPoints.pagamentoRecorrente.cancelarAdesao.url, {});
			return await this.doRequest(endPoints.pagamentoRecorrente.cancelarAdesao.method, url, null, cb);
		};
		async cobrancaManual(cb) {
			const url = this.urlGen(endPoints.pagamentoRecorrente.cobrancaManual.url, {});
			return await this.doRequest(endPoints.pagamentoRecorrente.cobrancaManual.method, url, null, cb);
		};
		async concederDescontoProxCob(cb) {
			const url = this.urlGen(endPoints.pagamentoRecorrente.concederDescontoProxCob.url, {});
			return await this.doRequest(endPoints.pagamentoRecorrente.concederDescontoProxCob.method, url, null, cb);
		};
		async getAdesao(cb) {
			const url = this.urlGen(endPoints.pagamentoRecorrente.getAdesao.url, {});
			return await this.doRequest(endPoints.pagamentoRecorrente.getAdesao.method, url, null, cb);
		};
		async getAdesoes(cb) {
			const url = this.urlGen(endPoints.pagamentoRecorrente.getAdesoes.url, {});
			return await this.doRequest(endPoints.pagamentoRecorrente.getAdesoes.method, url, null, cb);
		};
		async getNotificacoesRecorrencias(cb) {
			const url = this.urlGen(endPoints.pagamentoRecorrente.getNotificacoes.url, {});
			return await this.doRequest(endPoints.pagamentoRecorrente.getNotificacoes.method, url, null, cb);
		};
		/**
		 *
		 * @param {'ACTIVE' | 'INACTIVE'} status Default: ACTIVE
		 * @param {Date} startCreationDate Default: Today
		 * @param {Date} endCreationDate Default: Today
		 * @param {(err: any, responseBody: any) => void} cb
		 */
		async getPlanos(status, startCreationDate, endCreationDate, cb) {
			if (typeof status === 'undefined') status = 'ACTIVE';
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
			if (typeof startCreationDate === 'number') startCreationDate = new Date(startCreationDate);
			if (typeof endCreationDate === 'number') endCreationDate = new Date(endCreationDate);
			if ((startCreationDate.__proto__.constructor.name).toLocaleLowerCase() !== 'date') throw new Error(`'startCreationDate' parameter is invalid`);
			if ((endCreationDate.__proto__.constructor.name).toLocaleLowerCase() !== 'date') throw new Error(`'endCreationDate' parameter is invalid`);
			startCreationDate = startCreationDate.toJSON();
			endCreationDate = endCreationDate.toJSON();
			const url = this.urlGen(endPoints.pagamentoRecorrente.getPlanos.url, { status, startCreationDate, endCreationDate });
			//console.log(url);
			return await this.doRequest('GET', url, null, cb);
		};

		async getRecorrenciaPorNotificacao(cb) {
			const url = this.urlGen(endPoints.pagamentoRecorrente.getRecorrenciaPorNotificacao.url, {});
			return await this.doRequest(endPoints.pagamentoRecorrente.getRecorrenciaPorNotificacao.method, url, null, cb);
		};
		async listarOrdensPagto(cb) {
			const url = this.urlGen(endPoints.pagamentoRecorrente.listarOrdensPagto.url, {});
			return await this.doRequest(endPoints.pagamentoRecorrente.listarOrdensPagto.method, url, null, cb);
		};
		async retentarCobranca(cb) {
			const url = this.urlGen(endPoints.pagamentoRecorrente.retentarCobranca.url, {});
			return await this.doRequest(endPoints.pagamentoRecorrente.retentarCobranca.method, url, null, cb);
		};
	}
}
