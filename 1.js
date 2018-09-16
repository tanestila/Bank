var express = require('express');
const cors = require('cors');
const mysql = require('mysql');

var app = express();

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

const SELECT_ALL_CLIENTS = 'SELECT * FROM client';

app.use(cors());
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

app.get('/', function(req, res) {
  res.send('Сервер работает');
});

app.get('/clients', (req, res) => {
  connection.query(SELECT_ALL_CLIENTS, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      return res.json({
        data: results
      })
    }
  });
})

getUserData = function(userId,  cb) {
  const SELECT_CLIENT_QUERY = `SELECT client.Name, client.Surname, client.DateOfBirh  FROM client WHERE client.ClientId = ${userId}`;
  connection.query(SELECT_CLIENT_QUERY, (err, results) => {
    if (err) {
      return console.log(err);;
    } else {
      cb(results);
    }
  });
}


app.get('/client/get', (req, res) => {

  var cards;
  var accounts;
    var clientInfo;

  const  {id}  = req.query.id;
console.log(req.query.id);

  const SELECT_CARD_QUERY = `SELECT card.CardNumber, card.Balance  FROM card WHERE card.Owner = ${req.query.id}`;
  const SELECT_ACCOUNT_QUERY = `SELECT bankaccount.AccountNumber, bankaccount.Balance  FROM bankaccount WHERE bankaccount.Owner = ${req.query.id}`;

var obj = new Object();
var arrayCards = [];
var clientInfo;

var r = getUserData(req.query.id, function(result) {
  console.log(result);
  obj.Name = result[0].Name;
  obj.Surname = result[0].Surname;
  obj.DateOfBirh = result[0].DateOfBirh;
  console.log(obj);
});


  //obj.Name = clientInfo[0].Name;
  //  obj.Surname = clientInfo[0].Surname;
  //  obj.DateOfBirh = clientInfo[0].DateOfBirh;
  connection.query(SELECT_CARD_QUERY, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      //cards = results;

      results.forEach(x => { var objCard = new Object();
        objCard.CardNumber = x.CardNumber, objCard.Balance = x.Balance, arrayCards.push(objCard);
      });


    }
  });

  obj.Cards = arrayCards;
  obj.Cards = obj.Cards.filter((v, i, a) => a.indexOf(v) === i);
  var arrayAccounts = [];

  connection.query(SELECT_ACCOUNT_QUERY, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      //accounts = results;

      results.forEach(x => {
        objAccount = new Object(), objAccount.AccountNumber = x.AccountNumber, objAccount.Balance = x.Balance, arrayAccounts.push(objAccount);
      });

    }
  });
  obj.Accounts = arrayAccounts;
  obj.Accounts = obj.Accounts.filter((v, i, a) => a.indexOf(v) === i);
  return res.send(obj);

});

//var objClientInfo = JSON.stringify(clientInfo);
//var objCards = JSON.stringify(cards);
//var objAccounts = JSON.stringify(accounts);

app.listen(4000);
