export declare namespace constants {
    const PAGESEGURO_PREAPPROVAL_CHARGE: {
        AUTO: string;
        MANUAL: string;
    };
    const PAGESEGURO_PREAPPROVAL_PERIOD: {
        ANUAL: string;
        MENSAL: string;
        BIMESTRAL: string;
        TRIMESTRAL: string;
        SEMESTRAL: string;
        SEMANAL: string;
    };
}
export declare type PagSeguroPreApprovalRequestStatus = 'ACTIVE' | 'INACTIVE';
export declare type Charge = 'AUTO' | 'MANUAL';
export declare type PagSeguroCheckoutPaymentMethodType = 'CREDIT_CARD' | 'BOLETO' | 'DEBITO_ITAU';
export declare type PagSeguroPreApprovalPaymentMethodType = 'CREDITCARD';
export declare type Period = 'YEARLY' | 'MONTHLY' | 'BIMONTHLY' | 'TRIMONTHLY' | 'SEMIANNUALLY' | 'WEEKLY';
export declare namespace PagSeguro {
    interface IGetPreApprovals {
        resultsInThisPage: number;
        currentPage: number;
        totalPages: number;
        date: Date;
        preApprovalList: Array<IPreApprovalInstance>;
    }
    interface IPreApprovalInstance {
        name: string;
        code: string;
        tracker: string;
        status: string;
        lastEventDate: Date;
        charge: string;
        sender: PagSeguroPreApprovalSender;
        date: Date;
    }
    interface IGetPreApprovalRequests {
        resultsInThisPage: number;
        currentPage: number;
        totalPages: number;
        date: Date;
        preApprovalRequest: Array<IPreApprovalRequestInstance>;
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
        transaction: ITransactionObject;
    }
    interface IRefundCheckoutTransactionResponse {
    }
    interface ICancelCheckoutTransactionResponse {
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
        environment: EnvironmentType;
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
        email: string;
    }
    export class PagSeguroPreApprovalRequestDataAuto {
        /** REQUIRED
         * Nome/Identificador do plano. Formato: Livre, com limite de 100 caracteres. */
        name: string;
        /** REQUIRED
         * Indica o modelo de cobrança do pagamento recorrente pré-pago (AUTO) */
        charge: 'AUTO';
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
        charge: 'MANUAL';
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
        constructor();
    }
    export class PagSeguroPreApprovalRequest {
        redirectURL?: string;
        reference: string;
        preApproval: PagSeguroPreApprovalRequestDataManual | PagSeguroPreApprovalRequestDataAuto;
        constructor(charge: Charge);
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
        areaCode: string;
        number: '';
    }
    export type PagSeguroDocumentType = 'CNPJ' | 'CPF';
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
        constructor();
    }
    export class PagSeguroPaymentMethodCreditCardHolder {
        name: string;
        birthDate: string | Date;
        documents: Array<PagSeguroDocument>;
        phone: PagSeguroPhone;
        billingAddress: PagSeguroAddress;
        constructor();
    }
    export class PagSeguroPaymentMethodCreditCard {
        token: string;
        holder: PagSeguroPaymentMethodCreditCardHolder;
        constructor();
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
        constructor();
    }
    export class PagSeguroPreApproval {
        plan: string;
        reference: string;
        sender: PagSeguroPreApprovalSender;
        paymentMethod: PagSeguroPreApprovalPaymentMethod;
        constructor();
    }
    export class PagSeguroCheckoutSender {
        name: string;
        email: string;
        phone: PagSeguroPhone;
        documents: Array<PagSeguroDocument>;
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
        exclude: Array<PagSeguroCheckoutAcceptedPaymentMethod>;
    }
    export class PagSeguroCheckoutAcceptedPaymentMethod {
        group: PagSeguroCheckoutPaymentMethodType;
    }
    export class PagSeguroCheckoutPaymentMethodConfig {
        paymentMethod: PagSeguroCheckoutAcceptedPaymentMethod;
        configs: Array<PagSeguroCheckoutPaymentMethodConfigEntry>;
    }
    type PagSeguroCheckoutPaymentMethodConfigType = 'DISCOUNT_PERCENT' | 'MAX_INSTALLMENTS_NO_INTEREST' | 'MAX_INSTALLMENTS_LIMIT';
    export class PagSeguroCheckoutPaymentMethodConfigEntry {
        key: PagSeguroCheckoutPaymentMethodConfigType;
        value: string;
    }
    export class PagSeguroCheckout {
        sender: PagSeguroCheckoutSender;
        currency: PagSeguroCurrency;
        items: Array<PagSeguroCheckoutItem>;
        redirectURL: string;
        notificationURL: string;
        extraAmount?: PagSeguroAmount;
        reference?: string;
        shipping: PagSeguroCheckoutShipping;
        /** Default is 25 */
        timeout: number;
        /** Max Value is: 999999999 */
        maxAge?: number;
        /** Max Value is: 999 */
        maxUses?: number;
        receiver?: PagSeguroCheckoutReceiver;
        acceptedPaymentMethods?: PagSeguroCheckoutAcceptedPaymentMethods;
        paymentMethodConfigs?: Array<PagSeguroCheckoutPaymentMethodConfig>;
        enableRecovery: boolean;
    }
    export class Client {
        private baseUrl;
        private paymentUrl;
        private scriptBaseUrl;
        private parameters;
        constructor(parameters: Parameters);
        private redirectUrlGen;
        private paymentUrlGen;
        private urlGen;
        private scriptUrlGen;
        private doRequest;
        sessionId(cb: (err: any, sessionId: string) => any): Promise<any>;
        criarTransacao(checkout: PagSeguroCheckout, callback?: (err: any, response: ICreateTransactionResponse, xmlRequestBody?: string) => void, mode?: PagSeguroCheckoutMode): Promise<ICreateTransactionResponse>;
        consultaRetornoTransacaoCheckout(notificationCode: string, callback?: (err: any, response: IGetCheckoutTransactionResponse) => void): Promise<IGetCheckoutTransactionResponse>;
        estornarTransacaoParcialCheckout(transactionCode: string, refundValue: PagSeguroAmount, callback?: (err: any, response: IRefundCheckoutTransactionResponse) => void): Promise<IRefundCheckoutTransactionResponse>;
        estornarTransacaoCheckout(transactionCode: string, callback?: (err: any, response: IRefundCheckoutTransactionResponse) => void): Promise<IRefundCheckoutTransactionResponse>;
        cancelarTransacaoCheckout(transactionCode: string, callback?: (err: any, response: ICancelCheckoutTransactionResponse) => void): Promise<ICancelCheckoutTransactionResponse>;
        /**
         *
         * @param plano
         * @param callback
         */
        criarPlano(plano: PagSeguroPreApprovalRequest, callback?: (err: any, response: any) => void): Promise<ICreatePreApprovalRequest>;
        /**
         * @param info
         * @param callback
         */
        aderirPlano(info: PagSeguroPreApproval, callback?: (err: any, response: IPreApprovalRequestResponse) => void): Promise<IPreApprovalRequestResponse>;
        alterarMeioPagtoPlano(callback?: (err: any, response: any) => void): Promise<unknown>;
        alterarStatusAdesao(callback?: (err: any, response: any) => void): Promise<unknown>;
        alterarValorPlano(callback?: (err: any, response: any) => void): Promise<unknown>;
        cancelarAdesao(preApprovalCode: string, callback?: (err: any, response: boolean) => void): Promise<boolean>;
        cobrancaManual(callback?: (err: any, response: any) => void): Promise<unknown>;
        concederDescontoProxCob(callback?: (err: any, response: any) => void): Promise<unknown>;
        getAdesao(callback?: (err: any, response: any) => void): Promise<unknown>;
        getAdesoes(parameters: {
            preApprovalRequest?: string;
            maxPageResults?: number;
            initialDate?: Date | number | string;
            finalDate?: Date | number | string;
            senderEmail?: string;
            status?: string;
        }, callback?: (err: any, response: any) => void): Promise<IGetPreApprovals>;
        getNotificacoesRecorrencias(callback?: (err: any, response: any) => void): Promise<unknown>;
        /**
         *
         * @param status Default: ACTIVE
         * @param startCreationDate Default: Today
         * @param endCreationDate Default: Today
         * @param callback
         */
        getPlanos(status: PagSeguroPreApprovalRequestStatus, startCreationDate: Date | number | string, endCreationDate: Date | number | string, callback: (err: any, responseBody: any) => void): Promise<IGetPreApprovalRequests>;
        getRecorrenciaPorNotificacao(callback?: (err: any, response: any) => void): Promise<unknown>;
        listarOrdensPagto(callback?: (err: any, response: any) => void): Promise<unknown>;
        retentarCobranca(callback?: (err: any, response: any) => void): Promise<unknown>;
    }
    export {};
}
//# sourceMappingURL=pagseguro.d.ts.map