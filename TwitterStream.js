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
    }
}

module.exports = TwitterStream