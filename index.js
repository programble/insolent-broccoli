#!/usr/bin/env node
'use strict';

let path = require('path');
let http = require('http');
let querystring = require('querystring');
let sqlite3 = require('sqlite3');

let config = {
  port: process.env.PORT || 3000,

  databasePath: process.env.DATABASE_PATH || ':memory:',
  databaseMode: process.env.DATABASE_MODE === 'rw'
    ? sqlite3.OPEN_READWRITE
    : sqlite3.OPEN_READONLY,

  logSQL: process.env.LOG_SQL !== 'false',
  logError: process.env.LOG_ERROR !== 'false',

  title: process.env.TITLE || 'Insolent Broccoli',
  defaultQuery: process.env.DEFAULT_QUERY || "SELECT 'world' AS hello;",
};

let db = new sqlite3.Database(config.databasePath, config.databaseMode);

function defaultResponse(res, status) {
  res.writeHead(status, {
    'Content-Type': 'text/plain',
    'Content-Length': http.STATUS_CODES[status].length + 1,
  });
  res.end(http.STATUS_CODES[status] + '\n');
}

function jsonResponse(res, obj) {
  let json = JSON.stringify(obj);
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json),
  });
  res.end(json);
}

let server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=UTF-8',
      'Content-Length': Buffer.byteLength(indexHTML),
    });
    res.end(indexHTML);
    return;
  }

  if (req.url !== '/sql' || req.method !== 'POST') {
    defaultResponse(res, 404);
    return;
  }

  if (!req.headers['content-type'].startsWith('application/x-www-form-urlencoded')) {
    defaultResponse(res, 400);
    return;
  }

  let chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => {
    let data = Buffer.concat(chunks);
    let qs = querystring.parse(data.toString());

    if (!qs.sql) {
      defaultResponse(res, 400);
      return;
    }

    if (config.logSQL) console.log(qs.sql);

    db.all(qs.sql, (err, rows) => {
      if (err) {
        if (config.logError) console.error(err.stack);
        jsonResponse(res, { error: err.message });
        return;
      }

      let keys = Object.keys(rows[0] || {});
      let values = rows.map(row => keys.map(key => row[key]));

      jsonResponse(res, { columns: keys, rows: values });
    });
  });
});

if (require.main === module) {
  server.listen(config.port, () =>
    console.log('server started on port', server.address().port)
  );
}

module.exports = server;

let indexHTML = `
<!DOCTYPE html>
<title>${ config.title }</title>

<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
<style>
  * { font-family: Menlo,Monaco,Consolas,Courier New,monospace; }
  form { margin-top: 20px; margin-bottom: 20px; }
</style>

<div class="container-fluid">
  <form>
    <div class="input-group">
      <input type="text" class="form-control" autofocus value="${ config.defaultQuery }">
      <span class="input-group-btn">
        <button class="btn btn-default" type="submit">Run</button>
      </span>
    </div>
  </form>
  <div id="console">
  </div>
</div>

<script src="//code.jquery.com/jquery-2.1.4.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>

<script>
  $(function() {
    var lastQuery = '';

    var $form = $('form');
    var $input = $('input');
    var $console = $('#console');

    $input.keyup(function(e) {
      if (e.which !== 38 && e.which !== 40) return;
      e.preventDefault();

      var currentQuery = $input.val();
      $input.val(lastQuery);
      lastQuery = currentQuery;
    });

    $form.submit(function(e) {
      e.preventDefault();

      var query = $input.val();
      $.post('/sql', { sql: query }, function(res) {
        var $panel = $('<div>')
          .addClass('panel')
          .prependTo($console);
        var $panelHeading = $('<div>')
          .addClass('panel-heading')
          .text(query)
          .appendTo($panel);
        $('<a>')
          .text('#')
          .attr('href', '#' + encodeURIComponent(query))
          .addClass('pull-right')
          .appendTo($panelHeading);

        if (res.error) {
          $panel.addClass('panel-danger');
          $('<div>')
            .addClass('panel-body')
            .appendTo($panel)
            .append($('<p>').text(res.error));
        } else {
          $panel.addClass('panel-default');

          var $div = $('<div>')
            .addClass('table-responsive')
            .appendTo($panel);
          var $table = $('<table>')
            .addClass('table table-hover table-condensed table-bordered')
            .appendTo($div);

          var $tr = $('<tr>').appendTo($table);
          res.columns.forEach(function(col) {
            $tr.append($('<th>').text(col));
          });

          res.rows.forEach(function(row) {
            var $tr = $('<tr>').appendTo($table);
            row.forEach(function(value) {
              if (value !== null) {
                $tr.append($('<td>').text(value));
              } else {
                $tr.append($('<td>'));
              }
            });
          });
        }

        lastQuery = query;
        $input.val('');
      });
    });

    if (window.location.hash) {
      $input.val(decodeURIComponent(window.location.hash.slice(1)));
    }

    $form.submit();
  });
</script>
`;
