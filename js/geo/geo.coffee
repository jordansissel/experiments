radians = (deg) -> deg * Math.PI / 180.0
distance = (point1, point2) ->
  # http://andrew.hedges.name/experiments/haversine/
  R = 6373 # approximate radius of earth optimized for 39 degrees latitude
  lat1 = radians(point1.latitude)
  lat2 = radians(point2.latitude)
  lon1 = radians(point1.longitude)
  lon2 = radians(point2.longitude)
  dlat = lat2 - lat1
  dlon = lon2 - lon1

  a = Math.sin(dlat/2) * Math.sin(dlat/2) +
      Math.sin(dlon/2) * Math.sin(dlon/2) * Math.cos(lat1) * Math.cos(lat2) 
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) 
  return R * c

start = null
geo = (position) => 
  if start == null
    start = position.coords 
    $("body").append("Starting<br>")
  km = distance(start, position.coords)
  meters = km * 1000.0
  $("body").append("<div>Position (dist: " + meters + "): " + \
                   position.coords.latitude + ", " + position.coords.longitude + "</div>")
query = () -> navigator.geolocation.getCurrentPosition(geo, null)

setInterval(query, 1000)
