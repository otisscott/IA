const request = require('request');
const ObjectID = mongodb.ObjectID;
const TEST = 'spreads';
const ADD = 'count';
var ccxt = require ('ccxt')
let binance = new ccxt.binance({
  apiKey: 'REDACTED',
  secret: 'REDACTED'
})
let bithumb = new ccxt.bithumb({
  apiKey: 'REDACTED',
  secret: 'REDACTED'
})

let spread = [];
let goodSpread = [];
let count = 0;
let goodCount = 0;
let krwTousd;

async function waitForCurrency() {
  return new Promise(function(resolve, reject) {
    request('https://api.fixer.io/latest?base=KRW&symbols=USD', function(error, response, body) {
      if (error) return reject(error);
      resolve(body);
    });
  });
}

async function getConversion() {
  try {
    krwTousd = await waitForCurrency();
    krwTousd = parseFloat(krwTousd.substring(49,59));
  } catch(error) {
    console.error(error);
  }
}

let koreanXRPBuy, koreanXRPSell, usXRPB, usXRPS, koreanETHBuy, koreanETHSell, usETHS, usETHB, USDtoBTC, usETHBalance, usXRPBalance, koreanETHBalance, koreanXRPBalance, koreanKRWBalance;

let koreanXRPSRaw, koreanETHSRaw, usETHRaw, usXRPRaw, koreanXRPBRaw, koreanETHBRaw;

let usETHWithdraw, usXRPWithdraw, koreanXRPWithdraw, koreanETHWithdraw;

async function prices() {
  try {
    let promises = [binance.fetchTicker('ETH/BTC'), binance.fetchTicker('XRP/BTC'), binance.fetchTicker('BTC/USDT'), bithumb.fetchTicker('ETH/KRW'), bithumb.fetchTicker('XRP/KRW'), bithumb.fetchBalance(), binance.fetchBalance(), getConversion()]
    let prices = await Promise.all(promises);
    USDtoBTC = prices[2].ask;
    usXRPB = prices[1].ask * USDtoBTC;
    usXRPS = prices[1].bid * USDtoBTC;
    usETHS = prices[0].bid * USDtoBTC;
    usETHB = prices[0].ask * USDtoBTC;
    koreanETHB = prices[3].ask * krwTousd;
    koreanETHS = prices[3].bid * krwTousd;
    koreanXRPB = prices[4].ask * krwTousd;
    koreanXRPS = prices[4].bid * krwTousd;
    koreanETHBRaw = prices[3].ask;
    koreanXRPBRaw = prices[4].ask;
    koreanETHBalance = prices[5].free.ETH;
    koreanXRPBalance = prices[5].free.XRP;
    koreanKRWBalance = prices[5].free.KRW;
    usXRPBalance = prices[6].free.XRP;
    usETHBalance = prices[6].free.ETH;
  } catch(err) {
    console.log(err)
  }
  checkSpread();
}

function checkSpread() {
  let EthToXrpSpread;
  let XrpToEthSpread;
  EthToXrpSpread = ((usETHB / koreanETHS) / (usXRPS / koreanXRPB));
  XrpToEthSpread = ((usXRPB / koreanXRPS) / (usETHB / koreanETHS));
  if(XrpToEthSpread > 1.007) {
    console.log("XRP to ETH spread is good to go: ", XrpToEthSpread);
    spread.push(XrpToEthSpread);
    goodSpread.push(XrpToEthSpread);
    count += 1;
    goodCount += 1;
    EthtoXRPKorea();
    setTimeout(prices, 5000)
  } else if (EthToXrpSpread > 1.007) {
    console.log("ETH to XRP spread is good to go: ", EthToXrpSpread);
    spread.push(EthToXrpSpread);
    goodSpread.push(EthToXrpSpread);
    count += 1;
    goodCount += 1;
    EthKoreatoUS();
    setTimeout(prices, 5000);
  } else {
    console.log("The spread is too small. ETH to XRP is: ", EthToXrpSpread, " and XRP to ETH is: ", XrpToEthSpread);
    count += 1;
    if(EthToXrpSpread < XrpToEthSpread) {
      spread.push(XrpToEthSpread);
      setTimeout(prices, 5000)
    } else {
      spread.push(EthToXrpSpread);
      setTimeout(prices, 5000)
    }
  }
}
/*
function dailyAvg() {
  let avgSpread = 0;
  for(let i = 0; i < spread.length; i++) {
    avgSpread += spread[i];
  }
  avgSpread = ((avgSpread / count) - 1) * 100;
  console.log("The average spread in the past day has been ", avgSpread, "%");
  let percentage = 0;
  percentage = goodCount/count * 100;
  console.log("The margin has been tradable ", percentage, "% of the time in the past day");
  setTimeout(dailyAvg, 120000);
}
*/

