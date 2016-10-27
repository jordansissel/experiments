require "flores/pki"

class Cert
  attr_reader :key
  attr_reader :cert

  def initialize(subject)
    @subject = subject
    @key = OpenSSL::PKey::RSA.generate(2048, 65537)
    @cert = makecert
  end

  def makecert
    csr = Flores::PKI::CertificateSigningRequest.new
    csr.subject = @subject
    csr.public_key = @key.public_key
    csr.start_time = Time.now
    csr.expire_time = Time.now + 3600
    csrmod(csr) if respond_to?(:csrmod)
    return csr.create
  end

  def write(path)
    File.write("#{path}.key", @key)
    File.write("#{path}.crt", @cert)
    self
  end
end

class Root < Cert
  def csrmod(csr)
    csr.signing_key = @key
    csr.want_signature_ability = true
  end

  def intermediate(subject)
    Intermediate.new(subject, self)
  end

  def leaf(subject, *alts)
    Leaf.new(subject, alts, self)
  end
end

class Intermediate < Root
  def initialize(subject, signer)
    @signer = signer
    super(subject)
  end

  def csrmod(csr)
    super(csr)
    csr.signing_key = @signer.key
    csr.signing_certificate = @signer.cert
  end
end

class Leaf < Cert
  def initialize(subject, signer, alts=[])
    @signer = signer
    @alts = alts
    super(subject)
  end

  def csrmod(csr)
    csr.signing_key = @signer.key
    csr.signing_certificate = @signer.cert
    csr.subject_alternates = @alts
  end
end

root = Root.new("CN=fancy root").write("root")
int1 = Intermediate.new("CN=fancy int1", root).write("int1")
int2 = Intermediate.new("CN=fancy int2", int1).write("int2")
leaf = Leaf.new("CN=localhost", int2, ["IP:1.2.3.4", "DNS:localhost"]).write("leaf")
