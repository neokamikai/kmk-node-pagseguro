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
		case 'cancelar-adesao':{
			let codigo = txt.split(/\s/)[1];
			if(!codigo) return  console.log('Código da adesão não informado');
			(async () => {
				console.log('Cancelar adesão:',codigo);
				let result = await client.cancelarAdesao(codigo);
				console.log('Resposta:',result);
			})().catch(e => {
				console.log('catch',e);
			});
		}break;
		case 'get-adesoes': {
			(async () => {
				let result = await client.getAdesoes({
					initialDate:'2019-01-01',
					finalDate:'2019-09-24'
				});
				console.log(result);
			})().catch(e => {
				console.log(e);
			});
		} break;
		case 'get-planos': {
			(async () => {
				let result = await client.getPlanos('ACTIVE', 0);
				console.log(result);
			})();
		} break;
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
		case 'criar-plano': {
			(async () => {
				let planos = [{
					reference: '5d49d4b5bf7a797dd19244f5',//5d49d4b5bf7a797dd19244f5:Chame Garçom
					//redirectURL:'https://localhost:35443/api/pagseguro/adesao/5d49d4b5bf7a797dd19244f5/retorno',
					preApproval: {
						charge: 'AUTO',
						amountPerPayment: 12.9,
						name: 'Chame o Garçom',
						period: 'YEARLY',
						//receiver:{email: credentials.email}

					}
				}, {
					reference: '5d08d38280a1d5db9a50ab94',//5d08d38280a1d5db9a50ab94:Padrão
					//redirectURL:'https://localhost:35443/api/pagseguro/adesao/5d08d38280a1d5db9a50ab94/retorno',
					preApproval: {
						charge: 'AUTO',
						amountPerPayment: 169.9,
						name: 'Padrão',
						period: 'YEARLY',
						membershipFee: '0.00',
						//receiver:{email: credentials.email}

					}
				}, {
					reference: '5d08d38280a1d5db9a50ab95',//5d08d38280a1d5db9a50ab95:Avançado
					//redirectURL:'https://localhost:35443/api/pagseguro/adesao/5d08d38280a1d5db9a50ab95/retorno',
					preApproval: {
						charge: 'AUTO',
						amountPerPayment: 369.7,
						name: 'Plus',
						period: 'YEARLY',
						membershipFee: '0.00',
						//receiver:{email: credentials.email}

					}
				}];
				for (let plano of planos) {
					console.log('Criando plano ' + plano.preApproval.name + '...');
					try {
						let result = await client.criarPlano(plano)
							.catch(e => console.error(e));
						console.log('Resultado:', result);
					} catch (e) {
						console.log('Erro:', e);
					}
				}
			})();

		} break;
		case 'aderir': {

			client.aderirPlano({
				plan:'9BA597D9D4D4C1A44499BFACFA2C147E',
				reference:'5d49d4b5bf7a797dd19244f5',
				sender: {
					documents:[
						{type:'CPF', value:'11111111111'}
					],
					name:'TESTE',
					phone: {
						areaCode: '11',
						number:'912345678'
					},
					address:{
						city: 'TESTE',
						complement: 'TESTE',
						district:'TESTE',
						number: 'TESTE',
						postalCode:'00000000',
						state:'SP',
						street:'TESTE'
					},
					ip:'127.0.0.1',
					email:'email@comrpador.com.br'
				},
				paymentMethod: {
					type: "CREDITCARD",
					creditCard: {
						holder: {
							documents:[
								{type:'CPF', value:'11111111111'}
							],
							name:'TESTE',
							phone: {
								areaCode: '11',
								number:'912345678'
							},
							billingAddress: {
								city: 'TESTE',
								complement: 'TESTE',
								district:'TESTE',
								number: 'TESTE',
								postalCode:'00000000',
								state:'SP',
								street:'TESTE'
							},
							birthDate: '1987-09-10'
						},
						token:'TESTE'
					}
				}
			}, (err, resp) => {
					if(err){
						console.log('callback catch', err);
					}
					else {
						console.log(resp);
					}
				})/*.catch(e => {
					console.log('promise catch',e);
				})*/;
		} break;
		default:
			console.log('unknown command:', cmd);
	}
});
