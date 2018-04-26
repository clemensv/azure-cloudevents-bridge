var Flickr = require('flickr-sdk');

module.exports = function (context, req) {
    
    var flickr = new Flickr(process.env["FLICKR_API_KEY"]);
    
    flickr.photosets.getPhotos({
        user_id : process.env["FLICKR_USER_ID"], 
        photoset_id : process.env["FLICKR_PHOTOSET_ID"]
    }).then(function(res) {
        var l = res.body.photoset.photo.length;
        var p = Math.floor(Math.random() * Math.floor(l));
        flickr.photos.getSizes({ photo_id : res.body.photoset.photo[p].id }).then(
            function(resp){
                var pic = resp.body.sizes.size.find(element => { 
                    return element.width >= 1024; 
                }); 
                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: pic.source
                };
                context.done();
            }).catch(function(err){
                context.res = {
                    status: 400,
                    body: "Please pass a name on the query string or in the request body"
                };
                context.done();
            });       
        
    }).catch(function(err){ 
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
        context.done();
    });
    
};