import { ethers } from "ethers";
import BallotInteraction from "./interactionBallot";

const main = async () => {
  const DEPLOYED_BALLOT_CONTRACT_ADDRESS =
    "0x8d169F174082302F675a8E18Ff804a2a9cE697F7";

  const network = "goerli";

  const contract = new BallotInteraction(
    DEPLOYED_BALLOT_CONTRACT_ADDRESS,
    network,
    process.env.ALCHEMY_API_KEY || ""
  );

  const proposal0 = await contract.getProposal("0");
  console.log({ proposal0 });

  const chairperson = await contract.getChairPerson();
  console.log({ chairperson });

  //  Add Interactions here
  // const voter1 = "0x...";

  //  Send a Vote
  // const res1 = await contract.giveVoterRight(voter1);
  // console.log(res1);

  // const voter1State = await contract.getVoter(voter1);
  // console.log(voter1State);

  //   Give Vote from ENV private Key
  //   const tx1 = await contract.vote("0");
  //   console.log({ tx1 });
  //   const proposalState1 = await contract.getProposal("0");
  //   console.log(proposalState1);

  // Delegate Your Vote to Someone Else
  //   const to = "0x...";
  //   try {
  //     const tx2 = await contract.delegateVote(to);
  //     console.log(tx2);
  //   } catch (e) {
  //     console.error(e);
  //   }
  //   const toState = await contract.getVoter(to);
  //   console.log(toState);

  const winnerProposalName = await contract.getWinnerName();
  console.log("Winner Proposal Name!!", winnerProposalName);

  const winnerProposal = await contract.getWinner();
  console.log({winnerProposal})
  
  const winnerProposalState = await contract.getProposal(winnerProposal.toString())
  console.log(winnerProposalState);

};

main();
