var redis = require('redis');
var client = redis.createClient(16323, 'redis-16323.c17.us-east-1-4.ec2.cloud.redislabs.com', { no_ready_check: true });

client.auth('U4PFZ7III5GogbXHENNwSjVFvliCLVrz', function(err, doc){
    if(err)
        throw err;
    // else if(doc === "OK"){
    //     console.log("Authenticated");
    // }
});

client.on('connect', function () {
    console.log('Connected to Redis...');
});
let total = 0;

function waitForPush() {
    client.brpop(["resData", 0], function (err, reply) {
        var result = parseFloat(reply[1]);
        console.log(result);
        total += result;
        console.log("Total value is  " + total);
        waitForPush();
    })
}
waitForPush();
