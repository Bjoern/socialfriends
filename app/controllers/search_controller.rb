#require 'lib/social_actions/search'
require 'url_helpers'
require 'twitter_helpers'

class SearchController < ApplicationController
    
    #rescue_from Errno::ECONNREFUSED, :with => :connection_refused
#Timeout::Error
    def index

    end

    def results
        params[:page] = 1 unless params[:page] 
        search = SocialActions::Search.new(params[:q])
        search.created(params[:created])
        search.limit(params[:limit])
        search.page(params[:page])
        @results = search.fetch
        @results = [] unless @results
        #pp @results
        max_length = 700 #TODO move to config file

        #TODO horribly inefficient code
        @results.each do |result|
            if  result['description']
                #result['description'].gsub(/<p>/,'<br/><br/>')
                length = result['description'].length
                if length > max_length
                    result['description'] = result['description'][0,700]
                    result['description'].sub!(/\S*\Z/,'')      
                    result['description'] += '...'
                end
            end
        end

        if (request.xhr?)
            render :layout => false
        end

    end

    def friends
        #puts "friends action called with url #{params[:url]}"
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
        #puts "friends: #{@users}"
        #pp @friends
        render :partial => "friends"
    end

    #def connection_refused
    #    flash[:notice] = "Connection failed"
    #    render :results
    #end

end

