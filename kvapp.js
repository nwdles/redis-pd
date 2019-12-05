var redis = require('redis');
var client = redis.createClient(16323, 'redis-16323.c17.us-east-1-4.ec2.cloud.redislabs.com', { no_ready_check: true });

client.auth('U4PFZ7III5GogbXHENNwSjVFvliCLVrz', function(err, doc){
    if(err)
        throw err;
    // else if(doc === "OK"){
    //     console.log("Authenticated");
    // }
});

function Integrate(array, dx, f) {
    var a = array[0];
    var b = array[1];
    n = (b - a) / dx;
    Area = 0;
    for (i = 1; i <= n; i++) {
        x0 = a + (i - 1) * dx;
        x1 = a + i * dx;
        Ai = dx * (f(x0) + f(x1)) / 2.;
        Area = Area + Ai
    }
    return Area;
}

function f(x) {
    return -0.25 * Math.pow(x, 2) + x + 4;
}

var cluster = require('cluster');
var http = require('http');
const numCPUs = require('os').cpus().length;
const pid = process.pid;
var mydata = [];
var dx = 1;
var Total = 0;
var Integral_Value = 0;
const ab = [1, 5];
const start = ab[0];
const end = ab[1];
const interval = (end - start) / numCPUs;
const out = Array(numCPUs).fill().map((_, i) =>[start + i * interval, start + (i + 1) * interval]);

if (cluster.isMaster) {
    masterProcess();
} else {
    childProcess();
}
function masterProcess() {
    console.log(`Master ${process.pid} is running`);
    for (var i = 0; i < numCPUs; i++) {
        console.log(`Forking process  ${i}...`);
        cluster.fork();
        client.lpush(["mydata", out[i].toString()]);
    }
}

function childProcess() {
    function waitForPush() {
        client.brpop(["mydata", 0], function (err, reply) {
            res_redis = reply[1].split(",");
            var redis_array = [parseInt(res_redis[0]), parseInt(res_redis[1])];
            Integral_Value = Integrate(redis_array, dx, f);
            client.lpush(["resData", Integral_Value]);
            waitForPush();
        })
    }
    waitForPush();
}
