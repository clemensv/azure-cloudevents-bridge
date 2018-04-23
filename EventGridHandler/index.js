
const http = require("http");
const { URL } = require("url");

module.exports = function (context, eventGridEvent) {

    const url = new URL("https://cvcloudevents.azurewebsites.net/api/CloudEventHandler?code=5z5tTGixS7/QHmI8QvFaIDqVjSLVex/fAZh75oYPQg9Lg8o3ShWEsw==&clientId=default");

    context.log("Forwarding " + eventGridEvent.id);

    var cloudEvent = {
        eventID: eventGridEvent.id,
        eventTime: eventGridEvent.eventTime,
        eventType: eventGridEvent.eventType,
        eventTypeVersion: eventGridEvent.dataVersion,
        cloudEventsVersion: "0.1",
        contentType: eventGridEvent.contentType,
        data: eventGridEvent.data,
        source: eventGridEvent.topic + '#' + eventGridEvent.subject
    }

    var jsonCloudEvent = JSON.stringify(cloudEvent);

    var post_options = {
        host: url.host,
        port: url.port,
        path: url.pathname + '?' + url.searchParams,
        method: 'POST',
        headers: {
            'Content-Type': 'application/cloudevents+json',
            'Content-Length': Buffer.byteLength(jsonCloudEvent)
        }
    };

    context.log("CloudEvent: " + jsonCloudEvent);

    const req = http.request(post_options, (res) => {
        // success
        context.log("Status: " + res.statusCode)
        context.done();
    });

    req.on('error', (e) => {
        // error
        context.log("Status: " + e)
        context.done();
    });

    // write data to request body
    req.write(jsonCloudEvent);
    req.end();
};
