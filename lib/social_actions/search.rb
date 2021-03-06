#interface to the socialactions.com web service
#inspired by jnunemakers twitter gem

require 'net/http'
require 'json'
require 'cgi'
require 'uri'

module SocialActions
    class Search
        include Enumerable

        TYPE_GROUP_FUNDRAISER = 1 
        TYPE_CAMPAIGN = 2
        TYPE_PLEDGED_ACTION = 3
        TYPE_EVENT = 4
        TYPE_AFFINITY_GROUP = 5
        TYPE_VOLUNTEER = 6
        TYPE_MICROLOAN = 7
        TYPE_PETITION = 8 

        CREATED_1 = 1
        CREATED_2 = 2
        CREATED_7 = 7
        CREATED_14 = 14
        CREATED_30 = 30
        CREATED_ALL = 'all'

        MATCH_ANY = 'any'
        MATCH_ALL = 'all'

        ORDER_RELEVANCE = 'relevance'
        ORDER_CREATED_AT = 'created_at'


        attr_reader :result, :query

        def initialize(q=nil)
            clear #this also inits the @query variable and @query[:q]
            containing(q) if q && q.strip != ''
        end 

        def containing(word)
            @query[:q] << "#{word}"
            self
        end

        # Limits the number of results per page

        def limit(num)
            @query[:limit] = num
            self
        end

        # Which page of results to fetch
        def page(num)
            @query[:page] = num
            self
        end

        def match(any_or_all)
            @query[:match] = any_or_all
            self
        end

        def action_types(types)
            @query[:action_types] = types.join(',')
            self
        end

        def order(ordering)
            @query[:order] = ordering 
            self
        end

        def exclude_action_types(exclude_actions)
            @query[:exclude_action_types] = exclude_actions.join(',')
            self
        end

        def created(created_before_days)
            @query[:created] = created_before_days
            self
        end

        def sites(site_list)
            @query[:sites] = site_list.join(',')
            self
        end

        # Clears all the query filters to make a new search
        def clear
            @query = {}
            @query[:q] = []
            self
        end

        # If you want to get results do something other than iterate over them.
        def fetch
            @query[:q] = @query[:q].join(' ')
            q = @query.map{|key,value| "#{key}=#{CGI::escape(value.to_s) if value}"}.join('&')
            puts "query: #{q}"
            result = Net::HTTP.get(URI::HTTP.build({:host => 'search.socialactions.com', :path => '/actions.json', :query => q}))
            results = JSON.parse(result)
            results.map{|r| SearchResult.new_from_hash(r)}
            #pp results
        end


        def each
            @result = fetch()
            @result.each { |r| yield r }
        end 

    end
end

