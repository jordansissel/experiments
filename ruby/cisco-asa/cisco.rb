require "ftw"
require "nokogiri"

url = "http://www.cisco.com/en/US/docs/security/asa/asa80/system/message/logmsgs.html"

agent = FTW::Agent.new

response = agent.get!(url)
content = response.read_body
doc = Nokogiri::HTML(content)

#require "pry"; binding.pry
doc.css(".pEM_ErrMsg").each do |n| 
  # skip 'Error Message' headed
  c = n.children[1..-1]
  #require "pry"; binding.pry
  pattern = c.map do |n|
    value = if n.is_a?(Nokogiri::XML::Text)
              "\\Q#{n.text.gsub(/(^\s+)|(\s+$)/, "")}\\E" || ""
            #elsif n.is_a?(Nokogiri::XML::Element) && n.attributes["style"] && n.attributes["style"].value.downcase == "color: black; font-style: oblique; font-weight: normal"
            elsif n.is_a?(Nokogiri::XML::Element) && ["span", "em", "b"].include?(n.name)
              # placeholder, use something like %{WORD}
              if n.text =~ /^\s*$/
                nil
              else
                "%{WORD:#{n.text}}"
              end
            elsif n.is_a?(Nokogiri::XML::Element) && ["br"].include?(n.name)
              nil
            else
              puts "Unknown node thingy"
              p n
              require "pry"; binding.pry
            end
  end.reject { |l| l.nil? }.join(" ").gsub("\r\n", "")

  code = pattern[/[0-9]{6}/]
  puts "CISCO_ASA_#{code} #{pattern}"
end
