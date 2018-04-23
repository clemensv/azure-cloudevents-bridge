# Azure CloudEvents Bridge

This project implements an experimental generic bridge to map Azure Event Grid events 
into CloudEvents v0.1 events. The project uses the [Azure Functions Event Grid binding](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-event-grid). 
Please follow the [Azure Functions developer guide](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference) for information on how to deploy the code.

For the hosting App Service, the [WEBSITE_NODE_DEFAULT_VERSION](https://docs.microsoft.com/en-us/azure/azure-functions/functions-app-settings#websitenodedefaultversion) setting must
be set to "8.9.4". [Also see here](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#node-version-and-package-management).

The project implements two functions:

* EventGridHandler is the handler for the Event Grid Event. Change the `url` value to the HTTP(S) target address to which this instance
  shall forward the event. This could also be picked up from config; right now it's hardwired for simplicity.
  
* CloudEventHandler is a generic WebHook that writes the received content body into the log. 

