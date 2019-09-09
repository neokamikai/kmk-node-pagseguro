const {PagSeguro} = require('../')
let client = new PagSeguro.Client({
	appId: 'app0242712020', appKey:'8165020DE9E9335004C83FB8C3AD3C04', environment: 'sandbox',
	
});

let stdin = process.openStdin();
console.log('App started!');
stdin.on('data', e => {
	let txt = e.toString().trim();
	if (!txt) return;
	let cmd = txt.split(/\s/)[0];
	switch (cmd) {
		case 'criar-transacao': {
			client.criarTransacao({
				currency: "BRL",
				items: [
					{
						id: '1',
						amount: 10,
						name: 'Produto teste',
						quantity: 1,
						weight: 1
					}
				],
				redirectURL: 'http://casa.douglasdomingues.com.br:35180',
				notificationURL: '',
				sender: {
					name: 'Jose Comprador',
					email: 'comprador@uol.com.br',
					phone: {
						areaCode:'99',
						number:'999999999'
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
			});
		}
		default:
			console.log('unknown command:',cmd);
	}
});