var path = require('path');
var R = require('ramda');
var express = require('express');
var morgan = require('morgan');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3');

var config = {
  port: process.env.PORT || 3000,
  databasePath: process.env.DATABASE_PATH || 'example.sqlite',
  databaseMode: process.env.DATABASE_MODE === 'rw'
    ? sqlite3.OPEN_READWRITE
    : sqlite3.OPEN_READONLY,
  morganFormat: process.env.MORGAN_FORMAT || 'tiny',
  logSQL: process.env.LOG_SQL === 'true',
};

var app = express();
var db = new sqlite3.Database(config.databasePath, config.databaseMode);

app.use(morgan(config.morganFormat));
app.use(serveStatic(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/sql', function(req, res, next) {
  if (!req.body.sql) {
    res.status(400);
    res.json({ error: 'no sql' });
    return;
  }

  if (config.logSQL) {
    console.log('SQL:', req.body.sql);
  }

  db.all(req.body.sql, function(err, rows) {
    res.status(200);
    if (err) {
      console.error(err.stack);
      return res.json({ error: err.message });
    }

    var columns = R.keys(rows[0]);
    var values = R.map(R.values, rows);

    res.json({
      columns: columns,
      rows: values,
    });
  });
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.json({ error: 'internal server error' });
});

if (require.main === module) {
  var server = app.listen(config.port, function() {
    console.log('server started on port', server.address().port);
  });
}

module.exports = app;
