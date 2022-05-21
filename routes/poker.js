var express = require('express');
var path = require('path')
var router = express.Router();

/* GET home page. */
router.get('/', function(req,res,next) {
  //res.sendFile(path.join(__dirname, 'join.html'));
  res.render('join');
})

router.get('/:room', function(req, res, next) {
  //res.sendFile(path.join(__dirname,'poker.html'));
  res.render('poker');
});

module.exports = router;
