#require 'lib/social_actions/search'
require 'url_helpers'
require 'twitter_helpers'

class SearchController < ApplicationController
    
    #rescue_from Errno::ECONNREFUSED, :with => :connection_refused
#Timeout::Error
    def index

    end

    def results
        search = SocialActions::Search.new(params[:q])
        search.created(params[:created])
        search.limit(params[:limit])
        @results = search.fetch
        @results = [] unless @results
        pp @results
        #pp @results
    end

    def friends
        puts "friends action called with url #{params[:url]}"
        urls = []
        url = params[:url]
        if url
            urls << url
            urls << SocialActions::UrlHelpers.get_tinyurl(url)

            resolved_url =  SocialActions::UrlHelpers.resolve_redirects(url)

            if !url.eql? resolved_url
                urls << resolved_url
                urls << SocialActions::UrlHelpers.get_tinyurl(resolved_url)
            end
        end
        pp urls
        @users = SocialActions::TwitterHelpers.find_people_tweeting_words(urls)
        puts "friends: #{@users}"
        #pp @friends
        render :partial => "friends"
    end

    def connection_refused
        flash[:notice] = "Connection failed"
        render :results
    end

end
