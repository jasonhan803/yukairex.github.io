var txhash;


function setTxQuery() {
  neb.api.getTransactionReceipt({
      hash: txhash
  })
      .then(function (receipt) {
        console.log(receipt)
           
      })
      .catch(function (err){ 
      })
}


function mintListener(resp) {
    spin();
    txhash = resp.txhash;
    neb.api.getTransactionReceipt({
        hash: resp.txhash
    })
        .then(function (receipt) {
            console.log("receipt is:" + JSON.stringify(receipt))
            setQuery = setInterval(function () {
                setTxQuery();
            }, 10000);
        })
}


function buy() {
    var to = contractAddress;
    var value = amount;// need to change
    var callFunction = "mint";
    var callArgs = "";
    serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
      listener: mintListener,        //设置listener, 处理交易返回信息
      callback: mintCallback,
  });
}
  

function init(){
    const contractAddress = "n1m4pgesMKUtt7cMWg8z5yfi8Dkb3ZT9Dnr";
    const ownerAddress = "n1RQYWMLqy1twJhfYxPk4SFx7wdfeq31pMX";
    neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));
    $("#address").attr('href','https://explorer.nebulas.io/#/testnet/address/'+contractAddress).attr('target',"_blank");
    var chainId = 1001;// test net
    var callbackUrl = testnetUrl;
    var explorerTx = "https://explorer.nebulas.io/#/testnet/tx/";


    // //main net 
    // const contractAddress = "n1kU44RRFoFvQbe8A6FAHDCC5APnfn89m2P";
    // const ownerAddress = "n1bveJ8tkb1DDECgHvknRFZesJqeaL2iKNt";
    // $("#address").attr('href','https://explorer.nebulas.io/#/mainnet/address/'+contractAddress).attr("target","_blank");
    // neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));
    // var chainId = 1;// mainnet net
    // var callbackUrl = mainnetUrl;
    // //2ff9c00e3050f44dad190b1f5a6eb296ae6cdbed9007569db56fe2a054fc451c
    // var explorerTx = "https://explorer.nebulas.io/#/mainnet/tx/";
    // var explorer = "https://explorer.nebulas.io/#/address/";
    console.log("in initial function")

    var buyPlayer = $('#buyPlayer');
    buyPlayer.click(buy);
}

$(function() {
    $(window).load(function() {
      init();
    });
  });