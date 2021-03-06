require 'net/http'
require 'uri'
require 'pp'
require 'cgi'

#require 'logger'

module SocialActions
    
  #  class TooManyRedirects < StandardError; end

    class UrlHelpers     
        def UrlHelpers.resolve_redirects(url, max_redirects = 5)
            if max_redirects < 0
                raise ArgumentError.new("too many redirects, last resolved URL: #{url}")
            end

            # puts "resolve redirects for #{url}, max left: #{max_redirects}"
            response = nil
            u = URI.parse(url)
            Net::HTTP.start(u.host, u.port) {|http|
                path = u.path
                if u.query
                    path += '?'+u.query
                end
                response = http.head(u.path)
            }
           # pp response
           # puts "response code: #{response.code}"
            #response = Net::HTTP.get_response(URI.parse(uri_str))
            case response
            when Net::HTTPSuccess     then url
            when Net::HTTPRedirection then 
                UrlHelpers.resolve_redirects(response["location"], max_redirects - 1) 
            else
                response.error!
            end
        end

        def UrlHelpers.get_tinyurl(url)
            escaped_url = CGI::escape(url)
            # puts "escaped_url: #{escaped_url}"
            query_url = "http://tinyurl.com/api-create.php?url="+escaped_url
            uri = URI.parse(query_url)
            Net::HTTP.get(uri)
        end
    end
end
