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

root = Root.new("CN=root1").write("root1")
int1 = Intermediate.new("CN=root1 int 1", root).write("root1.int1")
leaf = Leaf.new("CN=localhost", int1, ["IP:1.2.3.4", "DNS:localhost"]).write("root1.int1.leaf1")
leaf2 = Leaf.new("CN=localhost", int1, ["IP:1.2.3.4", "DNS:localhost"]).write("root1.int1.leaf2")

root2 = Root.new("CN=root 2").write("root2")
int2_1 = Intermediate.new("CN=root 2 - int1", root).write("root2.int1")
