# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_socialFriends_session',
  :secret      => '8b2e0bbc6bf1ad49977572afaad4ea7e54f1dab107285f4f149d68e7f513a78ed059bd7bfe83355e48b36e8e96ee53f8f31a36d6442e7a1dc1976b44b51fb07f'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
