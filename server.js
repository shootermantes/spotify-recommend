var unirest = require('unirest');
var express = require('express');
var events = require('events');
var app = express();

app.use(express.static('public'));

/*  Spotify API */

var getFromApi = function(endpoint, args) {
    var emitter = new events.EventEmitter();
    unirest.get('https://api.spotify.com/v1/' + endpoint)
           .qs(args)
           .end(function(response) {
                if (response.ok) {
                    emitter.emit('end', response.body);
                }
                else {
                    emitter.emit('error', response.code);
                }
            });
    return emitter;
};


/*    Server setup    */

app.get('/search/:name', function(req, res) {
    var searchReq = getFromApi('search', {
        q: req.params.name,
        limit: 1,
        type: 'artist'
    });

    searchReq.on('end', function(item) {
        var artist = item.artists.items[0];
        unirest.get('https://api.spotify.com/v1/artists/' + artist.id + '/related-artists')
               .end(function(response){
                    console.log(response.ok)
                    if (response.ok){
                        artist.related = response.body.artists;
                        res.json(artist);
                    } else {
                        res.sendStatus(404);
                    };
               });

        //console.log(item.artists.items[0].id)
    });

    searchReq.on('error', function(code) {
        res.sendStatus(code);
    });
});

app.listen(process.env.PORT || 8080);