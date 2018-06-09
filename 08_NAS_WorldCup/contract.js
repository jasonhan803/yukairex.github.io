// Copyright (C) 2017 go-nebulas authors
//
// This file is part of the go-nebulas library.
//
// the go-nebulas library is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// the go-nebulas library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with the go-nebulas library.  If not, see <http://www.gnu.org/licenses/>.
//

'use strict';

var Operator = function (obj) {
    this.operator = {};
    this.parse(obj);
};

Operator.prototype = {
    toString: function () {
        return JSON.stringify(this.operator);
    },

    parse: function (obj) {
        if (typeof obj != "undefined") {
            var data = JSON.parse(obj);
            for (var key in data) {
                this.operator[key] = data[key];
            }
        }
    },

    get: function (key) {
        return this.operator[key];
    },

    set: function (key, value) {
        this.operator[key] = value;
    }
};

var Players = function () {
    LocalContractStorage.defineProperties(this, {
        totalTokens: null, // total token numbers that have been created
        owner:null, // game manager
        prizePool:{
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        }, // total prize pool
        totalPlayers:null, // unique players that has been added
        _name:null,
        claimable:null,
        deadline:null
    });

    LocalContractStorage.defineMapProperties(this, {
        "tokenOwner": null,
        
        "ownedTokensCount": null,
        "tokenApprovals": null,
        "operatorApprovals": {
            parse: function (value) {
                return new Operator(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        },
        // a single player properties
        "playerId":null,
        "playerWin":null,
        "playerGoal":null,
        "playerTime":null,
        "playerTalent":null,

        // store the data to find 
        
    });
};

Players.prototype = {
    init: function () {
        this.totalTokens = 0;
        this.owner = Blockchain.transaction.from;
        this.totalPlayers = 10; // this is how manu unique players that we create, need to be able to modifiy
        this._name ="Players";
        this.prizePool = new BigNumber(0);
        this.claimable = true;
        this.deadline = new Date('June 14, 2018 15:00:00'); // GMT time 6.14
    },

    name:function() {
        return this._name;
    },
// get function for local storage
    getTotalTokens:function(){
        return this.totalTokens; // return the user number;
    },

    getPrizePool:function(){
        return this.prizePool; // return the user number;
    },

    getTotalPlayers:function(){
        return this.totalPlayers; // return the user number;
    },

    getOwnerByTokenId:function(id){
        return this.tokenOwner.get(id);
    },

    getPlayersInfoByTokenId: function(tokenId){
        //token Id is an array;
        var data = JSON.parse(tokenId)
        var result=[];
        for (var i=0;i<data.length;i++){
            var id = this.playerId.get(data[i]);
            var win = this.playerWin.get(data[i]);
            var goal = this.playerGoal.get(data[i]);
            var min = this.playerTime.get(data[i]);
            var talent = this.playerTalent.get(data[i]);
            var player =  {
                "id":id,
                "win":win,
                "goal":goal,
                "time":min,
                "talent":talent,
                "owner":this.ownerOf(data[i]),
            };
            result.push(player);
        }

        // return a object array
        return result;
    },


//  =============== function to create a new Player =============================
    _createPlayer: function() {
        
        var playerId = this._generateNewPlayerId();
        this._initializePlayer(this.totalTokens,playerId);
        return playerId;
    },

    _initializePlayer: function (tokenId,playerId){
        this.playerId.set(tokenId,playerId);
        this.playerWin.set(tokenId,0);
        this.playerGoal.set(tokenId,0);
        this.playerTime.set(tokenId,0);
        var talent = this._generateNewPlayerTalent();
        this.playerTalent.set(tokenId,talent);
    },


    _generateNewPlayerId: function() {
        return parseInt(Math.random()*this.totalPlayers);
    },

    _generateNewPlayerTalent:function() {
        var number = parseInt(Math.random()*100);
        if (number>90){
            return 5;
        }
        if ((number<=90)&(number>70)){
            return 4;
        }
        if ((number<=70)&(number>40)){
            return 3;
        }
        if ((number<=40)&(number>10)){
            return 2;
        }
        if ((number<=10)){
            return 1;
        }
    },


    mint: function() {
        // overwrite the mint function, not using tokenId
        var from = Blockchain.transaction.from;
        // need to add payment requirement here
        var value = Blockchain.transaction.value;

        if (this.claimable==false){
            throw new Error("market has been closed");
        }
       
        if (value.lt(0.01)){
            throw new Error("not enough NAS to claim");
        }

        var playerId = this._createPlayer(); // return the unique playerId
        this._addTokenTo(from, this.totalTokens);
        this.transferEvent(true, "", from, this.totalTokens);
        
        this.totalTokens = this.totalTokens+1; 
        this.prizePool = this.prizePool.plus(value);
        return {"playerId":playerId,"talent":this.playerTalent.get(this.totalTokens-1)};
    },

// ========== function to create a specific player
    _createPlayerById: function(playerId) {
        this._initializePlayer(this.totalTokens,playerId);
    },

    mintPlayerById: function(id){
        // overwrite the mint function, not using tokenId
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;

        var playerId = parseInt(id);

        if (this.claimable==false){
            throw new Error("market has been closed");
        }

        if(playerId>=this.totalPlayers){
            throw new Error("this player does not exist")
        }

        if (value < 0.01){
            throw new Error("not enough NAS to claim");
        }

        this._createPlayerById(playerId); // return the unique playerId
        this._addTokenTo(from, this.totalTokens);
        this.transferEvent(true, "", from, this.totalTokens);
        this.totalTokens = this.totalTokens+1;

        this.prizePool = this.prizePool.plus(value);
        return {"playerId":playerId,"talent":this.playerTalent.get(this.totalTokens-1)};
    },

    getPlayersByOwner:function(owner) { // return the a id array
        var myPlayers = [];
        var counter = 0;
        for (var i=0;i<this.totalTokens;i++) {
            if(this.tokenOwner.get(i) == owner){
                myPlayers[counter]=i;//this.playerId.get(i);
                counter++;
            }
        }
        return myPlayers;
    },

    // player experience points calculation
    getExpPointsByTokenId: function(tokenId){
        if (tokenId < this.totalTokens){
            var win = this.playerWin.get(tokenId);
            var goal = this.playerGoal.get(tokenId);
            var min = this.playerTime.get(tokenId);
            var talent = this.playerTalent.get(tokenId);
            var expPoint = win*100+goal*300+min*talent;
            return expPoint;
        }
        else{
            throw new Error("token does not exist");
        }
    },


    calculatePointsForAllTokens:function(){
        var result = [];
        for (var i=0;i<this.totalTokens;i++){
            result[i] = {"tokenId":i,"points":this.getExpPointsByTokenId(i)};
        }
        return result;
    },


    bubbleSort: function(array) {
         // array = {"tokenId":, "points":}
        var done = false;
        while (!done) {
          done = true;
          for (var i = 1; i < array.length; i += 1) {
            if (array[i - 1].points < array[i].points) {
              done = false;
              var tmp = array[i - 1];
              array[i - 1] = array[i];
              array[i] = tmp;
            }
          }
        }
        return array;
    },




    sortTokensByPoints:function(){
       var result= this.calculatePointsForAllTokens();
       var sortResult = this.bubbleSort(result);
       var top20Owners = [];
       for (var i=0;i<20;i++){
           if (i>=this.totalTokens){
            top20Owners[i] = this.owner; // fill the blank with owner address;
           }
           else{
            top20Owners[i] = this.ownerOf(sortResult[i].tokenId);
           } 
       }
       return top20Owners;
    },


    // implement a method to rank the expPoint
    
//  ================== Game manager-only methods ======================
    increasePlayersNumber: function(addition){
        if(Blockchain.transaction.from!==owner){
            throw new Error("you are not game owner")
        }
        this.totalPlayers = this.totalPlayers + addition;
    },

    // return an array of tokensIDs by PlayerId;
    getTokenIdByPlayerId: function(targetPlayer) {
        var foundIDs = [];
        var counter = 0;
        for (var i=0;i<this.totalTokens;i++){
            if (this.playerId.get(i)==targetPlayer){
                foundIDs[counter] = i;
                counter= counter+1;
            }     
        }
        return foundIDs; // this is the token ID
    },

    updatePlayerStatus: function(targetPlayer,addTimes,addWins,addGoals) {
        var from = Blockchain.transaction.from;
        if (from !== this.owner){
            throw new Error("you are not game owner");
        }
        // check if inputs are reaonable
        if(addTimes<0||addTimes>90||addWins<0||addGoals<0){
            throw new Error("updated data is not reasonable");
        }
        else{
            var tokenIds =  this.getTokenIdByPlayerId(targetPlayer);
            var index;
            for (var i=0;i<tokenIds.length;i++){
                index = tokenIds[i];
             this.playerWin.set(index,this.playerWin.get(index)+parseInt(addWins));
             this.playerGoal.set(index,this.playerGoal.get(index)+parseInt(addGoals));
             this.playerTime.set(index,this.playerTime.get(index)+parseInt(addTimes)); // needs to modify here
            }          
        }
        return tokenIds
    },



//  ================== Prize Pool Management========================
    withdraw: function() { // need to comment for the final versioin
        var from = Blockchain.transaction.from;
        if (from !== this.owner){
            throw new Error("your are not game owner")
        }
        Blockchain.transfer(from,this.prizePool)
    },

    isClaimable: function(status) {
        var from = Blockchain.transaction.from;
        if (from !== this.owner){
            throw new Error("you are not game owner")
        } 
        this.claimable = status;
    },

    reward:function(){
        var from = Blockchain.transaction.from;
        if (from !== this.owner){
            throw new Error("you are not game owner")
        }

        var winners = this.sortTokensByPoints();
        var balance = this.prizePool;
        var amount = this.prizePool.div(100).mul(10);

        Blockchain.transfer(this.owner,amount);
        balance = balance.sub(amount);

        var amount = this.prizePool.div(100).mul(30);
        Blockchain.transfer(winners[0],amount);
        balance = balance.sub(amount);

        var amount = this.prizePool.div(100).mul(20);
        Blockchain.transfer(winners[1],amount);
        balance = balance.sub(amount);

        var amount = this.prizePool.div(100).mul(10);
        Blockchain.transfer(winners[2],amount);
        balance = balance.sub(amount);

        var amount = this.prizePool.div(100).mul(30).div(17);

        for (var i=3;i<19;i++){
            Blockchain.transfer(winners[i],amount);
            balance = balance.sub(amount);
        }

        this.prizePool = 0;
        Blockchain.transfer(winners[19],balance);

        
    },

    balanceOf: function (_owner) {
        var balance = this.ownedTokensCount.get(_owner);
        return balance;
        // if (balance instanceof BigNumber) {
        //     return balance.toString(10);
        // } else {
        //     return "0";
        // }
    },

    ownerOf: function (_tokenId) {
        return this.tokenOwner.get(_tokenId);
    },

    approve: function (_to, _tokenId) {
        var from = Blockchain.transaction.from;

        var owner = this.ownerOf(_tokenId);
        if (_to == owner) {
            throw new Error("invalid address in approve.");
        }
        // msg.sender == owner || isApprovedForAll(owner, msg.sender)
        if (owner == from || this.isApprovedForAll(owner, from)) {
            this.tokenApprovals.set(_tokenId, _to);
            this.approveEvent(true, owner, _to, _tokenId);
        } else {
            throw new Error("permission denied in approve.");
        }
    },

    getApproved: function (_tokenId) {
        return this.tokenApprovals.get(_tokenId);
    },

    setApprovalForAll: function(_to, _approved) {
        var from = Blockchain.transaction.from;
        if (from == _to) {
            throw new Error("invalid address in setApprovalForAll.");
        }
        var operator = this.operatorApprovals.get(from) || new Operator();
        operator.set(_to, _approved);
        this.operatorApprovals.set(from, operator);
    },

    isApprovedForAll: function(_owner, _operator) {
        var operator = this.operatorApprovals.get(_owner);
        if (operator != null) {
            if (operator.get(_operator) === "true") {
                return true;
            } else {
                return false;
            }
        }
    },

    isApprovedOrOwner: function(_spender, _tokenId) {
        var owner = this.ownerOf(_tokenId);
        return _spender == owner || this.getApproved(_tokenId) == _spender || this.isApprovedForAll(owner, _spender);
    },

    transferFrom: function (_from, _to, _tokenId) {
        var from = Blockchain.transaction.from;
        if (this.isApprovedOrOwner(from, _tokenId)) {
            this.clearApproval(_from, _tokenId);
            this.removeTokenFrom(_from, _tokenId);
            this._addTokenTo(_to, _tokenId);
            this.transferEvent(true, _from, _to, _tokenId);
        } else {
            throw new Error("permission denied in transferFrom.");
        }    
    },

    transfer: function ( _to, _tokenId) {
        var from = Blockchain.transaction.from;
        if (from != this.ownerOf(_tokenId)) {
            throw new Error("permission denied in transfer.");
        }
            this.removeTokenFrom(from, _tokenId);
            this._addTokenTo(_to, _tokenId);
            this.transferEvent(true, from, _to, _tokenId);    
    },

    clearApproval: function (_owner, _tokenId) {
        var owner = this.ownerOf(_tokenId);
        if (_owner != owner) {
            throw new Error("permission denied in clearApproval.");
        }
        this.tokenApprovals.del(_tokenId);
    },

    removeTokenFrom: function(_from, _tokenId) {
        if (_from != this.ownerOf(_tokenId)) {
            throw new Error("permission denied in removeTokenFrom.");
        }
        var tokenCount = this.ownedTokensCount.get(_from);
        if (tokenCount<1) {
            throw new Error("Insufficient account balance in removeTokenFrom.");
        }
        this.ownedTokensCount.set(_from, tokenCount-1);
    },

    // this should be a private method
    _addTokenTo: function(_to, _tokenId) {
        this.tokenOwner.set(_tokenId, _to);
        if (this.ownedTokensCount.get(_to)==null){
            var tokenCount = 0
        }else{
            var tokenCount = this.ownedTokensCount.get(_to) ;
        }
        this.ownedTokensCount.set(_to, tokenCount+1);
    },

    transferEvent: function (status, _from, _to, _tokenId) {
        Event.Trigger(this.name(), {
            Status: status,
            Transfer: {
                from: _from,
                to: _to,
                tokenId: _tokenId
            }
        });
    },

    approveEvent: function (status, _owner, _spender, _tokenId) {
        Event.Trigger(this.name(), {
            Status: status,
            Approve: {
                owner: _owner,
                spender: _spender,
                tokenId: _tokenId
            }
        });
    }

};

module.exports = Players;
