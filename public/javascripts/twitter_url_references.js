/* Twitter URL References
 *
 * check Twitter for tweets referencing a certain URL. Tries to resolve some URL shorteners, but not all of them
 *
 * author: Bjoern Guenzel 
 * email:  javascript aaat blinker.net
 *
 * depends: jquery 1.3.1 for JSONP and html rendering
 * depends: prototype.js 
 *
 * Copyright © 2009 Bjoern Guenzel
 */
Logger.debug("twitter_url_references.js loaded");

/*
 * naive attempt to guarantee no more than 5 requests to bitly at the same time
 */
var bitly = {

    MAX_OPEN_REQUESTS: 5,
    BITLY_TIMEOUT: 30000,//timeout for waiting for a free slot for a bitly call

    openRequestsCount: 0,
    calls: 0,

    /*
     * timeOfFirstAttempt can be null, will be filled in automatically in subsequent attempts
     */
    callBitly: function(method, params, onSuccess, onFailure, timeOfFirstAttempt) {
        Logger.debug("callBitly, method: "+method+", params: "+params+", openRequestsCount: "+this.openRequestsCount);

        //try to make sure that there are no more than 5 requests to bit.ly at the same time.
        var elapsedTime = timeOfFirstAttempt ? new Date().getTime() - timeOfFirstAttempt : 0;
        if(this.openRequestsCount >= this.MAX_OPEN_REQUESTS) {
            if(elapsedTime > this.BITLY_TIMEOUT) {
                Logger.debug("timeout for bitly call "+method+", params: "+params+", calls: "+bitly.calls+", time: "+elapsedTime);
                onFailure(null);
            } else {
                //try again in 800 milliseconds
                
                Logger.debug("waiting for bitly slot for call "+method+", params: "+params+", calls: "+bitly.calls+", time: "+elapsedTime);

                window.setTimeout(this.callBitly.bind(this, method, params, onSuccess, onFailure, timeOfFirstAttempt || new Date().getTime()), 100);
            }

            return;
        }     

        Logger.debug("found a bitly call slot, call: "+(++bitly.calls));

        params.version = "2.0.1",
        params.login = "socialfriends",
        params.apiKey = "R_11c2f3ecb3984fce2667064957d6aa16",//silly to have it public, but there seems to be no other choice - official bitly Javascript client does the same
        params.history = "1";//show in bitly history
    
        this.openRequestsCount++;

        var successFn = function(result) {
            Logger.debug("results for callBitly, method: "+method+", params: "+params+", data: "+result);
            this.openRequestsCount--;
            onSuccess(result);
         }.bind(this);

        var errorFn = function(result) {
           this.openRequestsCount--;
           onFailure(result, onFailure);
        }.bind(this);

        var url = "http://api.bit.ly/"+method+"?"+jQuery.param(params)+"&callback=?";
    
        jQuery.ajax({
            url: url, 
            success: successFn, 
            error: errorFn,
            dataType: 'jsonp'
        });
    },
        
    shorten: function(url, onSuccess, onFailure) {   
        this.callBitly("shorten", {longUrl: url}, function(data) {
            var hash = null;
            if(data && "OK" === data.statusCode){
                hash = data.results[url].hash;
            } 
            onSuccess(hash);
        }, onFailure);
    },

    stats: function(hash, onSuccess, onFailure) {
        this.callBitly("stats", {hash: hash}, onSuccess, onFailure); 
    },

    expand: function(hash, onSuccess, onFailure) {
        this.callBitly("expand",{hash:hash}, function(data){    
                onSuccess((data && "OK" === data.statusCode) ? data.results[hash] : null);
            }, onFailure);
    }

};
//TODO check what is class method and what is instance method
//TODO I wonder if some methods should rather be class methods
var TwitterURLReferences = Class.create(
    {
   
        /*
         * url: the url we are looking for
         * containerId: id of the dom element to insert tweets into (or the failure message)
         * spinnerId: id of the ajax spinner graphic, to show and hide as needed.
         */
        initialize: function(url, containerId, spinnerId) {
            Logger.debug("create twitterReferences");

            this.url = url;
            this.containerId = containerId;
            this.spinnerId = spinnerId;

            this.requestsCount = 0;//use this to know when all requests have finished and the spinner can be stopped
            this.errorsCount = 0;//know that some requests failed
            this.successCount = 0;//know that at least some requests succeeded, even if they might only have returned 0 results

            //save all friends here, even the one's we don't display them. Can use this if we want to provide a "show more friends" option
            this.friends = [];
            this.page = 0;
        },

//TwitterURLReferences.prototype = {
    friendsPerPage: 10,

    URL_REGEXP: /((((https?|ftp|file):\/\/)|(www\.|ftp\.))[-a-zA-Z0-9+&@#\/%=~_\|$?!:,\.]*[a-zA-Z0-9+&@#\/%=~_\|$])/i,

    //shorteners: ["bitly", "owly", "tinyurl", "trim", "cligs"],
    findTweet: function(account, hash, url, onSuccess, onFailure) {
        var params = {q: "from:"+account+" bit.ly", rpp: 10};//check a max of 10 bit.ly urls, don't want to upset bit.ly
        this.searchTwitter(params,function(result) {
              Logger.debug("tweets for @"+account+": "+result);
              this.resolveBitlyURLsInTweets(url, result, 0, onSuccess, onFailure); 
          }.bind(this), onFailure);
    },
    
    requestError: function(transport) {
        this.requestsCount--;
        this.errorsCount++;
        this.checkRequestsFinished();
    }.bind(this),

    checkRequestsFinished: function() {
        Logger.debug("checkRequestsFinished, requestsCount: "+this.requestsCount+", errors: "+this.errorsCount+", success: "+this.successCount);
        if(this.requestsCount === 0) {
            $(this.spinnerId).hide();
            if(this.friends.length === 0) {
                jQuery('#'+this.containerId).append('<span class="status-text">No references found. Please tweet this action and be the first.</span>');
            }
            if(this.errorsCount > 0) {
                var msg = this.successCount > 0 ? "some requests failed" : "querying failed";
                jQuery('#'+this.containerId).append('<span class="errorMessage">'+msg+'</span>');
            }
        }
    },

    /*
     * Do it sequentially for a change, so requestsCount remains the same
     * index should be 0 for intial call, iterates by recursion until the right tweet is found
     */
    resolveBitlyURLsInTweets: function(url, tweets, index, onSuccess, onFailure) {
            if(!tweets || index >= tweets.length) {
                //give up, just use a random tweet from user
                //TODO make it the latest tweet (bit.ly url could be confusing)
                var tweet = (tweets && tweets.size() > 0) ? tweets[0] : null;
                onSuccess(tweet);
            } else {
                //console.dir(tweets);
                var text = tweets[index].text;
                //find bitly hash
                //TODO we only look for the first bit.ly URL - minor flaw we'll live with for now, multiple URLs should be rare
                var expression = /http:\/\/bit\.ly\/(\w+)/i;
                var match = expression.exec(text);    
                if(match) {
                    var hash = match[1];
                    bitly.expand(hash, function(longUrl){
                        if(longUrl && longUrl === url) {
                            //found!!!
                            onSuccess(tweets[index]);
                        } else {
                            //try next tweet
                           this.resolveBitlyURLsInTweets(url, tweets, index+1, onSuccess, onFailure); 
                        }   
                    }.bind(this), onFailure);//TODO right now quit if one attempt fails, would be better to try the other ones as well.
                }            
            }
    },

    /*
     * main entry point after creation of object: this should trigger searching of all URL variations and displaying the references
     */
    findReferences: function() {

        //First check our own server for variants of the URLs that we can not get otherwise: see if the original URL is already shortened
        //and if so, provide the corresponding longURL. Also get tinyurls for both original url and longURL if applicable
        //with that list of URLs, run through the real program:
        //check for bit.ly references of longURL and originalURL, and search for tinyurl references directly.
        //later also check other url shorteners for longURL and originalURL

        Logger.debug("find references for url "+this.url);

        var params = {url: this.url};

        /*var successFn = function(data) {
            
        }.bind(this);
    */
        var successFn = function(data){
            Logger.debug("urls search succeeded for "+this.url+", results: "+data);  
            this.findURLReferencesAndDisplayFriends(data);
        }.bind(this);

        Logger.debug("before failFn definition");

        var failFn = function(data) {
            Logger.debug("urls search failed for "+this.url);
            //stick to the program, but only use the original url (as longURL, because that is the actual "main" url)
            this.errorsCount++;
            this.findURLReferencesAndDisplayFriends({longURL:this.url});
            //$(this.spinnerId).update("Sorry, this query did not execute successfully.");
        }.bind(this);

        Logger.debug("before ajax request for urls for "+this.containerId);

        //TODO make JSONP call
        var url = "/search/urls.json?"+jQuery.param(params)+"&callback=?";
    
        jQuery.ajax({
            url: url, 
            success: successFn, 
            error: failFn,
            dataType: 'jsonp'
        });
    },

    findBitlyReferences: function(url, onSuccess, onFailure) {
        Logger.debug("find bitly references for "+url);
        bitly.shorten(url, function(hash) {
            if(hash){
                bitly.stats(hash, function(data){
                    if(data && "OK" === data.statusCode) {
                        var twitterAccounts = new Hash(data.results.referrers["twitter.com"] || {});

                        twitterAccounts = twitterAccounts.keys().without("/","/home","/replies","/favorites","/inbox");
                        twitterAccounts = twitterAccounts.slice(0,9);//TODO magic number, show max ten users

                        Logger.debug("accounts: "+twitterAccounts.size()+", users: "+twitterAccounts);
                        
                        if(twitterAccounts.size() === 0) {
                            onSuccess(null);
                        } else {

                            //create new request "threads" for additional accounts to check (-1) because we already have a "thread" for the first check
                            this.requestsCount += twitterAccounts.length-1;            

                            twitterAccounts.each(function(account){
                                account = account.substr(1);//crop the leading "/"
                                this.findTweet(account, hash, url, onSuccess, onFailure);
                            }.bind(this));
                        }
                                    //asyncMap(twitterAccounts,function(account, callback){findTweet(account, hash, url, callback);},callback);
                    }            
                }.bind(this), onFailure);
            } else {
                onFailure();
                //options.onError("error in shorten", data);
            }
        }.bind(this), onFailure);
    },

    searchTwitter: function(params, onSuccess, onFailure) {
        jQuery.getJSON("http://search.twitter.com/search.json?"+jQuery.param(params)+"&callback=?", function(data){
                //fixme better error handling
                if(data && data.results) {
                    onSuccess(data.results);
                } else {
                    onFailure();
                }
            });
    },
   
    findURLReferencesAndDisplayFriends: function(urls) {
        Logger.debug("find references for "+this.containerId+", urls data: longURL: "+urls.longURL+", shorturls: "+urls.shorturls+", originalURL: "+urls.originalURL);
    
        //determine number of open requests beforehand, to prevent accidentally ending before all requests have run
        this.requestsCount = 2+(urls.shorturls ? urls.shorturls.length : 0);

        if(urls.originalURL) {
            this.findBitlyReferences(urls.originalURL, function(reference) {
               this.displayFriend(reference);
           }.bind(this), this.requestError.bind(this));
        } else {
            this.requestsCount--;
        }

        this.findBitlyReferences(urls.longURL, function(reference) {
            this.displayFriend(reference);
        }.bind(this), this.requestError.bind(this));

        if(urls.shorturls) {
            //todo search references to shorturls
            urls.shorturls.each(function(url){this.findShortURLReferences(url)}.bind(this));//TODO not sure if bind is necessary here
        }
    },

    findShortURLReferences: function(shorturl) {
        this.displayFriend(null);//TODO dummy to maintain correct requestsCount
    },

    displayFriend: function(friend) {
        Logger.debug("displayFriend: "+friend);    

        this.requestsCount--;
        this.successCount++;//even if no friend is found - success is one chain of requests going through
        if(friend) {
            this.friends.push(friend);
            if(this.friends.length < (this.page + 1) * this.friendsPerPage){
                //show it
                jQuery('#'+this.containerId).append(
                    '<div class="status">'
                        +'<a href="'+this.linkToTwitterProfile(friend.from_user)+'" class="author"><img src="'+friend.profile_image_url+'" alt="'+friend.from_user.escapeHTML()+'"/></a>'
                        +'<span class="status-text">'
                            +this.renderTwitterStatus(friend.from_user, friend.text)
                        +'</span>'
                    +'</div>'
                    +'<p class="break">&nbsp;</p>');
            }
        }

        this.checkRequestsFinished();
    },

    renderTwitterStatus: function(userName, text){
        //FIXME relying on Twitter to properly HTML-escape the text :-(
        //prototype gsub to the rescue: must sometimes add protocol (http://) to links, difficult with standard replace()
        text = text.gsub(this.URL_REGEXP, function(match) {
            var url = match[0];
            var urlWithProtocol = url.replace(/^www\./,"http://www.");
            var urlWithProtocol = urlWithProtocol.replace(/^ftp\./,"ftp://ftp.");
            return '<a href="'+urlWithProtocol+'">'+url+'</a>';
        });

        //turn usernames into links
        text = text.gsub(/@(\w+)/, '@<a href="http://twitter.com/#{1}">#{1}</a>');
    
        //TODO turn hashtags into links?

        return '<a href="'+this.linkToTwitterProfile(userName)+'">'+userName+'</a> '+text;
    },

    testStatusRender: function() {
        return this.renderTwitterStatus("blubber", "hi @blueblub, siehe www.brabbel.de http://brabbel.de http://www.brabbel.de ftp.wo.de ftp://wo.de https://www.a.c");
    },

    linkToTwitterProfile: function(userName) {
        return 'http://twitter.com/'+encodeURIComponent(userName);
    }

});

