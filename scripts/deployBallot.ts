import { ethers } from "hardhat";

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function main() {
  const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ballotFactory = await ethers.getContractFactory("Ballot");
  const ballotContract = await ballotFactory.deploy(convertStringArrayToBytes32(PROPOSALS));
  await ballotContract.deployed();

  console.log("Contract address:", ballotContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
