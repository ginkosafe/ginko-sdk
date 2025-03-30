import { Idl } from "@coral-xyz/anchor";

export type GinkoProtocol = {
  "address": "GinKo7e13rZF9PmvNnejkexYE37kggTcdpkFMTyNVjke",
  "metadata": {
    "name": "ginkoProtocol",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancelOrder",
      "discriminator": [
        95,
        129,
        237,
        240,
        8,
        49,
        223,
        132
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "order"
          ]
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "orderInputHolder",
          "writable": true
        },
        {
          "name": "refundReceiver",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "fillOrder",
      "discriminator": [
        232,
        122,
        115,
        25,
        199,
        143,
        136,
        162
      ],
      "accounts": [
        {
          "name": "settler",
          "docs": [
            "The market maker executing the fill"
          ],
          "signer": true
        },
        {
          "name": "authority",
          "docs": [
            "Token account proving the settler has appropriate authority",
            "Security: Validates settler has permission to execute fills"
          ]
        },
        {
          "name": "asset",
          "docs": [
            "The asset being traded",
            "Security: Circuit breaker check prevents trading of paused assets"
          ],
          "relations": [
            "order"
          ]
        },
        {
          "name": "order",
          "docs": [
            "The order being filled",
            "Security: Must match price oracle and asset to prevent oracle/asset confusion"
          ],
          "writable": true
        },
        {
          "name": "priceOracle",
          "docs": [
            "Oracle providing current price for slippage checks"
          ],
          "relations": [
            "order"
          ]
        },
        {
          "name": "assetMint",
          "docs": [
            "The RWA token mint",
            "Security: Must match the asset's mint to prevent token substitution"
          ],
          "writable": true
        },
        {
          "name": "paymentMint",
          "docs": [
            "The payment token mint",
            "Security: Must match order's payment mint to prevent payment token substitution"
          ]
        },
        {
          "name": "orderInputHolder",
          "docs": [
            "Account holding the order's input tokens",
            "Security: Must match order's recorded input holder"
          ],
          "writable": true
        },
        {
          "name": "settlerInputReceiver",
          "docs": [
            "Settler's account to receive input tokens",
            "Security: Must match input token mint to prevent token mixing"
          ],
          "writable": true
        },
        {
          "name": "settlerOutputProvider",
          "docs": [
            "Settler's account providing output tokens",
            "Security: Must be owned by settler to prevent unauthorized transfers"
          ],
          "writable": true
        },
        {
          "name": "userOutputReceiver",
          "docs": [
            "User's account to receive output tokens",
            "Security: Must be owned by order creator to prevent token theft"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "fillQty",
          "type": "u64"
        },
        {
          "name": "price",
          "type": {
            "defined": {
              "name": "price"
            }
          }
        }
      ]
    },
    {
      "name": "gcOrder",
      "discriminator": [
        34,
        128,
        255,
        186,
        133,
        111,
        11,
        231
      ],
      "accounts": [
        {
          "name": "settler",
          "signer": true
        },
        {
          "name": "authority"
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "owner",
          "docs": [
            "CHECK ."
          ],
          "writable": true,
          "relations": [
            "order"
          ]
        },
        {
          "name": "orderInputHolder",
          "writable": true
        },
        {
          "name": "refundReceiver",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "initAsset",
      "discriminator": [
        133,
        1,
        51,
        41,
        37,
        45,
        8,
        38
      ],
      "accounts": [
        {
          "name": "signer",
          "docs": [
            "The account paying for account creation"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "docs": [
            "Token account proving the signer has InitAsset authority",
            "Security: Validates signer can create new assets"
          ]
        },
        {
          "name": "asset",
          "docs": [
            "The asset account to be created",
            "Security: PDA derived from constant seed and unique nonce"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  115,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.nonce"
              }
            ]
          }
        },
        {
          "name": "mint",
          "docs": [
            "The token mint for this asset",
            "Security: PDA mint with asset account as mint authority"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  115,
                  101,
                  116,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.nonce"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "assetParams"
            }
          }
        }
      ]
    },
    {
      "name": "mintOrBurnAsset",
      "discriminator": [
        188,
        240,
        73,
        62,
        211,
        255,
        2,
        194
      ],
      "accounts": [
        {
          "name": "signer",
          "docs": [
            "The signer must have Settler authority via the authority account"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "docs": [
            "Token account proving the signer has Settler authority"
          ]
        },
        {
          "name": "asset",
          "docs": [
            "The asset being minted/burned, contains the ceiling and oracle parameters"
          ]
        },
        {
          "name": "assetMint",
          "docs": [
            "The mint for the RWA token"
          ],
          "writable": true
        },
        {
          "name": "assetHolder",
          "docs": [
            "The account that will receive minted tokens or provide tokens to burn"
          ],
          "writable": true
        },
        {
          "name": "quotaMint",
          "docs": [
            "The quota token mint, must match the protocol's known QUOTA_MINT"
          ],
          "writable": true
        },
        {
          "name": "quota",
          "docs": [
            "The quota token account that will be burned from during minting"
          ],
          "writable": true
        },
        {
          "name": "quotaPriceOracle",
          "docs": [
            "Oracle account providing the USD price for quota token calculations"
          ],
          "relations": [
            "asset"
          ]
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenProgram2022",
          "docs": [
            "The Token2022 program for quota token operations"
          ]
        }
      ],
      "args": [
        {
          "name": "mintOrBurn",
          "type": {
            "defined": {
              "name": "mintOrBurnAssetParam"
            }
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "placeOrder",
      "discriminator": [
        51,
        194,
        155,
        175,
        109,
        130,
        96,
        106
      ],
      "accounts": [
        {
          "name": "owner",
          "docs": [
            "The user creating the order"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "order",
          "docs": [
            "The order account to be created",
            "Security: PDA derived from owner and unique nonce"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "params.nonce"
              }
            ]
          }
        },
        {
          "name": "asset",
          "docs": [
            "The asset being traded",
            "Security: validation is done during fill_order"
          ]
        },
        {
          "name": "inputMint",
          "docs": [
            "Mint of the input token"
          ]
        },
        {
          "name": "orderInputHolder",
          "docs": [
            "Escrow account to hold input tokens",
            "Security: PDA-controlled account to prevent unauthorized withdrawals"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "order"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "inputMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userInputHolder",
          "docs": [
            "User's account providing input tokens",
            "Security: Must be owned by order creator"
          ],
          "writable": true
        },
        {
          "name": "priceOracle",
          "docs": [
            "Oracle providing price feed for market orders",
            "Security: validation is done during fill_order"
          ]
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "outputMint",
          "docs": [
            "Mint of the output token (required for sell orders)"
          ],
          "optional": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "orderParams"
            }
          }
        }
      ]
    },
    {
      "name": "switchboardPullFeedInit",
      "discriminator": [
        138,
        15,
        150,
        249,
        8,
        247,
        11,
        252
      ],
      "accounts": [
        {
          "name": "pullFeed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  105,
                  116,
                  99,
                  104,
                  98,
                  111,
                  97,
                  114,
                  100,
                  95,
                  112,
                  117,
                  108,
                  108,
                  95,
                  102,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "assetNonce"
              },
              {
                "kind": "account",
                "path": "paymentMint"
              }
            ]
          }
        },
        {
          "name": "queue"
        },
        {
          "name": "authority",
          "docs": [
            "pull feed authority"
          ]
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "programState"
        },
        {
          "name": "rewardEscrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pullFeed"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "wrappedSolMint",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "lutSigner"
        },
        {
          "name": "lut",
          "writable": true
        },
        {
          "name": "addressLookupTableProgram",
          "address": "AddressLookupTab1e1111111111111111111111111"
        },
        {
          "name": "ginkoAuthority",
          "docs": [
            "Token account proving the signer has InitAsset authority",
            "Security: Validates signer can create new assets"
          ]
        },
        {
          "name": "switchboardProgram",
          "address": "SBondMDrcV3K4kxZR1HNVT7osZxAHVHgYXL5Ze1oMUv"
        },
        {
          "name": "paymentMint"
        }
      ],
      "args": [
        {
          "name": "assetNonce",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "pullFeedInitParams",
          "type": {
            "defined": {
              "name": "pullFeedInitParams"
            }
          }
        }
      ]
    },
    {
      "name": "updateAsset",
      "discriminator": [
        56,
        126,
        238,
        138,
        192,
        118,
        228,
        172
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority"
        },
        {
          "name": "asset",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "assetUpdateParams"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "asset",
      "discriminator": [
        234,
        180,
        241,
        252,
        139,
        224,
        160,
        8
      ]
    },
    {
      "name": "order",
      "discriminator": [
        134,
        173,
        223,
        185,
        77,
        86,
        28,
        51
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidParams",
      "msg": "Invalid params"
    },
    {
      "code": 6001,
      "name": "invalidExpiration",
      "msg": "Invalid expiration"
    },
    {
      "code": 6002,
      "name": "invalidPrice",
      "msg": "Invalid price"
    },
    {
      "code": 6003,
      "name": "orderExpired",
      "msg": "Order expired"
    },
    {
      "code": 6004,
      "name": "exceedsCeiling",
      "msg": "Exceeds ceiling"
    },
    {
      "code": 6005,
      "name": "invalidSlippage",
      "msg": "Invalid slippage"
    },
    {
      "code": 6006,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6007,
      "name": "tradingPaused",
      "msg": "Trading paused"
    },
    {
      "code": 6008,
      "name": "invalidOrderSize",
      "msg": "Invalid order size"
    },
    {
      "code": 6009,
      "name": "orderAlreadyCanceled",
      "msg": "Order already canceled"
    },
    {
      "code": 6010,
      "name": "orderAlreadyFilled",
      "msg": "Order already filled"
    },
    {
      "code": 6011,
      "name": "orderNotReadyForGc",
      "msg": "Order not ready for GC"
    },
    {
      "code": 6012,
      "name": "mathOverflow",
      "msg": "Math overflow"
    }
  ],
  "types": [
    {
      "name": "asset",
      "docs": [
        "Asset represents a real-world asset (RWA) in the Ginko protocol.",
        "This account stores critical parameters that control minting, trading,",
        "and security constraints for the asset."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "docs": [
              "A 32-byte identifier, this field acts as a deterministic \"nonce\" in PDA derivations.",
              "For example:",
              "",
              "1. We query OpenFIGI to map \"AAPL\" -> \"BBG000B9XRY4\", a fixed 12 bytes ID.",
              "2. Use padded string `\"OpenFIGI:BBG000B9XRY4\"` as nonce.",
              "3. Store the padded string in `nonce`.",
              "",
              "NOTE: in the future if want to support other type of ids, we might store `sha256(namespace:id)`",
              "",
              "Using the nonce + a constant seed (e.g. `ASSET_SEED`) + `bump` ensures that",
              "each real-world asset maps to a unique on-chain address in a collision-resistant way.",
              "",
              "curl 'https://api.openfigi.com/v3/mapping'   \\",
              "--request POST     --header 'Content-Type: application/json'   \\",
              "--data '[{\"idType\":\"TICKER\",\"idValue\":\"AAPL\", \"exchCode\": \"US\"}]'"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "bump",
            "docs": [
              "The \"bump\" seed used by the runtime to ensure the derived PDA is not a valid Ed25519 key.",
              "Solana increments this `bump` as needed until it finds an off-curve address. The resulting",
              "valid PDA is then recorded so future instructions can derive the same address."
            ],
            "type": "u8"
          },
          {
            "name": "mint",
            "docs": [
              "The SPL token mint address for this RWA token"
            ],
            "type": "pubkey"
          },
          {
            "name": "minOrderSize",
            "docs": [
              "Minimum order size to prevent dust attacks and ensure economic viability"
            ],
            "type": "u64"
          },
          {
            "name": "ceiling",
            "docs": [
              "Maximum tokens that can be minted for this asset. This is a critical",
              "security parameter that caps potential losses in case of MM key compromise.",
              "The protocol enforces this limit in the mint_or_burn_asset instruction."
            ],
            "type": "u64"
          },
          {
            "name": "quotaPriceOracle",
            "docs": [
              "Oracle account that provides the USD price for the quota token.",
              "Used to calculate equivalent amounts during mint/burn operations."
            ],
            "type": "pubkey"
          },
          {
            "name": "paused",
            "docs": [
              "Emergency circuit breaker that can pause all operations for this asset"
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "assetParams",
      "docs": [
        "Parameters for initializing a new asset.",
        "These parameters define critical security and operational constraints."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "docs": [
              "Unique identifier for the asset.",
              "Security: Used in PDA derivation to ensure unique asset addresses"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "tokenDecimals",
            "docs": [
              "Decimal precision for the asset token",
              "Security: Must match underlying asset precision to prevent rounding exploits"
            ],
            "type": "u8"
          },
          {
            "name": "minOrderSize",
            "docs": [
              "Minimum order size to prevent dust attacks"
            ],
            "type": "u64"
          },
          {
            "name": "ceiling",
            "docs": [
              "Maximum supply cap for the asset",
              "Security: Critical parameter that limits potential losses in case of compromise"
            ],
            "type": "u64"
          },
          {
            "name": "quotaPriceOracle",
            "docs": [
              "Oracle account that will provide USD price for quota calculations",
              "Security: Must be a valid price feed to ensure correct quota token burns"
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "assetUpdateParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "minOrderSize",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "ceiling",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "paused",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "quotaPriceOracle",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "mintOrBurnAssetParam",
      "docs": [
        "Parameters for the mint or burn operation.",
        "This is the only instruction that can change the total supply of an asset."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "mint"
          },
          {
            "name": "burn"
          }
        ]
      }
    },
    {
      "name": "order",
      "docs": [
        "Order represents a user's intent to trade an asset at specific conditions.",
        "This account tracks the order's state, execution progress, and validation rules.",
        "Note: Order filling is separate from mint/burn operations and doesn't affect total supply."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "The public key of the order creator"
            ],
            "type": "pubkey"
          },
          {
            "name": "asset",
            "docs": [
              "The asset PDA this order is trading"
            ],
            "type": "pubkey"
          },
          {
            "name": "nonce",
            "docs": [
              "Unique identifier for this order, used in PDA derivation"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          },
          {
            "name": "inputHolder",
            "docs": [
              "Account holding the input tokens (payment tokens for buy, asset tokens for sell)"
            ],
            "type": "pubkey"
          },
          {
            "name": "paymentMint",
            "docs": [
              "The mint of the token being used for payment"
            ],
            "type": "pubkey"
          },
          {
            "name": "priceOracle",
            "docs": [
              "Oracle providing price feed for slippage calculations"
            ],
            "type": "pubkey"
          },
          {
            "name": "direction",
            "docs": [
              "Whether this is a buy or sell order"
            ],
            "type": {
              "defined": {
                "name": "orderDirection"
              }
            }
          },
          {
            "name": "typ",
            "docs": [
              "Market or limit order type"
            ],
            "type": {
              "defined": {
                "name": "orderType"
              }
            }
          },
          {
            "name": "limitPrice",
            "docs": [
              "Target price for limit orders, None for market orders"
            ],
            "type": {
              "option": {
                "defined": {
                  "name": "price"
                }
              }
            }
          },
          {
            "name": "inputQty",
            "docs": [
              "Quantity of input tokens to trade"
            ],
            "type": "u64"
          },
          {
            "name": "slippageBps",
            "docs": [
              "Maximum allowed price deviation in basis points (1/10000)"
            ],
            "type": "u16"
          },
          {
            "name": "createdAt",
            "docs": [
              "Unix timestamp when order was created"
            ],
            "type": "i64"
          },
          {
            "name": "expireAt",
            "docs": [
              "Unix timestamp when order becomes invalid"
            ],
            "type": "i64"
          },
          {
            "name": "canceledAt",
            "docs": [
              "Unix timestamp when order was canceled, if applicable"
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "filledQty",
            "docs": [
              "Amount of input_qty that has been executed"
            ],
            "type": "u64"
          },
          {
            "name": "filledOutputQty",
            "docs": [
              "Total quantity received from fills",
              "Note: We track raw quantities instead of average price to avoid",
              "floating point calculations"
            ],
            "type": "u64"
          },
          {
            "name": "lastFillSlot",
            "docs": [
              "Slot number of the last fill for this order"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "orderDirection",
      "docs": [
        "Direction of the order - whether it's buying or selling the asset"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "buy"
          },
          {
            "name": "sell"
          }
        ]
      }
    },
    {
      "name": "orderParams",
      "docs": [
        "Parameters for creating a new order.",
        "These parameters define the order's execution constraints and security parameters."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "docs": [
              "Unique identifier for the order",
              "Security: Used in PDA derivation to ensure unique order addresses"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "direction",
            "docs": [
              "Buy or sell direction"
            ],
            "type": {
              "defined": {
                "name": "orderDirection"
              }
            }
          },
          {
            "name": "typ",
            "docs": [
              "Market or limit order type"
            ],
            "type": {
              "defined": {
                "name": "orderType"
              }
            }
          },
          {
            "name": "limitPrice",
            "docs": [
              "Price constraint for limit orders",
              "Security: Must be Some for limit orders, None for market orders"
            ],
            "type": {
              "option": {
                "defined": {
                  "name": "price"
                }
              }
            }
          },
          {
            "name": "inputQty",
            "docs": [
              "Amount of input tokens to trade",
              "Security: Must be greater than asset's min_order_size"
            ],
            "type": "u64"
          },
          {
            "name": "slippageBps",
            "docs": [
              "Maximum allowed price deviation for market orders",
              "Security: Must be within valid range to prevent excessive slippage"
            ],
            "type": "u16"
          },
          {
            "name": "expireAt",
            "docs": [
              "Order expiration timestamp",
              "Security: Must be within valid future timeframe"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "orderType",
      "docs": [
        "Type of order that determines price execution behavior"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "market"
          },
          {
            "name": "limit"
          }
        ]
      }
    },
    {
      "name": "price",
      "docs": [
        "Price used when store or as instruction param",
        "1 Asset = mantissa / 10^scale QuoteToken"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mantissa",
            "type": "u64"
          },
          {
            "name": "scale",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "pullFeedInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feedHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "maxVariance",
            "type": "u64"
          },
          {
            "name": "minResponses",
            "type": "u32"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "recentSlot",
            "type": "u64"
          },
          {
            "name": "ipfsHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "minSampleSize",
            "type": "u8"
          },
          {
            "name": "maxStaleness",
            "type": "u32"
          },
          {
            "name": "permitWriteByAuthority",
            "type": {
              "option": "bool"
            }
          }
        ]
      }
    }
  ]
};

export const GINKO_IDL: Readonly<Idl> = {
  "address": "GinKo7e13rZF9PmvNnejkexYE37kggTcdpkFMTyNVjke",
  "metadata": {
    "name": "ginko_protocol",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancel_order",
      "discriminator": [
        95,
        129,
        237,
        240,
        8,
        49,
        223,
        132
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "order"
          ]
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "order_input_holder",
          "writable": true
        },
        {
          "name": "refund_receiver",
          "writable": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "fill_order",
      "discriminator": [
        232,
        122,
        115,
        25,
        199,
        143,
        136,
        162
      ],
      "accounts": [
        {
          "name": "settler",
          "docs": [
            "The market maker executing the fill"
          ],
          "signer": true
        },
        {
          "name": "authority",
          "docs": [
            "Token account proving the settler has appropriate authority",
            "Security: Validates settler has permission to execute fills"
          ]
        },
        {
          "name": "asset",
          "docs": [
            "The asset being traded",
            "Security: Circuit breaker check prevents trading of paused assets"
          ],
          "relations": [
            "order"
          ]
        },
        {
          "name": "order",
          "docs": [
            "The order being filled",
            "Security: Must match price oracle and asset to prevent oracle/asset confusion"
          ],
          "writable": true
        },
        {
          "name": "price_oracle",
          "docs": [
            "Oracle providing current price for slippage checks"
          ],
          "relations": [
            "order"
          ]
        },
        {
          "name": "asset_mint",
          "docs": [
            "The RWA token mint",
            "Security: Must match the asset's mint to prevent token substitution"
          ],
          "writable": true
        },
        {
          "name": "payment_mint",
          "docs": [
            "The payment token mint",
            "Security: Must match order's payment mint to prevent payment token substitution"
          ]
        },
        {
          "name": "order_input_holder",
          "docs": [
            "Account holding the order's input tokens",
            "Security: Must match order's recorded input holder"
          ],
          "writable": true
        },
        {
          "name": "settler_input_receiver",
          "docs": [
            "Settler's account to receive input tokens",
            "Security: Must match input token mint to prevent token mixing"
          ],
          "writable": true
        },
        {
          "name": "settler_output_provider",
          "docs": [
            "Settler's account providing output tokens",
            "Security: Must be owned by settler to prevent unauthorized transfers"
          ],
          "writable": true
        },
        {
          "name": "user_output_receiver",
          "docs": [
            "User's account to receive output tokens",
            "Security: Must be owned by order creator to prevent token theft"
          ],
          "writable": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "fill_qty",
          "type": "u64"
        },
        {
          "name": "price",
          "type": {
            "defined": {
              "name": "Price"
            }
          }
        }
      ]
    },
    {
      "name": "gc_order",
      "discriminator": [
        34,
        128,
        255,
        186,
        133,
        111,
        11,
        231
      ],
      "accounts": [
        {
          "name": "settler",
          "signer": true
        },
        {
          "name": "authority"
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "owner",
          "docs": [
            "CHECK ."
          ],
          "writable": true,
          "relations": [
            "order"
          ]
        },
        {
          "name": "order_input_holder",
          "writable": true
        },
        {
          "name": "refund_receiver",
          "writable": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "init_asset",
      "discriminator": [
        133,
        1,
        51,
        41,
        37,
        45,
        8,
        38
      ],
      "accounts": [
        {
          "name": "signer",
          "docs": [
            "The account paying for account creation"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "docs": [
            "Token account proving the signer has InitAsset authority",
            "Security: Validates signer can create new assets"
          ]
        },
        {
          "name": "asset",
          "docs": [
            "The asset account to be created",
            "Security: PDA derived from constant seed and unique nonce"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  115,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.nonce"
              }
            ]
          }
        },
        {
          "name": "mint",
          "docs": [
            "The token mint for this asset",
            "Security: PDA mint with asset account as mint authority"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  115,
                  101,
                  116,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "params.nonce"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "AssetParams"
            }
          }
        }
      ]
    },
    {
      "name": "mint_or_burn_asset",
      "discriminator": [
        188,
        240,
        73,
        62,
        211,
        255,
        2,
        194
      ],
      "accounts": [
        {
          "name": "signer",
          "docs": [
            "The signer must have Settler authority via the authority account"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "docs": [
            "Token account proving the signer has Settler authority"
          ]
        },
        {
          "name": "asset",
          "docs": [
            "The asset being minted/burned, contains the ceiling and oracle parameters"
          ]
        },
        {
          "name": "asset_mint",
          "docs": [
            "The mint for the RWA token"
          ],
          "writable": true
        },
        {
          "name": "asset_holder",
          "docs": [
            "The account that will receive minted tokens or provide tokens to burn"
          ],
          "writable": true
        },
        {
          "name": "quota_mint",
          "docs": [
            "The quota token mint, must match the protocol's known QUOTA_MINT"
          ],
          "writable": true
        },
        {
          "name": "quota",
          "docs": [
            "The quota token account that will be burned from during minting"
          ],
          "writable": true
        },
        {
          "name": "quota_price_oracle",
          "docs": [
            "Oracle account providing the USD price for quota token calculations"
          ],
          "relations": [
            "asset"
          ]
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "token_program_2022",
          "docs": [
            "The Token2022 program for quota token operations"
          ]
        }
      ],
      "args": [
        {
          "name": "mint_or_burn",
          "type": {
            "defined": {
              "name": "MintOrBurnAssetParam"
            }
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "place_order",
      "discriminator": [
        51,
        194,
        155,
        175,
        109,
        130,
        96,
        106
      ],
      "accounts": [
        {
          "name": "owner",
          "docs": [
            "The user creating the order"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "order",
          "docs": [
            "The order account to be created",
            "Security: PDA derived from owner and unique nonce"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "params.nonce"
              }
            ]
          }
        },
        {
          "name": "asset",
          "docs": [
            "The asset being traded",
            "Security: validation is done during fill_order"
          ]
        },
        {
          "name": "input_mint",
          "docs": [
            "Mint of the input token"
          ]
        },
        {
          "name": "order_input_holder",
          "docs": [
            "Escrow account to hold input tokens",
            "Security: PDA-controlled account to prevent unauthorized withdrawals"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "order"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "input_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user_input_holder",
          "docs": [
            "User's account providing input tokens",
            "Security: Must be owned by order creator"
          ],
          "writable": true
        },
        {
          "name": "price_oracle",
          "docs": [
            "Oracle providing price feed for market orders",
            "Security: validation is done during fill_order"
          ]
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "output_mint",
          "docs": [
            "Mint of the output token (required for sell orders)"
          ],
          "optional": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "OrderParams"
            }
          }
        }
      ]
    },
    {
      "name": "switchboard_pull_feed_init",
      "discriminator": [
        138,
        15,
        150,
        249,
        8,
        247,
        11,
        252
      ],
      "accounts": [
        {
          "name": "pull_feed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  105,
                  116,
                  99,
                  104,
                  98,
                  111,
                  97,
                  114,
                  100,
                  95,
                  112,
                  117,
                  108,
                  108,
                  95,
                  102,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "asset_nonce"
              },
              {
                "kind": "account",
                "path": "payment_mint"
              }
            ]
          }
        },
        {
          "name": "queue"
        },
        {
          "name": "authority",
          "docs": [
            "pull feed authority"
          ]
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "program_state"
        },
        {
          "name": "reward_escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pull_feed"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  155,
                  136,
                  87,
                  254,
                  171,
                  129,
                  132,
                  251,
                  104,
                  127,
                  99,
                  70,
                  24,
                  192,
                  53,
                  218,
                  196,
                  57,
                  220,
                  26,
                  235,
                  59,
                  85,
                  152,
                  160,
                  240,
                  0,
                  0,
                  0,
                  0,
                  1
                ]
              }
            ]
          }
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "wrapped_sol_mint",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "lut_signer"
        },
        {
          "name": "lut",
          "writable": true
        },
        {
          "name": "address_lookup_table_program",
          "address": "AddressLookupTab1e1111111111111111111111111"
        },
        {
          "name": "ginko_authority",
          "docs": [
            "Token account proving the signer has InitAsset authority",
            "Security: Validates signer can create new assets"
          ]
        },
        {
          "name": "switchboard_program",
          "address": "SBondMDrcV3K4kxZR1HNVT7osZxAHVHgYXL5Ze1oMUv"
        },
        {
          "name": "payment_mint"
        }
      ],
      "args": [
        {
          "name": "asset_nonce",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "pull_feed_init_params",
          "type": {
            "defined": {
              "name": "PullFeedInitParams"
            }
          }
        }
      ]
    },
    {
      "name": "update_asset",
      "discriminator": [
        56,
        126,
        238,
        138,
        192,
        118,
        228,
        172
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority"
        },
        {
          "name": "asset",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "AssetUpdateParams"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Asset",
      "discriminator": [
        234,
        180,
        241,
        252,
        139,
        224,
        160,
        8
      ]
    },
    {
      "name": "Order",
      "discriminator": [
        134,
        173,
        223,
        185,
        77,
        86,
        28,
        51
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidParams",
      "msg": "Invalid params"
    },
    {
      "code": 6001,
      "name": "InvalidExpiration",
      "msg": "Invalid expiration"
    },
    {
      "code": 6002,
      "name": "InvalidPrice",
      "msg": "Invalid price"
    },
    {
      "code": 6003,
      "name": "OrderExpired",
      "msg": "Order expired"
    },
    {
      "code": 6004,
      "name": "ExceedsCeiling",
      "msg": "Exceeds ceiling"
    },
    {
      "code": 6005,
      "name": "InvalidSlippage",
      "msg": "Invalid slippage"
    },
    {
      "code": 6006,
      "name": "Unauthorized",
      "msg": "Unauthorized"
    },
    {
      "code": 6007,
      "name": "TradingPaused",
      "msg": "Trading paused"
    },
    {
      "code": 6008,
      "name": "InvalidOrderSize",
      "msg": "Invalid order size"
    },
    {
      "code": 6009,
      "name": "OrderAlreadyCanceled",
      "msg": "Order already canceled"
    },
    {
      "code": 6010,
      "name": "OrderAlreadyFilled",
      "msg": "Order already filled"
    },
    {
      "code": 6011,
      "name": "OrderNotReadyForGC",
      "msg": "Order not ready for GC"
    },
    {
      "code": 6012,
      "name": "MathOverflow",
      "msg": "Math overflow"
    }
  ],
  "types": [
    {
      "name": "Asset",
      "docs": [
        "Asset represents a real-world asset (RWA) in the Ginko protocol.",
        "This account stores critical parameters that control minting, trading,",
        "and security constraints for the asset."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "docs": [
              "A 32-byte identifier, this field acts as a deterministic \"nonce\" in PDA derivations.",
              "For example:",
              "",
              "1. We query OpenFIGI to map \"AAPL\" -> \"BBG000B9XRY4\", a fixed 12 bytes ID.",
              "2. Use padded string `\"OpenFIGI:BBG000B9XRY4\"` as nonce.",
              "3. Store the padded string in `nonce`.",
              "",
              "NOTE: in the future if want to support other type of ids, we might store `sha256(namespace:id)`",
              "",
              "Using the nonce + a constant seed (e.g. `ASSET_SEED`) + `bump` ensures that",
              "each real-world asset maps to a unique on-chain address in a collision-resistant way.",
              "",
              "curl 'https://api.openfigi.com/v3/mapping'   \\",
              "--request POST     --header 'Content-Type: application/json'   \\",
              "--data '[{\"idType\":\"TICKER\",\"idValue\":\"AAPL\", \"exchCode\": \"US\"}]'"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "bump",
            "docs": [
              "The \"bump\" seed used by the runtime to ensure the derived PDA is not a valid Ed25519 key.",
              "Solana increments this `bump` as needed until it finds an off-curve address. The resulting",
              "valid PDA is then recorded so future instructions can derive the same address."
            ],
            "type": "u8"
          },
          {
            "name": "mint",
            "docs": [
              "The SPL token mint address for this RWA token"
            ],
            "type": "pubkey"
          },
          {
            "name": "min_order_size",
            "docs": [
              "Minimum order size to prevent dust attacks and ensure economic viability"
            ],
            "type": "u64"
          },
          {
            "name": "ceiling",
            "docs": [
              "Maximum tokens that can be minted for this asset. This is a critical",
              "security parameter that caps potential losses in case of MM key compromise.",
              "The protocol enforces this limit in the mint_or_burn_asset instruction."
            ],
            "type": "u64"
          },
          {
            "name": "quota_price_oracle",
            "docs": [
              "Oracle account that provides the USD price for the quota token.",
              "Used to calculate equivalent amounts during mint/burn operations."
            ],
            "type": "pubkey"
          },
          {
            "name": "paused",
            "docs": [
              "Emergency circuit breaker that can pause all operations for this asset"
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "AssetParams",
      "docs": [
        "Parameters for initializing a new asset.",
        "These parameters define critical security and operational constraints."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "docs": [
              "Unique identifier for the asset.",
              "Security: Used in PDA derivation to ensure unique asset addresses"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "token_decimals",
            "docs": [
              "Decimal precision for the asset token",
              "Security: Must match underlying asset precision to prevent rounding exploits"
            ],
            "type": "u8"
          },
          {
            "name": "min_order_size",
            "docs": [
              "Minimum order size to prevent dust attacks"
            ],
            "type": "u64"
          },
          {
            "name": "ceiling",
            "docs": [
              "Maximum supply cap for the asset",
              "Security: Critical parameter that limits potential losses in case of compromise"
            ],
            "type": "u64"
          },
          {
            "name": "quota_price_oracle",
            "docs": [
              "Oracle account that will provide USD price for quota calculations",
              "Security: Must be a valid price feed to ensure correct quota token burns"
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "AssetUpdateParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "min_order_size",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "ceiling",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "paused",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "quota_price_oracle",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "MintOrBurnAssetParam",
      "docs": [
        "Parameters for the mint or burn operation.",
        "This is the only instruction that can change the total supply of an asset."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Mint"
          },
          {
            "name": "Burn"
          }
        ]
      }
    },
    {
      "name": "Order",
      "docs": [
        "Order represents a user's intent to trade an asset at specific conditions.",
        "This account tracks the order's state, execution progress, and validation rules.",
        "Note: Order filling is separate from mint/burn operations and doesn't affect total supply."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "The public key of the order creator"
            ],
            "type": "pubkey"
          },
          {
            "name": "asset",
            "docs": [
              "The asset PDA this order is trading"
            ],
            "type": "pubkey"
          },
          {
            "name": "nonce",
            "docs": [
              "Unique identifier for this order, used in PDA derivation"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          },
          {
            "name": "input_holder",
            "docs": [
              "Account holding the input tokens (payment tokens for buy, asset tokens for sell)"
            ],
            "type": "pubkey"
          },
          {
            "name": "payment_mint",
            "docs": [
              "The mint of the token being used for payment"
            ],
            "type": "pubkey"
          },
          {
            "name": "price_oracle",
            "docs": [
              "Oracle providing price feed for slippage calculations"
            ],
            "type": "pubkey"
          },
          {
            "name": "direction",
            "docs": [
              "Whether this is a buy or sell order"
            ],
            "type": {
              "defined": {
                "name": "OrderDirection"
              }
            }
          },
          {
            "name": "typ",
            "docs": [
              "Market or limit order type"
            ],
            "type": {
              "defined": {
                "name": "OrderType"
              }
            }
          },
          {
            "name": "limit_price",
            "docs": [
              "Target price for limit orders, None for market orders"
            ],
            "type": {
              "option": {
                "defined": {
                  "name": "Price"
                }
              }
            }
          },
          {
            "name": "input_qty",
            "docs": [
              "Quantity of input tokens to trade"
            ],
            "type": "u64"
          },
          {
            "name": "slippage_bps",
            "docs": [
              "Maximum allowed price deviation in basis points (1/10000)"
            ],
            "type": "u16"
          },
          {
            "name": "created_at",
            "docs": [
              "Unix timestamp when order was created"
            ],
            "type": "i64"
          },
          {
            "name": "expire_at",
            "docs": [
              "Unix timestamp when order becomes invalid"
            ],
            "type": "i64"
          },
          {
            "name": "canceled_at",
            "docs": [
              "Unix timestamp when order was canceled, if applicable"
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "filled_qty",
            "docs": [
              "Amount of input_qty that has been executed"
            ],
            "type": "u64"
          },
          {
            "name": "filled_output_qty",
            "docs": [
              "Total quantity received from fills",
              "Note: We track raw quantities instead of average price to avoid",
              "floating point calculations"
            ],
            "type": "u64"
          },
          {
            "name": "last_fill_slot",
            "docs": [
              "Slot number of the last fill for this order"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OrderDirection",
      "docs": [
        "Direction of the order - whether it's buying or selling the asset"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Buy"
          },
          {
            "name": "Sell"
          }
        ]
      }
    },
    {
      "name": "OrderParams",
      "docs": [
        "Parameters for creating a new order.",
        "These parameters define the order's execution constraints and security parameters."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "docs": [
              "Unique identifier for the order",
              "Security: Used in PDA derivation to ensure unique order addresses"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "direction",
            "docs": [
              "Buy or sell direction"
            ],
            "type": {
              "defined": {
                "name": "OrderDirection"
              }
            }
          },
          {
            "name": "typ",
            "docs": [
              "Market or limit order type"
            ],
            "type": {
              "defined": {
                "name": "OrderType"
              }
            }
          },
          {
            "name": "limit_price",
            "docs": [
              "Price constraint for limit orders",
              "Security: Must be Some for limit orders, None for market orders"
            ],
            "type": {
              "option": {
                "defined": {
                  "name": "Price"
                }
              }
            }
          },
          {
            "name": "input_qty",
            "docs": [
              "Amount of input tokens to trade",
              "Security: Must be greater than asset's min_order_size"
            ],
            "type": "u64"
          },
          {
            "name": "slippage_bps",
            "docs": [
              "Maximum allowed price deviation for market orders",
              "Security: Must be within valid range to prevent excessive slippage"
            ],
            "type": "u16"
          },
          {
            "name": "expire_at",
            "docs": [
              "Order expiration timestamp",
              "Security: Must be within valid future timeframe"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "OrderType",
      "docs": [
        "Type of order that determines price execution behavior"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Market"
          },
          {
            "name": "Limit"
          }
        ]
      }
    },
    {
      "name": "Price",
      "docs": [
        "Price used when store or as instruction param",
        "1 Asset = mantissa / 10^scale QuoteToken"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mantissa",
            "type": "u64"
          },
          {
            "name": "scale",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "PullFeedInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feed_hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "max_variance",
            "type": "u64"
          },
          {
            "name": "min_responses",
            "type": "u32"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "recent_slot",
            "type": "u64"
          },
          {
            "name": "ipfs_hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "min_sample_size",
            "type": "u8"
          },
          {
            "name": "max_staleness",
            "type": "u32"
          },
          {
            "name": "permit_write_by_authority",
            "type": {
              "option": "bool"
            }
          }
        ]
      }
    }
  ]
};
