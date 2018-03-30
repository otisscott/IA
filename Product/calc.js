const request = require('request');
var ccxt = require ('ccxt')
let binance = new ccxt.binance({
  apiKey: '1pHIIeHGpkAV0fTvBr9rfgqC8yMNDS3eDfskHBcV5qXgGz0epCLOSmHhFMmqrLlo',
  secret: 'ce76ls7aseg9GAJAq79SorsPM449E3rkMNUnNT3m1nrkO27yllD6J6UQM3mRazFN'
})

let USDtoBTC, usXRPB, usETHB, feeETH;

let timesLooped = 4000;

let fee = 0.9999;

let initial = 5000;

let couponPrice = 47;

async function prices() {
  try {
    let promises = [binance.fetchTicker('ETH/BTC'), binance.fetchTicker('XRP/BTC'), binance.fetchTicker('BTC/USDT')]
    let prices = await Promise.all(promises);
    USDtoBTC = prices[2].ask;
    usXRPB = prices[1].ask * USDtoBTC;
    usETHB = prices[0].ask * USDtoBTC;
    feeETH = usETHB * 0.01;
  } catch(err) {
    console.log(err)
  }
  calc()
}

function percentages(inputAmmount) {
  return (((((inputAmmount * fee) - feeETH) * 0.999) - usXRPB) * fee);
}

function calc() {
  let total = 0;
  let last = initial;
  for(let i = 0; i <= timesLooped; i++) {
    if(last < 5000) {
      let post = percentages(last);
      total += post * 1.007 - 5000;
      last = post * 1.007;
    } else {
      total += percentages(5000) * 1.007 - 5000;
    }
  }
  total = total - (Math.floor(timesLooped / 40) * couponPrice);
  console.log(total)
}

prices();
