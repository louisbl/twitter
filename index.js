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
    consumer_key: 'xeSgE5wySSZguNGibwY08SN38',
    consumer_secret: 'uEjKDfatGbjFqaduhPjkxqveR63qAmcO0YtrbnB6LHOFHZ9o2R',
    access_token_key: '705541956-lgS1a32TVyxcoB0gAgknDxcCsJ9vacJQfpOpGrKM',
    access_token_secret: 'j0OF7N2mKwSDVFJVY1K99lATalz9LT8ke1wVYqTyuZAZi'
};

let clientTwitter = new Twitter(cfg);

//création du serveur et de socketIO
const server = http.createServer();
const socketIo = io(server);

server.on("request",(request,response) => {

    //route principal
    if(request.url === "/")
    {
        //home -> index.html
        const fileSrc = fs.createReadStream("./index.html", {'encoding': 'utf-8'});
        fileSrc.setEncoding('utf-8');
        fileSrc.pipe(response);
    }


});

//lancement sur port 5000
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
        //passage dans les différents transform avant d'afficher les tweets
        tw.pipe(errorTransform).pipe(tweetTransform).pipe(socketStream);
    });

    //arrete l'envoi des tweets
    socket.on('stop', () => {
        tw.destroy();
    });

    socket.on('retweet', (data) => {
        let tweetId = data.id;
        //requetes pour retweeter avec le compte rentré plus haut
        clientTwitter.post('statuses/retweet/' + tweetId, function(error, tweet, response) {
            if (!error) {
                console.log("Retweet");
            }
        });
    });

});

//previens le client si il y a une erreur sinon continue
const errorTransform = new Transform
({
    readableObjectMode: true,
    writableObjectMode: true,

    transform(tweet, _, callback )
    {
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

//traitement sur le tweet pour filtrer les tweets qui n'ont pas de localisation
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

//ecriture du tweet traité
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
        callback();
    }
});


