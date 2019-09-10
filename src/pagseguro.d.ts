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
export declare type Charge = 'AUTO' | 'MANUAL';
export declare type PagSeguroCheckoutPaymentMethod = 'CREDIT_CARD' | 'BOLETO' | 'DEBITO_ITAU';
export declare type Period = 'YEARLY' | 'MONTHLY' | 'BIMONTHLY' | 'TRIMONTHLY' | 'SEMIANNUALLY' | 'WEEKLY';
export declare namespace PagSeguro {
    interface ICreateTransactionResponse {
        checkout: ICreateTransactionResponseCheckout;
    }
    interface ICreateTransactionResponseCheckout {
        code: string;
        date: Date;
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
         * Formato: Um e-mail v�lido, com limite de 60 caracteres.
         * O e-mail informado deve estar vinculado � conta PagSeguro que est� realizando a chamada � API. */
        email: string;
    }
    export class PagSeguroPreApprovalRequestDataAuto {
        /** REQUIRED
         * Nome/Identificador do plano. Formato: Livre, com limite de 100 caracteres. */
        name: string;
        /** REQUIRED
         * Indica o modelo de cobran�a do pagamento recorrente pr�-pago (AUTO) */
        charge: 'AUTO';
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
        charge: 'MANUAL';
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
        constructor();
    }
    export class PagSeguroPreApprovalRequest {
        redirectURL: string;
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
        birthDate: string;
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
        constructor();
    }
    export class PagSeguroPreApproval {
        plan: string;
        reference: string;
        sender: PagSeguroPreApprovalSender;
        paymentMethod: PagSeguroPaymentMethod;
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
        group: PagSeguroCheckoutPaymentMethod;
    }
    export class PagSeguroCheckoutPaymentMethodConfig {
        paymentMethod: PagSeguroCheckoutAcceptedPaymentMethod;
        configs: Array<PagSeguroCheckoutPaymentMethodConfigEntry>;
    }
    type PagSeguroCheckoutPaymentMethodConfigType = 'DISCOUNT_PERCENT' | 'MAX_INSTALLMENTS_NO_INTEREST' | 'MAX_INSTALLMENTS';
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
        criarTransacao(checkout: PagSeguroCheckout, callback?: (err: any, response: ICreateTransactionResponse) => void, mode?: PagSeguroCheckoutMode): Promise<unknown>;
        /**
         *
         * @param plano
         * @param cb
         */
        criarPlano(plano: PagSeguroPreApprovalRequest, cb: (err: any, response: any) => void): Promise<any>;
        /**
         * @param {PagSeguroPreApproval} info
         * @param {(err, response) => void} cb
         */
        aderirPlano(info: any, cb: any): Promise<any>;
        alterarMeioPagtoPlano(cb: any): Promise<any>;
        alterarStatusAdesao(cb: any): Promise<any>;
        alterarValorPlano(cb: any): Promise<any>;
        cancelarAdesao(cb: any): Promise<any>;
        cobrancaManual(cb: any): Promise<any>;
        concederDescontoProxCob(cb: any): Promise<any>;
        getAdesao(cb: any): Promise<any>;
        getAdesoes(cb: any): Promise<any>;
        getNotificacoes(cb: any): Promise<any>;
        /**
         *
         * @param {'ACTIVE' | 'INACTIVE'} status Default: ACTIVE
         * @param {Date} startCreationDate Default: Today
         * @param {Date} endCreationDate Default: Today
         * @param {(err: any, responseBody: any) => void} cb
         */
        getPlanos(status: any, startCreationDate: any, endCreationDate: any, cb: any): Promise<any>;
        getRecorrenciaPorNotificacao(cb: any): Promise<any>;
        listarOrdensPagto(cb: any): Promise<any>;
        retentarCobranca(cb: any): Promise<any>;
    }
    export {};
}
//# sourceMappingURL=pagseguro.d.ts.map