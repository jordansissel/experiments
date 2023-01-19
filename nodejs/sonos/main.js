const { DeviceDiscovery, Helpers } = require('sonos');

const { EventEmitter } = require('node:events');

class SonosInfo {
  constructor() {
    this.devices = {};
    //this.events.addListener('new-device', this.addDevice);
  }

  addDevice(device) {
    device.deviceDescription().then(descr => {
      //console.log("New device: " + descr.friendlyName);
      //console.log(descr)
      this.devices[descr.displayName] = device;
    })
  }
}

const sonosinfo = new SonosInfo();

DeviceDiscovery((device) => {
  sonosinfo.addDevice(device);
  device.deviceDescription().then(descr => {
    // look for a sonos named "Office" 
    if (descr.roomName.match(/Office/)) { 
      //console.log(descr);
      console.log(device);
      // Coheed - Vaxis II - first track
      // https://play.napster.com/track/tra.676707759?ocode=social_user&pcode=social_user&cpath=Link&rsrc=track
      //const uri = "x-sonos-http:ondemand_track%3a%3atra.676707759|v1|ALBUM|alb.676707757.mp4?sid=202&flags=8232&sn=1"
      const uri = "x-sonos-http:ondemand_track%3a%3atra.186303593%7cv1%7cALBUM%7calb.186303592.mp4?sid=202&flags=8232&sn=1"

  //metadata += `<res protocolInfo="http-get:*:audio/mpeg:*" duration="${duration}">${streamUrl}</res>`
      const metadata = `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/" xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/"><item id="Q:0/1" parentId="Q:0"><upnp:class>
object.item.audioItem.musicTrack</upnp:class><dc:title>Hello Name</dc:title><dc:creator>Artist Name</dc:creator><upnp:album>Album</upnp:album></item></DIDL-Lite>`

      const track = {
        name: "trackname",
        artist: "artist",
        album: "album",
      }

      //x-sonos-http:ondemand_track%3a%3atra.186303593%7cv1%7cALBUM%7calb.186303592.mp4?sid=202&flags=8232&sn=1
      //10032028ondemand_track%3a%3atra.186303593%7cv1%7cALBUM%7calb.186303592
      const metadata3 = `
      <DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/" xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">
  <item id="10032028ondemand_track%3a%3atra.186303593%7cv1%7cALBUM%7calb.186303592" parentID="100420ecexplore%3aalbum%3a%3aalb.186303592" restricted="true">
    <dc:title>The Hollow</dc:title>
    <upnp:class>object.item.audioItem.musicTrack</upnp:class>
    <dc:creator>Coheed And Cambria</dc:creator>
    <upnp:albumArtURI>http://direct-ns.rhapsody.com/imageserver/images/tra.186303593/300x300.jpg</upnp:albumArtURI>
    <r:albumArtist>Coheed And Cambria</r:albumArtist>
    <r:description>The Afterman: Deluxe Edition</r:description>
    <desc id="cdudn" nameSpace="urn:schemas-rinconnetworks-com:metadata-1-0/">SA_RINCON51719_sonos-devices@jls.semicomplete.com</desc>
  </item>
</DIDL-Lite>
`
      console.log(metadata3)
      device.flush()
        .then(() => device.queue({ uri: uri, metadata: metadata3 }))
        .then(() => device.getQueue()).then(e => { console.log("Queue", e) })

      //device.getQueue().then(e => { console.log("Queue", e) })
    }
  });
});
