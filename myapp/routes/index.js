var express = require('express');
var router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'datadb',
  password: '12345',
  port: 5432,
});

/* GET home page. */
router.get('/', function(req, res, next) {
// Filters or Searching
const params = [];
  
// Filter ID
if (req.query.idCheckbox && req.query.id) {
 params.push(`id = '${req.query.id}'`);
}

// Filter string
if (req.query.stringCheckbox && req.query.string) {
 params.push(`string LIKE '%' || '${req.query.string}' || '%'`);
}

// Filter integer
if (req.query.integerCheckbox && req.query.integer) {
 params.push(`integer = '${req.query.integer}'`);
}

// Filter float
if (req.query.floatCheckbox && req.query.float) {
 params.push(`float = '${req.query.float}'`);
}

// Filter date
if (req.query.startDateCheckbox && req.query.endDateCheckbox && req.query.startDate && req.query.endDate) {
 params.push(`date BETWEEN '${req.query.startDate}' AND '${req.query.endDate}'`);
}

// Filter boolean
if (req.query.booleanCheckbox && (req.query.boolean === 'true' || req.query.boolean === 'false')) {
 params.push(`boolean = '${req.query.boolean}'`);
}

// Pagination
let sqlCount = `SELECT count(*) as total FROM entries`;
if (params.length > 0) {
 sqlCount += ` WHERE ${params.join(' AND  ')}`;
}
pool.query(sqlCount, [], (err, row) => {
 if (err) {
   console.error(err);
   return next(err);
 }
 const rows = row ? row.total : 0;
 const page = req.query.page || 1;
 const limit = 3;
 const offset = (page - 1) * limit;
 const pages = Math.ceil(rows / limit);
 const url = req.url == '/' ? '/?page=1' : req.url

 let sql = `SELECT * FROM entries`;
 if (params.length > 0) {
   sql += ` WHERE ${params.join(' AND  ')}`;
 }
 sql += ` LIMIT ${limit} OFFSET ${offset}`;

 pool.query(sql, [], (err, rows) => {
   if (err) {
     console.error(err);
     return next(err);
   }
  
   res.render('index', { title: 'SQLITE-Bread', data: rows.rows , pages, page, query: req.query, url });
 });
});
});

module.exports = router;
