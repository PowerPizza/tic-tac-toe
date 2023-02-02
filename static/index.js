function onCopyCTC_ID(){
    try{
        navigator.clipboard.writeText(document.querySelector(".black1 .entryCreateCrads .ctc_id").value);
        document.querySelector(".black1 .entryCreateCrads .copy_").innerText = "Copied";
    }
    catch{
        console.log("need a secure connection to launch navigator.clipboard");
    }
}

let gameCTC_ID;
function onCreateNewGame(){
    gameCTC_ID = createUUID();
    document.querySelector(".black1 .entryCreateCrads .ctc_id").value = gameCTC_ID;
    document.getElementsByClassName("black1")[0].style.display = "block";
}

function onCreate(){
    let name = document.querySelector(".black1 .entryCreateCrads .ur_name").value;
    let choice = document.querySelector(".black1 .entryCreateCrads .ox").value;

    let xmlsvr = new XMLHttpRequest();
    xmlsvr.open("POST", "/establishGame");
    xmlsvr.onload = ()=>{
        if (xmlsvr.responseText == 'ok'){
            document.getElementsByClassName("black1")[0].style.display = "";
            window.location.href = "/gameLoad";
        }
    }
    xmlsvr.send(JSON.stringify({"name": name, "choice": choice, "ctcID": gameCTC_ID}));
}


function onJoinGame(){
    document.getElementsByClassName("black2")[0].style.display = "block";
}

function onJoin(){
    let name_ = document.querySelector(".black2 .entryJoinCrads .ur_name").value;
    let ctcID = document.querySelector(".black2 .entryJoinCrads .connectionID").value;

    let xmlsvr = new XMLHttpRequest();
    xmlsvr.open("POST", "/connectClientToHost");
    xmlsvr.onload = ()=>{
        if (xmlsvr.responseText == "ok"){
            window.location.href = "/gameLoad";
        }
        else if (xmlsvr.responseText == "connection_full_filled"){
            alert("Someone already connected to this game.");
        }
        else{
            alert("cannot connect with this game due to : "+xmlsvr.responseText);
        }
    }
    xmlsvr.send(JSON.stringify({"connectorID": ctcID, "name": name_}))
}
