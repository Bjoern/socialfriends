# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
    #from http://www.regexguru.com/2008/11/detecting-urls-in-a-block-of-text/
    URL_REGEXP = Regexp.new(%q^((((https?|ftp|file)://)|(www\.|ftp\.))[-a-zA-Z0-9+&@#/%=~_|$?!:,.]*[a-zA-Z0-9+&@#/%=~_|$])^) 
    USER_REF_REGEXP = Regexp.new(%q^@(\w+)^)
    #assume text is already escaped with h() or something, just take care of links

    def twitter_status(user, msg)
        m = msg.gsub(URL_REGEXP, '<a href="\1">\1<ga>')
        #m = msg
        m = m.gsub(USER_REF_REGEXP, '@<a href="http://twitter.com/\1" target="blank">\1</a>')
        "#{link_to_twitter_profile user} #{m}"
    end

    def link_to_twitter_profile(user)
        "<a href=\"http://twitter.com/#{h(user)}\">#{h(user)}</a>"
    end
end
