const {expect} = require("chai");
const {ethers} = require("hardhat");


describe("Swap", function(){
    let [accountA, accountB, accountC] = []
    let token1
    let token2
    let swap
    let address0 = "0x0000000000000000000000000000000000000000"
    let amount = ethers.utils.parseUnits("1", "ether")
    let totalSupply = ethers.utils.parseUnits("1000000000", "ether");
    beforeEach(async()=>{
        this.signers = await ethers.getSigners();
        [accountA, accountB, accountC] = await ethers.getSigners();
        const Token1 = await ethers.getContractFactory("Token1");
        token1 = await (await Token1.deploy()).connect(admin);
        // admin transfer token1, token2 --> Swap contract
        await token1.deployed();
        const Token2 = await ethers.getContractFactory("Token2");
        token2 = await Token2.deploy();
        await token2.deployed();
        const Swap = await ethers.getContractFactory("Swap");
        swap = await Swap.deploy(token1.address, token2.address);
        await swap.deployed();
        this.accountC = this.signers[5];
    })
    describe("common", function(){
        it("total supply should return right value", async function () {
            expect(await token1.totalSupply()).to.be.equal(totalSupply)
        });
        it("balance of account A should return right value", async function () {
            expect(await token1.balanceOf(accountA.address)).to.be.equal(0)
        });
        it("balance of account B should return right value", async function () {
            expect(await token1.balanceOf(accountB.address)).to.be.equal(0)
        });
        it("should approve all token", async()=>{
            await token1.approve(accountA.address, totalSupply);
            expect(await token1.allowance(accountA.address, accountA.address)).to.equal(totalSupply);
        })
    })
    describe("mint token", function(){
        it("Should mint token", async()=>{
            await token1.mint(accountA.address, amount);
            expect(await token1.balanceOf(accountA.address)).to.equal(amount);
        })
    })
    describe("swap ", function(){
        it("Should swap token1 to token2", async()=>{ 
            await token1.mint(accountA.address, amount);
            await token1.approve(accountA.address, amount);
            // so le: co nhung van de
            // rate: float vs prime number
            await swap.setRate(2);
            const rate = await swap.getRate();
            // await token2.mint(accountB.address, (amount*rate).toString());
            // await token2.approve(accountB.address, (amount*rate).toString());
            // await token1.mint(swap.address,amount);
            await token2.mint(swap.address, (amount*rate).toString());
            await token1.approve(swap.address, amount);
            await token2.approve(swap.address, (amount*rate).toString());

            await swap.swapToken1(amount);
            console.log("accountA balance of token1", await token1.balanceOf(accountA.address));
            console.log("accountA balance of token2", await token2.balanceOf(accountA.address));
            console.log("accountswap balance of token1", await token1.balanceOf(swap.address));
            console.log("accountswap balance of token2", await token2.balanceOf(swap.address));
            expect(await token1.balanceOf(swap.address)).to.equal(amount);
            expect(await token2.balanceOf(accountA.address)).to.equal((amount*rate).toString());
        })
        it("should swap token2 to token1", async()=>{
            await token2.mint(accountA.address, amount);
            await token2.approve(accountA.address, amount);
            await swap.setRate(2);
            const rate = await swap.getRate();
            await token1.mint(swap.address, (amount/rate).toString());
            await token2.approve(swap.address, amount);
            await token1.approve(swap.address, (amount/rate).toString());
            await swap.swapToken2(amount);
            console.log("accountA balance of token1", await token1.balanceOf(accountA.address));
            console.log("accountA balance of token2", await token2.balanceOf(accountA.address));
            console.log("accountswap balance of token1", await token1.balanceOf(swap.address));
            console.log("accountswap balance of token2", await token2.balanceOf(swap.address));
            expect(await token2.balanceOf(swap.address)).to.equal(amount);
            expect(await token1.balanceOf(accountA.address)).to.equal((amount/rate).toString());
        })
        it("should swap native token to token1", async()=>{
            await swap.setNativeRate(1);
            const rate = await swap.getNativeRate();
            await token1.mint(swap.address, amount);
            await token1.approve(swap.address, amount);
            // console.log(swap.address);
            // console.log(accountA.address);
            await swap.swapNativeTokenToToken1(50, {from: accountA.address, value: 50})
            expect(await token1.balanceOf(accountA.address)).to.equal((50*rate).toString());
        })
        it("should swap token1 to native token", async()=>{
            await swap.setNativeRate(1);
            const rate = await swap.getNativeRate();
            await token1.mint(accountA.address, amount);
            await token1.approve(accountA.address, amount);
            await token1.approve(swap.address, amount);
            await swap.swapToken1ToNativeToken(amount, {from: accountA.address, value: (amount/rate).toString()})
            expect(await token1.balanceOf(accountA.address)).to.equal(0);
            expect(await token1.balanceOf(swap.address)).to.equal((amount/rate).toString());
        })

        // test with error
    })
})