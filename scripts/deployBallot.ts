import { ethers } from "hardhat";

async function main() {
  const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];
  const bytes32Array = PROPOSALS.map( prop => ethers.utils.formatBytes32String(prop))
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ballotFactory = await ethers.getContractFactory("Ballot");
  const ballotContract = await ballotFactory.deploy(bytes32Array);
  await ballotContract.deployed();

  console.log("Contract address:", ballotContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
