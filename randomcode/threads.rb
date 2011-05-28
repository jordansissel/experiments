

threads = []

(1..2).each do
  threads <<Thread.new do
    #(1..100000000).each { }
    system("seq 100000000 > /dev/null")
    puts "Done!"
  end
end

threads.each { |thread| thread.join }
puts "all complete"
