let alertMode = "loadMusic";
let dirtyFlag = false;
let isWebHIDSupported = true;

const objSelectCommand = document.getElementById('selectCommand');
const objCommandDescription = document.getElementById('commandDescription');
const objProgramTA = document.getElementById('programTextArea');
const objBtnConnect = document.getElementById('btnConnect');
const objBtnUpload = document.getElementById('btnUpload');
const objBtnClearProgram = document.getElementById('btnClearProgram');
const objBtnSaveProgram = document.getElementById('btnSaveProgram');
const objBtnLoadProgram = document.getElementById('btnLoadProgram');
const objBtnLoadSample = document.getElementById('btnLoadSample');
const objSelectSample = document.getElementById('selectSample');
const objSampleTA = document.getElementById('sampleTextArea');

const objBtnForward = document.getElementById('btnForward');
const objBtnBackward = document.getElementById('btnBackward');
const objBtnTurnLeft = document.getElementById('btnTurnLeft');
const objBtnTurnRight = document.getElementById('btnTurnRight');

const objVersion = document.getElementById('version');
const objControllerArea = document.getElementById('controllerArea');



function startup() {
    if (!("hid" in navigator)) {
        isWebHIDSupported = false;
        document.getElementById("deviceStatus").innerText = "WebHIDに未対応です。";
    }

    objBtnConnect.addEventListener('mouseup', connect, false);
    // objBtnConnect.addEventListener('touchend', connect, false);

    objBtnUpload.addEventListener('mouseup', upload, false);
    // objBtnUpload.addEventListener('touchend', upload, false);
    
    objBtnClearProgram.addEventListener('mouseup', onClearProgram, false);
    objBtnSaveProgram.addEventListener('mouseup', onSaveProgram, false);

    objBtnLoadProgram.addEventListener('click', clearFilePath);
    objBtnLoadProgram.addEventListener('change', onLoadProgram);

    objSelectCommand.addEventListener('change', setDescription, false);
    objProgramTA.addEventListener('keydown', onKeydown, false);
    
    objBtnLoadSample.addEventListener('mouseup', onLoadSample, false);
    objSelectSample.addEventListener('change', setSampleProgram, false);

    objBtnForward.addEventListener('mousedown', remoteForward, false);
    objBtnForward.addEventListener('touchstart', remoteForward, false);
    objBtnForward.addEventListener('mouseup', remoteStop, false);
    objBtnForward.addEventListener('touchend', remoteStop, false);
    
    objBtnBackward.addEventListener('mousedown', remoteBackward, false);
    objBtnBackward.addEventListener('touchstart', remoteBackward, false);
    objBtnBackward.addEventListener('mouseup', remoteStop, false);
    objBtnBackward.addEventListener('touchend', remoteStop, false);

    objBtnTurnLeft.addEventListener('mousedown', remoteTurnLeft, false);
    objBtnTurnLeft.addEventListener('touchstart', remoteTurnLeft, false);
    objBtnTurnLeft.addEventListener('mouseup', remoteStop, false);
    objBtnTurnLeft.addEventListener('touchend', remoteStop, false);

    objBtnTurnRight.addEventListener('mousedown', remoteTurnRight, false);
    objBtnTurnRight.addEventListener('touchstart', remoteTurnRight, false);
    objBtnTurnRight.addEventListener('mouseup', remoteStop, false);
    objBtnTurnRight.addEventListener('touchend', remoteStop, false);

    objVersion.addEventListener('dblclick', showSampleButton, false);
    objControllerArea.addEventListener('dblclick', showRemote, false);


    setVersion();
    setSelectBox();
    setButtonStyle();
    setSampleSelectBox();

    makeCommandDictionary();
    // console.log(commandDictionary);

    objProgramTA.value = '進む, 5\nさがる, 5\n右回転, 5\n左回転, 5\n止まる, 0\n電子音, 3, 135\n電子音, 3, 120\n電子音, 3, 107\n';
}

document.addEventListener("DOMContentLoaded", startup);

