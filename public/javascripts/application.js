// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

document.observe("dom:loaded", function() {
        //check for all url's with id of the form action_url#num, and try to load twitter friends for them
        var i = 0;
        loop: for(;i<100;i++) {
            var a = $('action_url'+i);
            if(a == null) {
                break loop;
            }
            url = a.readAttribute('href');
            //alert('href'+url);
            new Ajax.Updater({success: 'twitterers'+i}, '/search/friends', {
                    parameters: { url: url},
                    method: 'get',
                    onFailure: function(x){
                        return function(xmlHttpRequest, x_json_response) {
                            //alert('failure'+x+': '+xmlHttpRequest+", response: "+x_json_response);
                            $('twitterers'+x).update("Sorry, an error occured during execution of this query.");}
                    }(i)     
                });

        }
});


