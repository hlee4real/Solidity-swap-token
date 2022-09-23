const hre = require("hardhat");
async function main(){
    const Token2 = await ethers.getContractFactory("Token2");
    const token2 = await Token2.deploy();
    await token2.deployed();
    console.log("Token2 deployed to:", token2.address);
}
main().catch((error)=>{
    console.error(error);
    process.exitCode = 1;
})