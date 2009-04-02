$:.unshift File.join(File.dirname(__FILE__), "..", "..", "lib")

require 'test/unit'
require 'twitter_helpers'
require 'pp'

class TestTwitterHelpers < Test::Unit::TestCase
    
   def test_find_people_tweeting_words
       people = SocialActions::TwitterHelpers.find_people_tweeting_words(["#gntm"], 15, 3)
       puts "gntm size #{people.size}"
       assert people.size == 15
       pp people
       people = SocialActions::TwitterHelpers.find_people_tweeting_words(["#gntmsdkfdfghjsdnfdshhfdshdsfhdfshsdhfdsh"])
       pp people
       puts "garbage size #{people.size}"
       assert people.size == 0
   end
end
