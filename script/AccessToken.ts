const hre = require("hardhat");

async function main() {
  const AccessControlledToken = await hre.ethers.getContractFactory("AccessControlledToken");
  const accessControlledToken = await AccessControlledToken.deploy();

  console.log("AccessControlledToken deployed to:", accessControlledToken.target);

  const addr = "0xD1f4c4AFFfbc6984214d37bef1e3153b911e5166"
  const receiver = "0x369D745a39705f35a35051a7F765553727Beb3cA"

  const newAdmin = await accessControlledToken.addAdmin(addr);
  await newAdmin.wait();
  const testMint = await accessControlledToken.mint(addr, 100);
  await testMint.wait();
  const userBalance = await accessControlledToken.balanceOf(addr);
  console.log("User balance: ", userBalance.toString());

  const transferToken = await accessControlledToken.transfer(receiver, 50);
  await transferToken.wait();
  const userBalance2 = await accessControlledToken.balanceOf(addr);
  console.log("User balance: ", userBalance2.toString());

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});