
const https = require("https");
const { URL } = require("url");

module.exports = function (context, eventGridEvent) {

    // If using Azure Functions for the target, replace {key} with the access key and replace {app} with the function app name
    var urls = JSON.parse(process.env["TARGET_URLS"]);
    var p = Math.floor(Math.random() * Math.floor(urls.length));
    
    const url = new URL(urls[p]);

    context.log("Forwarding " + eventGridEvent.id + " to " + url);

    var cloudEvent = {
        eventID: eventGridEvent.id,
        eventTime: eventGridEvent.eventTime,
        eventType: eventGridEvent.eventType,
        cloudEventsVersion: "0.1",
        contentType: eventGridEvent.contentType,
        data: eventGridEvent.data,
        source: eventGridEvent.topic + '#' + eventGridEvent.subject
    }

    if (eventGridEvent.dataVersion && eventGridEvent.dataVersion.length > 0) {
        cloudEvent.eventTypeVersion = eventGridEvent.dataVersion;
    }

    var jsonCloudEvent = JSON.stringify(cloudEvent);

    var post_options = {
        host: url.host,
        port: url.port,
        path: url.pathname + '?' + url.searchParams,
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/cloudevents+json',
            'Content-Length': Buffer.byteLength(jsonCloudEvent)
        }
    };

    context.log("CloudEvent: " + jsonCloudEvent);

    const req = https.request(post_options, (res) => {
        // success
        context.log("Status: " + res.statusCode)
        context.done();
    });

    req.on('error', (e) => {
        // error
        context.log("Status: " + e)
        context.done(e);
    });

    // write data to request body
    req.write(jsonCloudEvent);
    req.end();
};