function setButtonStyle() {
    if (!isWebHIDSupported) {
        objBtnConnect.style.opacity = "0.4";
    }

    if (isConnected) {
        objBtnConnect.classList.add("connected");

        objBtnUpload.style.opacity = "1.0";
        objBtnForward.style.opacity = "1.0";
        objBtnBackward.style.opacity = "1.0";
        objBtnTurnLeft.style.opacity = "1.0";
        objBtnTurnRight.style.opacity = "1.0";
    } else {
        objBtnConnect.classList.remove("connected");
    
        objBtnUpload.style.opacity = "0.4";
        objBtnForward.style.opacity = "0.4";
        objBtnBackward.style.opacity = "0.4";
        objBtnTurnLeft.style.opacity = "0.4";
        objBtnTurnRight.style.opacity = "0.4";
    }
}

function setVersion() {
    let modified = new Date(document.lastModified);
    let year  = modified.getFullYear();
    let month = ('0' + (modified.getMonth() + 1)).slice(-2);
    let date  = ('0' + modified.getDate()).slice(-2);

    document.getElementById("version").innerHTML = 'ver. ' + year + month + date;
}

function setSelectBox() {
    for (let i = 0; i < commandData.length; i++) {
        if (commandData[i][0] != 0) {
            let objOption = document.createElement('option');
            objOption.setAttribute('value', i);
            objOption.text = commandData[i][1];
            objOption.value = commandData[i][1];
            objSelectCommand.appendChild(objOption);
        }
    }
}

function setDescription() {
    command = objSelectCommand.value;

    let description = commandDictionary[command][2];
    if (commandDictionary[command][1] >= 2) {
        description = description + '\n【' + commandDictionary[command][3]['note'] + '】';
    }
    if (commandDictionary[command][1] >= 3) {
        description = description + '\n【' + commandDictionary[command][4]['note'] + '】';
    }

    document.getElementById('commandDescription').innerText = description;
}

function onKeydown(event) {
    if (event.keyCode != 9) {
        return;
    }

    event.preventDefault();

    let carretPosition = objProgramTA.selectionStart;
    let carretLeft     = objProgramTA.value.substr(0, carretPosition);
    let carretRight    = objProgramTA.value.substr(carretPosition, objProgramTA.value.length);

    objProgramTA.value = carretLeft + "\t" + carretRight;
    objProgramTA.selectionEnd = carretPosition+1;
}


async function upload(event) {
    event.preventDefault();

    if (isConnected == false) {
        return;
    }
    
    let commandList = parseCommand();
    // addStopCommand(commandList);
    // let sendcode = compileCommand(commandList);

    const waitFor = duration => new Promise(r => setTimeout(r, duration));
    
    // console.log(device.productName);
    // console.log(device.collections);

    const reportId = 0x00;
    const dataS = Uint8Array.from([  1,  16, ...Array(62).fill(255)]);
    const dataE = Uint8Array.from([  1,  19, ...Array(62).fill(255)]);
    
    await device.sendReport(reportId, new Uint8Array(dataS));

    for (let i = 0; i < commandList.length; i++) {
        if (commandList[i].length == 0) continue;

        let command = commandList[i].split(',');
        let data = Array(64).fill(255, 0);
        data[1] = 16;
        
        if (command[0] in commandDictionary) {
            data[0] = commandDictionary[command[0]][1] + 1;

            switch (commandDictionary[command[0]][1]) {
                case 3:
                data[4] = parseInt(command[2], 10);
                case 2:
                data[3] = parseInt(command[1], 10);
                case 1:
                data[2] = commandDictionary[command[0]][0];
            }

        } else {
            console.log(i, 'Command not found!');
        }

        // console.log(data);
        await device.sendReport(reportId, new Uint8Array(data));
        // waitFor(100);
    }

    await device.sendReport(reportId, new Uint8Array(dataE));
}

let commandDictionary = {};
// '命令':[0命令コード, 1命令サイズ（byte）, 2'命令の説明', 3'引数1名称', 4'引数1説明', 5引数1最小値, 6引数1最大値, 7'引数2名称', 8'引数2説明', 9引数2最小値, 10引数2最大値]
function makeCommandDictionary() {
    for (let i = 0; i < commandData.length; i++) {
        let command = commandData[i][1];
        commandDictionary[command] = [];
        commandDictionary[command].push(commandData[i][2]);
        commandDictionary[command].push(commandData[i][3]);
        commandDictionary[command].push(commandData[i][4]);
        if (commandData[i][3] == 1) continue;
        commandDictionary[command].push({name:commandData[i][5], note:commandData[i][6], min:commandData[i][7], max:commandData[i][8]});
        if (commandData[i][3] == 2) continue;
        commandDictionary[command].push({name:commandData[i][9], note:commandData[i][10], min:commandData[i][11], max:commandData[i][12]});
    }
}
  
