require 'test_helper'

class SearchControllerTest < ActionController::TestCase
    # Replace this with your real tests.
    test "social actions search" do
        get(:results, {:q => "burma"})   
        assert_response :success 

        get(:friends, {:url => "http://tinyurl.com/dzk95x"})
        assert_response :success

        assert true
    end
end
