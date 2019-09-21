const { PagSeguro } = require('../');

let credentials = require('./credentials.json');
let client = new PagSeguro.Client(credentials);

let stdin = process.openStdin();
console.log('App started!');
stdin.on('data', e => {
	let txt = e.toString().trim();
	if (!txt) return;
	let cmd = txt.split(/\s/)[0];
	switch (cmd) {
		case 'consulta-retorno-transacao': {
			let code = txt.split(/\s/)[1];
			if (!code) return console.log('Código de transação não informado!');
			client.consultaRetornoTransacaoCheckout(code, (err, resp) => {
				if (err) {
					console.error('Error:', err);
				}
				else {
					console.log(resp.transaction);
				}
			}).catch(() => { });
		} break;
		case 'criar-transacao': {
			client.criarTransacao({
				currency: "BRL",
				items: [
					{
						id: '1',
						amount: 10,
						description: 'Produto teste',
						quantity: 1,
						weight: 1
					},
					{
						id: '2',
						amount: 10,
						description: 'Produto teste 2',
						quantity: 1,
						weight: 1
					}
				],
				redirectURL: '',
				notificationURL: '',
				sender: {
					name: 'Jose Comprador',
					email: 'comprador@uol.com.br',
					phone: {
						areaCode: '99',
						number: '999999999'
					},
					documents: [
						{
							type: "CPF", value: "11475714734"
						}
					]
				},
				shipping: {
					address: {
						street: 'Av. PagSeguro',
						number: '9999',
						complement: '99o andar',
						district: 'Jardim Internet',
						city: 'Cidade Exemplo',
						state: 'SP',
						country: 'BRA',
						postalCode: '99999999'
					},
					cost: '0.00',
					addressRequired: true,
					type: 1
				},
				timeout: 25,
				maxAge: 999999999,
				maxUses: 999,
				extraAmount: '0.00',
				reference: 'TESTE'
			}, (err, resp) => {
				if (err) {
					console.log('Error:', err);
				}
				else {
					console.log('Success!', resp);
				}
			});
		} break;
		case 'aderir': {
			client.aderirPlano({
				plan:'',
				reference:'',
				paymentMethod: {
					type:'CREDIT_CARD',
					credit: {
						token:'',
						holder: {
							billingAddress: {
								street: '',
								number: '',
								complement: '',
								district: '',
								postalCode: '',
								city: '',
								state: '',
								country: 'BRA',
							},
							birthDate: null,
							documents: [{ type: 'CNPJ', value: '' }],
							name: '',
							phone: {
								areaCode: '',
								number: ''
							}
						}
					}
				},
				sender:{
					name:'',
					phone:{
						areaCode:'', number:''
					},
					email:'',
					hash:'',
					documents:[{
						type:'CNPJ', value:''
					}],
					address:{
						street:'',
						number:'',
						complement:'',
						district:'',
						city:'',
						state:'',
						postalCode:'',
						country:''
					}
				}
			});
		} break;
		default:
			console.log('unknown command:', cmd);
	}
});
