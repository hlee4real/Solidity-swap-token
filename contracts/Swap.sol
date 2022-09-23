// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// IERC20
// import "./Token1.sol"; --> delete
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
//import safeERC20
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "hardhat/console.sol";

// upgradeable
// Contract SwapUpgradeable
// va upgrade cho anh

// VD: SwapUpgradeableV1: khong co method ABC()
// nhiem vu upgrade contract do SwapUpgradeableV2 --> them ham ABC()
// Note: co dieu kien cho viec them method(), them property --> dieu kien nay la gi?

contract Swap is Initializable, OwnableUpgradeable{
    using SafeERC20Upgradeable for ERC20Upgradeable;
    // rate --> token 1 & token 2
    // mapping[address1][address2] ==> rate; // float
    // mapping(address => uint256) public firstRate; //rate from 1->2
    // mapping(address => uint256) public secondRate; //rate from 2->1
    struct Rate {
        uint256 rate;
        uint32 rateDecimals;
    }

    mapping(address => mapping(address => Rate)) public tokenRate; //rate from 1->2
    function __Swap_init() public initializer{
        __Ownable_init();
    }
    event ChangeRate(address _tokenIn, address _tokenOut, uint256 _rate, uint32 _rateDecimals);
    event Swapping(address _tokenIn, address _tokenOut, uint256 _amount);

    // rate uint256 --> ???
    // solidity float --> how to store float on solidity
    function changeRate(address _tokenIn, address _tokenOut, uint256 _rate, uint32 _rateDecimals) external onlyOwner{
        require(_rate>0, "Rate must greater than 0");
        tokenRate[_tokenIn][_tokenOut].rate = _rate;
        tokenRate[_tokenIn][_tokenOut].rateDecimals = _rateDecimals;
        emit ChangeRate(_tokenIn, _tokenOut, _rate, _rateDecimals);
    }
    function withdraw(address _token, uint256 _amount, address _receiver) external payable onlyOwner{
    }

    // ERC20 <--> Native, ERC20 <--> ERC20
    // merge to 1 method: addres token 1, address token 2. (tham khao Uniswap)
    // params token1, token2
    // devs quy dinh: native token co dia chi adress(0): 0x0
    // function swapToken1(uint256 amount) public payable {
    //swap token1 to token2
    //check to make sure amount of sender > 0
    // require(amount > 0, "amount must be greater than 0");
    // Check balance ERC20 tokens before transfer --> SafeTransferFrom, SafeTransfer ....
    // require(token1.balanceOf(msg.sender)>=amount, "sender don't have enough token1");

    //calculate amount of token that will be received
    // uint256 exchangeToken1 = uint256(multiply(amount, rate));
    // require(exchangeToken1 > 0, "exchange amount must be greater than 0");
    //transfer - swap
    // token1.transferFrom(msg.sender,address(this), amount);
    // token2.transferFrom(address(this), msg.sender, exchangeToken1);

    // emit event: events handlers
    // return exchangeToken1;
    // }
    function swap(
        address _tokenIn,
        address _tokenOut,
        uint256 _amount
    ) public payable {
        // firstRate[token1] = getFirstRate(token1);
        // secondRate[token2] = getSecondRate(token2);
        require(_tokenIn != _tokenOut, "Token in and token out must be different");
        require(tokenRate[_tokenIn][_tokenOut].rate > 0, "Rate must be greater than 0");
        uint256 amountIn = msg.value;
        uint256 amountOut;
        console.log("tokenIn", _tokenIn);
        console.log("tokenOut", _tokenOut);
        if(_tokenIn!=address(0)){
            amountIn = _amount;
        }
        console.log("amountIn", amountIn);
        require(amountIn > 0, "Amount must be greater than 0");
        amountOut = (amountIn * tokenRate[_tokenIn][_tokenOut].rate) / (10**tokenRate[_tokenIn][_tokenOut].rateDecimals);
        console.log("amountOut", amountOut);
        _tokenInHandle(_tokenIn, amountIn);
        _tokenOutHandle(_tokenOut, amountOut);
        emit Swapping(_tokenIn, _tokenOut, _amount);
    }

    function _tokenInHandle(address _tokenIn, uint256 _amount) private{
        if(_tokenIn != address(0)){
            ERC20Upgradeable token = ERC20Upgradeable(_tokenIn);
            token.safeTransferFrom(_msgSender(), address(this), _amount);
        }
    }
    function _tokenOutHandle(address _tokenOut, uint256 _amount) private{
        if(_tokenOut != address(0)){
            ERC20Upgradeable token = ERC20Upgradeable(_tokenOut);
            token.safeTransfer(_msgSender(), _amount);
            return;
        }
        (bool sent, ) = (_msgSender()).call{value: _amount}("");
        require(sent, "Transfer token failed due to errors");
    }
    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}
