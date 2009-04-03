$:.unshift File.join(File.dirname(__FILE__), "..", "..", "lib")

require 'test/unit'
require 'url_helpers'

class TestUrlHelpers < Test::Unit::TestCase

    def test_resolution
        @tinyurl = 'http://tinyurl.com/dbbzg'
        @url = 'http://www.heise.de/'


        resolved_url = SocialActions::UrlHelpers.resolve_redirects(@tinyurl)
        assert @url.eql? resolved_url
    end

    def test_get_tinyurl
        @tinyurl = 'http://tinyurl.com/cpnq29' #'http://tinyurl.com/dbbzg'
        @url = 'http://mondhandy.de/mondkalenderPlanen.html?activityId=11' # 'http://www.heise.de/'


        received_url = SocialActions::UrlHelpers.get_tinyurl(@url)
        puts "received url: #{received_url}"
        assert @tinyurl.eql? received_url 
    end
end
