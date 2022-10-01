import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatRuntimeEnvironment } from "hardhat/types";

dotenv.config();

// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "KEY" with its key
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
// Replace this private key with your Goerli account private key.
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key.
// Beware: NEVER put real Ether into testing accounts
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;

const config: HardhatUserConfig = {
  defaultNetwork: "goerli",
  paths: { tests: "tests" },
  solidity: "0.8.17",
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
    },
  },
};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const getBallotContract = async (hre: HardhatRuntimeEnvironment) => {
  const ballotAddres = process.env.BALLOT_ADDRESS;

  if (!ballotAddres) {
    throw "BALLOT_ADDRESS is not set in .env file";
  }
  if (!hre.ethers.utils.isAddress(ballotAddres)) {
    throw "BALLOT_ADDRESS is not a valid address";
  }
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0];

  const ballotContractFactory = await hre.ethers.getContractFactory(
    "Ballot",
    signer
  );
  return ballotContractFactory.attach(ballotAddres);
};

const getEterscanTxLink = (txHash: String, hre: HardhatRuntimeEnvironment) => {
  return `https://${
    hre.network.name === "mainnet" ? "" : hre.network.name
  }.etherscan.io/tx/${txHash}`;
};

task("createVote", "Creating Vote Object")
  .addParam("account", "Voter's account")
  .setAction(async (taskArgs, hre) => {
    const ballotContract = await getBallotContract(hre);
    const account = hre.ethers.utils.getAddress(taskArgs.account);
    console.log("Creating a vote object:");
    const vote = {
      delegate: account,
      vote: 0,
      voted: false,
      weight: 1,
    };
    const createVoteTx = await ballotContract.createVoter(account, vote);
    console.log("Vote created!");
    console.log("Etherscan link:", getEterscanTxLink(createVoteTx.hash, hre));
  });

task("giveRightToVote", "Giving voting rights to an account")
  .addParam("account", "Voter's account")
  .setAction(async (taskArgs, hre) => {
    const ballotContract = await getBallotContract(hre);
    const account = hre.ethers.utils.getAddress(taskArgs.account);
    const giveRightToVoteTx = await ballotContract.giveRightToVote(account);
    console.log("Voting right granted!");
    console.log(
      "Etherscan link:",
      getEterscanTxLink(giveRightToVoteTx.hash, hre)
    );
  });

export default config;
