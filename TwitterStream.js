const { Readable } = require('stream');
const Twitter = require('twitter');


class TwitterStream extends Readable {
    constructor(cfg,query)
    {
        super({objectMode: true});
        this.client = new Twitter(cfg);
        this.connect(query)
    }
    _read() {}

    connect(query)
    {
        this.stream = this.client.stream("statuses/filter", { track : query });
        this.stream.on("data",tweet => this.push(tweet));

        this.stream.on("error", function (error) {
            console.log(error)
            console.log("Erreur - Veuillez recommencer dans un petit moment")
        })
    }
}

module.exports = TwitterStream