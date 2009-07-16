// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

//TODO better encapsulation with namespace and stuff

document.observe("dom:loaded", function() {

        //register search in search button
        $("submitButton").observe("click", search);
});


function searchTwitterUsers(pageNum) {
        //check for all url's with id of the form action_url#num, and try to load twitter friends for them
        Logger.info("searchTwitterUsers, page "+pageNum);

        var i = 0;
        loop: for(;i<100;i++) {
            var urlId = 'action_url'+pageNum+'_'+i;
            var a = $(urlId);
            //Logger.debug("checking url "+i);
            if(a == null) {
                Logger.debug("last url reached at index "+i+", id: "+urlId);
                break loop;
            }
            var url = a.readAttribute('href');
        
            //Logger.debug("url "+i+" read: "+url);
            //alert('href'+url);
            var containerId = 'twitterers'+pageNum+'_'+i;
            var spinnerId = 'spinner'+pageNum+'_'+i;

            //Logger.debug("found url "+url+", containerId: "+containerId);

            var twitterReferences = new TwitterURLReferences(url, containerId, spinnerId);

            //Logger.debug("twitter references created");

            twitterReferences.findReferences(); 
        }
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


