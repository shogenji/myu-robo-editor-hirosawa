let alertMode = "loadMusic";
let dirtyFlag = false;

const objSelectCommand = document.getElementById('selectCommand');
const objCommandDescription = document.getElementById('commandDescription');
const objEditArea = document.getElementById('editArea');
const objProgramTA = document.getElementById('programTextArea');
const objVersion = document.getElementById("version");
const objConnect = document.getElementById('btnConnect');
const objDownload = document.getElementById('btnDownload');
const objSaveProgram = document.getElementById('btnSaveProgram');
const objLoadProgram = document.getElementById('btnLoadProgram');
const objBtnForward = document.getElementById('btnForward');
const objBtnBackward = document.getElementById('btnBackward');
const objBtnTurnLeft = document.getElementById('btnTurnLeft');
const objBtnTurnRight = document.getElementById('btnTurnRight');


function startup() {
    if (!("hid" in navigator)) {
        document.getElementById("deviceStatus").innerText = "WebHIDに未対応です。";
        document.getElementById("btnConnect").style.opacity = "0.4";
    }

    objConnect.addEventListener('mouseup', connect, false);
    // btnConnect.addEventListener('touchend', connect, false);

    objDownload.addEventListener('mouseup', download, false);
    // btnDownload.addEventListener('touchend', download, false);
    objDownload.style.opacity = "0.4";
    
    objSaveProgram.addEventListener('mouseup', saveProgram, false);
    objLoadProgram.addEventListener('click', clearFilePath);
    objLoadProgram.addEventListener('change', loadProgram);

    objSelectCommand.addEventListener('change', setDescription, false);
    objProgramTA.addEventListener('keydown', onKeydown, false);
    
    setVersion();
    setSelectBox();

    makeCommandDictionary();
    // console.log(commandDictionary);

    objProgramTA.value = '進む, 5\nさがる, 5\n右回転, 5\n左回転, 5\n止まる, 0\n電子音, 3, 135\n電子音, 3, 120\n電子音, 3, 107\n';

    objBtnForward.addEventListener('mousedown', remoteForward, false);
    objBtnForward.addEventListener('touchstart', remoteForward, false);
    objBtnForward.addEventListener('mouseup', remoteStop, false);
    objBtnForward.addEventListener('touchend', remoteStop, false);
    objBtnForward.style.opacity = "0.4";
    
    objBtnBackward.addEventListener('mousedown', remoteBackward, false);
    objBtnBackward.addEventListener('touchstart', remoteBackward, false);
    objBtnBackward.addEventListener('mouseup', remoteStop, false);
    objBtnBackward.addEventListener('touchend', remoteStop, false);
    objBtnBackward.style.opacity = "0.4";

    objBtnTurnLeft.addEventListener('mousedown', remoteTurnLeft, false);
    objBtnTurnLeft.addEventListener('touchstart', remoteTurnLeft, false);
    objBtnTurnLeft.addEventListener('mouseup', remoteStop, false);
    objBtnTurnLeft.addEventListener('touchend', remoteStop, false);
    objBtnTurnLeft.style.opacity = "0.4";

    objBtnTurnRight.addEventListener('mousedown', remoteTurnRight, false);
    objBtnTurnRight.addEventListener('touchstart', remoteTurnRight, false);
    objBtnTurnRight.addEventListener('mouseup', remoteStop, false);
    objBtnTurnRight.addEventListener('touchend', remoteStop, false);
    objBtnTurnRight.style.opacity = "0.4";
}

document.addEventListener("DOMContentLoaded", startup);


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
    if (commandDictionary[command][1] == 2) {
        description = description + '\n【' + commandDictionary[command][3]['note'] + '】';
    }
    if (commandDictionary[command][1] == 3) {
        description = description + '\n【' + commandDictionary[command][4]['note'] + '】';
    }

    objCommandDescription.innerText = description;
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


async function download(event) {
    event.preventDefault();

    // if (!device) return;
    if (isConnected == false) {
        return;
    }
    
    let commandList = parseCommand();
    // let sendcode = compileCommand(commandList);

    const waitFor = duration => new Promise(r => setTimeout(r, duration));
    
    console.log(device.productName);
    console.log(device.collections);

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
    console.log(commandList);

    return commandList;
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

function saveProgram(event) {
    event.preventDefault();

    const a = document.createElement('a');
    a.href = 'data:text/plain,' + encodeURIComponent(objProgramTA.value);
    a.download = document.getElementById('inputProgramName').value;

    a.click();
}


let reader = new FileReader();

// 保持しているファイル名を消す
function clearFilePath() {
    objLoadProgram.value = null;
}

function loadProgram() {
    for (file of objLoadProgram.files) {
        alertMode = "loadProgram";
        document.getElementById('alertTitle').innerText = "";
        document.getElementById('alertMessage').innerText = "プログラムを読み込みますか？\n（現在のプログラムは消去されます）";
        document.getElementById('btnCancel').innerText = "やめる";
        document.getElementById('btnOK').innerText = "読み込む";
        objDialogAlert.showModal();
    }
}

function setProgram() {
    reader.readAsText(file, 'UTF-8');
    reader.onload = ()=> {
        objProgramTA.value = reader.result;
    };
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
const objBtnSet = document.getElementById('btnSet');

objSelectCommand.addEventListener('dblclick', function() {
    if (setDialogBox()) {
        objDialogArg.showModal();
    } else {
        addCommandToTextArea();
    }
});

objBtnSet.addEventListener('click', function() {
    addCommandToTextArea();
    objDialogArg.close();
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
        case 1:
            return false;
        case 2:
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
        case 3:
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
  if (alertMode == "loadProgram") {
    setProgram();
  } else if (alertMode == "loadMusic") {
    loadMusic();
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
