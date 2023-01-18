const { DeviceDiscovery } = require('sonos');

const { EventEmitter } = require('node:events');

class SonosInfo {
  constructor() {
    this.devices = {};
    //this.events.addListener('new-device', this.addDevice);
  }

  addDevice(device) {
    device.deviceDescription().then(descr => {
      console.log("New device: " + descr.friendlyName + " / " + descr.roomName);
      //console.log(descr)
      this.devices[descr.displayName] = device;
    })
  }
}

const sonosinfo = new SonosInfo();

DeviceDiscovery((device) => {
  sonosinfo.addDevice(device);
  device.deviceDescription().then(descr => {
    if (descr.roomName.match(/Office/)) { 
      console.log(device);
      console.log(descr.roomName);

      device.getQueue().then(e => console.log(e))
    }
  });
});
