
require "metriks"
require "stud/interval"

meter = Metriks.meter("hello")
count = 0

include Stud
interval(0.200) do
  meter.mark
  count += 1
  if count > 30
    %w(count one_minute_rate five_minute_rate fifteen_minute_rate).each do |m|
      puts m => meter.send(m.to_sym)
    end
    count = 0
  end
end
