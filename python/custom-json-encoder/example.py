#
# You can't serialize Decimal with json by default, so you need to help json
# figure out how to serialize it.
#
import json
from decimal import Decimal

class HappyDecimalJSON(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, Decimal):
      return float(obj)
    return json.JSONEncoder.default(self, obj)

data = { 
  "foo": Decimal("33.445"),
  "bar": "Hello"
}

print json.dumps(data, cls=HappyDecimalJSON)
  
