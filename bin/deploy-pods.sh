# Spin up azure resources
terraform init -upgrade
terraform plan -out main.tfplan
terraform apply main.tfplan

export TENANT_ID=$(terraform output -raw tenant_id)
export CLIENT_ID=$(terraform output -raw client_id)

# Build docker container and push to ACR
docker compose build
username=$(terraform output -raw acr_username)
password=$(terraform output -raw acr_password)
server=$(terraform output -raw acr_login_server)
docker login -u $username -p $password $server
docker tag filevault-nodejs $server/filevault
docker push $server/filevault

# Apply 
echo "$(terraform output kube_config)" > ./azurek8s

tail -n +2 "azurek8s" > ./azurek8s1
sed '$d' azurek8s1 > ./azurek8s

export KUBECONFIG=./azurek8s
envsubst < kubernetes/azure-secrets.yaml | kubectl apply -f -
kubectl apply -f kubernetes/mysql-initdb-configmap.yaml
kubectl apply -f kubernetes/db-deployment.yaml
kubectl apply -f kubernetes/filevault-deployment.yaml