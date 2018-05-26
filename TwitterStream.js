const { Readable } = require('stream');
const Twitter = require('twitter');


class TwitterStream extends Readable {
    constructor(cfg,query)
    {
        super({objectMode: true});
        this.client = new Twitter(cfg);
        this.connect(query)
    }

    _read()
    {}

    connect(query)
    {
        this.stream = this.client.stream("statuses/filter", { track : query });
        //envoie des tweets
        this.stream.on("data",tweet => this.push({'error':false, 'data':tweet}));
        //envoie des erreurs
        this.stream.on("error",  error => this.push({'error':true, 'data':error}))
    }
}

module.exports = TwitterStream