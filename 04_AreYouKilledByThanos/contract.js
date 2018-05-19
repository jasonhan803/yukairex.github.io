// check if you are killed by Thanos
// load your NAS address
// get true/false 

// if true, have an option. Send 0.1 NAS to this contract and no one will take it. You will be saved

'use strict';

var ThanosContract = function () {
    LocalContractStorage.defineMapProperties(this, {
      isKilled: null
    })
  };


  ThanosContract.prototype = {
    
    init: function () {
        
      },

    check: function() {
        var from = Blockchain.transaction.from;

        if (this.isKilled.get(from)) {
            // already checked
        }
        
        // DO something with from

        // half return killed
        this.isKilled.set(from,1);
    

        // half return saved
        this.isKilled.set(from,2);
    },


    save: function() {
        var from = Blockchain.transaction.from;
        
        if (this.isKilled.get(from)===1) {
            // you address will be killed
            var value = Blockchain.transaction.value;

            if (value>100000)
            {
                this.isKilled.set(from,2);
                return 1;
            }
            else {
                throw new Error("not enough NAS to save you!")
            }
        }

        else {
            return 0;
        }
        
    }


  }

