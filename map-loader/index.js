const fs = require("fs")
const { MongoClient } = require("mongodb")
const IBMCOS = require('ibm-cos-sdk')
const Papaparse = require('papaparse')
const { v4: uuidv4 } = require('uuid')

const COS_ENDPOINT = "s3.us-south.cloud-object-storage.appdomain.cloud"

async function run() {

    if (process.env.CE_SERVICES === undefined) {
        throw ("Requires service bindings")
    }

    let ceServices = JSON.parse(process.env.CE_SERVICES)

    if (ceServices["databases-for-mongodb"] === undefined) {
        throw("Requires Mongo credentials")
    }
    if (ceServices["cloud-object-storage"] === undefined) {
        throw("Requires COS credentials")
    }

    let mongoCreds = JSON.parse(ceServices["databases-for-mongodb"][0].credentials.connection).mongodb
    fs.writeFileSync(mongoCreds.certificate.name, mongoCreds.certificate.certificate_base64, { encoding: "base64" })
    let mongoClient = await MongoClient.connect(mongoCreds.composed[0], {
        tls: true,
        tlsCAFile: mongoCreds.certificate.name,
        useUnifiedTopology: true,
    });
    let db = mongoClient.db(mongoCreds.database)

    let cosCreds = ceServices["cloud-object-storage"][0].credentials;
    let cosClient = new IBMCOS.S3({
        endpoint: `https://${COS_ENDPOINT}`,
        apiKeyId: cosCreds.apikey,
        serviceInstanceId: cosCreds.resource_instance_id,
        signatureVersion: "iam",
    });


    let csvString
    await cosClient.getObject({
        Bucket: process.env.COS_BUCKET, 
        Key: process.env.COS_FILE,
    }).promise().then((data) => {
        if (data != null) csvString = Buffer.from(data.Body).toString()
    })
    let data = Papaparse.parse(csvString, {
        header: true
    }).data

    let mongoDocs = []
    for (i = 0; i < parseInt(process.env.NUM); i++) {
        let place = data[i]
        mongoDocs.push({
            guid: uuidv4(),
            map: 'a906abdf-6cd0-4e04-8cfb-834d1301bcd0',
            user: 'd588c09d-81bf-486b-a714-54acab2fcf61',
            location: {
                type: "Point",
                 // TODO: Fix issues with Mongo location syntax
                coordinates: [parseFloat(place.lat), parseFloat(place.lng)],
            },
            metadata: {
                title: place.city,
                description: `Population: ${place.population}`
            }
        })        
    }

    db.collection("places").insertMany(mongoDocs).then(result => {
        console.log(result)
        mongoClient.close()
    }).catch(err => {
        console.log(err)
        mongoClient.close()
    })
}

run()

