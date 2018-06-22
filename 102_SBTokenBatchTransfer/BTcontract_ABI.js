const BT_Contract_ABI = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "myAddresses",
				"type": "address[]"
			},
			{
				"name": "totalAmount",
				"type": "uint256"
			},
			{
				"name": "distrAmount",
				"type": "uint256"
			}
		],
		"name": "distribute",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_address",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	}
]