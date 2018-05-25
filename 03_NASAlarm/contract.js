'use strict';

var AlarmContract = function () {
  LocalContractStorage.defineProperty(this, "threshold");
  LocalContractStorage.defineMapProperties(this, {
    alarmTime: null,
    alarmActive: null,
    deposit: null
  })
};

// save value to contract, only after height of block, users can takeout
AlarmContract.prototype = {
  init: function () {
    this.threshold = 0.01;
  },

  setAlarm: function (msec) {
    var from = Blockchain.transaction.from;
    var value = Blockchain.transaction.value;
    var now = Date.now();// this should return to UTC msec number

    if (value <= this.threshold) {
      throw new Error("deposit is not enough");
    }


    var mytime = msec;// this should be larger than now
    console.log(mytime);
    this.alarmTime.set(from, mytime);
    this.alarmActive.set(from, true);
    this.deposit.set(from, value);

    // return the state at the end of transaction to avoid unnessary delay
    var result = {
      "alarmTime":this.alarmTime.get(from),
    "alarmActive":this.alarmActive.get(from),
    "alarmDeposit":this.deposit.get(from)}

    return result;
    
  },

  stopAlarm: function () {
    var from = Blockchain.transaction.from;

    // check the sender Alarm is active or not

    if (this.alarmActive.get(from)===false) {
      throw new Error("you need to set your alarm first!");
    }

    var now = Date.now();
    if ((now - parseInt(this.alarmTime.get(from)))>600000) {
      console.log("alarm expires,you cannot get your deposit back");
      this.alarmActive.set(from, false);
      this.deposit.set(from, 0);
     
    }
    else {
      console.log('alarm clear')
      this.alarmActive.set(from, false);
      var value = this.deposit.get(from);
      Blockchain.transfer(from, value);
      this.deposit.set(from, 0); 
    }

    var result = {
      "alarmTime":this.alarmTime.get(from),
    "alarmActive":this.alarmActive.get(from),
    "alarmDeposit":this.alarmActive.get(from)}

    return result;


  },

  getNow: function(){
    return Date.now();
  },

  getDeposit:function(){
    var from = Blockchain.transaction.from;
    return(this.deposit.get(from));
  },

  getAlarmStatus:function(){
    var from = Blockchain.transaction.from;
    return(this.alarmActive.get(from));
  },

  getAlarmTime:function(){
    var from = Blockchain.transaction.from;
    return(this.alarmTime.get(from));
  },


}

module.exports = AlarmContract;