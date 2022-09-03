var upnp = require("peer-upnp");
var http = require("http");
var server = http.createServer();
var PORT = 8080;
server.listen(PORT);
// Peer is an event emitter
var peer = upnp
  .createPeer({
    prefix: "/upnp",
    server: server,
  })
  .on("ready", function (peer: { on: (arg0: string, arg1: (service: any) => void) => { (): any; new(): any; on: { (arg0: string, arg1: (device: any) => void): void; new(): any; }; }; close: () => void; }) {
    console.log("ready");
    // listen to urn:schemas-upnp-org:service:SwitchPower:1 services
    peer
      .on("urn:schemas-upnp-org:service:SwitchPower:1", function (service: { serviceType: string; on: (arg0: string, arg1: (service: any) => void) => void; bind: (arg0: (service: any) => void) => { (): any; new(): any; on: { (arg0: string, arg1: (data: any) => void): void; new(): any; }; }; removeAllListeners: (arg0: string) => void; }) {
        console.log("service " + service.serviceType + " found");
        service.on("disappear", function (service: { serviceType: string; }) {
          console.log("service " + service.serviceType + " disappeared");
        });
        // Bind to service to be able to call service actions
        service
          .bind(function (service: { SetTarget: (arg0: { NewTargetValue: number; }, arg1: (res: any) => void) => void; }) {
            // Call UPnP action SetTarget with parameter NewTargetValue
            service.SetTarget(
              {
                NewTargetValue: 1,
              },
              function (res: any) {
                console.log("Result", res);
              }
            );
        })
          .on("event", function (data: { Status: string; }) {
            console.log(
              data.Status == "1" || data.Status == "true"
                ? "Light is ON"
                : "Light is OFF"
            );
          });
        // unsubscribe from the service after 10 seconds
        setTimeout(function () {
          service.removeAllListeners("event");
        }, 10000);
      })
      .on("upnp:rootdevice", function (device: { deviceType: string; on: (arg0: string, arg1: (device: any) => void) => void; }) {
        // listen to root devices
        console.log("rootdevice " + device.deviceType + " found");
        device.on("disappear", function (device: { UDN: string; }) {
          console.log("rootdevice " + device.UDN + " disappeared");
        });
      });
    // close peer after 30 seconds
    setTimeout(function () {
      peer.close();
    }, 30000);
  })
  .on("close", function () {
    console.log("closed");
  });
