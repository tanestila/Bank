var express = require('express');
const cors = require('cors');
var mysql = require('mysql');
var async = require('async');
var convert = require('xml-js');
var bodyParser = require("body-parser");
var parseString = require('xml2js').parseString;

var app = express();
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});
var connectionParams = {
  host: 'localhost',
  user: 'root',
  password: 'toor',
  database: 'bank'
};
app.use(cors());
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));


app.get('/', function(req, res) {
  res.send('Сервер работает');
});

app.get('/client/get', function(req, res) {

  const connection = mysql.createConnection(connectionParams);
  connection.connect(err => {
    if (err) {
      return err;
    }
  });

  const SELECT_CARD_QUERY = `SELECT card.CardNumber, card.Balance  FROM card WHERE card.Owner = ${req.query.id}`;
  const SELECT_ACCOUNT_QUERY = `SELECT bankaccount.AccountNumber, bankaccount.Balance  FROM bankaccount WHERE bankaccount.Owner = ${req.query.id}`;
  const SELECT_CLIENT_QUERY = `SELECT client.ClientId, client.Name, client.Surname, client.DateOfBirh  FROM client WHERE client.ClientId = ${req.query.id}`

  var return_data = {};

  async.parallel([
    function(parallel_done) {
      connection.query(SELECT_CLIENT_QUERY, {}, function(err, results) {
        if (err) return parallel_done(err);
        return_data.Client = results;
        parallel_done();
      });
    },
    function(parallel_done) {
      connection.query(SELECT_CARD_QUERY, {}, function(err, results) {
        if (err) return parallel_done(err);
        return_data.Cards = results;
        parallel_done();
      });
    },
    function(parallel_done) {
      connection.query(SELECT_ACCOUNT_QUERY, {}, function(err, results) {
        if (err) return parallel_done(err);
        return_data.Account = results;
        parallel_done();
      });
    }
  ], function(err) {
    if (err) console.log(err);
    connection.end();

    return_data.Client[0].DateOfBirh = JSON.stringify(return_data.Client[0].DateOfBirh);

    var options = {
      compact: true,
      ignoreComment: true,
      spaces: 4
    };
    var result = convert.json2xml(return_data, options);
    return res.json({
      data: result
    })
    console.log(result);
  });
});

app.post('/client/post', urlencodedParser, function(req, res) {
  if (!req.body) return res.sendStatus(400)
  var dataToDb;
  var xml = "<root>" + req.body.userInfo + "</root>"
  parseString(xml, { explicitArray: false }, function(err, result) {
    console.log(result.root);
    dataToDb = result.root;
  });

  const connection = mysql.createConnection(connectionParams);
  connection.connect(err => {
    if (err) {
      return err;
    }
  });

  try {
    if (dataToDb.Client.Name) {
      var DateOfBirh = dataToDb.Client.DateOfBirh.slice(1, 20).replace('T', ' ');
      connection.query(`INSERT INTO client (ClientId, Name, Surname, DateOfBirh)  VALUES('${dataToDb.Client.ClientId}','${dataToDb.Client.Name}','${dataToDb.Client.Surname}','${DateOfBirh}')`, {}, function(err, results) {
        if (err) throw err;
        return console.log('success');
      });
    }
    connection.query(`INSERT INTO card (CardNumber, Balance, Owner)  VALUES('${dataToDb.Cards.CardNumber}','${dataToDb.Cards.Balance}','${dataToDb.Client.ClientId}')`, {}, function(err, results) {
      if (err) throw err;
      return console.log('success');
    });
    connection.query(`INSERT INTO bankaccount (AccountNumber, Balance, Owner)  VALUES('${dataToDb.Account.CardNumber}','${dataToDb.Account.Balance}','${dataToDb.Client.ClientId}')`, {}, function(err, results) {
      if (err) throw err;
      return console.log('success');
    });
  } catch (err) {
    console.log(err)
  } finally {

  }
  connection.end();
  res.sendStatus(200);
})
app.listen(4000);
