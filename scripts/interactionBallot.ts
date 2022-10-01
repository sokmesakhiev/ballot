import { Contract, ethers } from "ethers";
import { Ballot } from "../typechain-types";

var fs = require("fs");
var BallotJson = JSON.parse(
  fs.readFileSync("./artifacts/contracts/Ballot.sol/Ballot.json", "utf8")
);

import * as dotenv from "dotenv";
dotenv.config();

const getPrivateKeyFromEnv = (network: string): string | undefined => {
  switch (network) {
    case "goerli":
      return process.env.GOERLI_PRIVATE_KEY;
    case "localnet":
      return process.env.LOCAL_PRIVATE_KEY;
    default:
      throw Error("Network Not Supported!!");
  }
};

export default class Interaction {
  private ballotContract: Contract | undefined;

  constructor(
    deployedContractAddress: string,
    network: string,
    alchemyAPIKey: string
  ) {
    if (!deployedContractAddress) {
      throw "BALLOT_ADDRESS is not sent";
    }
    if (!ethers.utils.isAddress(deployedContractAddress)) {
      throw "BALLOT_ADDRESS is not a valid address";
    }

    const PRIVATE_KEY = getPrivateKeyFromEnv(network);

    if (!PRIVATE_KEY) {
      console.error("!! Make sure to set your env keys for signer !!");
      throw Error("SET PRIVATE KEY IN ENV.");
    }

    const provider = new ethers.providers.AlchemyProvider(
      network,
      alchemyAPIKey
    );

    const signer = new ethers.Wallet(
      ethers.utils.hexlify(`0x${PRIVATE_KEY}`),
      provider
    );

    this.ballotContract = new ethers.Contract(
      deployedContractAddress,
      BallotJson.abi,
      signer
    );
  }

  private checkInitialized() {
    if (!this.ballotContract) {
      console.error("!! Contract was not Initialized !!");
      throw Error("Initializer should initialize");
    }
  }

  private checkAddress(address: string) {
    if (!ethers.utils.isAddress(address)) {
      throw Error("Address is not correct!!");
    }
  }

  async getVoter(voterAddress: string) {
    this.checkInitialized();
    return await this.ballotContract?.voters(voterAddress);
  }

  async getProposal(proposalId: string) {
    this.checkInitialized();
    return await this.ballotContract?.proposals(proposalId);
  }

  async getChairPerson () {
    return await this.ballotContract?.chairperson();
  }

  async giveVoterRight(to: string) {
    this.checkInitialized();
    this.checkAddress(to);
    const tx = await this.ballotContract?.giveRightToVote(to);
    return await tx.wait();
  }

  async vote(proposalId: string) {
    this.checkInitialized();
    const tx = await this.ballotContract?.vote(proposalId);
    return await tx.wait();

  };

  async delegateVote(to: string) {
    this.checkInitialized();
    this.checkAddress(to);
    const tx = await this.ballotContract?.delegate(to);
    return await tx.wait();
  }

  async getWinnerName() {
    this.checkInitialized();
    return ethers.utils.parseBytes32String(await this.ballotContract?.winnerName());
  }

  async getWinner() {
    this.checkInitialized();
    return await this.ballotContract?.winningProposal();
  }
}
