# Spin up azure resources
terraform init -upgrade
terraform plan -out main.tfplan
terraform apply main.tfplan

# Build docker container and push to ACR
docker-compose up -d --build
username=$(terraform output -raw acr_username)
password=$(terraform output -raw acr_password)
server=$(terraform output -raw acr_login_server)
docker login -u $username -p $password $server
docker tag filevault-nodejs $server/filevault
docker push $server/filevault
docker tag mysql:8.0.39 $server/db
docker push $server/db
docker compose down

# Apply 
echo "$(terraform output kube_config)" > ./azurek8s

tail -n +2 "azurek8s" > ./azurek8s1
sed '$d' azurek8s1 > ./azurek8s

export KUBECONFIG=./azurek8s
kubectl apply -f acr-filevault.yaml