module.exports = function (context, data) {
    context.log('Webhook was triggered!');

    // Check if we got first/last properties
    context.log("data: " + data);
    context.done();
}
