var redis = require('redis');
var client = redis.createClient(16323, 'redis-16323.c17.us-east-1-4.ec2.cloud.redislabs.com', { no_ready_check: true });

client.auth('U4PFZ7III5GogbXHENNwSjVFvliCLVrz', function(err, doc){
    if(err)
        throw err;
});

let total = 0;
var cluster = require('cluster');
var http = require('http');
const numCPUs = require('os').cpus().length;
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
        
        client.lpush(["mydata", out[i].toString()]);
    }cluster.fork();
}

function childProcess() {
    console.log('Answers:');
    waitForRead();
}

function waitForRead()
{
    client.brpop(["resData", 0], function (err, reply) {
        var result = parseFloat(reply[1]);
        console.log(result);
        total += result;
        console.log("Total value is  " + total);
        waitForRead();
    })
}
