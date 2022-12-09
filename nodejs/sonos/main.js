const { DeviceDiscovery } = require('sonos');

DeviceDiscovery((device) => {
  //console.log('found device at ' + device.host + " - " + device.friendlyName)

  device.deviceDescription().then(descr => {
    // look for a sonos named "Sonos Roam" 
    if (descr.friendlyName.match(/Sonos Roam/)) { 
      console.log(descr);
      // Coheed - Vaxis II - first track
      // https://play.napster.com/track/tra.676707759?ocode=social_user&pcode=social_user&cpath=Link&rsrc=track
      //device.play("x-sonos-http:ondemand_track%3a%3atra.676707759|v1|ALBUM|alb.676707757.mp4?sid=202&flags=8232&sn=1");
      device.play("x-sonos-http:ondemand_track%3a%3atra.676707759|v1|ALBUM|alb.676707757.mp4?sid=202&flags=8232&sn=1");
      //device.play("x-sonos-http:ondemand_album%3a%3aalb.676707757|v1|ALBUM|alb.676707757.mp4?sid=202&flags=8232&sn=1");
    }
  });
});
