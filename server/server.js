// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const got = require('got')
const MongoClient = require('mongodb').MongoClient;

// Declare a route
fastify.post('/electricity/billedUnits', async (request, reply) => {
    collection = await connectDB();
    try {
        var usage = prepareUsageData(request);
        const options = { upsert: true };
        await collection.updateOne({ _id: usage.accountNumber }, { $set: usage }, options);
    } catch (err) {
        throw err;
    }
    //client.close();

    return '201 - Created';
});


fastify.get('/electricity/billedUnits', async (request, reply) => {
    collection = await connectDB();
    let result = null;
    try {
        result = await collection.findOne({ _id: request.headers.accountnumber });
    } catch (err) {
        throw err;
    }

    return result;
});



// Run the server!
const start = async () => {
    try {
        await fastify.listen(3000)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()

let connectedInstance = null;
function prepareUsageData(request) {
    let usage = {};
    usage['lastUpdatedTimestamp'] = new Date();
    usage['lastBilledUnits'] = request.body.billedUnits;
    usage['alias'] = request.body.alias;
    usage['accountNumber'] = request.body.accountNumber;
    usage['lastCalculatedBill'] = request.body.lastCalculatedBill;
    return usage;
}

async function connectDB() {
    if (connectedInstance) {
        return connectedInstance;
    }
    try {
        const URI = process.env.MONGO_URI;
        const client = await MongoClient.connect(URI, { useUnifiedTopology: true });
        const electricityDB = client.db('electricity');
        connectedInstance = electricityDB.collection('usage')
    } catch (err) {
        throw err;
    }
    return connectedInstance;
}
