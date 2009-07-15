/* Twitter URL References
 *
 * check Twitter for tweets referencing a certain URL. Tries to resolve some URL shorteners, but not all of them
 *
 * author: Bjoern Guenzel 
 * email:  javascript aaat blinker.net
 *
 * depends: jquery 1.3.1 for JSONP
 *
 * © Copyright 2009 Bjoern Guenzel
 */
Logger.debug("twitter_url_references loaded");

function chain(calls, callback) {
    var recursiveChain = function(calls, index, result) {
        
    }
}

function asyncMap(items, transform, callback) {
    var result = [];
    var count = 0;
    if(items.length === 0){
        callback(result);
        return;
    } 
    items.each(function(item, index) {
            transform(item, function(data) {
                    result[index] = data;
                    if(++count === items.length) {
                        callback(result);
                    }
                });
        });
}

var twitterURLReferences = {

    shorteners: ["bitly", "owly", "tinyurl", "trim", "cligs"],

    bitly: {
        callBitly: function(method, params, callback) {
             Logger.debug("callBitly, method: "+method+", params: "+params);

             params.version = "2.0.1",
             params.login = "socialfriends",
             params.apiKey = "R_11c2f3ecb3984fce2667064957d6aa16",//silly to have it public, but there seems to be no other choice - official bitly Javascript client does the same
             params.history = "1";//show in bitly history
             jQuery.getJSON("http://api.bit.ly/"+method+"?"+jQuery.param(params)+"&callback=?", function(data) {
                     Logger.debug("results for callBitly, method: "+method+", params: "+params+", data: "+data);
                     callback(data);
                });
        },

        shorten: function(url, callback) {
            this.callBitly("shorten", {longUrl: url}, function(data) {
                    var hash = null;
                    if(data && "OK" === data.statusCode){
                        hash = data.results[url].hash;
                    } 
                    callback(hash);
                });
        },

        stats: function(hash, callback) {
            this.callBitly("stats", {hash: hash}, function(data) {
                                       callback(data);
                });
        },

        expand: function(hash, callback) {
            this.callBitly("expand",{hash:hash}, function(data){
                    callback((data && "OK" === data.statusCode) ? data.results[hash] : null);
                });
        },

        findTweet: function(account, hash, url, callback) {
            var params = {q: "from:"+account+" bit.ly", rpp: 10};//check a max of 10 bit.ly urls, don't want to upset bit.ly
            twitterURLReferences.searchTwitter(params,function(result) {
                    Logger.debug("tweets for @"+account+": "+result);
                    twitterURLReferences.bitly.resolveURLsInTweets(url, result, 0, callback); 
            });
        },

        resolveURLsInTweets: function(url, tweets, index, callback) {
            if(!tweets || index >= tweets.length) {
                //give up, just use a random tweet from user
                //TODO make it the latest tweet (bit.ly url could be confusing)
                var tweet = (tweets && tweets.size() > 0) ? tweets[0] : null;
                callback(tweet);
            } else {
                //console.dir(tweets);
                var text = tweets[index].text;
                //find bitly hash
                //TODO we only look for the first bit.ly URL - minor flaw we'll live with for now, multiple URLs should be rare
                var expression = /http:\/\/bit\.ly\/(\w+)/i;
                var match = expression.exec(text);    
                if(match) {
                    var hash = match[1];
                    this.expand(hash, function(longUrl){
                        if(longUrl && longUrl === url) {
                            //found!!!
                            callback(tweets[index]);
                        } else {
                            //try next tweet
                            twitterURLReferences.bitly.resolveURLsInTweets(url, tweets, index+1,callback); 
                        }   
                    });
                }            
            }
        },


        findBitlyReferences: function(url, callback) {
            Logger.debug("find bitly references for "+url);
            this.shorten(url, function(hash) {
                    if(hash){
                        twitterURLReferences.bitly.stats(hash, function(data){
                                if(data && "OK" === data.statusCode) {
                                    var twitterAccounts = new Hash(data.results.referrers["twitter.com"] || {});

                                    twitterAccounts = twitterAccounts.keys().without("/","/home","/replies","/favorites","/inbox");
                                    twitterAccounts = twitterAccounts.slice(0,9);//TODO magic number, show max ten users

                                    Logger.debug("accounts: "+twitterAccounts.size()+", users: "+twitterAccounts);
                                    
                                    twitterAccounts.each(function(account){
                                            account = account.substr(1);//crop the leading "/"
                                            twitterURLReferences.bitly.findTweet(account, hash, url, callback);
                                    });
                                    //asyncMap(twitterAccounts,function(account, callback){findTweet(account, hash, url, callback);},callback);
                                }            
                            });
                    } else {
                        callback(null);//FIXME
                        //options.onError("error in shorten", data);
                    }
            });
        }


    },

    searchTwitter: function(params, callback) {
        jQuery.getJSON("http://search.twitter.com/search.json?"+jQuery.param(params)+"&callback=?", function(data){
                callback(data && data.results ? data.results : null);//FIXME better error handling
            });
    }
   
}

