#require 'lib/social_actions/search'

class SearchController < ApplicationController
  def index

  end

  def results
          search = SocialActions::Search.new(params[:q])
          @results = search.fetch
          #pp @results
  end

  def friends
  end

end

