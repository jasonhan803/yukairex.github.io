"use strict";

var AntiCensorshipContract = function() { // contract initialization

    // data storage zone

     LocalContractStorage.defineMapProperties(this,{
         messageKeys: null,
         fullMessages: null
     })
     LocalContractStorage.defineProperty(this,"size");

};

AntiCensorshipContract.prototype = {
    init: function() {
        // initiaization of joinmyteamcontract
        this.size = 0;
    },

    getMessageKeys : function (idx) {
        // get message by message id
        if (idx>this.size){
            throw new Error("your message does not exist!");
        }

        return this.messageKeys.get(idx);
    },

    getFullMessage : function (idx) {
        // get message by message id
        if (idx>this.size){
            throw new Error("your message does not exist!");
        }
        return this.fullMessages.get(idx);

    },

    newMessage : function (key, message) {
        // write a new message to the block chain
        // return message ID
        var index = this.size; // member index
        this.messageKeys.set(index,key);
        this.fullMessages.set(index,message);
        this.size = this.size+1;
    },

    itemSize: function(){
        return this.size;
    },

}


module.exports = AntiCensorshipContract;