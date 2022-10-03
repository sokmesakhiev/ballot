import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

describe("Ballot", function () {
  let ballotContract: Ballot;
  let accounts: SignerWithAddress[];

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotFactory.deploy(
      convertStringArrayToBytes32(PROPOSALS)
    );
    await ballotContract.deployed();
    // const obj= await ballotContract.deployed();
    // const deployTx = obj.deployTransaction;
    // const receipt = await deployTx.wait();
  });

  describe("when the contract is deployed", function () {
    it("has the provided proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }
    });

    it("has zero votes for all proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount).to.eq(0);
      }
    });

    it("sets the deployer address as chairperson", async function () {
      expect(await ballotContract.chairperson()).to.equal(accounts[0].address);
    });

    it("sets the voting weight for the chairperson as 1", async function () {
      const chairperson = await ballotContract.chairperson();
      const voter = await ballotContract.voters(chairperson);

      expect(voter.weight).to.equal(1);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
    it("gives right to vote for another address", async function () {
      await ballotContract.giveRightToVote(accounts[1].address)

      const voter = await ballotContract.voters(accounts[1].address);
      expect(voter.weight).to.equal(1);
    });

    it("can not give right to vote for someone that has voted", async function () {
      const voter = {
        voted: true,
        weight: 0,
        delegate: '0x0000000000000000000000000000000000000000',
        vote: 1
      }
      await ballotContract.createVoter(accounts[1].address, voter);
      await expect(ballotContract.giveRightToVote(accounts[1].address)).to.be.revertedWith("The voter already voted.");
    });

    it("can not give right to vote for someone that has already voting rights", async function () {
      const voter = {
        voted: false,
        weight: 1,
        delegate: '0x0000000000000000000000000000000000000000',
        vote: 1
      }
      await ballotContract.createVoter(accounts[1].address, voter);
      await expect(ballotContract.giveRightToVote(accounts[1].address)).to.be.reverted
    });
  });

  describe("when the voter interact with the vote function in the contract", function () {
    it("should register the vote", async () => {
      const voter = {
        voted: false,
        weight: 1,
        delegate: '0x0000000000000000000000000000000000000000',
        vote: 1
      }
      const proposalIndex: number = 1;
      await ballotContract.createVoter(accounts[1].address, voter);

      await ballotContract.connect(accounts[1]).vote(proposalIndex);

      const proposal = await ballotContract.proposals(proposalIndex);
      const updatedVoter = await ballotContract.voters(accounts[1].address);

      expect(proposal.voteCount).to.eq(1);
      expect(updatedVoter.voted).to.eq(true);
      expect(updatedVoter.vote).to.eq(proposalIndex);
    });
  });

  describe("when the voter interact with the delegate function in the contract", function () {
    it("should transfer voting power", async () => {
      const voter = {
        voted: false,
        weight: 1,
        delegate: '0x0000000000000000000000000000000000000000',
        vote: 0
      }

      const delegatedVoter = {
        voted: false,
        weight: 1,
        delegate: '0x0000000000000000000000000000000000000000',
        vote: 0
      }
      const proposalIndex: number = 1;
      await ballotContract.createVoter(accounts[1].address, voter);
      await ballotContract.createVoter(accounts[2].address, delegatedVoter);
      await ballotContract.connect(accounts[2]).vote(1);

      await ballotContract.connect(accounts[1]).delegate(accounts[2].address);

      const proposal = await ballotContract.proposals(proposalIndex);
      const firstAccountVoter = await ballotContract.voters(accounts[1].address);

      expect(firstAccountVoter.voted).to.eq(true);
      expect(firstAccountVoter.delegate).to.eq(accounts[2].address);
      expect(proposal.voteCount).to.eq(2);
    });

    it("should increase weight of delegated account", async () => {
      const voter = {
        voted: false,
        weight: 1,
        delegate: '0x0000000000000000000000000000000000000000',
        vote: 0
      }

      const delegatedVoter = {
        voted: false,
        weight: 1,
        delegate: '0x0000000000000000000000000000000000000000',
        vote: 0
      }
      const proposalIndex: number = 1;
      await ballotContract.createVoter(accounts[1].address, voter);
      await ballotContract.createVoter(accounts[2].address, delegatedVoter);

      await ballotContract.connect(accounts[1]).delegate(accounts[2].address);

      const secondAccountVoter = await ballotContract.voters(accounts[2].address);
      expect(secondAccountVoter.weight).to.eq(2);
    });
  });

  describe("when the an attacker interact with the giveRightToVote function in the contract", function () {
    it("should revert", async () => {
      await expect(
        ballotContract.connect(accounts[1]).giveRightToVote(accounts[1].address)
      ).to.be.revertedWith("Only chairperson can give right to vote.");
    });
  });

  describe("when the an attacker interact with the vote function in the contract", function () {
    it("should revert", async () => {
      await expect(
        ballotContract.connect(accounts[1]).vote(1)
      ).to.be.revertedWith("Has no right to vote");
    });
  });

  describe("when the an attacker interact with the delegate function in the contract", function () {
    it("should revert", async () => {
      await expect(
        ballotContract.connect(accounts[0]).delegate(accounts[0].address)
      ).to.be.revertedWith("Self-delegation is disallowed.");
    });
  });

  describe("when someone interact with the winningProposal function before any votes are cast", function () {
    it("should return 0", async () => {
      expect(await ballotContract.winningProposal()).to.eq(0)
    });
  });

  describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {
    it("should return 0", async () => {
      await ballotContract.vote(0);

      expect(await ballotContract.winningProposal()).to.eq(0)
    });
  });

  describe("when someone interact with the winnerName function before any votes are cast", function () {
    it("should return name of proposal 0", async () => {
      expect(
        await ballotContract.connect(accounts[1]).winnerName()
      ).to.eq(ethers.utils.formatBytes32String("Proposal 1"));
    });
  });

  describe("when someone interact with the winnerName function after one vote is cast for the second proposal", function () {
    it("should return name Proposal 2", async () => {
      await ballotContract.vote(1)

      expect(
        await ballotContract.winnerName()
      ).to.eq(ethers.utils.formatBytes32String("Proposal 2"));
    });
  });

  describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
    // TODO
    it("should return the name of the winner proposal", async () => {
      const voter = {
        voted: false,
        weight: 1,
        delegate: '0x0000000000000000000000000000000000000000',
        vote: 0
      }
      await ballotContract.createVoter(accounts[0].address, voter);
      await ballotContract.connect(accounts[0]).vote(1);
      await ballotContract.createVoter(accounts[1].address, voter);
      await ballotContract.connect(accounts[1]).vote(0);
      await ballotContract.createVoter(accounts[2].address, voter);
      await ballotContract.connect(accounts[2]).vote(1);
      await ballotContract.createVoter(accounts[3].address, voter);
      await ballotContract.connect(accounts[3]).vote(2);
      await ballotContract.createVoter(accounts[4].address, voter);
      await ballotContract.connect(accounts[4]).vote(1);

      expect(
        await ballotContract.winningProposal()
      ).to.eq(1);
      expect(
        await ballotContract.winnerName()
      ).to.eq(ethers.utils.formatBytes32String("Proposal 2"));
    });
  });
});
