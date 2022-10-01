# Weekend Project 2: Ballot Scripts

## Development

```bash
yarn install
yarn hardhat compile
```

Then create a file named `.env` with the following content and fill values:

```env
ALCHEMY_API_KEY=
GOERLI_PRIVATE_KEY=
BALLOT_ADDRESS=0x79eEcC3b5e50598129EaF64f7f86f65458E071Cd
```

## Scripts

### Create Vote

```bash
yarn hardhat createVote --account 0xD9aF6C670B49C4b1239B86bb472E877f5BdF13Bf
```

Example TX: https://goerli.etherscan.io/tx/0x6baeef448ff447d6cfaf0cf1f58deb73138d11835021ff8beeb0297193386a0c

### Give Right to Vote

```bash
 yarn hardhat giveRightToVote --account 0xD9aF6C670B49C4b1239B86bb472E877f5BdF13Bf
```

_Note: Only `chairman`(deployer) can call this script_

Example TX: TODO

## Helper Fucntions

### Get Ballot Contract

This function creates an instance of `Ballot` contract using `BALLOT_ADDRESS` variable in the `.env` file as address and `accounts[0]` as signer.

### Get Etherscan Tx Link

This function returns `Etherscan` link to Tx.
