let device = undefined;
let isConnected = false;
let deviceFilter = {    // Filter on devices with the MYU robo.
    vendorId: 0x04d8,   // Microchip Technology Inc.
    productId: 0xfa8b,  // MYUUSB
};
let requestParams = { filters: [deviceFilter] };

async function connect() {
    console.log(event.type);
    
    if (isConnected == true) {
        return;
    }

    try {
        [device] = await navigator.hid.requestDevice(requestParams);
        if (!device) {  // Cancelled
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

    if (!device.opened) {
        try {
            await device.open();
        } catch (error) {
            console.error(error.name, error.message);
        }   
    }

    document.getElementById("deviceStatus").innerText = "ミュウロボが接続されました。";
    document.getElementById("btnConnect").classList.add("connected");
    isConnected = true;    

    document.getElementById("btnDownload").style.opacity = "1.0";
    document.getElementById("btnForward").style.opacity = "1.0";
    document.getElementById("btnBackward").style.opacity = "1.0";
    document.getElementById("btnTurnLeft").style.opacity = "1.0";
    document.getElementById("btnTurnRight").style.opacity = "1.0";
}

async function handleConnectedDevice(e) {
    console.log("Device connected: " + e.device.productName);
    isConnected = true;
}

async function handleDisconnectedDevice(e) {
    console.log("Device disconnected: " + e.device.productName);

    device = undefined;
    document.getElementById("deviceStatus").innerText = "ミュウロボが接続されていません。";
    document.getElementById("btnConnect").classList.remove("connected");
    isConnected = false;
    
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
