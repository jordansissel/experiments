# Values taken from http://aws.amazon.com/ec2/pricing/
# for an m1.large ("Large") instance
on_demand_hourly = 0.34
reserve_hourly = 0.12
reserve_1year = 910       
reserve_3year = 1400

# quadruple extra large instances
#on_demand_hourly = 1.60
#reserve_hourly = 0.56
#reserve_1year = 4290
#reserve_3year = 6590

on_demand_daily = on_demand_hourly * 24
reserve_daily = reserve_hourly * 24
x <- c(0, 365 * 3)
y <- on_demand_daily * x

# Calculate day of break-even point reserve vs on-demand rates
break_1year_x = reserve_1year / (on_demand_daily - reserve_daily)
break_3year_x = reserve_3year / (on_demand_daily - reserve_daily)

png(filename = "ec2_m1large_cost.png", width = 800, height=475)
plot(x, y, type="l", col='red', xlab="", ylab="cost ($USD)")
title("EC2 cost analysis for m1.large", 
      sprintf("(days)\n1-year is cheaper than on-demand after %.0f days of usage,\n 3-year is cheaper after %.0f days", break_1year_x, break_3year_x))
text(200, 0, sprintf("on-demand=$%.2f/hour", on_demand_hourly), pos=3, col='red')

#abline(reserve_1year, reserve_daily, col='green')
curve(reserve_daily * x + reserve_1year * (1 + floor(x / 365)),
      from=0, to=365*3, col='green', add=T)
text(400, reserve_1year, sprintf("1-year=$%.0f+$%.2f/hour", reserve_1year, reserve_hourly), pos=3, col='green')

#abline(reserve_3year, reserve_daily, col='blue')
curve(reserve_daily * x + reserve_3year, from=0, to=365*3, col='blue', add=T)
text(600, reserve_3year + 500, sprintf("3-year=$%.0f+$%.2f/hour", reserve_3year, reserve_hourly), pos=3, col='blue')


point_y = reserve_1year + reserve_daily * break_1year_x
points(break_1year_x, point_y)
text(break_1year_x, point_y, labels = sprintf("%.0f days", break_1year_x), pos=1)

point_y = reserve_3year + reserve_daily * break_3year_x
points(break_3year_x, point_y)
text(break_3year_x, point_y, labels = sprintf("%.0f days", break_3year_x), pos=1)

dev.off()
quit()
