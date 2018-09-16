var express = require('express');
const cors = require('cors');
var mysql = require('mysql');
var async  = require('async');
var convert = require('xml-js');

var app = express();
app.use(cors());
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));


app.get('/', function(req, res) {
  res.send('Сервер работает');
});

app.get('/client/get', function (req, res) {

  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'toor',
    database: 'bank'
  });

  connection.connect(err => {
    if (err) {
      return err;
    }
  });
  const SELECT_CARD_QUERY = `SELECT card.CardNumber, card.Balance  FROM card WHERE card.Owner = ${req.query.id}`;
  const SELECT_ACCOUNT_QUERY = `SELECT bankaccount.AccountNumber, bankaccount.Balance  FROM bankaccount WHERE bankaccount.Owner = ${req.query.id}`;
  const SELECT_CLIENT_QUERY = `SELECT client.Name, client.Surname, client.DateOfBirh  FROM client WHERE client.ClientId = ${req.query.id}`

    var return_data = {};

    async.parallel([
      function(parallel_done) {
          connection.query(SELECT_CLIENT_QUERY , {}, function(err, results) {
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

         return_data.Info[0].DateOfBirh = JSON.stringify(return_data.Info[0].DateOfBirh);

         var options = {compact: true, ignoreComment: true, spaces: 4};
         var result = convert.json2xml(return_data, options);
         //console.log(result);
         res.send(result);
         console.log(result);
    });
});


app.listen(4000);
