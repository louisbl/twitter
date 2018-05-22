const io = require("socket.io");
const http = require("http");
const fs = require("fs");
const { Transform, Writable } = require("stream");
const TwitterStream = require("./TwitterStream");
const Twitter = require('twitter');

// utilisation de mapbox pour transformer une ville en coordonnées
let MapboxClient = require('mapbox');


let client = new MapboxClient('pk.eyJ1IjoidGNoYW5ldCIsImEiOiJjamd3MzJ4NHYxcGRoMndvZnpicXNndWR6In0.6ywbnPqqgi84ElYQUh32Sw');


//Rentrer ses infos
const cfg = {
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: ''
};

let clientTwitter = new Twitter(cfg);

const stringify = new Transform({
    writableObjectMode : true,

    transform(chunk, encoding, callback)
    {
        this.push(JSON.stringify(chunk)+ '\n');
        callback();
    }
});

const server = http.createServer();
const socketIo = io(server);

server.on("request",(request,response) => {

    if(request.url === "/")
    {
        //home
        const fileSrc = fs.createReadStream("./index.html", {'encoding': 'utf-8'});
        fileSrc.setEncoding('utf-8');
        fileSrc.pipe(response);
    }


});

server.listen(5000);

socketIo.on("connection", socket => {
    console.log("Serveur lancé");
    socket.emit('connected', 'Serveur connecté');

    socket.on('client_connected', function(data)  {
        console.log(data);
    });

    let tw;

    socket.on('filtre', (data) => {
        console.log(data);
        tw = new TwitterStream(cfg,data);
        tw.pipe(errorTransform).pipe(tweetTransform).pipe(socketStream);
    });

    socket.on('stop', () => {
        tw.destroy();
    });

    socket.on('retweet', (data) => {
        console.log(data.id)

        let tweetId = data.id;
        clientTwitter.post('statuses/retweet/' + tweetId, function(error, tweet, response) {
            if (!error) {
                console.log(tweet);
            }
            console.log(error)
        });
    });

});

const errorTransform = new Transform
({
    readableObjectMode: true,
    writableObjectMode: true,

    transform(tweet, _, callback )
    {
        console.log(tweet.error);
        if(tweet.error)
        {
            socketIo.emit("error","Une erreur est survenue, veuillez réessayer de rafraichir la page dans quelques instants")
        }
        else
        {
            this.push(tweet.data)
        }

        callback();
    }
})

const tweetTransform = new Transform
({
    readableObjectMode: true,
    writableObjectMode: true,

    transform(tweet, _, callback )
    {
        if(tweet.user !== undefined && tweet.user !== null && tweet.user.location !== undefined && tweet.user.location !== null )
        {
            this.push(tweet)
        }

        callback();
    }
})

const socketStream = new Writable
({
    objectMode: true,

    write(tweet, _, callback)
    {

            //envoie au client les coordonnées géo de celui qui à twitté
            client.geocodeForward(tweet.user.location,{})
              .then(function(res) {

                // res is the http response, including: status, headers and entity properties
                let data = res.entity; // data is the geocoding result as parsed JSON

                  if(data !== undefined && data.features !== undefined && data.features[0] !== undefined)
                  {
                      socketIo.emit('tweet', tweet, data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]);

                  }
              })
              .catch(function(err) {
                console.log(err)
              });


        //socketIo.emit('tweet', tweet);
        callback();
    }
});


