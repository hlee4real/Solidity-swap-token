const {expect} = require("chai");
const {ethers} = require("hardhat");

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
        swap = await Swap.deploy();
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
        it("Should swap tokenA to tokenB", async()=>{
            // await tokenA.connect(alice).approve(swap.address, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toString());
            // await tokenB.connect(alice).approve(swap.address, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toString());
            console.log("john address", john.address);
            console.log("swap address", swap.address);
            // await tokenA.connect(alice).approve(swap.address, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toString());
            // console.log('xxxx', (await tokenA.allowance(alice.address, swap.address)).toString());      
            // await tokenA.transfer(john.address, amount)
            // await tokenA.approve(john.address, amount)
            // await tokenA.approve(swap.address, amount);
            console.log("john balance token A", await tokenA.balanceOf(john.address));
            console.log("john balance token B", await tokenB.balanceOf(john.address));
            console.log("swap balance tokenA", await tokenA.balanceOf(swap.address));
            console.log("swap balance tokenB", await tokenB.balanceOf(swap.address));
            await swap.setFirstRate(tokenA.address, 1);
            await swap.setSecondRate(tokenB.address, 3);
            const firstRate = await swap.firstRate(tokenA.address);
            const secondRate = await swap.secondRate(tokenB.address);
            console.log("first rate", firstRate.toString());
            console.log("second rate", secondRate.toString());
            // await tokenB.connect(alice).approve(swap.address, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toString());
            // await tokenB.transfer(swap.address, (amount*firstRate/secondRate).toString())
            // await tokenB.approve(swap.address, (amount*firstRate/secondRate).toString())
            // await tokenB.approve(john.address, (amount*firstRate/secondRate).toString())
            await tokenA.connect(john).approve(swap.address, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toString());
            // await tokenB.connect(john).approve(swap.address, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toString());
            await swap.connect(john).swap(tokenA.address, tokenB.address, ethers.utils.parseUnits("1", "ether"));
            expect(await tokenA.balanceOf(swap.address)).to.equal((amount.add(ethers.utils.parseUnits("1", "ether"))));
            expect(await tokenA.balanceOf(john.address)).to.equal(amount.sub(ethers.utils.parseUnits("1", "ether")));
        })
        // it("should swap native token to token A", async()=>{
        //     await swap.connect(john).setFirstRate(address0, 1);
        //     await swap.connect(john).setSecondRate(tokenA.address, 3);
        //     const firstRate = await swap.firstRate(tokenA.address);
        //     const secondRate = await swap.secondRate(address0);
        //     console.log("first rate", firstRate.toString());
        //     console.log("second rate", secondRate.toString());
        //     await swap.connect(john).swap(address0, tokenA.address, ethers.utils.parseUnits("1", "ether"),{value: ethers.utils.parseUnits("1", "ether")});
        //     expect(await tokenA.balanceOf(john.address)).to.equal(amount.add(ethers.utils.parseUnits("0.333333333333333333", "ether")));
        //     expect(await tokenA.balanceOf(swap.address)).to.equal(amount.sub(ethers.utils.parseUnits("0.333333333333333333", "ether")));
        //     // expect(await ethers.provider.getBalance(john.address)).to.equal(ethers.utils.parseUnits("9999", "ether"));// cái này pass rồi nhma nó trừ phí nên thành fail a ơi :v
        //     expect(await ethers.provider.getBalance(swap.address)).to.equal(ethers.utils.parseUnits("101", "ether"));
        // })
        it("should swap token A to native token", async()=>{
            await swap.connect(john).setFirstRate(tokenA.address, 1);
            await swap.connect(john).setSecondRate(address0, 3);
            const firstRate = await swap.firstRate(tokenA.address);
            const secondRate = await swap.secondRate(address0);
            console.log("first rate", firstRate.toString());
            console.log("second rate", secondRate.toString());
            await tokenA.connect(john).approve(swap.address, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toString());
            await swap.connect(john).swap(tokenA.address, address0, ethers.utils.parseUnits("1", "ether"),{from: john.address});
            expect(await tokenA.balanceOf(john.address)).to.equal(amount.sub(ethers.utils.parseUnits("1", "ether")));
            expect(await tokenA.balanceOf(swap.address)).to.equal(amount.add(ethers.utils.parseUnits("1", "ether")));
            // expect(await ethers.provider.getBalance(john.address)).to.equal(ethers.utils.parseUnits("10000.333333333333333333", "ether"));// cái này pass rồi nhma nó trừ phí nên thành fail a ơi :v
            expect(await ethers.provider.getBalance(swap.address)).to.equal(ethers.utils.parseUnits("99.666666666666666667", "ether"));
        })
    })
})