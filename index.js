const io = require("socket.io");
const http = require("http");
const fs = require("fs");
const { Transform, Writable } = require("stream");
const TwitterStream = require("./TwitterStream");

// utilisation de mapbox pour transformer une ville en coordonnées
let MapboxClient = require('mapbox');


let client = new MapboxClient('pk.eyJ1IjoidGNoYW5ldCIsImEiOiJjamd3MzJ4NHYxcGRoMndvZnpicXNndWR6In0.6ywbnPqqgi84ElYQUh32Sw');


const cfg = {
    consumer_key: 'xeSgE5wySSZguNGibwY08SN38',
    consumer_secret: 'uEjKDfatGbjFqaduhPjkxqveR63qAmcO0YtrbnB6LHOFHZ9o2R',
    access_token_key: '705541956-lgS1a32TVyxcoB0gAgknDxcCsJ9vacJQfpOpGrKM',
    access_token_secret: 'j0OF7N2mKwSDVFJVY1K99lATalz9LT8ke1wVYqTyuZAZi'
};

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
        tw.pipe(socketStream);
    });

    socket.on('stop', () => {
        tw.destroy();
    });

});


const socketStream = new Writable
({
    objectMode: true,

    write(tweet, _, callback)
    {
        if(tweet.user.location !== undefined && tweet.user.location !== null)
        {

                //envoie au client les coordonnées géo de celui qui à twitté
                client.geocodeForward(tweet.user.location,{})
                  .then(function(res) {
                    // res is the http response, including: status, headers and entity properties
                    let data = res.entity; // data is the geocoding result as parsed JSON

                      if(data.features[0] !== undefined && data.features[0] !== null)
                      {
                          socketIo.emit('tweet', tweet, data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]);

                      }
                  })
                  .catch(function(err) {
                    console.log(err)
                  });
        }

        //socketIo.emit('tweet', tweet);
        callback();
    }
});


