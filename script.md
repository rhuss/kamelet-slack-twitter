

```
watch kubectl get pods, ksvcs, kameletbindings

kn broker create default

kn source kamelet list

bat slack-sink.yml

kubectl apply -f slack-sink-demo.yml

stern camel -A

kn event send --to Broker:eventing.knative.dev/v1:default  -t "tweet.translated" -f "text=Hello World"
# Switch to slack channel

ls tw/
kn source kamelet bind twitter-search-source \
   --broker default \
   --property keywords="#kduck" \
   --property accessToken=$(<tw/accessToken) \
   --property accessTokenSecret=$(<tw/accessTokenSecret) \
   --property apiKeySecret=$(<tw/apiKeySecret) \
   --property apiKey=$(<tw/apiKey)

stern -o raw twitter-search

kn service create edisplay --image gcr.io/knative-releases/knative.dev/eventing-contrib/cmd/event_display
kn trigger create event-display-trigger --broker default --sink ksvc:edisplay
stern -o raw edisplay

# Tweet test tweet

kn func create -l node -t cloudevents translate-tweet
kubectl create secret generic google-sa --from-file=google-service-account.json

kn func config
# Volumes -> Add -> Secret: google-sa -> /opt/gce
# Envs -> Add -> From specific value: GOOGLE_APPLICATION_CREDENTIALS=/opt/gce/google-service-account.json
# Envs -> Add -> From specific value: GOOGLE_PROJECT_ID=knativecon-demo

npm install --save @google-cloud/translate

idea .

export GOOGLE_PROJECT_ID=knativecon-demo
export GOOGLE_APPLICATION_CREDENTIALS=/Users/roland/Development/knative/demos/kamelet-slack-twitter/google-service-account.json

npm start &

kn event send --to-url http://localhost:8080 -f text=Hello -f id=1234 -f user.name=roland 
kn func deploy


kn trigger create tweet-trigger --filter type=org.apache.camel.event --broker default --sink ksvc:translate-tweet

# Tweet and show slack
```
