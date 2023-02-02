let myData;
/*
here myData looks like :--
{
    "Host_name": "OKAA",
    "Host_choice": "X",
    "ctc_ID": "PvZVOkqV-Sbvk-h3xw-qeqN-1GGlblDY9x1t",
    "isClientJoined": false,
    "clientCrads": {},
    "dataForClient": "cli-msg",
    "dataForHost": "host-msg"
}
*/
let gameCanvas = [['', '', ''], ['', '', ''], ['', '', '']];
let buttonOfGames = [];

function getData(){
    let xmlsvr = new XMLHttpRequest();
    xmlsvr.open("POST", "/giveHostData");
    xmlsvr.onload = ()=>{
        // console.log(xmlsvr.responseText);
        if (xmlsvr.responseText == "END"){
            window.onbeforeunload = null;
            window.location.reload();
        }
        if (xmlsvr.responseText == "Host_Timed_Out"){
            window.onbeforeunload = null;
            window.location.reload();
        }
        else{
            myData = JSON.parse(xmlsvr.responseText);
            if (myData["isClientJoined"] == false){
                setTimeout(getData, 600, true);
            }
            else{
                document.getElementsByClassName("playArea")[0].style.display = "";
                document.getElementsByClassName("waiting")[0].remove();
                // console.log(myData);
                document.querySelector(".gameInfo .lable1").innerText = `${myData["Host_name"]} VS ${myData["clientCrads"]["name"]}`;
                document.querySelector(".gameInfo .lable3").innerText = `Choice : ${myData["Host_choice"]}`;

                if (myData["dataForClient"] == "your_chance"){
                    document.querySelector(".gameInfo .lable2").innerText = "Current Chance : Your";
                    enableAllGameButtons();
                }
                else{
                    document.querySelector(".gameInfo .lable2").innerText = "Current Chance : Not Your";
                    message_getter_started = true;
                    getMessages();
                }
            }
        }
    }
    xmlsvr.send("Data")
}
getData();

let message_getter_started = false;
function getMessages(){
    // function not only get messages infact it disable and enable player sides
    let xmlsvr = new XMLHttpRequest();
    xmlsvr.open("POST", "/getMessages");
    xmlsvr.onload = ()=>{
        // console.log(xmlsvr.responseText);
        if (xmlsvr.responseText.startsWith("your_chance") || xmlsvr.responseText.startsWith("you_lose")){
            document.querySelector(".gameInfo .lable2").innerText = "Current Chance : Your";
            enableAllGameButtons();
            let to_autoactive = Number(xmlsvr.responseText.split(" ")[1]);
            if (myData["Host_choice"] == "X"){
                buttonOfGames[to_autoactive][0].innerText = "⭕";
                gameCanvas[buttonOfGames[to_autoactive][2][0]][buttonOfGames[to_autoactive][2][1]] = "O";
            }
            else if (myData["Host_choice"] == "O"){
                buttonOfGames[to_autoactive][0].innerText = "❌";
                gameCanvas[buttonOfGames[to_autoactive][2][0]][buttonOfGames[to_autoactive][2][1]] = "X";
            }
            buttonOfGames[to_autoactive][1] = ()=>{};
        }
        else if (xmlsvr.responseText == "not_your_chance"){
            document.querySelector(".gameInfo .lable2").innerText = "Current Chance : Not Your";
            disableAllGameButtons();
        }
        if (xmlsvr.responseText.startsWith("you_lose")){
            // console.log(xmlsvr.responseText);
            winCheck(`😅 You Lose ${myData["Host_name"]} 😅`, false, myData["clientCrads"]["Client_choice"]);
            return;
        }
        if (xmlsvr.responseText.startsWith("Game TIE")){
            disableAllGameButtons("Game Over!");
            document.querySelector(".won .wonInfo .message").innerText = "Game TIE";
            document.querySelector(".won .wonInfo .view_game_canvas").appendChild(document.querySelector(".playArea"));
            document.getElementsByClassName("won")[0].style.display = "block";
        }
        if (xmlsvr.responseText == "quit"){
            window.location.reload();
            return 0;
        }
        setTimeout(getMessages, 200);
    }
    xmlsvr.send(JSON.stringify({"ctc_id": myData["ctc_ID"], "of": "client"}));
}

function setMessage(msg, of_){
    let xmlsvr = new XMLHttpRequest();
    xmlsvr.open("POST", "/setMessages");
    xmlsvr.send(JSON.stringify({"ctc_id": myData["ctc_ID"], "of": of_, "msg": msg}));
}

