const hre = require("hardhat");

async function main() {
  const AccessControlledToken = await hre.ethers.getContractFactory("AccessControlledToken");
  const accessControlledToken = await AccessControlledToken.deploy();

  console.log("AccessControlledToken deployed to:", accessControlledToken.target);

  const addr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  const receiver = "0x976EA74026E726554dB657fA54763abd0C3a0aa9"

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