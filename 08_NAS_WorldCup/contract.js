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
        this.totalPlayers = 9; // this is how manu unique players that we create, need to be able to modifiy
        this._name ="Players";
        this.prizePool = new BigNumber(0);
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
                "talent":talent
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
        return parseInt(Math.random()*this.totalPlayers)
    },

    _generateNewPlayerTalent:function() {
        return parseInt(Math.random()*5); // five different player talents
    },


    mint: function() {
        // overwrite the mint function, not using tokenId
        var from = Blockchain.transaction.from;
        // need to add payment requirement here
        var value = Blockchain.transaction.value;
       
        if (value.lt(0.01)){
            throw new Error("not enough NAS to claim");
        }

        var playerId = this._createPlayer(); // return the unique playerId
        this._addTokenTo(from, this.totalTokens);
        this.transferEvent(true, "", from, this.totalTokens);
        
        this.totalTokens = this.totalTokens+1; 
        this.prizePool = this.prizePool.plus(value);
        return playerId;
    },

// ========== function to create a specific player
    _createPlayerById: function(playerId) {
        this._initializePlayer(this.totalTokens,playerId);
    },

    mintPlayerById: function(playerId){
        // overwrite the mint function, not using tokenId
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;

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
        return playerId;
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
        var win = this.playerWin.get(tokenId);
        var goal = this.playerGoal.get(tokenId);
        var min = this.playerTime.get(tokenId);
        var talent = this.playerTalent.get(tokenId);
        var expPoint = win*300+goal*300+min*talent;
        return expPoint;
    },


    // implement a method to rank the expPoint
    
//  ================== Game manager-only methods ======================
    increasePlayersNumber: function(addition){
        if(Blockchain.transaction.from!==owner){
            throw new Error("your are not game owner")
        }
        this.totalPlayers = this.totalPlayers + addition;
    },

    updateWin: function(tokenIds) { // load an array of tokenIds, 
        var from = Blockchain.transaction.from;
        if (from !== this.owner){
            throw new Error("your are not game owner")
        }

        for (var i=0;i<tokenIds.length;i++){
            this.playerWin.set(i,this.playerWin.get(i)+1);
        }
    },

    updateGoal: function(tokenIds) { // load an array of tokenIds, 
        var from = Blockchain.transaction.from;
        if (from !== this.owner){
            throw new Error("your are not game owner")
        }

        for (var i=0;i<tokenIds.length;i++){
            this.playerGoal.set(i,this.playerGoal.get(i)+1);
        }
    },

    updateTime: function(tokenIds) { // load an array of tokenIds, 
        var from = Blockchain.transaction.from;
        if (from !== this.owner){
            throw new Error("your are not game owner")
        }

        for (var i=0;i<tokenIds.length;i++){
            this.playerTime.set(i,this.playerTime.get(i)+1); // needs to modify here
        }
    },



//  ================== Prize Pool Management========================
    withdraw: function() {
        var from = Blockchain.transaction.from;
        if (from !== this.owner){
            throw new Error("your are not game owner")
        }
        Blockchain.transfer(from,this.prizePool)
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

    burn: function(_owner, _tokenId) {
        this.clearApproval(_owner, _tokenId);
        this.removeTokenFrom(_owner, _tokenId);
        this.transferEvent(true, _owner, "", _tokenId);
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
