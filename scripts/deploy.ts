import { ethers } from "hardhat";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function main() {
  const provider = ethers.getDefaultProvider("goerli");
  const lastBlock = await provider.getBlock("latest");
  console.log({lastBlock});
  // const accounts = await ethers.getSigners();
  // console.log("Deploying Ballot contract");
  // console.log("Proposals: ");
  // PROPOSALS.forEach((element, index) => {
  //   console.log(`Proposal N. ${index + 1}: ${element}`);
  // });
  // const ballotFactory = await ethers.getContractFactory("Ballot");
  // const ballotContract = await ballotFactory.deploy(
  //   convertStringArrayToBytes32(PROPOSALS)
  // );
  // await ballotContract.deployed();
  // console.log(`HelloWorld was deployed to address ${ballotContract.address}`);
  // for (let index = 0; index < PROPOSALS.length; index++) {
  //   const proposal = await ballotContract.proposals(index);
  //   const name = ethers.utils.parseBytes32String(proposal.name)
  //   console.log(index, name, proposal)
  // }
  // const chairperson = await ballotContract.chairperson();
  // console.log({chairperson});
  // console.log({
  //   accounts0: accounts[0].address,
  //   accounts1: accounts[1].address
  // });

  // let voterStructForAccount = await ballotContract.voters(accounts[1].address);
  // console.log({voterStructForAccount});
  // const giveRightToVoteTx = await ballotContract.giveRightToVote(accounts[1].address);
  // const giveRightToVoteReceipt = await giveRightToVoteTx.wait();
  // console.log({giveRightToVoteReceipt})
  // let voterStructForAccount1 = await ballotContract.voters(accounts[1].address);
  // console.log({voterStructForAccount1})
  // console.log("Casting a vote for proposal 0 useing Account 1");
  // const castVoteTx = await ballotContract.connect(accounts[1]).vote(0);
  // const castVoteTxReceipt = await castVoteTx.wait();
  // console.log({castVoteTxReceipt});
  // const proposal0 = await ballotContract.proposals(0);
  // const name0 = ethers.utils.parseBytes32String(proposal0.name)
  // console.log({index: 0, name0, proposal0})
  // voterStructForAccount1 = await ballotContract.voters(accounts[1].address);
  // console.log({voterStructForAccount1})
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
