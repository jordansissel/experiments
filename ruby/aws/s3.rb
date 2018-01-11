require "aws-sdk-s3"

def dirlist(client, bucket, prefix)
  client.list_objects(bucket: bucket, delimiter: "/", prefix: prefix) \
    .common_prefixes \
    .map(&:prefix) \
    .map { |path| File.basename(path) }
end

bucket = ARGV[0]
s3region = ARGV[1]
if bucket.nil? || s3region.nil?
  puts "Usage: #{$0} bucket-name region-name"
  exit 1
end

begin
  client = Aws::S3::Client.new(region: s3region)

  accounts = dirlist(client, bucket, "AWSLogs/")

  count = 0
  accounts.each do |account|
    types = dirlist(client, bucket, "AWSLogs/#{account}/")
    types.each do |type|
      regions = dirlist(client, bucket, "AWSLogs/#{account}/#{type}/")
      #p [account, type, regions]

      date = (Time.now - 86400).strftime("%Y/%m/%d")
      regions.each do |region|
        puts "Listing objects in account [redacted] type #{type} region #{region} date #{date}"
        # List files for today
        prefix = "AWSLogs/#{account}/#{type}/#{region}/#{date}/"

        #p prefix

        region_count = 0
        Aws::S3::Resource.new(region: s3region).bucket(bucket).objects(prefix: prefix).each do |object|
          count += 1
          region_count += 1
          #$stdout.syswrite(".")
        end
        puts "#{region_count} objects in account [redacted] type #{type} region #{region} date #{date}"
      end
    end
  end

  puts "Total objects: #{count}"
rescue => e
  puts "Error: #{e}"
  raise if ENV["DEBUG"]
  exit 1
end
