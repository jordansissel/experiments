require "rubygems"
require "test/unit"
require "ffi"
require "ipaddr"

module ACL
  extend FFI::Library
  LIB = File.join(File.dirname(__FILE__), "..", "acl.so")
  
  system("make -C .. acl.so") or raise "compile failed"

  ffi_lib LIB
  attach_function :acl_v4_new, [], :pointer
  attach_function :acl_v4_add_str, [:pointer, :string, :int], :int
  attach_function :acl_v4_test, [:pointer, :uint], :int
  attach_function :acl_v4_length, [:pointer], :int
end

class TestACL < Test::Unit::TestCase
  def test_add_and_length_agrees
    acl = ACL.acl_v4_new
    
    list = %w{0.0.0.0/0 1.2.3.4/32 192.168.0.1/8 10.0.3.4}
    list.each do |l|
      rc = ACL.acl_v4_add_str(acl, l, l.length)
      assert_equal(0, rc, "acl_v4_add_str of '#{l}' should succeed")
    end

    assert_equal(list.length, ACL.acl_v4_length(acl),
                 "ACL length should be #{list.length}")
  end # def test_add_and_length_agrees

  def test_invalid_addresses
    acl = ACL.acl_v4_new

    list = %w{1.2.3.4/33 256.254.13.4/30}
    list.each do |l|
      rc = ACL.acl_v4_add_str(acl, l, l.length)
      assert_not_equal(0, rc, "acl_v4_add_str of '#{l}' should fail")
    end

    assert_equal(0, ACL.acl_v4_length(acl),
                 "ACL length should be 0 since all addresses should be invalid")
  end # def test_invalid_addresses

  def test_acl_allows_succeeds
    acl = ACL.acl_v4_new

    list = %w{10.0.0.0/8 192.168.0.1 172.16.0.0/16}
    list.each do |l|
      rc = ACL.acl_v4_add_str(acl, l, l.length)
      assert_equal(0, rc, "acl_v4_add_str of '#{l}' should succeed")
    end

    ips = %w{10.0.0.1 10.255.3.4 192.168.0.1 172.16.0.1 172.16.255.255}
    ips.each do |ip|
      ip_int = ip.split(".").reduce(0) { |s,c| s = (s << 8) + (c.to_i) }
      #printf("%s => %08x (%d)\n", ip, ip_int, ip_int)
      assert_equal(0, ACL.acl_v4_test(acl, ip_int),
                   "Expected #{ip} to be accepted by ACL.")
    end
  end # def test_acl_allows_succeeds

  def test_acl_slash_16
    acl = ACL.acl_v4_new
    
    net =  "172.16.0.0/16"
    ACL.acl_v4_add_str(acl, net, net.length)

    addr = IPAddr.new(net)
    1.upto(1 << 16).each do |i|
      assert_equal(0, ACL.acl_v4_test(acl, addr.to_i),
                   "Expected #{addr} to be accepted by ACL.")
      addr = addr.succ
    end
  end # def test_acl_slash_16

end # class TestACL
