const exchangeV2Abi = [
	{
		type: "constructor",
		inputs: [
			{
				name: "params",
				type: "tuple",
				internalType: "struct ExchangeInitParams",
				components: [
					{
						name: "admin",
						type: "address",
						internalType: "address"
					},
					{
						name: "collateral",
						type: "address",
						internalType: "address"
					},
					{
						name: "ctf",
						type: "address",
						internalType: "address"
					},
					{
						name: "outcomeTokenFactory",
						type: "address",
						internalType: "address"
					},
					{
						name: "proxyFactory",
						type: "address",
						internalType: "address"
					},
					{
						name: "safeFactory",
						type: "address",
						internalType: "address"
					},
					{
						name: "feeReceiver",
						type: "address",
						internalType: "address"
					}
				]
			}
		],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "addAdmin",
		inputs: [
			{
				name: "admin_",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "addOperator",
		inputs: [
			{
				name: "operator_",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "eip712Domain",
		inputs: [],
		outputs: [
			{
				name: "fields",
				type: "bytes1",
				internalType: "bytes1"
			},
			{
				name: "name",
				type: "string",
				internalType: "string"
			},
			{
				name: "version",
				type: "string",
				internalType: "string"
			},
			{
				name: "chainId",
				type: "uint256",
				internalType: "uint256"
			},
			{
				name: "verifyingContract",
				type: "address",
				internalType: "address"
			},
			{
				name: "salt",
				type: "bytes32",
				internalType: "bytes32"
			},
			{
				name: "extensions",
				type: "uint256[]",
				internalType: "uint256[]"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getCollateral",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getCtf",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getFeeReceiver",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getMaxFeeRate",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "uint256",
				internalType: "uint256"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getOrderStatus",
		inputs: [
			{
				name: "orderHash",
				type: "bytes32",
				internalType: "bytes32"
			}
		],
		outputs: [
			{
				name: "",
				type: "tuple",
				internalType: "struct OrderStatus",
				components: [
					{
						name: "filled",
						type: "bool",
						internalType: "bool"
					},
					{
						name: "remaining",
						type: "uint248",
						internalType: "uint248"
					}
				]
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getOutcomeTokenFactory",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getPolyProxyFactoryImplementation",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getPolyProxyWalletAddress",
		inputs: [
			{
				name: "_addr",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getProxyFactory",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getSafeAddress",
		inputs: [
			{
				name: "_addr",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getSafeFactory",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getSafeFactoryImplementation",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "hashOrder",
		inputs: [
			{
				name: "order",
				type: "tuple",
				internalType: "struct Order",
				components: [
					{
						name: "salt",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "maker",
						type: "address",
						internalType: "address"
					},
					{
						name: "signer",
						type: "address",
						internalType: "address"
					},
					{
						name: "tokenId",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "makerAmount",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "takerAmount",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "side",
						type: "uint8",
						internalType: "enum Side"
					},
					{
						name: "signatureType",
						type: "uint8",
						internalType: "enum SignatureType"
					},
					{
						name: "timestamp",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "metadata",
						type: "bytes32",
						internalType: "bytes32"
					},
					{
						name: "builder",
						type: "bytes32",
						internalType: "bytes32"
					},
					{
						name: "signature",
						type: "bytes",
						internalType: "bytes"
					}
				]
			}
		],
		outputs: [
			{
				name: "",
				type: "bytes32",
				internalType: "bytes32"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "isAdmin",
		inputs: [
			{
				name: "usr",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [
			{
				name: "",
				type: "bool",
				internalType: "bool"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "isOperator",
		inputs: [
			{
				name: "usr",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [
			{
				name: "",
				type: "bool",
				internalType: "bool"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "isUserPaused",
		inputs: [
			{
				name: "user",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [
			{
				name: "",
				type: "bool",
				internalType: "bool"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "matchOrders",
		inputs: [
			{
				name: "conditionId",
				type: "bytes32",
				internalType: "bytes32"
			},
			{
				name: "takerOrder",
				type: "tuple",
				internalType: "struct Order",
				components: [
					{
						name: "salt",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "maker",
						type: "address",
						internalType: "address"
					},
					{
						name: "signer",
						type: "address",
						internalType: "address"
					},
					{
						name: "tokenId",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "makerAmount",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "takerAmount",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "side",
						type: "uint8",
						internalType: "enum Side"
					},
					{
						name: "signatureType",
						type: "uint8",
						internalType: "enum SignatureType"
					},
					{
						name: "timestamp",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "metadata",
						type: "bytes32",
						internalType: "bytes32"
					},
					{
						name: "builder",
						type: "bytes32",
						internalType: "bytes32"
					},
					{
						name: "signature",
						type: "bytes",
						internalType: "bytes"
					}
				]
			},
			{
				name: "makerOrders",
				type: "tuple[]",
				internalType: "struct Order[]",
				components: [
					{
						name: "salt",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "maker",
						type: "address",
						internalType: "address"
					},
					{
						name: "signer",
						type: "address",
						internalType: "address"
					},
					{
						name: "tokenId",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "makerAmount",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "takerAmount",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "side",
						type: "uint8",
						internalType: "enum Side"
					},
					{
						name: "signatureType",
						type: "uint8",
						internalType: "enum SignatureType"
					},
					{
						name: "timestamp",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "metadata",
						type: "bytes32",
						internalType: "bytes32"
					},
					{
						name: "builder",
						type: "bytes32",
						internalType: "bytes32"
					},
					{
						name: "signature",
						type: "bytes",
						internalType: "bytes"
					}
				]
			},
			{
				name: "takerFillAmount",
				type: "uint256",
				internalType: "uint256"
			},
			{
				name: "makerFillAmounts",
				type: "uint256[]",
				internalType: "uint256[]"
			},
			{
				name: "takerFeeAmount",
				type: "uint256",
				internalType: "uint256"
			},
			{
				name: "makerFeeAmounts",
				type: "uint256[]",
				internalType: "uint256[]"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "onERC1155BatchReceived",
		inputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			},
			{
				name: "",
				type: "address",
				internalType: "address"
			},
			{
				name: "",
				type: "uint256[]",
				internalType: "uint256[]"
			},
			{
				name: "",
				type: "uint256[]",
				internalType: "uint256[]"
			},
			{
				name: "",
				type: "bytes",
				internalType: "bytes"
			}
		],
		outputs: [
			{
				name: "",
				type: "bytes4",
				internalType: "bytes4"
			}
		],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "onERC1155Received",
		inputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			},
			{
				name: "",
				type: "address",
				internalType: "address"
			},
			{
				name: "",
				type: "uint256",
				internalType: "uint256"
			},
			{
				name: "",
				type: "uint256",
				internalType: "uint256"
			},
			{
				name: "",
				type: "bytes",
				internalType: "bytes"
			}
		],
		outputs: [
			{
				name: "",
				type: "bytes4",
				internalType: "bytes4"
			}
		],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "orderStatus",
		inputs: [
			{
				name: "",
				type: "bytes32",
				internalType: "bytes32"
			}
		],
		outputs: [
			{
				name: "filled",
				type: "bool",
				internalType: "bool"
			},
			{
				name: "remaining",
				type: "uint248",
				internalType: "uint248"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "parentCollectionId",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "bytes32",
				internalType: "bytes32"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "pauseTrading",
		inputs: [],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "pauseUser",
		inputs: [],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "paused",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "bool",
				internalType: "bool"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "removeAdmin",
		inputs: [
			{
				name: "admin",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "removeOperator",
		inputs: [
			{
				name: "operator",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "renounceAdminRole",
		inputs: [],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "renounceOperatorRole",
		inputs: [],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "setFeeReceiver",
		inputs: [
			{
				name: "receiver",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "setMaxFeeRate",
		inputs: [
			{
				name: "rate",
				type: "uint256",
				internalType: "uint256"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "setUserPauseBlockInterval",
		inputs: [
			{
				name: "_interval",
				type: "uint256",
				internalType: "uint256"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "unpauseTrading",
		inputs: [],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "unpauseUser",
		inputs: [],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "userPauseBlockInterval",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "uint256",
				internalType: "uint256"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "userPausedBlockAt",
		inputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [
			{
				name: "",
				type: "uint256",
				internalType: "uint256"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "validateFee",
		inputs: [
			{
				name: "fee",
				type: "uint256",
				internalType: "uint256"
			},
			{
				name: "cashValue",
				type: "uint256",
				internalType: "uint256"
			}
		],
		outputs: [],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "validateOrder",
		inputs: [
			{
				name: "order",
				type: "tuple",
				internalType: "struct Order",
				components: [
					{
						name: "salt",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "maker",
						type: "address",
						internalType: "address"
					},
					{
						name: "signer",
						type: "address",
						internalType: "address"
					},
					{
						name: "tokenId",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "makerAmount",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "takerAmount",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "side",
						type: "uint8",
						internalType: "enum Side"
					},
					{
						name: "signatureType",
						type: "uint8",
						internalType: "enum SignatureType"
					},
					{
						name: "timestamp",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "metadata",
						type: "bytes32",
						internalType: "bytes32"
					},
					{
						name: "builder",
						type: "bytes32",
						internalType: "bytes32"
					},
					{
						name: "signature",
						type: "bytes",
						internalType: "bytes"
					}
				]
			}
		],
		outputs: [],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "validateOrderSignature",
		inputs: [
			{
				name: "orderHash",
				type: "bytes32",
				internalType: "bytes32"
			},
			{
				name: "order",
				type: "tuple",
				internalType: "struct Order",
				components: [
					{
						name: "salt",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "maker",
						type: "address",
						internalType: "address"
					},
					{
						name: "signer",
						type: "address",
						internalType: "address"
					},
					{
						name: "tokenId",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "makerAmount",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "takerAmount",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "side",
						type: "uint8",
						internalType: "enum Side"
					},
					{
						name: "signatureType",
						type: "uint8",
						internalType: "enum SignatureType"
					},
					{
						name: "timestamp",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "metadata",
						type: "bytes32",
						internalType: "bytes32"
					},
					{
						name: "builder",
						type: "bytes32",
						internalType: "bytes32"
					},
					{
						name: "signature",
						type: "bytes",
						internalType: "bytes"
					}
				]
			}
		],
		outputs: [],
		stateMutability: "view"
	},
	{
		type: "event",
		name: "FeeCharged",
		inputs: [
			{
				name: "receiver",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "amount",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "FeeReceiverUpdated",
		inputs: [
			{
				name: "feeReceiver",
				type: "address",
				indexed: true,
				internalType: "address"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "MaxFeeRateUpdated",
		inputs: [
			{
				name: "maxFeeRate",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "NewAdmin",
		inputs: [
			{
				name: "newAdminAddress",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "admin",
				type: "address",
				indexed: true,
				internalType: "address"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "NewOperator",
		inputs: [
			{
				name: "newOperatorAddress",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "admin",
				type: "address",
				indexed: true,
				internalType: "address"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "OrderFilled",
		inputs: [
			{
				name: "orderHash",
				type: "bytes32",
				indexed: true,
				internalType: "bytes32"
			},
			{
				name: "maker",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "taker",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "side",
				type: "uint8",
				indexed: false,
				internalType: "enum Side"
			},
			{
				name: "tokenId",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			},
			{
				name: "makerAmountFilled",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			},
			{
				name: "takerAmountFilled",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			},
			{
				name: "fee",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			},
			{
				name: "builder",
				type: "bytes32",
				indexed: false,
				internalType: "bytes32"
			},
			{
				name: "metadata",
				type: "bytes32",
				indexed: false,
				internalType: "bytes32"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "OrdersMatched",
		inputs: [
			{
				name: "takerOrderHash",
				type: "bytes32",
				indexed: true,
				internalType: "bytes32"
			},
			{
				name: "takerOrderMaker",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "side",
				type: "uint8",
				indexed: false,
				internalType: "enum Side"
			},
			{
				name: "tokenId",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			},
			{
				name: "makerAmountFilled",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			},
			{
				name: "takerAmountFilled",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "RemovedAdmin",
		inputs: [
			{
				name: "removedAdmin",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "admin",
				type: "address",
				indexed: true,
				internalType: "address"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "RemovedOperator",
		inputs: [
			{
				name: "removedOperator",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "admin",
				type: "address",
				indexed: true,
				internalType: "address"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "TradingPaused",
		inputs: [
			{
				name: "pauser",
				type: "address",
				indexed: true,
				internalType: "address"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "TradingUnpaused",
		inputs: [
			{
				name: "pauser",
				type: "address",
				indexed: true,
				internalType: "address"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "UserPauseBlockIntervalUpdated",
		inputs: [
			{
				name: "oldInterval",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			},
			{
				name: "newInterval",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "UserPaused",
		inputs: [
			{
				name: "user",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "effectivePauseBlock",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "UserUnpaused",
		inputs: [
			{
				name: "user",
				type: "address",
				indexed: true,
				internalType: "address"
			}
		],
		anonymous: false
	},
	{
		type: "error",
		name: "FeeExceedsMaxRate",
		inputs: []
	},
	{
		type: "error",
		name: "FeeExceedsProceeds",
		inputs: []
	},
	{
		type: "error",
		name: "InvalidSignature",
		inputs: []
	},
	{
		type: "error",
		name: "MakingGtRemaining",
		inputs: []
	},
	{
		type: "error",
		name: "MaxFeeRateExceedsCeiling",
		inputs: []
	},
	{
		type: "error",
		name: "MismatchedTokenIds",
		inputs: []
	},
	{
		type: "error",
		name: "NotAdmin",
		inputs: []
	},
	{
		type: "error",
		name: "NotCrossing",
		inputs: []
	},
	{
		type: "error",
		name: "NotOperator",
		inputs: []
	},
	{
		type: "error",
		name: "OrderAlreadyFilled",
		inputs: []
	},
	{
		type: "error",
		name: "OrderExpired",
		inputs: []
	},
	{
		type: "error",
		name: "Paused",
		inputs: []
	},
	{
		type: "error",
		name: "TooLittleTokensReceived",
		inputs: []
	},
	{
		type: "error",
		name: "UserIsPaused",
		inputs: []
	}
] as const;

export { exchangeV2Abi };

