# kmk-node-pagseguro

### Installation

`npm install kmk-node-pagseguro`

### Usage

***Initializing PagSeguro.Client with TypeScript***
```typescript
import { PagSeguro } from 'kmk-node-pagseguro'

async run(){
	let client = new PagSeguro.Client({
		environment: 'sandbox',  
		email: 'your@email.com', 
		token: 'YOUR-TOKEN', 
		currency: 'BRL'
	});
}
	

```

***Initializing PagSeguro.Client with JavaScript***
```typescript
import { PagSeguro } from 'kmk-node-pagseguro'

async run(){
	let client = new PagSeguro.Client({
		environment: 'sandbox',  
		email: 'your@email.com', 
		token: 'YOUR-TOKEN', 
		currency: 'BRL'
	});
}
	

```

