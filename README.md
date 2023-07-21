# From Twitter to Slack

This simple integration demonstrates how easy it is to integrate 

## Setup Kamel

* Setup Minikube, Serving, Eventing from kn-box

```
cd kn-box
./00-installer.sh
minikube addons enable registry
./01-kn-serving.sh
./02-kn-eventing.sh
cd ..
```

* Install Kamel from the latest nightly

```
kubectl create ns kamel
kubens kamel
kamel install --olm=false --maven-repository=https://repository.apache.org/content/repositories/snapshots@id=apache-snapshots@snapshots --global
```

* Install an own Integration Platform in the demo namespace

```
# Create and switch to our demo namespace
kubectl create ns demo
kubens demo

# Update integration-platform.yaml with ip of the minishift registry
reg_ip=$(kubectl get svc -n kube-system registry -o jsonpath={.spec.clusterIP})
sed -i -e "s/\(.*address:\).*/\1 $reg_ip/" integration-platform.yaml

# Create integration platform in namespace to have Kamelets available
kubectl apply -f integration-platform.yaml
```

## Install integration

```
kubens demo

# Create broker
kn broker create default

# Create Sink
bat slack-sink.yml

kubectl apply -f slack-sink-demo.yml

# Create Twitter search
kn source kamelet bind twitter-search-source \
   --broker default \
   --property keywords="#kduck" \
   --property accessToken=$(<tw/accessToken) \
   --property accessTokenSecret=$(<tw/accessTokenSecret) \
   --property apiKeySecret=$(<tw/apiKeySecret) \
   --property apiKey=$(<tw/apiKey)
```

## Create function

```
# Preps
kubectl create secret generic google-sa --from-file=google-service-account.json

# Create function
kn func create -l node -t cloudevents translate-tweet
cd translate-tweet

# Install Google Translate Deps
npm install --save @google-cloud/translate

# Config access to Google Translate API
kn func config

# Volumes -> Add -> Secret: google-sa -> /opt/gce
# Envs -> Add -> From specific value: GOOGLE_APPLICATION_CREDENTIALS=/opt/gce/google-service-account.json
# Envs -> Add -> From specific value: GOOGLE_PROJECT_ID=knativecon-demo

# Edit in IDEA
idea .

# Deploy function
kn func deploy -r docker.io/rhuss

# Connect to Broker
kn trigger create tweet-trigger --filter type=org.apache.camel.event --broker default --sink ksvc:translate-tweet

# Test function with Broker
kn event send --to Broker:eventing.knative.dev/v1:default -t -f text=Hello -f id=1234 -f user.name=roland 
```

## Misc

### Connect edisplay to broker

```
kn service create edisplay --image gcr.io/knative-releases/knative.dev/eventing-contrib/cmd/event_display
kn trigger create event-display-trigger --broker default --sink ksvc:edisplay
```


### Send a test event

```
kn event send --to Broker:eventing.knative.dev/v1:default -n demo -t kamelet.slack -f "text=Another Test"
```


## OpenShift installation

```
ocpdev create -i -s -e
```

* Install Community Camel-K operator 1.9.1
* If only 1.9.0 available: Edit CSV and replace every docker image reference with `docker.io/testcamelk/camel-k:1.9.1-nightly`

## Authentication

### Slack

* https://api.slack.com/tutorials/tracks/getting-a-token

### Twitter

* https://apps.twitter.com

### Google Translate

* https://cloud.google.com/translate/docs/reference/rest/
* https://cloud.google.com/translate/docs/setup
* https://cloud.google.com/translate/docs/reference/libraries/v2/nodejs


