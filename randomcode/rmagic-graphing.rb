#!/usr/bin/env ruby

require "rubygems"
require 'rvg/rvg'


class PrettyGraph
  attr_accessor :width
  attr_accessor :height
  attr_accessor :title
  attr_accessor :axes

  def initialize(width, height, title)
    @width = width
    @height = height
    @title = title
    @axes = []
  end

  def render(output)
    rvg = Magick::RVG.new(@width, @height) do |canvas|
      canvas.background_fill = 'white'
      canvas.use(render_frame)
      canvas.use(render_data, 80, 30)
    end
    rvg.draw.write(output)
  end
 
  def render_frame
    rvg = Magick::RVG.new(@width, @height) do |canvas|
      canvas.rect(@width-1, @height-1, 0, 0) \
        .styles(:stroke => "grey", :stroke_width => 1, :fill => "white")
      canvas.rect(@width-3, @height-3, 1, 1) \
        .styles(:stroke => "black", :stroke_width => 1, :fill => "#E8F8F8")
      canvas.text(@width / 2, 20, @title) \
        .styles(
                :text_anchor => "middle",
                :font_size => 16)
    end
    return rvg
  end

  def render_data
    width = @width - 100
    height = @height - 60
    rvg = Magick::RVG.new(width, height) do |canvas|
      canvas.rect(width, height, 0, 0) \
        .styles(:stroke => "grey", :stroke_width => 1, :fill => "white")
      #canvas.text(30, 50, "hello there").styles(:font_size => 40)

      min_x = @axes[0].points[0][0]
      min_y = @axes[0].points[0][1]
      max_x = @axes[0].points[0][0]
      max_y = @axes[0].points[0][1]
      @axes.each do |axis|
        axis.points.each do |point|
          min_x = point[0] if point[0] < min_x
          min_y = point[1] if point[1] < min_y
          max_x = point[0] if point[0] > max_x
          max_y = point[1] if point[1] > max_y
        end
      end

      @axes.each do |axis|
        data = axis.render(width, height, min_x, min_y, max_x, max_y)
        canvas.use(data, 0, 0)
      end
    end
    return rvg
  end

end

class GraphAxis
  attr_accessor :points

  def initialize
    @points = []
  end

  def render(width, height, min_x, min_y, max_x, max_y)
    # we could use 'viewbox' here to make life easy, but that changes what '1'
    # means for stroke width, etc. Also, it doesn't invert the axis.
    #rvg.viewbox(min_x, min_y, (max_x - min_x), (max_y - min_y)) do |canvas|

    xratio = (max_x - min_x) / width.to_f
    yratio = (max_y - min_y) / height.to_f

    xtrans = lambda { |x| (x - min_x) / xratio }

    # ytrans should invert, (larger 'y' means higher on the graph)
    ytrans = lambda { |y| height - ((y - min_y) / yratio) }
    rvg = Magick::RVG.new(width, height) do |canvas|
      canvas.background_fill = 'white'

      # Translate all the points, then plot with polyline.
      transpoints = @points.collect { |x,y| [ xtrans.call(x), ytrans.call(y) ] }
      canvas.polyline(*(transpoints.flatten)).styles(:stroke_width => 1, :stroke => "red", :fill => "none")

      # Fill under the curve by making a polygon of the line; prepending
      # the origin and appending the largest viewable X value + y origin
      transpoints.unshift([0, height])
      transpoints << [width, height]
      canvas.polygon(*(transpoints.flatten)).styles(:stroke_width => 1, :stroke => "red", :fill => "#FFCCFF")

      @points.each do |x,y|
        canvas.circle(1, xtrans.call(x), ytrans.call(y))
      end
    end
    return rvg
  end
end


graph = PrettyGraph.new(400, 200, "Hello")

axis = GraphAxis.new
(1..60).each do |i| 
  axis.points << [Time.now.to_f + i, Math.log(i)]
end

axis2 = GraphAxis.new
(1..60).each do |i| 
  axis2.points << [Time.now.to_f + i, Math.sin((i / 2.0).to_f)]
end

graph.axes << axis
graph.axes << axis2

graph.render("/home/jls/public_html/test.gif")
