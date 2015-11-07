# Insolent Broccoli

Small web interface to SQLite.

[Demo](http://insolent-broccoli.app.cmcenroe.me)

## Install

```
npm install -g insolent-broccoli
```

## Usage

```
insolent-broccoli
```

## Configuration

Environment variable | Default                    | Description
-------------------- | -------------------------- | -----------
`PORT`               | 3000                       | HTTP port
`DATABASE_PATH`      | `:memory:`                 | SQLite database path
`DATABASE_MODE`      | `r`                        | SQLite mode, `rw` for read/write
`LOG_SQL`            | `true`                     | Log SQL queries
`LOG_ERROR`          | `true`                     | Log query errors
`TITLE`              | Insolent Broccoli          | Page title
`DEFAULT_QUERY`      | `SELECT 'world' AS hello;` | Initial query

## License

Copyright © 2015, Curtis McEnroe <curtis@cmcenroe.me>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
