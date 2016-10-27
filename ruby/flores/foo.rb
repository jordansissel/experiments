require "flores/pki"

class CK
  attr_reader :key, :cert
  def initialize(key, cert)
    @key = key
    @cert = cert
  end

  def write(path)
    File.write("#{path}.key", @key)
    File.write("#{path}.crt", @cert)
    self
  end
end

def generate(subject, signer=nil, ca=true)
  csr = Flores::PKI::CertificateSigningRequest.new
  key = OpenSSL::PKey::RSA.generate(2048, 65537)
  csr.subject = subject
  csr.public_key = key.public_key
  csr.start_time = Time.now
  csr.expire_time = Time.now + 3600
  csr.want_signature_ability = ca

  if signer
    csr.signing_key = signer.key
    csr.signing_certificate = signer.cert
  else
    csr.signing_key = key
  end

  return key, csr.create
end

root = CK.new(*generate("CN=fancy root")).write("root")
int1 = CK.new(*generate("CN=fancy int1", root)).write("int1")
int2 = CK.new(*generate("CN=fancy int2", int1)).write("int2")
leaf = CK.new(*generate("CN=localhost", int2, false)).write("leaf")
