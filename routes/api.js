var express = require('express');
var router = express.Router();
var fs = require('fs');

// var config = fs.readFileSync('./app_config.json', 'utf8');
// config = JSON.parse(config);
//
// router.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
//
//
// /* GET env variable */
// router.get('/env', function(req, res, next) {
//   	var env = {
//   		"AWS_REGION": process.env.AWS_REGION || config.AWS_REGION,
//   		"AWS_COGNITO_USERPOOLID": process.env.AWS_COGNITO_USERPOOLID || config.AWS_COGNITO_USERPOOLID,
//     	"AWS_COGNITO_CLIENTID": process.env.AWS_COGNITO_CLIENTID || config.AWS_COGNITO_CLIENTID,
//     	"AWS_COGNITO_IDENTITY_POOL_ID": process.env.AWS_COGNITO_IDENTITY_POOL_ID || config.AWS_COGNITO_IDENTITY_POOL_ID,
// 	    "AWS_DYNAMODB_TABLENAME": process.env.AWS_DYNAMODB_TABLENAME || config.AWS_DYNAMODB_TABLENAME
//   	};
// 	res.json(env);
// });

module.exports = router;
