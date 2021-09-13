let device;
  
async function connect() {
    console.log(event.type);

    if (device) {
        return;
    }

    // Filter on devices with the MYU robo.
    const filters = [
        {
            vendorId: 0x04d8, // Microchip Technology Inc.
            productId: 0xfa8b, // MYUUSB
            // usage: 0x01,
            // usagePage: 65280,
        },
      ];
    // Prompt user to select a MYU robo device.
    try {
        [device] = await navigator.hid.requestDevice({ filters });
        if (!device) {
          return;
        }
        // Wait for the HID connection to open.
	    await device.open();
        document.getElementById("deviceStatus").innerText = "ミュウロボが接続されました。";
        document.getElementById("btnConnect").classList.add("connected");
    
        document.getElementById("btnDownload").style.opacity = "1.0";

        document.getElementById("btnForward").style.opacity = "1.0";
        document.getElementById("btnBackward").style.opacity = "1.0";
        document.getElementById("btnTurnLeft").style.opacity = "1.0";
        document.getElementById("btnTurnRight").style.opacity = "1.0";
    } catch (error) {
        console.error(error.name, error.message);
    }
}

function handleConnectedDevice(e) {
    console.log("Device connected: " + e.device.productName);
}

function handleDisconnectedDevice(e) {
    console.log("Device disconnected: " + e.device.productName);

    device = undefined;
    document.getElementById("deviceStatus").innerText = "ミュウロボが接続されていません。";
    document.getElementById("btnConnect").classList.remove("connected");

    document.getElementById("btnDownload").style.opacity = "0.4";

    document.getElementById("btnForward").style.opacity = "0.4";
    document.getElementById("btnBackward").style.opacity = "0.4";
    document.getElementById("btnTurnLeft").style.opacity = "0.4";
    document.getElementById("btnTurnRight").style.opacity = "0.4";
}

function handleInputReport(e) {
    console.log(e.device.productName + ": got input report " + e.reportId);
    console.log(new Uint8Array(e.data.buffer));
}
  
navigator.hid.addEventListener("connect", handleConnectedDevice);
navigator.hid.addEventListener("disconnect", handleDisconnectedDevice);