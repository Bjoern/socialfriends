require 'twitter'

module SocialActions
    class TwitterHelpers
        def TwitterHelpers.find_people_tweeting_words(words, users_per_page = 10, page = 1)
            puts "find people tweeting words"
            max_users = users_per_page * page
            @users = {}
            words.each do |word|
                p = 1 #results page
                results = nil
                while @users.size < max_users && (results == nil || results.size > 0)
                    puts "word: #{word}, page: #{p}"
                    search = Twitter::Search.new(word)
                    search.per_page(100)
                    search.page(p)
                    results = search.fetch.results
                    results.each do |result|
                        puts result.inspect
                        user = result.from_user
                        @users[user] = result unless @users[user]
                        puts @users.size
                        break if @users.size >= max_users
                    end

                    p += 1
                end
            end

            sorted = @users.keys.sort!

            users_for_page = sorted.slice(((page-1)*users_per_page), users_per_page)
            users_for_page = [] unless users_for_page

            users_for_page.map {|user| @users[user]}         
        end
    end 
end
