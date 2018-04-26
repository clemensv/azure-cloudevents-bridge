var Twitter = require("twitter");
var https = require("https");
var url = require("url");

module.exports = function(context, request) {

  if ( request.method !== 'POST' ) {
    context.res = {
      status: 405
    };
    context.done();
    return;
  }

  var client = new Twitter({
    consumer_key: process.env["TWITTER_CONSUMER_KEY"],
    consumer_secret: process.env["TWITTER_CONSUMER_SECRET"],
    access_token_key: process.env["TWITTER_ACCESS_TOKEN_KEY"],
    access_token_secret: process.env["TWITTER_ACCESS_TOKEN_SECRET"]
  });

  var statusString =
    "Event Type:" + request.body.eventType + "\n" +
    "Event ID:" + request.body.eventID + "\n" +
    "Event Time:" + request.body.eventTime + "\n";
  
  if (request.body.eventType == "Microsoft.Storage.BlobCreated" || 
      request.body.eventType == "aws.s3.object.created") {

        // we're assuming these are pics
        var objurl = "";

        if ( request.body.eventType == "Microsoft.Storage.BlobCreated") {
          objurl = request.body.data.url;
        } else { // aws case
          objurl = "https://s3.amazonaws.com/"+  request.body.data.bucket.name + "/" + request.body.data.object.key;
        }
    statusString = statusString + objurl;

    https.get(url.parse(objurl), function(res) {
      var data = [];

      res.on("data", function(chunk) {
          data.push(chunk);
        })
        .on("end", function() {
          //at this point data is an array of Buffers
          //so Buffer.concat() can make us a new Buffer
          //of all of them together
          var buffer = Buffer.concat(data);

          client.post("media/upload", { media: buffer }, function(error, media, response ) {
            if (!error) {
              // Lets tweet it
              var status = {
                status: statusString,
                media_ids: media.media_id_string // Pass the media id string
              };

              client.post("statuses/update", status, function( error, tweet, response ) {
                if (error) throw error;
              });
            } else {
              if (error) throw error;
            }
          });
        });
    });
  } else {
    client.post(
      "statuses/update",
      {
        status: statusString
      },
      function(error, tweet, response) {
        if (error) throw error;
      }
    );
  }
  context.done();
};
