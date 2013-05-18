class OldWay
  def initialize(data = {})
    @data = data
  end

  def [](key)
    if key[0] == '['
      val = @data
      key.gsub(/(?<=\[).+?(?=\])/).each do |tok|
        if val.is_a? Array
          val = val[tok.to_i]
        else
          val = val[tok]
        end
      end
      return val
    else
      return @data[key]
    end
  end # def []

  def old(key)
    # If the key isn't in fields and it starts with an "@" sign, get it out of data instead of fields
    if ! @data["@fields"].has_key?(key) and key.slice(0,1) == "@"
      return @data[key]
    elsif key.index(/(?<!\\)\./)
      value = nil
      obj = @data["@fields"]
      # "." is what ES uses to access structured data, so adopt that
      # idea here, too.  "foo.bar" will access key "bar" under hash "foo".
      key.split(/(?<!\\)\./).each do |segment|
        segment.gsub!(/\\\./, ".")
        if (obj.is_a?(Array) || (obj.is_a?(Hash) && !obj.member?(segment)) )
          # try to safely cast segment to integer for the 0 in foo.0.bar
          begin
            segment = Integer(segment)
          rescue Exception
            #not an int, do nothing, segment remains a string
          end
        end
        if obj
          value = obj[segment] rescue nil
          obj = obj[segment] rescue nil
        else
          value = nil
          break
        end
      end # key.split.each
      return value
    else
      return @data["@fields"][key.gsub(/\\\./, ".")]
    end
  end # def []
end
