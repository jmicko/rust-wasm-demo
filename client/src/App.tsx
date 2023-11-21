import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)


  // options object should have the following keys
  // size: the size of the trade in either base or quote currency
  // startingValue: the price to start the loop at
  interface User {
    id: number;
    taker_fee: number;
  }

  interface Product {
    quote_increment_decimals: number;
    base_inverse_increment: number;
    product_id: string;
  }

  interface Options {
    [key: string]: any;
    availableQuote: number;
    endingValue: number;
    ignoreFunds: boolean;
    increment: number;
    incrementType: string;
    maxSize: number;
    product: Product;
    size: number;
    sizeCurve: string;
    sizeType: string;
    skipFirst: boolean;
    startingValue: number;
    steepness: number;
    trade_pair_ratio: number;
    tradingPrice: number;
  }

  interface TradePair {
    base_size: number;
    buy_quote_size: number;
    limit_price: number;
    original_buy_price: number;
    original_sell_price: number;
    previous_total_fees: number;
    product_id: string;
    sell_quote_size: number;
    side: string;
    stp: string;
    total_fees: number;
    trade_pair_ratio: number;
    userID: number;
  }

  const testUser: User = {
    id: 1,
    taker_fee: 0.00600000,
  }

  const testProduct: Product = {
    quote_increment_decimals: 5,
    base_inverse_increment: 10,
    product_id: 'DOGE-USD',
  }

  const testOptions: Options = {
    availableQuote: 1000,
    endingValue: 0.1,
    ignoreFunds: false,
    increment: 0.5,
    incrementType: 'percentage',
    maxSize: 100,
    product: testProduct,
    size: 10,
    sizeCurve: 'curve',
    sizeType: 'base',
    skipFirst: false,
    startingValue: 0.5,
    steepness: 1,
    trade_pair_ratio: 1.5,
    tradingPrice: 0.5,
  }

  interface Result {
    valid: boolean;
    cost: number;
    orderList: Array<TradePair>;
    lastBuyPrice: number;
    btcToBuy: number;
    options: Options;
    quoteToReserve: number;
    buyCount: number;
    sellCount: number;
  }

  function test() {
    // start timer to see how long it takes to run
    console.time('autoSetup');
    // run the function
    const autoSetupResult = autoSetup(testUser, testOptions);
    // stop timer
    console.timeEnd('autoSetup');

    if ('cost' in autoSetupResult) {
      const result: Result = autoSetupResult;
      console.log(result.orderList, 'autoSetup result');
    } else {
      console.log('autoSetup failed');
    }
  }

  function autoSetup(user: User, options: Options) {
    // console.log('running autoSetup')
    const product = options.product;
    // console.log(product_id, 'product_id')
    // console.log(options.user, options.availableFunds, 'user')
    // const available = options.availableQuote;
    // a false return object to use when the function fails
    const falseReturn = {
      valid: false,
    }

    // if any key in the options object is null or undefined, return falseReturn
    for (let key in options) {
      if (options[key] === null || options[key] === undefined) {
        console.log('bad options')
        return falseReturn;
      }
      // else {
      //   console.log(options[key], 'options[key]', key)
      // }
    }


    // if (!available) {
    //   console.log('no available funds for this product')
    //   return falseReturn;
    // }
    // console.log(options, 'options')

    // create an array to hold the new trades to put in
    const orderList: Array<TradePair> = [];

    // SHORTEN PARAMS for better readability
    // let availableFunds = options.availableFunds;
    let availableFunds = options.availableQuote;

    // console.log(availableFunds, 'availableFunds')

    const {
      size,
      startingValue,
      endingValue,
      tradingPrice,
      increment,
      incrementType,
      trade_pair_ratio,
      skipFirst,
      sizeType,
      sizeCurve,
      maxSize,
      steepness
    } = options;


    // initialize values for the loop
    let buyPrice = startingValue;
    let cost = 0;
    let loopDirection = (endingValue - startingValue < 0) ? "down" : "up";

    let btcToBuy = 0;
    let quoteToReserve = 0;
    let buyCount = 0;
    let sellCount = 0;


    // prevent infinite loops and bad orders
    if ((startingValue === 0 && !skipFirst) ||
      startingValue <= 0 ||
      // startingValue === null ||
      // startingValue === undefined ||
      (startingValue === 0 && incrementType === 'percentage') ||
      (endingValue <= startingValue && loopDirection === "up") ||
      size <= 0 ||
      increment <= 0 ||
      trade_pair_ratio <= 0 ||
      steepness <= 0 ||
      maxSize <= 0 ||
      tradingPrice <= 0) {
      console.log('bad options')
      return falseReturn;
    }
    // loop until one of the stop triggers is hit
    let stop = false;
    // for (let index = 0; index < array.length; index++) {
    //   const element = array[index];

    // }

    for (let i = 0; (!stop && i < 1000); i++) {
      if (i === 0 && skipFirst) {
        // console.log('need to skip first one!');
        // increment buy price, but don't remove cost from funds
        incrementBuyPrice();
        // check if need to stop
        stopChecker();
        if (stop) {
          console.log('stop triggered on first iteration')
          return falseReturn;
        }
        // skip the rest of the iteration and continue the loop
        continue;
      }
      // console.log(product.quote_increment_decimals, 'product.quote_increment_decimals')

      // get buy price rounded to cents the precision of the quote currency
      buyPrice = Number(buyPrice.toFixed(product.quote_increment_decimals));
      // get the sell price by multiplying the buy price by the trade pair ratio



      // let original_sell_price = (buyPrice * Number(trade_pair_ratio)).toFixed(product.quote_increment_decimals);
      // THIS IS NOT OLD CODE FROM WHEN BTC-USD WAS THE ONLY PRODUCT. Using 100 here because the trade_pair_ratio is a percentage. 
      let original_sell_price = (Math.round((buyPrice * (Number(trade_pair_ratio) + 100))) / 100);




      // console.log(tradingPrice, '<-tradingPrice', buyPrice > tradingPrice, '<-true if SELL', buyPrice, '<-buyPrice', original_sell_price, 'original_sell_price', trade_pair_ratio, 'trade_pair_ratio')
      // figure out if it is going to be a BUY or a sell. Buys will be below current trade price, sells above.
      let side = (buyPrice > tradingPrice)
        ? 'SELL'
        : 'BUY'

      // set the current price based on if it is a BUY or sell
      let limit_price = (side === 'SELL')
        ? original_sell_price
        : buyPrice

      // console.log(product.base_inverse_increment, 'product.base_inverse_increment')
      const actualSize = (getActualSize() * product.base_inverse_increment) / product.base_inverse_increment;


      // count up how much base currency will need to be purchased to reserve for all the sell orders
      if (side === 'SELL') {
        // console.log(actualSize, 'actualSize', (actualSize * product.base_inverse_increment));
        // okay why does this multiply by product.base_inverse_increment??
        // because later on, the actualSize is divided by product.base_inverse_increment before returning it
        btcToBuy += (actualSize * product.base_inverse_increment)
      }

      // calculate the previous fees on sell orders
      const previous_total_fees = (side === 'BUY')
        ? 0
        : buyPrice * actualSize * user.taker_fee;

      // console.log(previous_total_fees);

      // CREATE ONE ORDER
      const singleOrder = {
        original_buy_price: buyPrice,
        original_sell_price: Number(original_sell_price),
        side: side,
        limit_price: limit_price,
        base_size: actualSize,
        buy_quote_size: Number((actualSize * buyPrice).toFixed(product.quote_increment_decimals)),
        sell_quote_size: Number((actualSize * original_sell_price).toFixed(product.quote_increment_decimals)),
        previous_total_fees: previous_total_fees,
        total_fees: 0,
        product_id: product.product_id,
        stp: 'cn',
        userID: user.id,
        trade_pair_ratio: options.trade_pair_ratio,
      }
      // console.log(singleOrder, 'singleOrder')

      // break out of the loop if the order is invalid
      if (singleOrder.base_size <= 0) {
        stop = true;
        continue;
      }
      if (singleOrder.limit_price <= 0) {
        stop = true;
        continue;
      }
      if (singleOrder.buy_quote_size <= 0) {
        stop = true;
        continue;
      }
      if (singleOrder.sell_quote_size <= 0) {
        stop = true;
        continue;
      }

      // console.log(singleOrder, 'singleOrder');
      // push that order into the order list
      orderList.push(singleOrder);

      // increase the buy count or sell count depending on the side
      side === 'BUY'
        ? buyCount++
        : sellCount++;

      ////////////////////////////
      // SETUP FOR NEXT LOOP - do some math to figure out next iteration, and if we should keep looping
      ////////////////////////////

      // subtract the buy size USD from the available funds
      // if sizeType is base, then we need to convert
      if (sizeType === 'base') {
        // let USDSize = size * buyPrice;
        // need to convert to USD. If is a buy, use the buy price, if a sell, use the trading price because that is what the bot will use
        const conversionPrice = (side === 'BUY')
          ? buyPrice
          : tradingPrice

        let USDSize = size * conversionPrice;
        availableFunds -= USDSize;
        cost += USDSize;
        // buy orders need to add quote value to quoteToReserve
        side === 'BUY' && (quoteToReserve += USDSize);
      } else {
        let quoteSize = size;

        // console.log('current funds', availableFunds);
        // if it is a sell, need to convert from quote to base size based on the buy price
        // then get the cost of the base size at the trading price,
        // then get the cost of the quote at the current price
        if (side === 'SELL') {
          // console.log(quoteSize, 'quote size SELLING');
          // console.log('need to convert to base size');
          // convert to base size
          const baseSize = quoteSize / buyPrice;
          // console.log('base size', baseSize);
          // convert to USD
          const USDSize = baseSize * tradingPrice;
          // console.log('USD size', USDSize);
          quoteSize = USDSize;
          // console.log(quoteSize, 'quote size actual cost SELLING');
        } else {
          // buy orders need to add quote value to quoteToReserve
          quoteToReserve += quoteSize;
        }

        availableFunds -= quoteSize;
        cost += quoteSize;
      }

      // increment the buy price
      incrementBuyPrice();


      // STOP TRADING IF...

      // stop if run out of funds unless user specifies to ignore that
      stopChecker();
    }

    ////////////////////
    ////// RESULT ////// 
    ////////////////////
    // console.log('valid result')
    return {
      valid: true,
      cost: cost,
      orderList: orderList,
      lastBuyPrice: orderList[orderList.length - 1]?.original_buy_price,
      btcToBuy: (btcToBuy / product.base_inverse_increment),
      options: options,
      quoteToReserve: quoteToReserve,
      buyCount: buyCount,
      sellCount: sellCount,
    }

    ////////////////////
    ////// HELPERS /////
    ////////////////////

    // get the actual size in base currency of the trade
    function getActualSize() {
      // console.log(size, 'size');
      // if sizeCurve is curve, use the bellCurve
      const newSize = (sizeCurve === 'curve')
        // adjust the size based on the curve
        ? curvedSize()
        // else leave the size alone
        : size;

      // console.log(newSize, 'newSize');
      function curvedSize() {
        // if the increment type is percentage, convert it to a number
        // this is the same as the increment in the bellCurve, which is a dollar amount
        const newIncrement = incrementType === 'percentage'
          ? increment * buyPrice
          : increment

        // this will adjust the size based on where the buy price is on a curve
        return bellCurve({
          maxSize: maxSize - size,
          minSize: size,
          increment: newIncrement,
          steepness: steepness,
          buyPrice: buyPrice,
          tradingPrice: tradingPrice,
        })
      }

      if (sizeType === 'quote') {
        // if the size is in quote, convert it to base
        const convertedToBase = Number(Math.floor((newSize / buyPrice) * product.base_inverse_increment)) / product.base_inverse_increment
        // console.log(convertedToBase, 'convertedToBase', buyPrice, 'buyPrice', product.base_inverse_increment, 'product.base_inverse_increment');
        return convertedToBase
      } else {
        // if the size is in base, it will not change. 
        return newSize
      }
    }

    // console.log(quoteToReserve, 'quoteToReserve');
    // console.log(buyCount, 'buyCount');

    function stopChecker() {
      let USDSize = size * buyPrice;
      // calc next round funds
      let nextFunds = (sizeType === 'base')
        ? availableFunds - USDSize
        : availableFunds - size
      // console.log(((availableFunds - nextFunds) < 0) && !options.ignoreFunds, nextFunds, 'next funds', availableFunds, !options.ignoreFunds);
      if (((nextFunds) < 0) && !options.ignoreFunds) {
        // console.log('ran out of funds!', availableFunds);
        stop = true;
      }
      // console.log('available funds is', availableFunds);
      // stop if the buy price passes the ending value
      if (loopDirection === 'up' && buyPrice > endingValue) {
        stop = true;
      } else if (loopDirection === 'down' && buyPrice < endingValue) {
        stop = true;
      } else if (loopDirection === 'down' && buyPrice <= 0) {
        stop = true;
      }
    }

    function incrementBuyPrice() {
      // can have either percentage or dollar amount increment
      if (incrementType === 'dollars') {
        // if incrementing by dollar amount
        (loopDirection === 'up')
          ? buyPrice += increment
          : buyPrice -= increment;
      } else {
        // if incrementing by percentage
        (loopDirection === 'up')
          // the hardcoded 100 is because the increment is a percentage, not old code
          ? buyPrice = buyPrice * (1 + (increment / 100))
          : buyPrice = buyPrice / (1 + (increment / 100));
      }
    }
  }

  interface BellCurveOptions {
    maxSize: number;
    minSize: number;
    increment: number;
    steepness: number;
    buyPrice: number;
    tradingPrice: number;
  }

  function bellCurve(options: BellCurveOptions) {
    const { maxSize, minSize, increment, steepness, buyPrice, tradingPrice } = options;
    return maxSize / (1 + (1 / (steepness * increment)) * (buyPrice - tradingPrice) ** 2) + minSize
  }


  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() =>{ setCount((count) => count + 1); test()}}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
