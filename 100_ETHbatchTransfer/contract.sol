pragma solidity ^0.4.21;

import "./SafeMath.sol";

contract batchTransfer {
    using SafeMath for uint256;
    
    uint totalEther;
    
    function batchTransfer() {
        totalEther = 0;
    }
    
    function distribute(address[] myAddresses) public payable {
            require(myAddresses.length>0);
            
            uint256 value = msg.value;
            uint256 length = myAddresses.length;
            uint256 distr = value.div(length);
            
            if(length==1)
            {
               myAddresses[0].transfer(value);
            }else
            {
                for(uint256 i=0;i<(length.sub(1));i++)
                {
                    myAddresses[i].transfer(distr);
                    value = value.sub(distr);
                }
                myAddresses[myAddresses.length-1].transfer(value);
            }
            
            totalEther = totalEther.add(msg.value);
    }
}