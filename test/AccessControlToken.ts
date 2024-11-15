const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccessControl", function () {
    let AccessControl;
    let accessControl: { connect: (arg0: any) => { (): any; new(): any; setAdmin: { (arg0: any): any; new(): any; }; authorize: { (arg0: any): any; new(): any; }; deauthorize: { (arg0: any): any; new(): any; }; }; };
    let owner: { address: any; }, addr1: { address: any; }, addr2, addrs;

    beforeEach(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        AccessControl = await ethers.getContractFactory("AccessControl");
        accessControl = await AccessControl.deploy();
    });

    it("Should set the deployer as admin", async function () {
        await expect(accessControl.connect(owner).setAdmin(addr1.address))
            .to.not.be.revertedWith("Not admin");
    });

    it("Should authorize the deployer", async function () {
        await expect(accessControl.connect(owner).authorize(addr1.address))
            .to.not.be.revertedWith("Not authorized");
    });

    it("Should allow admin to set new admin", async function () {
        await expect(accessControl.connect(owner).setAdmin(addr1.address))
            .to.emit(accessControl, "AdminChanged")
            .withArgs(owner.address, addr1.address);
    });

    it("Should allow admin to authorize accounts", async function () {
        await expect(accessControl.connect(owner).authorize(addr1.address))
            .to.emit(accessControl, "AuthorizationChanged")
            .withArgs(addr1.address, true);
    });

    it("Should allow admin to deauthorize accounts", async function () {
        await accessControl.connect(owner).authorize(addr1.address);
        await expect(accessControl.connect(owner).deauthorize(addr1.address))
            .to.emit(accessControl, "AuthorizationChanged")
            .withArgs(addr1.address, false);
    });
});