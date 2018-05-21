// this dice contract enable user to play with contract
// I will load initial NAS to the contract
// one can guess the dice number, deposit at most 1/6 of the contract balance;
// if one win, then get the contract balance as payout
// if one lose, the money adds into the contract


"use strict";

var DiceContract = function() { // contract initialization

    // data storage zone

    //  LocalContractStorage.defineMapProperties(this,{
    //      messageKeys: null,
    //      fullMessages: null
    //  })
    LocalContractStorage.defineProperty(this,"balance");// save how many NAS has been sent out
    LocalContractStorage.defineProperty(this,"numberOfPlays");// save how many time this game is activated;
    LocalContractStorage.defineProperty(this,"totalPayout");// save how many NAS has been sent out

};

DiceContract.prototype = {
    init: function() {
        // initiaization of joinmyteamcontract
        this.numberOfPlays = 0;
        this.totalPayout = 0;
        this.balance = 0;
    },

    play: function(number){
        // check the balance of this contract
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;

        var reward = value*6;

        if (reward>this.balance){
            throw new Error("you can only stake at most 1/6 of the current pool")
        }

        var randomNumber = parseInt(Math.random()*6)+1;

        if (number==randomNumber){
            Blockchain.transfer(from, reward);
            this.balance = this.balance - reward; 
        }

        this.balance = this.balance+value;
        return randomNumber;
    },

    donate: function() {
        var value = Blockchain.transaction.value;
        this.balance = this.balance + value;
    }
    // getMessageKeys : function (idx) {
    //     // get message by message id
    //     if (idx>this.size){
    //         throw new Error("your message does not exist!");
    //     }

    //     return this.messageKeys.get(idx);
    // },

    // getFullMessage : function (idx) {
    //     // get message by message id
    //     if (idx>this.size){
    //         throw new Error("your message does not exist!");
    //     }
    //     return this.fullMessages.get(idx);

    // },

    // newMessage : function (key, message) {
    //     // write a new message to the block chain
    //     // return message ID
    //     var index = this.size; // member index
    //     this.messageKeys.set(index,key);
    //     this.fullMessages.set(index,message);
    //     this.size = this.size+1;
    // },

    // itemSize: function(){
    //     return this.size;
    // },

}


module.exports = DiceContract;