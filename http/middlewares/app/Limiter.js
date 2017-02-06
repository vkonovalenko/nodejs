var RateLimit = require('express-rate-limit');
var limiter = new RateLimit({
//    windowMs: 15*60*1000, // 15 minutes 
    windowMs: 1000, // per second
    max: Config.get('limit_req_per_second'), // limit each IP to 100 requests per windowMs 
    delayMs: 0 // disable delaying - full speed until the max limit is reached 
});
App.app().use(limiter);