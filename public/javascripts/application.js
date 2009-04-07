// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

document.observe("dom:loaded", function() {

        //register search in search button
        $("submitButton").observe("click", search);
});

function searchTwitterUsers(pageNum) {
        //check for all url's with id of the form action_url#num, and try to load twitter friends for them
        var i = 0;
        loop: for(;i<100;i++) {
            var a = $('action_url'+pageNum+'_'+i);
            if(a == null) {
                break loop;
            }
            url = a.readAttribute('href');
            //alert('href'+url);
            var id = 'twitterers'+pageNum+'_'+i;
            new Ajax.Updater({success: id}, '/search/friends', {
                    parameters: { url: url},
                    method: 'get',
                    onFailure: function(id_value){
                        return function(xmlHttpRequest, x_json_response) {
                            $(id_value).update("Sorry, this query did not execute successfully.");}
                    }(id)     
                });

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
                //alert("onSuccess");
               // alert(request.responseText);
                $("searchResults").insert({bottom: request.responseText});
                searchTwitterUsers(params.page);
                try {
                    $("moreButton").observe("click", showMore(params));
                } catch (e) {
                    //alert('no button found');
                    //nothing, moreButton probably doesn't exist
                }
            },
            onFailure: function(request, json_header) {
                //alert("failure");
                $("loadError").show();
            },
            onComplete: function(request, json_header){
               // alert("complete");
                $("searchSpinner").hide();
            }
        }
    );

}


