module.exports = function (context, request) {
    context.log('Webhook was triggered!');

    // Check if we got first/last properties
    context.log("data: " + request.rawBody);
    context.done();
}
