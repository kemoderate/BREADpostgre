var express = require('express');
var router = express.Router();
const moment = require('moment')

module.exports = (pool) => {
  /* GET home page. */
  router.get('/', function (req, res, next) {
    // Pagination and search
    const params = [];
    let sortBy = req.query.sortby || 'id';
    let sortDir = req.query.sortorder || 'asc';

    if (req.query.checkId && req.query.id) {
      params.push(`id = ${req.query.id}`);
    }
    if (req.query.checkStr && req.query.string) {
      params.push(`string ILIKE '%${req.query.string}%'`);
    }
    if (req.query.checkInt && req.query.integer) {
      params.push(`integer = ${req.query.integer}`);
    }
    if (req.query.checkFloat && req.query.float) {
      params.push(`float = ${req.query.float}`);
    }
    if (req.query.checkDate && req.query.startDate && req.query.endDate) {
      params.push(`date BETWEEN '${req.query.startDate}' AND '${req.query.endDate}'`);
    }
    if (req.query.checkBol && req.query.boolean) {
      params.push(`boolean = '${req.query.boolean}'`);
    }

    let sqlCount = `SELECT COUNT(*) as total FROM entries`;
    if (params.length > 0) {
      sqlCount += ` WHERE ${params.join(' AND ')}`;
    }

    pool.query(sqlCount, [], (err, count) => {
      const rows = count.rows[0].total;
      const page = req.query.page || 1;
      const limit = 3;
      const offset = (page - 1) * limit;
      const pages = Math.ceil(rows / limit);
      // Remove duplicate url for sortby and sortorder parameters using urlsearchparams
      const queryParams = new URLSearchParams(req.query);
      queryParams.delete('sortby');
      queryParams.delete('sortorder');
      queryParams.set('page', '1');
      const url = `${req.path}?${queryParams.toString()}`;
      console.log(url)
      let sql = `SELECT * FROM entries`;
      if (params.length > 0) {
        sql += ` WHERE ${params.join(' AND ')}`;
      }
      sql += ` ORDER BY ${sortBy} ${sortDir} LIMIT ${limit} OFFSET ${offset};`;

      pool.query(sql, (err, row) => {
        if (err) {
          console.error(err);
        } else {
          res.render('index', {
            title: 'POSTGRE-Breads',
            data: row.rows,
            moment,
            page: page,
            pages: pages,
            url: url,
            query: req.query,
            sortBy: sortBy,
            sortDir: sortDir,
          });
        }
      });
    });
  });



  router.get('/add', (req, res, next) => {
    res.render('add', { title: 'Add' })
  });

  router.post('/add', (req, res, next) => {
    const string = req.body.string
    const integer = req.body.integer
    const float = req.body.float
    const date = req.body.date
    const boolean = req.body.boolean;
    const sql = `INSERT INTO entries (string, integer, float, date, boolean) VALUES ('${string}', ${integer}, ${float}, '${date}', '${boolean}')`;

    pool.query(sql, (err) => {
      if (err) {
        console.error(err)
      } else {
        console.log('ADDING DATA SUCCESS')
        res.redirect('/')
      }
    });
  });

  router.get('/edit/:id', (req, res, next) => {
    const id = req.params.id
    const sql = `SELECT * FROM entries WHERE id = ${id}`
    pool.query(sql, (err, row) => {
      if (err) {
        console.error(err)
      } else {
        res.render('edit', { title: 'Edit', data: row.rows[0], moment })
      }
    });
  })

  router.post('/edit/:id', (req, res, next) => {
    const id = req.params.id
    const string = req.body.string
    const integer = req.body.integer
    const float = req.body.float
    const date = req.body.date
    const boolean = req.body.boolean
    let sql = `UPDATE entries SET string= '${string}', integer = ${integer}, float = ${float},date = '${date}', boolean = ${boolean} WHERE id = ${id}`
    pool.query(sql, (err) => {
      if (err) {
        console.error(err)
      } else {
        console.log('EDIT DATA SUCCESS')
        res.redirect('/')
      }
    })
  })

  router.get('/delete/:id', (req, res, next) => {
    const id = req.params.id
    const sql = `DELETE FROM entries WHERE id = ${id}`
    pool.query(sql, (err) => {
      if (err) {
        console.error(err)
      } else {
        console.log('DELETE DATA SUCCESS')
        res.redirect('/')
      }
    })
  })
  return router
}

// module.exports = router;