function createLine(direction, row_col){
    // row_col only used when HR, and VR direction.
    let re_btnOfGames = plane_to_3D_arr(buttonOfGames);
    if (direction == "TL_TO_BR"){
        for (let x = 0; x < re_btnOfGames.length; x++) {
            re_btnOfGames[x][x][0].style.backgroundColor = "orange"; 
        }
    }

    else if (direction == "TR_TO_BL"){
        for (let x = 0; x < re_btnOfGames.length; x++) {
            re_btnOfGames[x][re_btnOfGames.length-x-1][0].style.backgroundColor = "orange"; 
        }
    }

    else if (direction == "HR"){
        for (let x = 0; x < re_btnOfGames.length; x++) {
            re_btnOfGames[row_col][x][0].style.backgroundColor = "orange"; 
        }
    }

    else if (direction == "VR"){
        for (let x = 0; x < re_btnOfGames.length; x++) {
            re_btnOfGames[x][row_col][0].style.backgroundColor = "orange"; 
        }
    }
}

function winCheck(msg, set_msg, check_for, auto_on_btn){
    let winner_ = calcWin(gameCanvas, check_for, createLine);
    if (winner_ != "none"){
        if (set_msg == true){
            setMessage("you_lose "+auto_on_btn, "host");
            setMessage("you_won", "client");
        }
        disableAllGameButtons("Game Over!");
        document.querySelector(".won .wonInfo .message").innerText = msg;
        document.querySelector(".won .wonInfo .view_game_canvas").appendChild(document.querySelector(".playArea"));
        document.getElementsByClassName("won")[0].style.display = "block";
        return "ok";
    }
}

function autoResizeDocument(){
    const ele = document.getElementsByClassName("playArea")[0];
    let w = ele.clientWidth;
    ele.style.height = w+"px";

    // prepairing game
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let div_ = document.createElement("div");
            div_.onclick = ()=>{
                gameCanvas[i][j] = myData["Host_choice"];
                
                if (myData["Host_choice"] == "O"){
                    div_.innerText = "⭕";
                }
                else if (myData["Host_choice"] == "X"){
                    div_.innerText = "❌";
                }
                
                disableAllGameButtons();
                let z = 0;
                for (;z < buttonOfGames.length; z++) {  // button permanent lock
                    if (buttonOfGames[z][0] == div_){
                        buttonOfGames[z] = [div_, ()=>{}];
                        break
                    }
                }
                div_.onclick = ()=>{};
                
                if (winCheck(`🎉 You Won ${myData["Host_name"]} 🎉`, true, myData["Host_choice"], z) == "ok"){
                    return;
                }

                else if (!gameCanvas.find((idx1)=>{return idx1.includes('')})){
                    setMessage("Game TIE", "host");
                    setMessage("Game TIE", "client");
                    disableAllGameButtons("Game Over!");
                    document.querySelector(".won .wonInfo .message").innerText = "Game TIE";
                    document.querySelector(".won .wonInfo .view_game_canvas").appendChild(document.querySelector(".playArea"));
                    document.getElementsByClassName("won")[0].style.display = "block";
                    return;
                }

                setMessage("not_your_chance", "client");
                setMessage("your_chance "+z, "host");


                if (message_getter_started == false){
                    message_getter_started = true;
                    getMessages();
                }
            }
            ele.appendChild(div_);
            var arr_to_add = [div_, div_.onclick, [i, j]];  // array contain button and their default on click functions,
            buttonOfGames.push(arr_to_add);
        }
    }
    disableAllGameButtons();
    
    // show waiting for another player
    if (!myData || !myData["isClientJoined"]){
        document.getElementsByClassName("playArea")[0].style.display = "none";
    }
}

function disableAllGameButtons(msg="Its not your chance!"){
    for (let i = 0; i < buttonOfGames.length; i++) {
        buttonOfGames[i][0].onclick = ()=>{alert(msg)};
    }
}

function enableAllGameButtons(){
    for (let i = 0; i < buttonOfGames.length; i++) {
        buttonOfGames[i][0].onclick = buttonOfGames[i][1];
    }
}

function onReplayGame(){
    let xmlsvr = new XMLHttpRequest();
    xmlsvr.open("POST", "/setupReplay");
    xmlsvr.onload = ()=>{
        if (xmlsvr.responseText == "ok"){
            window.onbeforeunload = ()=>{};
            window.location.reload();
        }
        else if (xmlsvr.responseText == "no_game"){
            window.location.reload();
        }
    }
    xmlsvr.send(JSON.stringify({"who": "host", "ctc_id": myData["ctc_ID"]}));
}

window.onload = autoResizeDocument;

window.onbeforeunload = ()=>{
    let xmlsvr = new XMLHttpRequest();
    xmlsvr.open("POST", "/onHostLeave");
    xmlsvr.onload = ()=>{
        if (xmlsvr.responseText != "ok"){
            return "error while closing game "+xmlsvr.responseText;
        }
    }
    xmlsvr.send(myData["ctc_ID"]);
} // this func here run when website reloaded or left so we can use it.