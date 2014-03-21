var request = require('request');
var cheerio = require('cheerio');
var Table = require('cli-table');
var async = require('async');

module.exports = function(config) {

  header = config.lang === 'zh-CN' ?
    ['交易所', '最新买价', '最新卖价', '最新成交价', '最高', '最低', '24小时成交量', '日期'] :
    ['Exchange', 'Buy', 'Sell', 'Last', 'High', 'Low', 'Vol', 'Date'];
  var table = new Table({
      head: header
  });
  var rows = [];

  async.each(config.exchanges, function(exchange, callback) {
    var priceInfo = {
      buy: '',
      high: '',
      low: '',
      last: '',
      sell: '',
      vol: '',
      date: ''
    }

    request(exchange.api, function(error, res, body) {
      if (!error && res.statusCode == 200) {
        getPrice(exchange, body);
        rows.push([
          exchange.name,
          priceInfo.buy,
          priceInfo.sell,
          priceInfo.last,
          priceInfo.high,
          priceInfo.low,
          priceInfo.vol,
          new Date().toLocaleDateString()
        ]);
        callback();
      }
    });

    function getPrice(exchange, chunk) {
      var price = JSON.parse(chunk);
      price = price.ticker ? price.ticker : price;
      priceInfo.buy = exchange.currency + price.buy;
      priceInfo.high = exchange.currency + price.high;
      priceInfo.low = exchange.currency + price.low;
      priceInfo.last = exchange.currency + price.last;
      priceInfo.sell = exchange.currency + price.sell;
      priceInfo.vol = price.vol_ltc ? parseFloat(price.vol_ltc) : parseFloat(price.vol);
    }

  }, function(err) {
    rows.sort(function(a, b) {
      return a[0] > b[0];
    });

    rows.forEach(function (row) {
      table.push(row)
    });

    console.log(table.toString());

  });

}
