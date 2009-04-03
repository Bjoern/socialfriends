# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
    #assume text is already escaped with h() or something, just take care of links
    def twitter_status(user, msg)
        "#{link_to_twitter_profile user} #{msg}"
    end

    def link_to_twitter_profile(user)
        "<a href=\"http://twitter.com/#{h(user)}\">#{h(user)}</a>"
    end
end
