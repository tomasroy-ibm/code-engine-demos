# todo

### Instructions
1. Build a Docker image and push it to a registry. In this example, we'll use Dockerhub.
```
docker build . -t myrepo/todo:latest
docker push myrepo/todo:latest
```

2. Create a Databases for MongoDB instance in IBM Cloud.
3. Using the IBM Cloud CLI, create a Code Engine project in IBM Cloud or select an existing one.
```
ibmcloud ce project create -n my-project
ibmcloud ce project select -n my-project
```

4. Create a new application with your container image in Dockerhub (Code Engine uses the `latest` tag by default).
```
ibmcloud ce app create -n todo -i myrepo/todo
```

5. Bind your application to your MongoDB instance
```
ibmcloud ce app bind -n todo --si my-mongo-database
```