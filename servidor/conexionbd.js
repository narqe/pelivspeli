var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  port     : 3306,
  user     : 'root',
  password : '569842aa',
  database : 'competencias',
});

connection.connect(
  function(error){
    if(error){ 
      console.log(error.stack)
    } else {
      console.log('Conectado como id '+connection.threadId)
    }
  }
);

module.exports = connection;