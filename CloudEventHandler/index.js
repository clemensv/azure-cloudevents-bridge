var Twitter = require("twitter");
var https = require("https");
var url = require("url");
var msRestAzure = require("ms-rest-azure");
var vision = require("azure-cognitiveservices-vision");
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials

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
    "Type: " + request.body.eventType + "\n" +
    "ID: " + request.body.eventID + "\n" +
    "Time: " + request.body.eventTime + "\n";
  
  context.log("Event received: " + request.body.eventType + ", " + request.body.eventTime);

  if (request.body.eventType == "Microsoft.Storage.BlobCreated" || 
      request.body.eventType == "aws.s3.object.created") {

        // we're assuming these are pics
        var objurl = "";

        if ( request.body.eventType == "Microsoft.Storage.BlobCreated") {
          objurl = request.body.data.url;
        } else { // aws case
          objurl = "https://s3.amazonaws.com/"+  request.body.data.bucket.name + "/" + request.body.data.object.key;
        }

    var tweetPicture = function() {
        https.get(url.parse(objurl), function(res) {

        context.log("Image retrieved");
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
                context.log("Media uploaded");
                // Lets tweet it
                var status = {
                  status: statusString,
                  media_ids: media.media_id_string // Pass the media id string
                };

                client.post("statuses/update", status, function( error, tweet, response ) {
                  if (error) {
                    context.log( JSON.stringify(error) );
                  } else {
                    context.log("Tweet sent: " + response.status);
                  }
                  context.done();
                });
              } else {
                context.log( JSON.stringify(error) );
                context.done();
              }
            });
          });
      });
    }

    let key = process.env["AZURE_VISION_APIKEY"];
    if ( key ) {
        let credentials = new CognitiveServicesCredentials(process.env["AZURE_VISION_APIKEY"]);
        let vclient = new vision.ComputerVisionAPIClient(credentials, "westeurope");
        vclient.analyzeImage(objurl, { visualFeatures: ["Categories", "Tags", "Description"] }, function (err, result, request, response) {
            if ( !err ) {
              statusString = statusString + "ACV:\n";
              result.description.captions.forEach( function(c) {
                statusString = statusString + "   \"" + c.text + "\" (confidence "+Math.floor(c.confidence*1000)/1000+")\n"
              });
              statusString = statusString + "   tags: ";
              result.description.tags.forEach( function(t) {
                statusString = statusString + t + " "
              });
              if ( statusString.length > 260 ) {
                statusString = statusString.substr(0,260);
              }
            }
            tweetPicture();
        });
    } else {
      tweetPicture();
    }

  } else {
    client.post(
      "statuses/update",
      {
        status: statusString
      },
      function(error, tweet, response) {
        if (error) {
          context.log( JSON.stringify(error) );
        } else {
          context.log("Tweet sent: " + response.status);
        }
        context.done();
      }
    );
  }  
};
