// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

//TODO better encapsulation with namespace and stuff

document.observe("dom:loaded", function() {

        //register search in search button
        $("submitButton").observe("click", search);
});


var friendsPerPage = 10;

var URL_REGEXP = /((((https?|ftp|file):\/\/)|(www\.|ftp\.))[-a-zA-Z0-9+&@#\/%=~_\|$?!:,\.]*[a-zA-Z0-9+&@#\/%=~_\|$])/i;

//save all friends here, even the one's we don't display them. Can use this if we want to provide a "show more friends" option
var friendsMap = {};

function searchTwitterUsers(pageNum) {
        //check for all url's with id of the form action_url#num, and try to load twitter friends for them
        Logger.debug("searchTwitterUsers, page "+pageNum);

        var i = 0;
        loop: for(;i<100;i++) {
            var a = $('action_url'+pageNum+'_'+i);
            if(a == null) {
                break loop;
            }
            var url = a.readAttribute('href');
        
            //alert('href'+url);
            var id = 'twitterers'+pageNum+'_'+i;
        
            Logger.debug("found url "+url+", containerId: "+id);

            if(!friendsMap[id]) {
                friendsMap[id] = {page: pageNum, friends: []};
            }

            var params = {url: url}

            Logger.debug("before ajax request for urls for "+id);

            new Ajax.Request("/search/urls.json", {
                    parameters: params,
                    method: 'get',
                    onFailure: function(id_value){
                        return function(xmlHttpRequest, x_json_response) {
                            Logger.debug("urls search failed for "+id_value);
                            $(id_value).update("Sorry, this query did not execute successfully.");};
                    }(id),
                    sanitizeJSON: true,
                    onSuccess: function(id_value){
                        return function(transport) {
                            Logger.debug("urls search succeeded for "+id_value+", results: "+transport.responseJSON);
                            findURLReferencesAndDisplayFriends(id_value, transport.responseJSON);
                        }  
                    }(id)
                });

            //jQuery.getJSON("/search/urls.json?"+jQuery.param(params), function(data) {findURLReferencesAndDisplayFriends(id, data)});
            /*new Ajax.Updater({success: id}, '/search/friends', {
                    parameters: { url: url},
                    method: 'get',
                    onFailure: function(id_value){
                        return function(xmlHttpRequest, x_json_response) {
                            $(id_value).update("Sorry, this query did not execute successfully.");}
                    }(id)     
                });
            */
        }
}

function findURLReferencesAndDisplayFriends(containerId, urls) {
    Logger.debug("find references for "+containerId+", urls data: longURL: "+urls.longURL+", shorturls: "+urls.shorturls+", originalURL: "+urls.originalURL);
    twitterURLReferences.bitly.findBitlyReferences(urls.longURL, function(references) {
            displayFriend(containerId, references);
        });
    if(urls.originalURL) {
         twitterURLReferences.bitly.findBitlyReferences(urls.originalURL, function(references) {
            displayFriend(containerId, tweet);
        });
    }

    //todo search references to shorturls
}

//TODO remove if not needed (as is the case atm)
function displayFriends(containerId, friends) {
    Logger.debug("friend data: "+friends);
    friends.each(function(friend){displayFriend(containerId, friend);});
}

function displayFriend(containerId, friend) {
    if(friend) {
        friendsMap[containerId].friends.push(friend);
        Logger.debug("displayFriend: "+friend);    
        if(friendsMap[containerId].friends.length < friendsMap[containerId].page * friendsPerPage){
            //show it
            jQuery('#'+containerId).append(
                '<div class="status">'
                    +'<a href="'+linkToTwitterProfile(friend.from_user)+'" class="author"><img src="'+friend.profile_image_url+'" alt="'+friend.from_user.escapeHTML()+'"/></a>'
                    +'<span class="status-text">'
                        +renderTwitterStatus(friend.from_user, friend.text)
                    +'</span>'
                +'</div>'
                +'<p class="break">&nbsp;</p>');
        }
    }
}

function renderTwitterStatus(userName, text){
    //FIXME relying on Twitter to properly HTML-escape the text :-(
    //prototype gsub to the rescue: must sometimes add protocol (http://) to links, difficult with standard replace()
    text = text.gsub(URL_REGEXP, function(match) {
        var url = match[0];
        var urlWithProtocol = url.replace(/^www\./,"http://www.");
        var urlWithProtocol = urlWithProtocol.replace(/^ftp\./,"ftp://ftp.");
        return '<a href="'+urlWithProtocol+'">'+url+'</a>';
    });

    //turn usernames into links
    text = text.gsub(/@(\w+)/, '@<a href="http://twitter.com/#{1}">#{1}</a>');
    
    //TODO turn hashtags into links?

    return '<a href="'+linkToTwitterProfile(userName)+'">'+userName+'</a> '+text;
}

function testStatusRender() {
    return renderTwitterStatus("blubber", "hi @blueblub, siehe www.brabbel.de http://brabbel.de http://www.brabbel.de ftp.wo.de ftp://wo.de https://www.a.c");
}

function linkToTwitterProfile(userName) {
    return 'http://twitter.com/'+encodeURIComponent(userName);
}

//load more results
function showMore(params) {
    return function(event) {
        event.stop();
        params.page++;
        $("moreButton").remove();
        findResults(params);
    }
}

function sampleSearch(query) {
    var params = {q:query, page: 1};
    $("searchResults").update();
    findResults(params);
}

//execute search
function search(event) {
    //alert("submit pressed");
    event.stop();
    
    $("searchResults").update();
    var params = $("searchForm").serialize(true);
    params.page = 1;
    findResults(params);
}


//search social actions TODO: rename
function findResults(params){
    //show spinner
    $("searchSpinner").show();
    $("loadError").hide();
       //search
    var url = $("searchForm").readAttribute("action");
    //alert("url: "+url);

    new Ajax.Request(url, { 
            parameters: params,
            method: "get", 
            onSuccess: function(request, json_header) {
                $("searchResults").insert({bottom: request.responseText});
                searchTwitterUsers(params.page);
                try {
                    $("moreButton").observe("click", showMore(params));
                } catch (e) {
                    //nothing, moreButton probably doesn't exist
                }
            },
            onFailure: function(request, json_header) {
                $("loadError").show();
            },
            onComplete: function(request, json_header){
                $("searchSpinner").hide();
            }
        }
    );

}