function krwCheck(which) {
  console.log(arguments.callee.name + ' called')
  console.log(koreanKRWBalance > (10/krwTousd));
  if(koreanKRWBalance > (10/krwTousd)) {
    if(which) {
      setTimeout(kETHB, 1000);
    } else {
      setTimeout(kXRPB, 1000);
    }
  } else {
    setTimeout(function() {
      krwCheck(which);
    }, 1000);
  }
}
function koreanXRPCheck(which) {
  console.log(arguments.callee.name + ' called')
  if(koreanXRPBalance*usXRPB > 10) {
    if(which) {
      setTimeout(XrptoEthKorea, 1000);
    } else {
      setTimeout(XrpKoreatoUS, 1000);
    }
  } else {
    setTimeout(function() {
      koreanXRPCheck(which);
    }, 1000);
  }
}
function usETHCheck(which) {
  console.log(arguments.callee.name + ' called')
  if(usETHBalance*usETHB > 10) {
    if(which) {
      setTimeout(EthUStoKorea, 2000);
    } else {
      setTimeout(EthtoXrpUS, 2000);
    }
  } else {
    setTimeout(function() {
      usETHCheck(which);
    }, 1000);
  }
}
function usXRPCheck(which) {
  console.log(arguments.callee.name + ' called')
  if(usXRPBalance*usXRPB > 10) {
    if(which) {
      setTimeout(XrpUStoKorea, 2000);
    } else {
      setTimeout(XrptoEthUS, 2000);
    }
  } else {
    setTimeout(function() {
      usXRPCheck(which)
    }, 1000);
  }
}

// US Sell functions
async function XrptoEthUS() {
  console.log(arguments.callee.name + ' called')
  let quantity = (usXRPBalance - (1 / usXRPB));
  quantity = parseFloat(quantity.toFixed(4));
  console.log(quantity, usXRPBalance)
  try {
    await binance.createMarketSellOrder('XRP/ETH', quantity)
    usETHCheck(true);
  } catch(err) {
    console.log(err);
    XrptoEthUS();
  }
}

async function EthtoXrpUS() {
  console.log(arguments.callee.name + ' called')
  try {
    let quantity = usETHBalance - (1 / usETHB);
    quantity = parseFloat(quantity.toFixed(1));
    await binance.createMarketBuyOrder('XRP/ETH', quantity);
    usXRPCheck(true);
  } catch(err) {
    console.log(err);
    EthtoXrpUS();
  }
}
//US Send functions
async function EthUStoKorea() {
  console.log(arguments.callee.name + ' called')
  try {
    let quantity = usETHBalance - (1 / usETHB);
    await binance.withdraw('ETH', quantity, '0xfbee64a423ebe49ff216474cca17be5681a824c6', tag = undefined, params = {})
  } catch(err) {
    console.log(err);
    EthUStoKorea();
  }
}

