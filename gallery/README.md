# gallery

### Instructions
1. Build a Docker image and push it to a registry. In this example, we'll use Dockerhub.
```
docker build . -t myrepo/gallery:latest
docker push myrepo/gallery:latest
```

2. Create a Cloud Object Storage instance in IBM Cloud, create a new bucket, and add some JPGs to the bucket.
3. Using the IBM Cloud CLI, create a Code Engine project in IBM Cloud or select an existing one.
```
ibmcloud ce project create -n my-project
ibmcloud ce project select -n my-project
```

4. Create a new application with your container image in Dockerhub (Code Engine uses the `latest` tag by default). Provide `GALLERY_BUCKET_NAME` as an environment variable with the name of your bucket.
```
ibmcloud ce app create -n gallery -i myrepo/gallery --env GALLERY_BUCKET_NAME=my-gallery-bucket
```

5. Bind your application to your Cloud Object Storage instance
```
ibmcloud ce app bind -n gallery --si my-object-storage
```