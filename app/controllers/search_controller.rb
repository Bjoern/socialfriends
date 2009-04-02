#require 'lib/social_actions/search'
require 'url_helpers'
require 'twitter_helpers'

class SearchController < ApplicationController
    def index

    end

    def results
        search = SocialActions::Search.new(params[:q])
        @results = search.fetch
        #pp @results
    end

    def friends
        urls = []
        url = params[:url]
        if url
            urls << url
            resolved_url =  SocialActions::UrlHelpers.resolve_redirects(url)

            if !url.eql? resolved_url
                urls << resolved_url
                url = resolved_url
            end

            tinyurl = SocialActions::UrlHelpers.get_tinyurl(url)
            urls << tinyurl 
        end
        @friends = SocialActions::TwitterHelpers.find_people_tweeting_words(urls)
        render :partial => "friends"
    end

end

