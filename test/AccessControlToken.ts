const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccessControl", function () {
    let AccessControl;
    let accessControl;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
     
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        AccessControl = await ethers.getContractFactory("AccessControl");
        accessControl = await AccessControl.deploy();
    });

    describe("Deployment", function () {
        it("Should set the deployer as admin", async function () {
            
            await expect(accessControl.connect(owner).setAdmin(addr1.address))
                .to.not.be.revertedWith("Not admin");
        });

        it("Should authorize the deployer", async function () {
    
            await expect(accessControl.connect(owner).authorize(addr1.address))
                .to.not.be.revertedWith("Not authorized");
        });

        it("Should emit AdminChanged event on deployment", async function () {
            const deployTx = await AccessControl.deploy();
            await expect(deployTx.deploymentTransaction())
                .to.emit(deployTx, "AdminChanged")
                .withArgs(ethers.ZeroAddress, owner.address);
        });
    });

    describe("Admin Management", function () {
        it("Should allow admin to set new admin", async function () {
            await expect(accessControl.connect(owner).setAdmin(addr1.address))
                .to.emit(accessControl, "AdminChanged")
                .withArgs(owner.address, addr1.address);
        });

        it("Should prevent non-admin from setting new admin", async function () {
            await expect(accessControl.connect(addr1).setAdmin(addr2.address))
                .to.be.revertedWith("Not admin");
        });

        it("Should prevent setting zero address as admin", async function () {
            await expect(accessControl.connect(owner).setAdmin(ethers.ZeroAddress))
                .to.be.revertedWith("Invalid address");
        });

        it("Should transfer admin privileges correctly", async function () {
     
            await accessControl.connect(owner).setAdmin(addr1.address);
            
           
            await expect(accessControl.connect(owner).setAdmin(addr2.address))
                .to.be.revertedWith("Not admin");
         
            await expect(accessControl.connect(addr1).setAdmin(addr2.address))
                .to.not.be.revertedWith("Not admin");
        });
    });

    describe("Authorization Management", function () {
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

        it("Should prevent non-admin from authorizing accounts", async function () {
            await expect(accessControl.connect(addr1).authorize(addr2.address))
                .to.be.revertedWith("Not admin");
        });

        it("Should prevent non-admin from deauthorizing accounts", async function () {
            await expect(accessControl.connect(addr1).deauthorize(addr2.address))
                .to.be.revertedWith("Not admin");
        });

        it("Should maintain authorization after admin change", async function () {
   
            await accessControl.connect(owner).authorize(addr2.address);
            
          
            await accessControl.connect(owner).setAdmin(addr1.address);
            
           
            await expect(accessControl.connect(addr2).authorize(addr1.address))
                .to.be.revertedWith("Not admin");
      
            await expect(accessControl.connect(owner).deauthorize(addr2.address))
                .to.be.revertedWith("Not admin");
        });
    });

    describe("Complex Scenarios", function () {
        it("Should handle multiple authorization changes", async function () {
      
            await accessControl.connect(owner).authorize(addr1.address);
            await accessControl.connect(owner).authorize(addr2.address);
            
           
            await accessControl.connect(owner).deauthorize(addr1.address);
        
            await expect(accessControl.connect(addr1).authorize(addrs[0].address))
                .to.be.revertedWith("Not admin");
            await expect(accessControl.connect(addr2).authorize(addrs[0].address))
                .to.be.revertedWith("Not admin");
        });

        it("Should handle admin transfer chain", async function () {
         
            await accessControl.connect(owner).setAdmin(addr1.address);
            await accessControl.connect(addr1).setAdmin(addr2.address);
            await accessControl.connect(addr2).setAdmin(addrs[0].address);
            
       
            await expect(accessControl.connect(addrs[0]).authorize(addr1.address))
                .to.not.be.revertedWith("Not admin");
            
         
            await expect(accessControl.connect(owner).authorize(addr1.address))
                .to.be.revertedWith("Not admin");
            await expect(accessControl.connect(addr1).authorize(addr2.address))
                .to.be.revertedWith("Not admin");
            await expect(accessControl.connect(addr2).authorize(addr1.address))
                .to.be.revertedWith("Not admin");
        });
    });
});