# Showcase setup

## Environment variables
```
SECRET_KEY=shhhhh
MONGODB_CONNECTION_STRING=mongodb://admin:admin@localhost:27017/local?authSource=admin
DATEBASE_ADDRESS=127.0.0.1
DATEBASE_USERNAME=service
DATEBASE_PASSWORD=service
DATEBASE_NAME=TripConnect
```

## Using Docker Compose
```sh
cd TripConnect
npm install
docker-compose tools/docker/docker-compose.yml
npm run dev
```

## Using Kubernetes
```sh
cd TripConnect
# Build tripconnect image
docker build -t tripconnect:development .
# Apply k8s manifest
kubectl apply -f tools/k8s/development-setup.yml
```
```sh
kubectl get pods
kubectl exec -it <application-pod> -- sh
```