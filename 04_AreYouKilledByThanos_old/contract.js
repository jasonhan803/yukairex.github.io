// check if you are killed by Thanos
// load your NAS address
// get true/false 

// if true, have an option. Send 0.1 NAS to this contract and no one will take it. You will be saved

'use strict';

var ThanosContract = function () {
    LocalContractStorage.defineMapProperties(this, {
      isKilled: null
    })
    LocalContractStorage.defineProperty(this,"owner")
  };


  ThanosContract.prototype = {
    
    init: function () {
        this.owner = Blockchain.transaction.from;
      },

    
    getStatus: function(address) {
        return this.isKilled.get(address);
    },

    check: function() {
        var from = Blockchain.transaction.from;

        if (this.isKilled.get(from)) {
            // already checked
            throw new Error("your address has already been checked")
        }
        
        // DO something with from
        var number = Math.random();
        
        if (number>0.5){
            // half return killed  
            this.isKilled.set(from,1);
        }
        else {
             // half return saved
            this.isKilled.set(from,0);
        }
    },


    save: function() {
        var from = Blockchain.transaction.from;
        
        if (this.isKilled.get(from)==1) {
            // you address will be killed
            var value = Blockchain.transaction.value;

            if (value>=0.01)
            {
                this.isKilled.set(from,0);
            }
            else {
                throw new Error("not enough NAS to save you!")
            }
        }

        else {
            throw new Error("you are not killed, no need to save")
        }     
    }


}


  
module.exports = ThanosContract;
