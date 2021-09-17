
async function remoteForward() {
    // if (!device) return;
    if (!isConnected) return;

    const data = Uint8Array.from([  2,   2,   0, ...Array(61).fill(255)]);
    await device.sendReport(0x00, new Uint8Array(data));
}

async function remoteBackward() {
    // if (!device) return;
    if (!isConnected) return;

    const data = Uint8Array.from([  2,   8,   0, ...Array(61).fill(255)]);
    await device.sendReport(0x00, new Uint8Array(data));
}

async function remoteTurnLeft() {
    // if (!device) return;
    if (!isConnected) return;

    const data = Uint8Array.from([  2,  11,   0, ...Array(61).fill(255)]);
    await device.sendReport(0x00, new Uint8Array(data));
}

async function remoteTurnRight() {
    // if (!device) return;
    if (!isConnected) return;

    const data = Uint8Array.from([  2,  10,   0, ...Array(61).fill(255)]);
    await device.sendReport(0x00, new Uint8Array(data));
}

async function remoteStop() {
    // if (!device) return;
    if (!isConnected) return;

    const data = Uint8Array.from([  2,   0,   0, ...Array(61).fill(255)]);
    await device.sendReport(0x00, new Uint8Array(data));
}
