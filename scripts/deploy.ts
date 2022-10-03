import { ethers } from "hardhat";
import { Ballot, Ballot__factory } from "../typechain-types";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];
const bytes32Array = PROPOSALS.map ( prop => ethers.utils.formatBytes32String(prop))

async function main() {
  const provider = await ethers.getDefaultProvider("goerli");

  const key = process.env.GOERLI_PRIVATE_KEY;
  console.log({ key: `0x${key}` });
  if (!key) {
    console.log("NO PRIVATE KEY FOUND!!");
    return;
  }

  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  PROPOSALS.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });

  const wallet = new ethers.Wallet(ethers.utils.hexlify(`0x${key}`));
  const signer = wallet.connect(provider);

  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log({ balance });

  if (balance == 0) {
    console.error("Balance too low!!");
    return;
  }

  const ballotFactory = new Ballot__factory(signer);
  const ballotContract = await ballotFactory.deploy(bytes32Array);

  await ballotContract.deployed();

  console.log(
    `Ballot contract deployed to the address: ${ballotContract.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
