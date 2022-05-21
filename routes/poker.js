var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req,res,next) {
  res.render('join');
})

router.get('/:room', function(req, res, next) {
  res.render('poker');
});

module.exports = router;
