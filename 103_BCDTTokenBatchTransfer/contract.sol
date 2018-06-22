pragma solidity ^0.4.21;

import "./SafeMath.sol";

contract EIP20Interface {
    uint256 public totalSupply;
    function balanceOf(address _owner) public view returns (uint256 balance);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
    function approve(address _spender, uint256 _value) public returns (bool success);
    function allowance(address _owner, address _spender) public view returns (uint256 remaining);
    event Transfer(address indexed _from, address indexed _to, uint256 _value); 
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract batchTransfer {
    using SafeMath for uint256;
    EIP20Interface public token;
    
    function batchTransfer(address _address) public {
        token = EIP20Interface(_address);
    }
    
    
    function distribute(address[] myAddresses, uint totalAmount, uint distrAmount) public {
            require(myAddresses.length>0);
            token.transferFrom(msg.sender, address(this),totalAmount);
                for(uint256 i=0;i<myAddresses.length;i++)
                {
                    token.transfer(myAddresses[i],distrAmount);
                }
    }
}