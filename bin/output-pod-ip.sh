export KUBECONFIG=./azurek8s
echo "IP address: $(kubectl get service/filevault -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"