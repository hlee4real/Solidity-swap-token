const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");

describe("Swap", function(){
    let [alice, bob, john] = []
    let tokenA
    let tokenB
    let swap
    let address0 = "0x0000000000000000000000000000000000000000"
    let amount = ethers.utils.parseUnits("100", "ether")
    let totalSupply = ethers.utils.parseUnits("1000000000", "ether");
    beforeEach(async()=>{
        [alice, bob, john] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Token",{
            signer: alice
        });
        tokenA = await Token.deploy("TOKENA", "TKA");
        await tokenA.deployed();
        tokenB = await Token.deploy("TOKENB", "TKB");
        await tokenB.deployed();
        const Swap = await ethers.getContractFactory("Swap",{
            signer: john
        });
        // await upgrades.deployProxy(ContractFactory,[ 'constructor params' ], { initializer: '__GameFiBox_init'});
        swap = await upgrades.deployProxy(Swap,{ initializer: '__Swap_init'});
        await swap.deployed();
    })
    beforeEach(async()=>{
        // await tokenA.connect(alice).approve(swap.address, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toString());
        // console.log('allowances token A', (await tokenA.allowance(alice.address, swap.address)).toString());      
        await tokenA.connect(alice).transfer(john.address, amount)
        await tokenA.connect(alice).transfer(swap.address, amount)
        // await tokenB.connect(alice).approve(swap.address, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toString());
        // console.log('allowances token B', (await tokenB.allowance(alice.address, swap.address)).toString());      
        await tokenB.connect(alice).transfer(john.address, amount)
        await tokenB.connect(alice).transfer(swap.address, amount)
        await bob.sendTransaction({to: swap.address,value: ethers.utils.parseUnits("100", "ether")})
        // account: 
        // alice --> totalsupply - 200 (A+B)
        // swap --> 100 (A+B)
        // john --> 100 (A+B)
    })
    describe("swap", function(){
        it("should swap tokenA to tokenB success", async()=>{
            // await swap.connect(john).checkOwner();
            await swap.connect(john).changeRate(tokenA.address, tokenB.address, 3,1); 
            await tokenA.connect(john).approve(swap.address, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toString());
            await swap.connect(john).swap(tokenA.address, tokenB.address, ethers.utils.parseUnits("1", "ether"));
            expect(await tokenA.balanceOf(john.address)).to.equal(ethers.utils.parseUnits("99", "ether"));
            expect(await tokenA.balanceOf(swap.address)).to.equal(ethers.utils.parseUnits("101", "ether"));
            expect(await tokenB.balanceOf(john.address)).to.equal(ethers.utils.parseUnits("100.3", "ether"));
            expect(await tokenB.balanceOf(swap.address)).to.equal(ethers.utils.parseUnits("99.7", "ether"));
        })
        it("should swap token A to native token success", async()=>{
            await swap.connect(john).changeRate(tokenA.address, address0, 3,1); 
            await tokenA.connect(john).approve(swap.address, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toString());
            await swap.connect(john).swap(tokenA.address, address0, ethers.utils.parseUnits("1", "ether"));
            expect(await tokenA.balanceOf(john.address)).to.equal(ethers.utils.parseUnits("99", "ether"));
            expect(await tokenA.balanceOf(swap.address)).to.equal(ethers.utils.parseUnits("101", "ether"));
            // expect(await ethers.provider.getBalance(john.address)).to.equal(ethers.utils.parseUnits("10000.3", "ether"));
            expect(await ethers.provider.getBalance(swap.address)).to.equal(ethers.utils.parseUnits("99.7", "ether"));
        })
        it("should swap native token to token A success",async()=>{
            await swap.connect(john).changeRate(address0, tokenA.address, 3,1); 
            await swap.connect(john).swap(address0, tokenA.address, ethers.utils.parseUnits("1", "ether"),{value: ethers.utils.parseUnits("1", "ether")});
            expect(await tokenA.balanceOf(john.address)).to.equal(ethers.utils.parseUnits("100.3", "ether"));
            expect(await tokenA.balanceOf(swap.address)).to.equal(ethers.utils.parseUnits("99.7", "ether"));
            expect(await ethers.provider.getBalance(swap.address)).to.equal(ethers.utils.parseUnits("101", "ether"));
            // expect(await ethers.provider.getBalance(john.address)).to.equal(ethers.utils.parseUnits("9999", "ether"));

        })
    })
})