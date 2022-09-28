import { expect } from "chai";
import { ethers } from "hardhat";
import { HelloWorld } from "../typechain-types";

describe("HelloWorld", function () {
  let helloWorldContract: HelloWorld;

  this.beforeEach(async () => {
    const helloWorldFactory = await ethers.getContractFactory("HelloWorld");
    helloWorldContract = await helloWorldFactory.deploy();
    await helloWorldContract.deployed();
  });

  it("Should give a Hello World", async () => {
    expect(await helloWorldContract.helloWorld()).to.equal("Hello World");
  });

  it("Should set owner to deployer account", async () => {
    const accounts = await ethers.getSigners();

    expect(await helloWorldContract.owner()).to.equal(accounts[0].address);
  });

  it("Should not allow anyone other than owner to call transferOwnership", async () => {
    const accounts = await ethers.getSigners();

    await expect(
      helloWorldContract
        .connect(accounts[1])
        .transferOwnership(accounts[1].address)
    ).to.be.revertedWith("Caller is not the owner");
  });

  it("Should not allow anyone other than owner to change text", async () => {
    const accounts = await ethers.getSigners();

    await expect(
      helloWorldContract
        .connect(accounts[1])
        .setText("Hello Cambodia")
    ).to.be.revertedWith("Caller is not the owner");
  });

  it("Should change text correctly", async () => {
    const accounts = await ethers.getSigners();
    helloWorldContract.setText("Welcome");

    expect(await helloWorldContract.helloWorld()).to.equal("Welcome");
  });

  it("Should transfter owner correctly", async () => {
    const accounts = await ethers.getSigners();
    helloWorldContract.transferOwnership(accounts[1].address);

    expect(await helloWorldContract.owner()).to.equal(accounts[1].address);
  });
});
