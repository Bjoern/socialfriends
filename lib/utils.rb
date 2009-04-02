module Utils
    def Utils.retries(retries, sleep_time, activity_name, &block)
            #puts "block: "+block
            #return unless false
            #puts "retries "+retries.to_s
      begin
       block.call 
      rescue => e
        msg = retries > 1 ? " will try again up to #{retries-1} times" : " giving up"
        puts "Exception trying #{activity_name} (#{msg}): "+ e + "\n" + e.backtrace.join("\n") #FIXME log instead of puts
        if retries > 1 
               # puts "try again"
                sleep sleep_time
                Utils.retries(retries - 1, sleep_time, activity_name, &block)
        else
                #puts "give up"
                raise e
        end
      end
    end

  #just for testing ruby features...
  def Utils.a_recursion(n, &block)
    return unless n > 0
    puts n
    block.call
    Utils.a_recursion(n-1, &block)
  end 

end
