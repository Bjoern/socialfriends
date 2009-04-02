module SocialActions

    class SearchResult < Hash

        # Creates an easier to work with hash from
        # one with string-based keys
        def self.new_from_hash(hash)
            new.merge!(hash)
        end

        def created_at
            self['created_at']
        end

        def created_at=(val)
            self['created_at'] = val
        end


        def site
            self['site']
        end  

        def name
            self['name']
        end

        def title
            self['title']
        end

        def url
            self['url']
        end

        def description
            self['description']
        end

        def referrer_count
            self['referrer_count']
        end

        def hit_count
            self['hit_count']
        end

        def action_type
            self['action_type']
        end

        def location
            self['location']
        end
    end
end