async function XrpUStoKorea() {
  console.log(arguments.callee.name + ' called')
  try {
    let quantity = usXRPBalance - (1 / usXRPB);
    await binance.withdraw('XRP', quantity, 'rsG1sNifXJxGS2nDQ9zHyoe1S5APrtwpjV', tag = 1003338641, params = {});
    koreanXRPCheck(true);
  } catch(err) {
    console.log(err);
    XrpUStoKorea
  }
}

async function kETHB() {
  console.log(arguments.callee.name + ' called')
  try {
    let quantity = (koreanKRWBalance / koreanETHBRaw) - (1 / usETHB);
    quantity = parseFloat(quantity.toFixed(4));
    console.log(quantity);
    await bithumb.createMarketBuyOrder('ETH/KRW', quantity);
  } catch(err) {
    console.log(err);
    kETHB();
  }
}

async function XrptoEthKorea() {
  console.log(arguments.callee.name + ' called')
  try {
    let quantity = koreanXRPBalance - (1 / usXRPB);
    quantity = parseFloat(quantity.toFixed(4));
    console.log(quantity, koreanXRPBalance)
    await bithumb.createMarketSellOrder('XRP/KRW', quantity)
    krwCheck(true);
  } catch(err) {
    console.log(err);
    XrptoEthKorea();
  }
}

async function kXRPB() {
  console.log(arguments.callee.name + ' called')
  let quantity = (koreanKRWBalance / koreanXRPBRaw) - (1 / usXRPB)
  quantity = parseFloat(quantity.toFixed(4));
  try {
    await bithumb.createMarketBuyOrder('XRP/KRW', quantity);
    koreanXRPCheck(false);
  } catch(err) {
    console.log(err);
    kXRPB();
  }
}

async function EthtoXRPKorea() {
  console.log(arguments.callee.name + ' called')
  try {
    if(koreanETHB * usETHB < 100) {
      console.log("No balance, wait and try again")
    } else {
      if(koreanETHBalance * usETHB> 5001) {
        console.log("Balance greater than 5000, trading")
        let quantity = 5000 / usETHB;
        quantity = parseFloat(quantity.toFixed(4));
        await bithumb.createMarketSellOrder('ETH/KRW', quantity);
        krwCheck(false);
      } else {
        console.log("Balance less than 5000, trading")
        let quantity = koreanETHBalance - (1 / usETHB);
        quantity = parseFloat(quantity.toFixed(4));
        await bithumb.createMarketSellOrder('ETH/KRW', quantity)
        krwCheck(false);
      }
    }
  } catch(err) {
    console.log(err)
  }
}

//Korean Send functions
async function XrpKoreatoUS() {
  console.log(arguments.callee.name + ' called')
  try {
    let quantity = (koreanXRPBalance - (1 / usXRPB));
    console.log(quantity, koreanXRPBalance)
    await bithumb.withdraw('XRP', quantity, 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh', tag = 105373459, params = {'destination': 105373459});
    usXRPCheck(false);
  } catch(err) {
    console.log(err);
    XrpKoreatoUS();
  }
}

async function EthKoreatoUS() {
  console.log(arguments.callee.name + ' called')
  try {
    if(koreanETHBalance * usETHB < 100) {
      console.log("No balance, wait and try again")
    } else {
      if(koreanETHBalance * usETHB > 5001) {
        console.log("Balance is greater than 5000, trading")
        let quantity = 5000 / usETHB;
        quantity = parseFloat(quantity.toFixed(4));
        await bithumb.withdraw('ETH', quantity, '0x9fac38bd12df93d52fdd658222c3b3884a8376c8')
        usETHCheck(false);
      } else {
        console.log("Balance is less than 5000, trading")
        let quantity = ((koreanETHBalance) - (1 / usETHB));
        quantity = parseFloat(quantity.toFixed(4));
        console.log(quantity, koreanETHBalance)
        await bithumb.withdraw('ETH', quantity, '0x9fac38bd12df93d52fdd658222c3b3884a8376c8')
        usETHCheck(false);
      }
    }
  } catch(err) {
    console.log(err);
  }
}
setTimeout(prices,5000);
