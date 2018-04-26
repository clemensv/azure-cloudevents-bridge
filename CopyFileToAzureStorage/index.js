const storage = require("azure-storage");
const { URL } = require("url");
var path = require("path");

module.exports = function(context, req) {
  const blobService = storage.createBlobService();

  var source = req.query.source;
  if ( !source ) {
    source = req.body;
  }  

  var url = new URL(source);
  const blobName = Math.floor(Math.random() * Math.floor(1000)) + "-" + path.basename(url.pathname);
  var containerName = process.env["AZURE_STORAGE_CONTAINER_NAME"];  

  blobService.startCopyBlob(url.href, containerName, blobName, function( error, result, response ) {
    if (!error) {
      context.res = {
        status: 204
      };
    } else {
      context.log("Error " + error);
      context.res = {
        status: 500,
        body: error
      };
    }
    context.done();
  });
};
