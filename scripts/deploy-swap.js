const hre = require("hardhat");
async function main(){
    const Token1 = await ethers.getContractFactory("Token1");
    const token1 = await Token1.deploy();
    await token1.deployed();
    console.log("Token1 deployed to:", token1.address);
    const Token2 = await ethers.getContractFactory("Token2");
    const token2 = await Token2.deploy();
    await token2.deployed();
    console.log("Token2 deployed to:", token2.address);
    const Swap = await ethers.getContractFactory("Swap");
    const swap = await Swap.deploy(token1.address, token2.address);
    await swap.deployed();
    console.log("Swap deployed to:", swap.address);
    
}
main().catch((error)=>{
    console.error(error);
    process.exitCode = 1;
})