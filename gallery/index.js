const Express = require("express")
const IBMCOS = require('ibm-cos-sdk')

const COS_ENDPOINT = "s3.us-south.cloud-object-storage.appdomain.cloud"
const GALLERY_BUCKET_NAME = process.env.GALLERY_BUCKET_NAME

if (GALLERY_BUCKET_NAME === undefined) {
    throw("GALLERY_BUCKET_NAME must be set")
}

// Setup Express server
const server = Express()
const port = process.env.PORT || 8080

// Look for COS Credentials, setup COS Client
let cosCredentials, cosClient
const ceServices = process.env.CE_SERVICES
if (ceServices !== undefined) {
    let cosCredentialSet = JSON.parse(ceServices)["cloud-object-storage"]
    if (cosCredentialSet !== undefined) {
        cosCredentials = cosCredentialSet[0].credentials
        cosClient = new IBMCOS.S3({
            endpoint: `https://${COS_ENDPOINT}`,
            apiKeyId: cosCredentials.apikey,
            serviceInstanceId: cosCredentials.resource_instance_id,
            signatureVersion: "iam",
        });
        console.log("COS client initialized!")
    }
}

// Setup backend
server.get("/pictureUrls", (req, res) => {
    if (!cosClient) return res.status(500).send("Object storage not configured")
    cosClient.listObjects({
        Bucket: GALLERY_BUCKET_NAME,
    }).promise().then(data => {
        let pictureUrls = [];
        for (var object of data.Contents) {
            if (object.Key.includes(".jpeg") || object.Key.includes(".jpg")) {
                pictureUrls.push(`https://${GALLERY_BUCKET_NAME}.${COS_ENDPOINT}/${object.Key}`)
            }
        }
        res.status(200).json({ pictureUrls })
    }).catch(err => {
        res.status(500).send(err)
    });
})
server.get("/uploadSupport", (req, res) => {
    if (!cosCredentials) return res.status(200).json({ uploads_supported: false })
    if (cosCredentials.iam_role_crn && 
        (cosCredentials.iam_role_crn.includes("Writer") || cosCredentials.iam_role_crn.includes("Manager"))
    ) return res.status(200).json({ uploads_supported: true })
    res.status(200).json({ uploads_supported: false })
})

// Setup frontend
server.use(Express.static('public'))
server.get('/', (req, res) => res.sendFile('./public/index.html'))

server.listen(port, () => console.log(`Express listening on ${port}...`))
