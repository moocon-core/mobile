/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/moocon_vaults.json`.
 */
export type MooconVaults = {
  "address": "mooxHpyFXFemZDNmGQE8KxW93aK8eRVG51nbsK2H52v",
  "metadata": {
    "name": "mooconVaults",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claim",
      "discriminator": [
        62,
        198,
        214,
        193,
        213,
        159,
        108,
        210
      ],
      "accounts": [
        {
          "name": "claimer",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "commitment",
          "docs": [
            "The base-layer commitment. Never delegated, so `amount` and `claimer` here were",
            "written only by `commit` and the base-layer `reveal`."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "arg",
                "path": "round"
              }
            ]
          }
        },
        {
          "name": "pMint",
          "writable": true
        },
        {
          "name": "claimerPTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "claimer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "pMint"
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
          "name": "tokenProgram"
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
          "name": "rentRecipient",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        },
        {
          "name": "round",
          "type": "u32"
        }
      ]
    },
    {
      "name": "closeSwapPreference",
      "discriminator": [
        192,
        43,
        93,
        116,
        17,
        168,
        225,
        25
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true,
          "relations": [
            "swapPreference"
          ]
        },
        {
          "name": "vault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "swapPreference",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  45,
                  112,
                  114,
                  101,
                  102,
                  101,
                  114,
                  101,
                  110,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        }
      ]
    },
    {
      "name": "collectFee",
      "discriminator": [
        60,
        173,
        247,
        103,
        4,
        93,
        130,
        48
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "vaultFTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "fTokenMint"
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
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
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
          "name": "adminTokenAccount",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "lendingAdmin"
        },
        {
          "name": "lending",
          "docs": [
            "reads the rate from the trusted source."
          ],
          "writable": true
        },
        {
          "name": "fTokenMint",
          "writable": true
        },
        {
          "name": "supplyTokenReservesLiquidity",
          "writable": true
        },
        {
          "name": "lendingSupplyPositionOnLiquidity",
          "writable": true
        },
        {
          "name": "rateModel"
        },
        {
          "name": "lendingVault",
          "writable": true
        },
        {
          "name": "claimAccount",
          "writable": true
        },
        {
          "name": "liquidity",
          "writable": true
        },
        {
          "name": "liquidityProgram",
          "writable": true
        },
        {
          "name": "rewardsRateModel"
        },
        {
          "name": "tokenProgram"
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
          "name": "lendingProgram"
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        }
      ]
    },
    {
      "name": "commit",
      "discriminator": [
        223,
        140,
        142,
        165,
        229,
        208,
        156,
        74
      ],
      "accounts": [
        {
          "name": "vrfAuthority",
          "writable": true,
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "lending",
          "writable": true
        },
        {
          "name": "pMint"
        },
        {
          "name": "mint"
        },
        {
          "name": "fTokenMint"
        },
        {
          "name": "supplyTokenReservesLiquidity"
        },
        {
          "name": "rewardsRateModel"
        },
        {
          "name": "lendingProgram"
        },
        {
          "name": "commitment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "request",
          "docs": [
            "Randomness-only sibling of `commitment`. This is the account that later gets",
            "delegated to the Ephemeral Rollup; the commitment above never leaves base layer."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  110,
                  100,
                  111,
                  109,
                  110,
                  101,
                  115,
                  115,
                  45,
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "commitment"
              }
            ]
          }
        },
        {
          "name": "prevReward",
          "docs": [
            "that the prior round is finalized before a new round can start (no",
            "re-roll). Must be `None` iff `round == 0`."
          ],
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        },
        {
          "name": "tickets",
          "type": "u64"
        },
        {
          "name": "expectedIndex",
          "type": "u8"
        },
        {
          "name": "merkleRoot",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "secretHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "consumeRandomness",
      "discriminator": [
        190,
        217,
        49,
        162,
        99,
        26,
        73,
        234
      ],
      "accounts": [
        {
          "name": "vrfProgramIdentity",
          "docs": [
            "Scoped VRF identity PDA, bound to this program. Its presence as a signer proves",
            "the callback was issued by the VRF program for this program."
          ],
          "signer": true
        },
        {
          "name": "request",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  110,
                  100,
                  111,
                  109,
                  110,
                  101,
                  115,
                  115,
                  45,
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "request"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "randomness",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "delegateRewardResult",
      "discriminator": [
        172,
        134,
        0,
        239,
        192,
        170,
        213,
        103
      ],
      "accounts": [
        {
          "name": "vrfAuthority",
          "writable": true,
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "commitment"
        },
        {
          "name": "bufferRequest",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "request"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                11,
                122,
                123,
                186,
                120,
                254,
                158,
                180,
                42,
                242,
                34,
                43,
                225,
                7,
                184,
                80,
                45,
                137,
                150,
                43,
                158,
                73,
                117,
                44,
                19,
                239,
                124,
                5,
                133,
                162,
                28,
                79
              ]
            }
          }
        },
        {
          "name": "delegationRecordRequest",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "request"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "delegationMetadataRequest",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110,
                  45,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "request"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "request",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  110,
                  100,
                  111,
                  109,
                  110,
                  101,
                  115,
                  115,
                  45,
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "commitment"
              }
            ]
          }
        },
        {
          "name": "instructions",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "ownerProgram",
          "address": "mooxHpyFXFemZDNmGQE8KxW93aK8eRVG51nbsK2H52v"
        },
        {
          "name": "delegationProgram",
          "address": "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        },
        {
          "name": "validator",
          "type": {
            "option": "pubkey"
          }
        }
      ]
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "depositor",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "premiumVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "depositorTokenAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "premiumVault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
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
          "name": "recipientTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "premiumVault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "fTokenMint"
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
          "name": "mint"
        },
        {
          "name": "pMint",
          "writable": true
        },
        {
          "name": "depositorPTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "depositor"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "pMint"
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
          "name": "lendingAdmin"
        },
        {
          "name": "lending",
          "writable": true
        },
        {
          "name": "fTokenMint",
          "writable": true
        },
        {
          "name": "supplyTokenReservesLiquidity",
          "writable": true
        },
        {
          "name": "lendingSupplyPositionOnLiquidity",
          "writable": true
        },
        {
          "name": "rateModel"
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "liquidity",
          "writable": true
        },
        {
          "name": "liquidityProgram",
          "writable": true
        },
        {
          "name": "rewardsRateModel"
        },
        {
          "name": "tokenProgram"
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
          "name": "lendingProgram"
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "harvest",
      "discriminator": [
        228,
        241,
        31,
        182,
        53,
        169,
        59,
        199
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "The protocol admin or VRF authority may deliver a finalized reward for its winner."
          ],
          "signer": true
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "commitment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "arg",
                "path": "round"
              }
            ]
          }
        },
        {
          "name": "winner"
        },
        {
          "name": "pMint",
          "writable": true
        },
        {
          "name": "winnerPTokenAccount",
          "docs": [
            "Must already exist. Unlike winner-driven claim, harvest never creates or funds an ATA."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "winner"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "pMint"
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
          "name": "tokenProgram"
        },
        {
          "name": "rentRecipient",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        },
        {
          "name": "round",
          "type": "u32"
        }
      ]
    },
    {
      "name": "harvestAndRedeem",
      "discriminator": [
        35,
        250,
        194,
        20,
        165,
        119,
        75,
        98
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "The protocol admin or VRF authority may deliver a finalized reward for its winner."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "commitment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "arg",
                "path": "round"
              }
            ]
          }
        },
        {
          "name": "winner"
        },
        {
          "name": "swapProxy",
          "docs": [
            "instructions and signs the route in the second. Validated by its seeds."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  45,
                  112,
                  114,
                  111,
                  120,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "state"
              }
            ]
          }
        },
        {
          "name": "pMint",
          "docs": [
            "Pinned to `vault.p_mint` by `validate_accounts`."
          ],
          "writable": true
        },
        {
          "name": "proxyPTokenAccount",
          "docs": [
            "Must already exist. Like harvest, this instruction never creates or funds an ATA."
          ],
          "writable": true
        },
        {
          "name": "mint",
          "docs": [
            "CPIs and the extension check as an account info, never deserialized here."
          ],
          "writable": true
        },
        {
          "name": "proxyTokenAccount",
          "docs": [
            "Where the redeemed underlying lands."
          ],
          "writable": true
        },
        {
          "name": "vaultFTokenAccount",
          "docs": [
            "The vault's pooled fToken position: its canonical ATA for its own fToken",
            "mint, and nothing else."
          ],
          "writable": true
        },
        {
          "name": "fTokenMint",
          "docs": [
            "by key, so it is not deserialized."
          ],
          "writable": true
        },
        {
          "name": "lendingAdmin"
        },
        {
          "name": "lending",
          "docs": [
            "reads the rate from the trusted source."
          ],
          "writable": true
        },
        {
          "name": "supplyTokenReservesLiquidity",
          "writable": true
        },
        {
          "name": "lendingSupplyPositionOnLiquidity",
          "writable": true
        },
        {
          "name": "rateModel"
        },
        {
          "name": "liquidityVault",
          "writable": true
        },
        {
          "name": "claimAccount",
          "writable": true
        },
        {
          "name": "liquidity",
          "writable": true
        },
        {
          "name": "liquidityProgram",
          "writable": true
        },
        {
          "name": "rewardsRateModel"
        },
        {
          "name": "lendingProgram"
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
          "name": "tokenProgram"
        },
        {
          "name": "instructions",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "rentRecipient",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "docs": [
            "Jupiter only redeems to a token account owned by its signing vault."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
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
          "name": "redemptionTicket",
          "docs": [
            "is pinned and the account created in the handler rather than by an `init`",
            "constraint: Anchor's generated create-account block puts `try_accounts`",
            "8 bytes past the 4KB SBF frame this struct already sits flush against, so",
            "the allocation goes in the handler's own frame instead."
          ],
          "writable": true
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        },
        {
          "name": "round",
          "type": "u32"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vrfAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initializeSwapConfig",
      "discriminator": [
        79,
        91,
        59,
        38,
        187,
        40,
        8,
        42
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "swapConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "usdcMint",
          "type": "pubkey"
        },
        {
          "name": "outputMints",
          "type": {
            "array": [
              "pubkey",
              16
            ]
          }
        }
      ]
    },
    {
      "name": "initializeVault",
      "discriminator": [
        48,
        191,
        163,
        44,
        71,
        129,
        63,
        164
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "state"
              }
            ]
          }
        },
        {
          "name": "lending"
        },
        {
          "name": "mint"
        },
        {
          "name": "fMint"
        },
        {
          "name": "pMint"
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
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
          "name": "vaultFTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "fMint"
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
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "minDeposit",
          "type": "u64"
        },
        {
          "name": "withdrawFee",
          "type": "u64"
        },
        {
          "name": "tiers",
          "type": {
            "array": [
              {
                "defined": {
                  "name": "distributionTier"
                }
              },
              2
            ]
          }
        }
      ]
    },
    {
      "name": "processUndelegation",
      "discriminator": [
        196,
        28,
        41,
        206,
        48,
        37,
        51,
        167
      ],
      "accounts": [
        {
          "name": "baseAccount",
          "writable": true
        },
        {
          "name": "buffer",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  110,
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  101,
                  45,
                  98,
                  117,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "baseAccount"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                181,
                183,
                0,
                225,
                242,
                87,
                58,
                192,
                204,
                6,
                34,
                1,
                52,
                74,
                207,
                151,
                184,
                53,
                6,
                235,
                140,
                229,
                25,
                152,
                204,
                98,
                126,
                24,
                147,
                128,
                167,
                62
              ]
            }
          }
        },
        {
          "name": "payer",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "accountSeeds",
          "type": {
            "vec": "bytes"
          }
        }
      ]
    },
    {
      "name": "requestRandomness",
      "discriminator": [
        213,
        5,
        173,
        166,
        37,
        236,
        31,
        18
      ],
      "accounts": [
        {
          "name": "vrfAuthority",
          "writable": true,
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "commitment"
        },
        {
          "name": "request",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  110,
                  100,
                  111,
                  109,
                  110,
                  101,
                  115,
                  115,
                  45,
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "commitment"
              }
            ]
          }
        },
        {
          "name": "oracleQueue",
          "writable": true,
          "address": "5hBR571xnXppuCPveTrctfTU7tJLSN94nq7kv7FRK5Tc"
        },
        {
          "name": "programIdentity",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "vrfProgram",
          "address": "Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz"
        },
        {
          "name": "slotHashes",
          "address": "SysvarS1otHashes111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        }
      ]
    },
    {
      "name": "reveal",
      "discriminator": [
        9,
        35,
        59,
        190,
        167,
        249,
        76,
        115
      ],
      "accounts": [
        {
          "name": "vrfAuthority",
          "docs": [
            "Receives the rent of the closed result account."
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "commitment",
          "writable": true
        },
        {
          "name": "request",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  110,
                  100,
                  111,
                  109,
                  110,
                  101,
                  115,
                  115,
                  45,
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "commitment"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        },
        {
          "name": "secretSeed",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "winner",
          "type": "pubkey"
        },
        {
          "name": "winnerWeight",
          "type": "u64"
        },
        {
          "name": "expectedIndex",
          "type": "u64"
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "defined": {
                "name": "weightedProofNode"
              }
            }
          }
        }
      ]
    },
    {
      "name": "setAllowedPools",
      "discriminator": [
        78,
        101,
        15,
        228,
        242,
        101,
        141,
        53
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "swapConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "pools",
          "type": {
            "array": [
              "pubkey",
              24
            ]
          }
        }
      ]
    },
    {
      "name": "setDistributionTierIntervals",
      "discriminator": [
        77,
        3,
        8,
        223,
        37,
        126,
        106,
        118
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        },
        {
          "name": "intervals",
          "type": {
            "array": [
              "i64",
              2
            ]
          }
        }
      ]
    },
    {
      "name": "setNewActivityPaused",
      "discriminator": [
        48,
        207,
        137,
        216,
        39,
        82,
        112,
        120
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    },
    {
      "name": "setSwapConfig",
      "discriminator": [
        225,
        183,
        87,
        170,
        211,
        116,
        234,
        6
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "swapConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "usdcMint",
          "type": "pubkey"
        },
        {
          "name": "outputMints",
          "type": {
            "array": [
              "pubkey",
              16
            ]
          }
        }
      ]
    },
    {
      "name": "setSwapPreference",
      "discriminator": [
        226,
        202,
        70,
        168,
        75,
        25,
        41,
        95
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "swapConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "outputMint",
          "docs": [
            "Rejected here as well as at harvest time, so a user learns their choice",
            "is not routable when they make it rather than when they win."
          ]
        },
        {
          "name": "swapPreference",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  45,
                  112,
                  114,
                  101,
                  102,
                  101,
                  114,
                  101,
                  110,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        }
      ]
    },
    {
      "name": "setVrfAuthority",
      "discriminator": [
        219,
        49,
        136,
        166,
        71,
        6,
        51,
        74
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newVrfAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "setWithdrawFee",
      "discriminator": [
        33,
        223,
        102,
        118,
        225,
        116,
        8,
        238
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        },
        {
          "name": "withdrawFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapRedemption",
      "docs": [
        "`vault_index` and `round` seed the vault and bind the redemption ticket;",
        "the amount to route comes off that ticket rather than from an argument."
      ],
      "discriminator": [
        187,
        221,
        57,
        174,
        68,
        28,
        144,
        160
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "The same authority that signed the preceding redeem, which the handler",
            "checks rather than assumes."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "swapConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "winner"
        },
        {
          "name": "vault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "swapPreference",
          "docs": [
            "Where the destination mint comes from. The winner does not sign either",
            "instruction, so the choice has to be theirs in advance."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  45,
                  112,
                  114,
                  101,
                  102,
                  101,
                  114,
                  101,
                  110,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "winner"
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "swapProxy",
          "docs": [
            "and signs the route. Validated by its seeds."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112,
                  45,
                  112,
                  114,
                  111,
                  120,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "state"
              }
            ]
          }
        },
        {
          "name": "mint",
          "docs": [
            "Pinned to `vault.mint` by `validate_accounts`."
          ],
          "writable": true
        },
        {
          "name": "proxyTokenAccount",
          "writable": true
        },
        {
          "name": "usdcMint",
          "docs": [
            "Pinned to `swap_config.usdc_mint` by `validate_accounts`."
          ]
        },
        {
          "name": "proxyUsdcTokenAccount",
          "writable": true
        },
        {
          "name": "outputMint",
          "docs": [
            "Two gates, both applied by `validate_accounts`: the winner chose it, and",
            "the admin lists it."
          ]
        },
        {
          "name": "winnerOutputTokenAccount",
          "docs": [
            "Must already exist. Like harvest, this program never creates or funds an ATA."
          ],
          "writable": true
        },
        {
          "name": "clmmProgram"
        },
        {
          "name": "tokenProgram2022",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "memoProgram",
          "address": "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "usdcTokenProgram"
        },
        {
          "name": "outputTokenProgram"
        },
        {
          "name": "instructions",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "legacyTokenProgram",
          "docs": [
            "Raydium requires legacy SPL Token independently of the input mint's owner."
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "redemptionTicket",
          "docs": [
            "What the preceding redeem measured, and who it settled for. Everything",
            "the sysvar check used to prove by comparing account positions comes from",
            "here instead, and the amount comes from here rather than from an argument",
            "the caller had to predict before the redeem ran. Closed on the way out, so",
            "the ticket cannot outlive the transaction that wrote it."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  100,
                  101,
                  109,
                  112,
                  116,
                  105,
                  111,
                  110,
                  45,
                  116,
                  105,
                  99,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "state"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        },
        {
          "name": "round",
          "type": "u32"
        },
        {
          "name": "hop1TickCount",
          "type": "u8"
        },
        {
          "name": "minAmountOut",
          "type": "u64"
        }
      ]
    },
    {
      "name": "syncRate",
      "discriminator": [
        44,
        249,
        76,
        136,
        3,
        137,
        49,
        247
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "lending"
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        }
      ]
    },
    {
      "name": "undelegateRewardResult",
      "discriminator": [
        132,
        190,
        22,
        73,
        219,
        68,
        236,
        210
      ],
      "accounts": [
        {
          "name": "vrfAuthority",
          "writable": true,
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "commitment",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "arg",
                "path": "round"
              }
            ]
          }
        },
        {
          "name": "request",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  110,
                  100,
                  111,
                  109,
                  110,
                  101,
                  115,
                  115,
                  45,
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "commitment"
              }
            ]
          }
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magicContext",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        },
        {
          "name": "round",
          "type": "u32"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "withdrawer",
          "signer": true
        },
        {
          "name": "premiumVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultIndex"
              }
            ]
          }
        },
        {
          "name": "vaultFTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "premiumVault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "fTokenMint"
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
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "premiumVault"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
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
          "name": "withdrawerTokenAccount",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "pMint",
          "writable": true
        },
        {
          "name": "withdrawerPTokenAccount",
          "writable": true
        },
        {
          "name": "lendingAdmin"
        },
        {
          "name": "lending",
          "docs": [
            "reads the rate from the trusted source."
          ],
          "writable": true
        },
        {
          "name": "fTokenMint",
          "writable": true
        },
        {
          "name": "supplyTokenReservesLiquidity",
          "writable": true
        },
        {
          "name": "lendingSupplyPositionOnLiquidity",
          "writable": true
        },
        {
          "name": "rateModel"
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "claimAccount",
          "writable": true
        },
        {
          "name": "liquidity",
          "writable": true
        },
        {
          "name": "liquidityProgram",
          "writable": true
        },
        {
          "name": "rewardsRateModel"
        },
        {
          "name": "tokenProgram"
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
          "name": "lendingProgram"
        }
      ],
      "args": [
        {
          "name": "vaultIndex",
          "type": "u32"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "randomnessRequest",
      "discriminator": [
        244,
        231,
        228,
        160,
        148,
        28,
        17,
        184
      ]
    },
    {
      "name": "redemptionTicket",
      "discriminator": [
        134,
        239,
        22,
        113,
        25,
        135,
        201,
        241
      ]
    },
    {
      "name": "rewardCommitment",
      "discriminator": [
        108,
        208,
        127,
        252,
        215,
        11,
        228,
        96
      ]
    },
    {
      "name": "state",
      "discriminator": [
        216,
        146,
        107,
        94,
        104,
        75,
        182,
        177
      ]
    },
    {
      "name": "swapConfig",
      "discriminator": [
        212,
        45,
        70,
        222,
        245,
        122,
        125,
        166
      ]
    },
    {
      "name": "swapPreference",
      "discriminator": [
        216,
        200,
        219,
        181,
        118,
        161,
        229,
        118
      ]
    },
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "events": [
    {
      "name": "commitEvent",
      "discriminator": [
        252,
        78,
        246,
        83,
        244,
        83,
        218,
        56
      ]
    },
    {
      "name": "newActivityPauseChanged",
      "discriminator": [
        215,
        83,
        19,
        238,
        56,
        38,
        202,
        251
      ]
    },
    {
      "name": "revealEvent",
      "discriminator": [
        51,
        6,
        123,
        75,
        48,
        187,
        64,
        1
      ]
    },
    {
      "name": "rewardClaimedEvent",
      "discriminator": [
        246,
        43,
        215,
        228,
        82,
        49,
        230,
        56
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "randomnessNotFulfilled",
      "msg": "Randomness has not been fulfilled yet"
    },
    {
      "code": 6001,
      "name": "zeroAmount",
      "msg": "zeroAmount"
    },
    {
      "code": 6002,
      "name": "cpiFailed",
      "msg": "CPI to Jup program failed"
    },
    {
      "code": 6003,
      "name": "invalidMint",
      "msg": "Provided invalid mint"
    },
    {
      "code": 6004,
      "name": "overflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6005,
      "name": "alreadySynced",
      "msg": "Exchange rate already synced"
    },
    {
      "code": 6006,
      "name": "notSynced",
      "msg": "Exchange rate not synced yet"
    },
    {
      "code": 6007,
      "name": "invalidExchangeRate",
      "msg": "Invalid exchange rate data"
    },
    {
      "code": 6008,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6009,
      "name": "winnerNotSet",
      "msg": "Winner not yet assigned"
    },
    {
      "code": 6010,
      "name": "alreadyClaimed",
      "msg": "Reward already claimed"
    },
    {
      "code": 6011,
      "name": "notWinner",
      "msg": "Not the winner"
    },
    {
      "code": 6012,
      "name": "nothingToClaim",
      "msg": "No yield to claim"
    },
    {
      "code": 6013,
      "name": "invalidRewardType",
      "msg": "Invalid reward type"
    },
    {
      "code": 6014,
      "name": "jackpotEmpty",
      "msg": "Jackpot pool is empty"
    },
    {
      "code": 6015,
      "name": "invalidFee",
      "msg": "Fee exceeds maximum"
    },
    {
      "code": 6016,
      "name": "invalidPMint",
      "msg": "Invalid PMint"
    },
    {
      "code": 6017,
      "name": "mismatchedDecimals",
      "msg": "Mismatched decimals between mint and pMint"
    },
    {
      "code": 6018,
      "name": "invalidRandomnessAccount",
      "msg": "Invalid randomness account"
    },
    {
      "code": 6019,
      "name": "invalidLendingProgram",
      "msg": "Invalid lending program"
    },
    {
      "code": 6020,
      "name": "invalidLendingAccount",
      "msg": "Invalid lending account"
    },
    {
      "code": 6021,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6022,
      "name": "invalidRound",
      "msg": "Invalid Round"
    },
    {
      "code": 6023,
      "name": "belowMinimumDeposit",
      "msg": "Below minimum deposit"
    },
    {
      "code": 6024,
      "name": "invalidVaultShare",
      "msg": "Invalid Vault share"
    },
    {
      "code": 6025,
      "name": "invalidSecretSeed",
      "msg": "Secret seed does not match committed hash"
    },
    {
      "code": 6026,
      "name": "invalidMerkleProof",
      "msg": "Invalid merkle proof"
    },
    {
      "code": 6027,
      "name": "tierIntervalNotElapsed",
      "msg": "Tier distribution interval has not elapsed"
    },
    {
      "code": 6028,
      "name": "emptyRange",
      "msg": "Ticket range count must be greater than zero"
    },
    {
      "code": 6029,
      "name": "rangePastTotal",
      "msg": "Ticket range extends past total_tickets"
    },
    {
      "code": 6030,
      "name": "indexOutOfRange",
      "msg": "Winner index falls outside the submitted ticket range"
    },
    {
      "code": 6031,
      "name": "invalidAmount",
      "msg": "Amount cannot be u64::MAX"
    },
    {
      "code": 6032,
      "name": "invalidTicketSupply",
      "msg": "Ticket supply does not match mint supply"
    },
    {
      "code": 6033,
      "name": "newActivityPaused",
      "msg": "New deposits and rounds are paused"
    },
    {
      "code": 6034,
      "name": "randomnessAlreadyRequested",
      "msg": "Randomness has already been requested for this reward"
    },
    {
      "code": 6035,
      "name": "randomnessAlreadyFulfilled",
      "msg": "Randomness has already been fulfilled for this reward"
    },
    {
      "code": 6036,
      "name": "rewardAlreadyFinalized",
      "msg": "Reward has already been finalized"
    },
    {
      "code": 6037,
      "name": "randomnessNotRequested",
      "msg": "Randomness has not been requested for this reward"
    },
    {
      "code": 6038,
      "name": "rewardNotFinalized",
      "msg": "Reward has not been finalized"
    },
    {
      "code": 6039,
      "name": "previousRoundNotFinalized",
      "msg": "Previous round must be finalized before committing a new round"
    },
    {
      "code": 6040,
      "name": "invalidTierInterval",
      "msg": "Invalid distribution tier interval"
    },
    {
      "code": 6041,
      "name": "invalidTierOrder",
      "msg": "Distribution tiers are not in ascending interval order"
    },
    {
      "code": 6042,
      "name": "invalidSlot",
      "msg": "Invalid slot for this reward commitment"
    },
    {
      "code": 6043,
      "name": "invalidAtomicDelegation",
      "msg": "Reward result delegation must immediately follow its commit"
    },
    {
      "code": 6044,
      "name": "rateBelowHighWaterMark",
      "msg": "Exchange rate dropped below the vault high-water mark"
    },
    {
      "code": 6045,
      "name": "mismatchedTokenProgram",
      "msg": "The vault mints must be owned by the same token program"
    },
    {
      "code": 6046,
      "name": "activeTransferFeeUnsupported",
      "msg": "Active Token-2022 transfer fees are not supported"
    },
    {
      "code": 6047,
      "name": "activeTransferHookUnsupported",
      "msg": "Active Token-2022 transfer hooks are not supported"
    },
    {
      "code": 6048,
      "name": "unsupportedTokenExtension",
      "msg": "Token-2022 mint contains an unsupported extension"
    },
    {
      "code": 6049,
      "name": "indexMismatch",
      "msg": "Computed winner index does not match the expected index"
    },
    {
      "code": 6050,
      "name": "invalidSwapProgram",
      "msg": "Swap program is not the expected Raydium CLMM program"
    },
    {
      "code": 6051,
      "name": "poolNotWhitelisted",
      "msg": "Route passes through a pool the admin has not whitelisted"
    },
    {
      "code": 6052,
      "name": "invalidRouteAccount",
      "msg": "Route account is not owned by the swap program, or smuggles in a signer"
    },
    {
      "code": 6053,
      "name": "invalidRouteLayout",
      "msg": "Route account list does not describe the required one or two hops"
    },
    {
      "code": 6054,
      "name": "invalidRouteDestination",
      "msg": "Route hop does not settle into the expected token account"
    },
    {
      "code": 6055,
      "name": "invalidRouteMint",
      "msg": "Route hop does not settle in the expected mint"
    },
    {
      "code": 6056,
      "name": "outputMintNotWhitelisted",
      "msg": "Output mint is not on the admin whitelist"
    },
    {
      "code": 6057,
      "name": "outputMintMismatch",
      "msg": "Output mint is not the one the winner chose"
    },
    {
      "code": 6058,
      "name": "slippageExceeded",
      "msg": "Swap delivered less than the caller's minimum"
    },
    {
      "code": 6059,
      "name": "proxyNotDrained",
      "msg": "Swap did not preserve the proxy's pre-existing balances"
    },
    {
      "code": 6060,
      "name": "nonAtomicRedemption",
      "msg": "Redeem and swap must be adjacent instructions in one transaction"
    },
    {
      "code": 6061,
      "name": "invalidSwapConfig",
      "msg": "Swap config list contains a duplicate, a gap, or an empty mint"
    },
    {
      "code": 6062,
      "name": "invalidTokenAccount",
      "msg": "Token account is not the canonical associated token account it must be"
    },
    {
      "code": 6063,
      "name": "invalidMinimumOutput",
      "msg": "Minimum output must be positive"
    },
    {
      "code": 6064,
      "name": "redemptionTicketMismatch",
      "msg": "Redemption ticket does not describe this swap"
    },
    {
      "code": 6065,
      "name": "invalidRedemptionTicket",
      "msg": "Redemption ticket is not the account its seeds derive"
    }
  ],
  "types": [
    {
      "name": "commitEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "round",
            "type": "u32"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "merkleRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "secretHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "vrfSeed",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "distributionTier",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "distributedAt",
            "type": "i64"
          },
          {
            "name": "interval",
            "type": "i64"
          },
          {
            "name": "rewardShare",
            "type": "u64"
          },
          {
            "name": "accumulated",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "newActivityPauseChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "admin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "randomnessRequest",
      "docs": [
        "One-shot VRF request state for a round. This is the *only* account delegated to the",
        "Ephemeral Rollup, so a compromised ER can affect nothing but `randomness`."
      ],
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "commitment",
            "type": "pubkey"
          },
          {
            "name": "randomness",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "requested",
            "type": "u8"
          },
          {
            "name": "fulfilled",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                5
              ]
            }
          }
        ]
      }
    },
    {
      "name": "redemptionTicket",
      "docs": [
        "What the redeem left on the swap proxy, and for whom.",
        "",
        "Exists only between `harvest_and_redeem` and the `swap_redemption` that",
        "immediately follows it: created by the first, closed by the second, never",
        "observable across transactions. A singleton, like the proxy it describes —",
        "one redemption is in flight at a time, so a bundle cannot hand the swap a",
        "different winner's ticket."
      ],
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "The authority that signed the redeem. The swap must be signed by the same one."
            ],
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "winner",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "docs": [
              "The mint sitting on the proxy — the swap's input mint."
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "Measured, not nominal: the proxy balance delta the redeem actually produced."
            ],
            "type": "u64"
          },
          {
            "name": "round",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                3
              ]
            }
          }
        ]
      }
    },
    {
      "name": "revealEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "round",
            "type": "u32"
          },
          {
            "name": "secretSeed",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "randomness",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "winnerIndex",
            "type": "u64"
          },
          {
            "name": "winnerStart",
            "type": "u64"
          },
          {
            "name": "winnerCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "rewardClaimedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "round",
            "type": "u32"
          },
          {
            "name": "beneficiary",
            "type": "pubkey"
          },
          {
            "name": "actor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "harvested",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "rewardCommitment",
      "docs": [
        "Immutable per-round economic commitment. Created on base layer by `commit` and",
        "**never delegated** — every value the base-layer `claim` mints against lives here."
      ],
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "claimer",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "totalTickets",
            "type": "u64"
          },
          {
            "name": "winnerIndex",
            "type": "u64"
          },
          {
            "name": "randomness",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "secretHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "merkleRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "slot",
            "type": "u64"
          },
          {
            "name": "round",
            "type": "u32"
          },
          {
            "name": "rewardType",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          }
        ]
      }
    },
    {
      "name": "state",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "vrfAuthority",
            "type": "pubkey"
          },
          {
            "name": "lastVault",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "newActivityPaused",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          }
        ]
      }
    },
    {
      "name": "swapConfig",
      "docs": [
        "Admin-owned route policy for `harvest_and_swap`.",
        "",
        "The mints a prize may be routed through were compile-time constants, which",
        "made listing one more xStock a program upgrade — a deploy, an audit diff, and",
        "a window where the old binary is still live. They live here instead so the",
        "list is data the admin edits.",
        "",
        "What deliberately did *not* move: the Raydium program id, which stays a",
        "compile-time pin. A config account that could redirect the CPI to an",
        "arbitrary program would make every other check on this path decorative, and",
        "unlike the mint list that is not something operations should be able to",
        "change without a redeploy."
      ],
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "usdcMint",
            "docs": [
              "The only token a first hop may settle into."
            ],
            "type": "pubkey"
          },
          {
            "name": "allowedOutputMints",
            "docs": [
              "Destination mints, the first `allowed_count` of which are live. Entries",
              "past the count are `Pubkey::default()` and are never matched."
            ],
            "type": {
              "array": [
                "pubkey",
                16
              ]
            }
          },
          {
            "name": "allowedPools",
            "docs": [
              "Raydium pools a route may pass through. Empty means no route is",
              "possible: an allowlist that defaults to permitting everything is not an",
              "allowlist."
            ],
            "type": {
              "array": [
                "pubkey",
                24
              ]
            }
          },
          {
            "name": "allowedCount",
            "type": "u8"
          },
          {
            "name": "allowedPoolCount",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                5
              ]
            }
          }
        ]
      }
    },
    {
      "name": "swapPreference",
      "docs": [
        "A depositor's standing instruction to take their prize as a tokenized stock.",
        "",
        "`harvest_and_swap` pays a winner who never signs it, so the destination mint",
        "cannot come from the transaction that settles the reward — the authority",
        "would be choosing on the winner's behalf. It comes from here instead: the",
        "account exists only because the user created it, and it names the only mint",
        "their prize may be routed into.",
        "",
        "The account's existence is the opt-in. No preference means no swap, and the",
        "authority must settle that round with plain `harvest`."
      ],
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "outputMint",
            "docs": [
              "Checked against the admin whitelist again at harvest time, so a mint",
              "delisted after the user chose it cannot still be routed into."
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          }
        ]
      }
    },
    {
      "name": "vault",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "fMint",
            "type": "pubkey"
          },
          {
            "name": "pMint",
            "type": "pubkey"
          },
          {
            "name": "lending",
            "type": "pubkey"
          },
          {
            "name": "minDeposit",
            "type": "u64"
          },
          {
            "name": "accumulatedFee",
            "type": "u64"
          },
          {
            "name": "unclaimedRewards",
            "docs": [
              "Finalized reward liabilities that have not yet been claimed."
            ],
            "type": "u64"
          },
          {
            "name": "withdrawFee",
            "type": "u64"
          },
          {
            "name": "lastRate",
            "type": "u64"
          },
          {
            "name": "accumulatedYield",
            "type": "u64"
          },
          {
            "name": "checkpointedFBalance",
            "docs": [
              "Internal record of fTokens owned by the vault as of the last",
              "checkpoint. Decoupled from the live `vault_f_token_account.amount` so",
              "that direct transfers into the vault's fToken ATA cannot inflate the",
              "yield computation. Only mutates via `apply_f_balance_delta` from",
              "deposit / withdraw / collect_fee, measuring the actual CPI delta."
            ],
            "type": "u64"
          },
          {
            "name": "distributionTiers",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "distributionTier"
                  }
                },
                2
              ]
            }
          },
          {
            "name": "currentRound",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "pubkeyPadding",
            "type": "pubkey"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                3
              ]
            }
          }
        ]
      }
    },
    {
      "name": "weightedProofNode",
      "docs": [
        "One sibling on the path from a leaf to the root."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "siblingHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "siblingWeight",
            "type": "u64"
          },
          {
            "name": "siblingIsLeft",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "percentageDenominator",
      "type": "u64",
      "value": "1000000"
    },
    {
      "name": "randomnessRequestSeed",
      "type": "bytes",
      "value": "[114, 97, 110, 100, 111, 109, 110, 101, 115, 115, 45, 114, 101, 113, 117, 101, 115, 116]"
    },
    {
      "name": "redemptionTicketSeed",
      "docs": [
        "Hands the measured redemption from `harvest_and_redeem` to the",
        "`swap_redemption` that must follow it. Derived from `state` like the proxy it",
        "describes, so `init` is what enforces one redemption in flight."
      ],
      "type": "bytes",
      "value": "[114, 101, 100, 101, 109, 112, 116, 105, 111, 110, 45, 116, 105, 99, 107, 101, 116]"
    },
    {
      "name": "rewardSeed",
      "type": "bytes",
      "value": "[114, 101, 119, 97, 114, 100]"
    },
    {
      "name": "stateSeed",
      "type": "bytes",
      "value": "[115, 116, 97, 116, 101]"
    },
    {
      "name": "swapConfigSeed",
      "type": "bytes",
      "value": "[115, 119, 97, 112, 45, 99, 111, 110, 102, 105, 103]"
    },
    {
      "name": "swapPreferenceSeed",
      "docs": [
        "Per user, per vault opt-in to being paid a prize as a tokenized stock. The",
        "account's existence is the opt-in; it names the destination mint."
      ],
      "type": "bytes",
      "value": "[115, 119, 97, 112, 45, 112, 114, 101, 102, 101, 114, 101, 110, 99, 101]"
    },
    {
      "name": "swapProxySeed",
      "docs": [
        "Signer-only PDA that stands in as the winner's claimant in `harvest_and_swap`.",
        "The winner never signs a harvest, so nothing they own may authorize a swap;",
        "the proxy holds the reward for the length of that instruction and signs the",
        "route on their behalf. Derived from `state` rather than per vault, so a",
        "single pair of intermediate ATAs serves every vault."
      ],
      "type": "bytes",
      "value": "[115, 119, 97, 112, 45, 112, 114, 111, 120, 121]"
    },
    {
      "name": "vaultSeed",
      "type": "bytes",
      "value": "[118, 97, 117, 108, 116]"
    }
  ]
};