function parseCommand() {
    console.log("parseCommand");

    let commandList = objProgramTA.value;
    commandList     = commandList.replace(/ /g, "");    // 半角スペース除去
    commandList     = commandList.replace(/　/g, "");   // 全角スペース除去
    commandList     = commandList.replace(/\t/g, "");   // タブ除去
    commandList     = commandList.replace(/，/g, ",");  // 全角カンマ → 半角
    commandList     = commandList.replace(/[０-９]/g, function(s) { // 全角数字 → 半角
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    commandList     = commandList.replace(/\n$/g, "");
    // commandList     = commandList.replace(/\n\n+/g, "\n");
    // commandList     = commandList.replace(/^\n/g, "");

    commandList = commandList.split('\n');
    // console.log(commandList);

    return commandList;
}

function addStopCommand(commandList) {
    let motorFlag = false;

    for (let i = 0; i < commandList.length; i++) {
        if (commandList[i].length == 0) continue;

        let commandArray = commandList[i].split(',');
        let command = commandArray[0];

        if (command in commandDictionary) {
            if (commandDictionary[command][0] >= 1 && commandDictionary[command][0] <= 11) {
                motorFlag = true;
            } else if (motorFlag == true) {
                if (commandDictionary[command][0] == 80 || commandDictionary[command][0] == 105) {
                    commandList.splice(i, 0, '止まる,0');
                }
                motorFlag = false;
            }
        } else {
            console.log('Line ' + String(i + 1) + ': ' + command + ' not found!');
        }
    }
}

function compileCommand(commandList) {
    let sendcode = [];

    for (let i = 0; i < commandList.length; i++) {
        if (commandList[i].length == 0) continue;

        let commandArray = commandList[i].split(',');
        let command = commandArray[0];

        if (command in commandDictionary) {
            sendcode.push(commandDictionary[command][0]);
            for (c = 1; c < commandDictionary[command][1]; c++) {
                sendcode.push(parseInt(commandArray[c], 10));
            }
        } else {
            console.log('Line ' + String(i + 1) + ': ' + command + ' not found!');
        }
    }

    return sendcode;
}

function onSaveProgram(event) {
    event.preventDefault();

    alertMode = "saveProgram";
    document.getElementById('alertTitle').innerText = "プログラムを保存します";
    document.getElementById('alertMessage').innerText = "名前を付けてプログラムを保存します。\n（ダウンロード（要確認）に保存されます）";
    document.getElementById('btnCancel').innerText = "やめる";
    document.getElementById('btnOK').innerText = "保存する";
    objDialogAlert.showModal();
}

function saveProgram() {
    const a = document.createElement('a');
    a.href = 'data:text/plain,' + encodeURIComponent(objProgramTA.value);
    a.download = document.getElementById('inputProgramName').value;

    a.click();
}



// 保持しているファイル名を消す
function clearFilePath() {
    objBtnLoadProgram.value = null;
}

function onLoadProgram(event) {
    event.preventDefault();

    alertMode = "loadProgram";
    document.getElementById('alertTitle').innerText = "";
    document.getElementById('alertMessage').innerText = "プログラムを読み込みますか？\n（現在のプログラムは消去されます）";
    document.getElementById('btnCancel').innerText = "やめる";
    document.getElementById('btnOK').innerText = "読み込む";
    objDialogAlert.showModal();
}

function loadProgram() {
    let reader = new FileReader();

    let file = objBtnLoadProgram.files[0];

    reader.readAsText(file, 'UTF-8');
    reader.onload = ()=> {
        objProgramTA.value = reader.result;
    };

    document.getElementById('inputProgramName').value = file.name;
}

function onClearProgram() {
    alertMode = "clearProgram";
    document.getElementById('alertTitle').innerText = "";
    document.getElementById('alertMessage').innerText = "現在のプログラムを消去しますか？";
    document.getElementById('btnCancel').innerText = "やめる";
    document.getElementById('btnOK').innerText = "消去する";
    objDialogAlert.showModal();
}
    
function clearProgram() {
    objProgramTA.value = "";

    // document.getElementById('inputProgramName').value = file.name;
}
    

// 引数入力用ダイアログボックス

// dialogPolyfillを使用する場合
// let dialogList = document.querySelectorAll('dialog');
// if (dialogList) {
//   for (let i = 0; i < dialogList.length; i++) {
//     dialogPolyfill.registerDialog(dialogList[i]);
//   }
// }

let argValue = new Array(3);

const objDialogArg = document.getElementById('dialogArg');
const objBtnArgOK = document.getElementById('btnArgOK');
const objBtnArgCancel = document.getElementById('btnArgCancel');

objSelectCommand.addEventListener('dblclick', function() {
    if (setDialogBox()) {
        objDialogArg.showModal();
    } else {
        addCommandToTextArea();
    }
});

objBtnArgOK.addEventListener('click', function() {
    addCommandToTextArea();
    objDialogArg.close();
});

objBtnArgCancel.addEventListener('click', function() {
    objDialogArg.close('cancelled');
});

objDialogArg.addEventListener('click', function(event) {
    if (event.target === objDialogArg) {
        objDialogArg.close('cancelled');
    }
});

function addCommandToTextArea() {
    argValue[1] = document.getElementById("inputArg1").value;
    argValue[2] = document.getElementById("inputArg2").value;

    let commandList = objProgramTA.value;
    let pos          = objProgramTA.selectionStart;
    let len          = commandList.length;
    let before       = commandList.substr(0, pos);
    let after        = commandList.substr(pos, len);
    let word         = objSelectCommand.value;

    for (let i = 1; i < commandDictionary[objSelectCommand.value][1]; i++) {
        word = word + ', ' + argValue[i];
    }

    if (after[0] != '\n') {
        word = word + '\n';
    }

    objProgramTA.value = before + word + after;

    objProgramTA.focus();
    let newCaret = pos + word.length;
    objProgramTA.setSelectionRange(newCaret, newCaret);
}

function setDialogBox() {
    command = objSelectCommand.value;
    console.log(command, commandDictionary[command][1]);
    
    switch (commandDictionary[command][1]) {
        case 1: // 引数なし
            return false;
        case 2: // 引数1
            document.getElementById("arg1Name").innerText = commandDictionary[command][3]['name'];
            document.getElementById("arg1Description").innerText = commandDictionary[command][3]['note'];
            document.getElementById("inputArg1").min = commandDictionary[command][3]['min'];
            document.getElementById("inputArg1").max = commandDictionary[command][3]['max'];
            if (isNaN(argValue[1])) {
                document.getElementById("inputArg1").value = commandDictionary[command][3]['min'];
            } else {
                if (argValue[1] < commandDictionary[command][3]['min']) {
                    document.getElementById("inputArg1").value = commandDictionary[command][3]['min'];
                } else if (argValue[1] > commandDictionary[command][3]['max']) {
                    document.getElementById("inputArg1").value = commandDictionary[command][3]['max'];
                } else {
                    document.getElementById("inputArg1").value = argValue[1];
                }  
            }
            arg2Value = null;
            document.getElementById("arg2").style.display = "none";
            break;
        case 3: // 引数2
            document.getElementById("arg1Name").innerText = commandDictionary[command][3]['name'];
            document.getElementById("arg1Description").innerText = commandDictionary[command][3]['note'];
            document.getElementById("inputArg1").min = commandDictionary[command][3]['min'];
            document.getElementById("inputArg1").max = commandDictionary[command][3]['max'];
            if (isNaN(argValue[1])) {
                document.getElementById("inputArg1").value = commandDictionary[command][3]['min'];
            } else {
                if (argValue[1] < commandDictionary[command][3]['min']) {
                    document.getElementById("inputArg1").value = commandDictionary[command][3]['min'];
                } else if (argValue[1] > commandDictionary[command][3]['max']) {
                    document.getElementById("inputArg1").value = commandDictionary[command][3]['max'];
                } else {
                    document.getElementById("inputArg1").value = argValue[1];
                }  
            }
            document.getElementById("arg2").style.display = "block";
            document.getElementById("arg2Name").innerText = commandDictionary[command][4]['name'];
            document.getElementById("arg2Description").innerText = commandDictionary[command][4]['note'];
            document.getElementById("inputArg2").min = commandDictionary[command][4]['min'];
            document.getElementById("inputArg2").max = commandDictionary[command][4]['max'];
            if (commandDictionary[command][4]['min'] == commandDictionary[command][4]['max']) {
                // document.getElementById("arg2").style.display = "none";
                document.getElementById("inputArg2").readOnly = true;
            } else {
                // document.getElementById("arg2").style.display = "block";
                document.getElementById("inputArg2").readOnly = false;
            }
            if (isNaN(argValue[2])) {
                document.getElementById("inputArg2").value = commandDictionary[command][4]['min'];
            } else {
                if (argValue[2] < commandDictionary[command][4]['min']) {
                    document.getElementById("inputArg2").value = commandDictionary[command][4]['min'];
                } else if (argValue[2] > commandDictionary[command][4]['max']) {
                    document.getElementById("inputArg2").value = commandDictionary[command][4]['max'];
                } else {
                    document.getElementById("inputArg2").value = argValue[2];
                }  
            }

            break;
    }

    return true;
}


// アラートダイアログボックス

const objDialogAlert = document.getElementById('dialogAlert');
const objBtnOK = document.getElementById('btnOK');
const objBtnCancel = document.getElementById('btnCancel');

objBtnOK.addEventListener('click', function() {
    switch (alertMode) {
        case 'loadProgram':
            loadProgram();
            break;
        case 'saveProgram':
            saveProgram();
            break;
        case 'loadSample':
            loadSample();
            break;
        case 'clearProgram':
            clearProgram();
            break;
        case 'loadMusic':
            loadMusic();
            break;
        default:
    }

    objDialogAlert.close();
});

objBtnCancel.addEventListener('click', function() {
    objDialogAlert.close();
});

objDialogAlert.addEventListener('click', function(event) {
    if (event.target === objDialogAlert) {
        objDialogAlert.close('cancelled');
    }
});



// サンプルプログラム
function setSampleSelectBox() {
    for (let i = 0; i < sampleData.length; i++) {
        let objOption = document.createElement('option');
        objOption.setAttribute('value', i);
        objOption.text = sampleData[i][0];
        objOption.value = sampleData[i][0];
        objSelectSample.appendChild(objOption);
    }
}

function setSampleProgram() {
    objSampleTA.value = sampleData[objSelectSample.selectedIndex][2];
}

function onLoadSample(event) {
    event.preventDefault();

    objDialogSample.showModal();
}

function loadSample() {
    // console.log(objSelectSample.selectedIndex);

    objProgramTA.value = sampleData[objSelectSample.selectedIndex][2];
    document.getElementById('inputProgramName').value = sampleData[objSelectSample.selectedIndex][1];
}

function showSampleButton() {
    if (objBtnLoadSample.style.display == 'none') {
        objBtnLoadSample.style.display = 'block';
    } else {
        objBtnLoadSample.style.display = 'none';
    }
}


// サンプルプログラムダイアログボックス

const objDialogSample = document.getElementById('dialogSample');
const objBtnSampleOK = document.getElementById('btnSampleOK');
const objBtnSampleCancel = document.getElementById('btnSampleCancel');

objBtnSampleOK.addEventListener('click', function() {
    if (objSelectSample.selectedIndex == -1) {
        return;
    } else {
        objDialogSample.close();
        alertMode = "loadSample";
        document.getElementById('alertTitle').innerText = "";
        document.getElementById('alertMessage').innerText = "プログラムを読み込みますか？\n（現在のプログラムは消去されます）";
        document.getElementById('btnCancel').innerText = "やめる";
        document.getElementById('btnOK').innerText = "読み込む";
        objDialogAlert.showModal();
    }
});

objBtnSampleCancel.addEventListener('click', function() {
    objDialogSample.close();
});

objDialogSample.addEventListener('click', function(event) {
    if (event.target === objDialogSample) {
        objDialogSample.close('cancelled');
    }
});



// リモートボタン
function showRemote() {
    objRemoteController = document.getElementById('remote-controller');
    if (objRemoteController.style.display == "none") {
        objRemoteController.style.display = "block";
    } else {
        objRemoteController.style.display = "none";
    }
}



window.oncontextmenu = function(event) {
    event.preventDefault();
    event.stopPropagation();

    return false;
};
