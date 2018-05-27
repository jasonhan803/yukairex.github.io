"use strict";

var batchTransfer = function() { // contract initialization
    // LocalContractStorage.defineProperty(this,"balance");// save how many NAS has been sent out
    // LocalContractStorage.defineProperty(this,"numberOfPlays");// save how many time this game is activated;
    // LocalContractStorage.defineProperty(this,"totalPayout");// save how many NAS has been sent out

    // LocalContractStorage.defineMapProperty(this,{
    //      userNumber: null
    // })
};

batchTransfer.prototype = {
    init: function() {

    },

    distribute: function(myAddresses){
        var addresses = JSON.parse(myAddresses)
        // check the balance of this contract
        if (addresses.length<=0){
            throw new Error("no receipients are given")
        }
        
        var length = addresses.length;
        var value = Blockchain.transaction.value;
        var amount= new BigNumber(value.divToInt(length)) ;

        var balance = value;


        // check addresses
        for(var i=1; i<length;i++){
            if(Blockchain.verifyAddress(addresses[i])===0){
                throw new Error("The "+i+" address is not valid!")   
            }           
        }

        
        if (length==1){ // only one receipient
            Blockchain.transfer(addresses[0], value);
        }else{
            for(var i=1; i<(length-1);i++){
                Blockchain.transfer(addresses[i], amount);
                balance = balance.sub(amount);
            }  
            Blockchain.transfer(addresses[length-1], balance);
        }

        var result={
            "length":length,
            "value":value,
            "amount":amount
        }
        return result
 

    }

}


module.exports = batchTransfer;