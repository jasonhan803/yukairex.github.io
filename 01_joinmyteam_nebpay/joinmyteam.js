"use strict";

var joinMyTeamContract = function() { // contract initialization

    LocalContractStorage.defineProperty(this, "owner", null);
    LocalContractStorage.defineMapProperties(this,{
        teamIndex: null,
        team:null
    });
    LocalContractStorage.defineProperty(this,"size");

};

joinMyTeamContract.prototype = {
    init: function() {
        // initiaization of joinmyteamcontract
        this.owner = Blockchain.transaction.from;
        this.size = 0;
    },

    getOwner: function(){ // get the contract owner
       return this.owner;
    },

    joinTeam: function(){
        var index = this.size; // member index
        var member = Blockchain.transaction.from;
        // need to check if this guy has joined or not
        if(this.team.get(member)) {
            throw new Error("you have already joined the team.");
        }
        this.teamIndex.set(index,member);// the is indexarray
        this.team.set(member,"1");// this is data array
        this.size = this.size+1;
    },

    teamSize: function(){
        return this.size;
    },

    getMember:function(index){
        if (index>this.size){
            throw new Error("index is greater than size.");
        }
        
        return this.teamIndex.get(index);
    }
}


module.exports = joinMyTeamContract;