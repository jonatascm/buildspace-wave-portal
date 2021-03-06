import { ethers } from "hardhat";

const main = async () => {
  const [owner, randomPerson] = await ethers.getSigners();
  const waveContractFactory = await ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy({
    value: ethers.utils.parseEther("0.1"),
  });
  await waveContract.deployed();
  console.log("Contract deployed to:", waveContract.address);
  console.log("Contract deployed by:", owner.address);

  let contractBalance = await ethers.provider.getBalance(waveContract.address);
  console.log("Contract balance:", ethers.utils.formatEther(contractBalance));

  let waveCount;
  waveCount = await waveContract.getTotalWaves();

  let waveTxn = await waveContract.wave("Testing this message");
  await waveTxn.wait();

  waveCount = await waveContract.getTotalWaves();

  waveTxn = await waveContract
    .connect(randomPerson)
    .wave("This is another message here");
  await waveTxn.wait();

  waveCount = await waveContract.getTotalWaves();
  const wavers = await waveContract.getAllWaves();
  contractBalance = await ethers.provider.getBalance(waveContract.address);
  console.log("Contract balance:", ethers.utils.formatEther(contractBalance));

  console.log("Wavers: ", wavers);
  console.log("Total wave count: ", waveCount.toNumber());
};

const runMain = async () => {
  try {
    await main();
    process.exitCode = 0;
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  }
};

runMain();
