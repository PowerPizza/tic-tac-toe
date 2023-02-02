from flask import Flask, render_template, request, redirect
import json, random
from flask import session
# op
app = Flask(__name__)
app.secret_key = "hmmm"
runningGames = {}
# operator master
@app.route("/")
def home():
    print("sessions : ", session)
    print("running games : ", runningGames)
    return render_template("index.html")

# hoster_ID = ctc_ID = joinID both are type of uuid.
@app.route("/establishGame", methods=["POST"])
def establishGame():
    data_ = json.loads(request.data.decode("utf-8"))
    rand_chance = random.choice(["your_chance", "not_your_chance"])
    runningGames[data_["ctcID"]] = {"Host_name": data_["name"],
                                    "Host_choice": data_["choice"],
                                    "ctc_ID": data_["ctcID"],
                                    "isClientJoined": False,
                                    "clientCrads": {},
                                    "dataForClient": rand_chance,
                                    "dataForHost": ""}
    if runningGames[data_["ctcID"]]["dataForClient"] == "your_chance":
        runningGames[data_["ctcID"]]["dataForHost"] = "not_your_chance"
    else:
        runningGames[data_["ctcID"]]["dataForHost"] = "your_chance"
    """
    dataForClient in runningGames[UID] column contains data which client receive and same dataForHost
    contain data which game hoster receive.
    """
    print(runningGames)
    session["hostLOG"] = data_["ctcID"]
    return "ok"

@app.route("/gameLoad")
def loadGame():
    if "hostLOG" in session:
        return render_template("gameGUI_host.html")
    if "clientCrads" in session:
        return render_template("gameGUI_cli.html")
    else:
        return redirect("/")

@app.route("/giveHostData", methods=["POST"])
def giveHostData():
    if "hostLOG" in session:
        try:
            return json.dumps(runningGames[session["hostLOG"]])
        except BaseException as e:
            print(e)
            del session["hostLOG"]
            return "END"
    else:
        return "Host_Timed_Out"

@app.route("/connectClientToHost", methods=["POST"])
def connectClientToHost():
    data_ = json.loads(request.data.decode("utf-8"))
    if data_["connectorID"] in runningGames:
        if not runningGames[data_["connectorID"]]["isClientJoined"]:
            if runningGames[data_["connectorID"]]["Host_choice"] == "X":
                data_["Client_choice"] = "O"
            elif runningGames[data_["connectorID"]]["Host_choice"] == "O":
                data_["Client_choice"] = "X"

            runningGames[data_["connectorID"]]["isClientJoined"] = True
            runningGames[data_["connectorID"]]["clientCrads"] = data_
            session["clientCrads"] = data_
            return "ok"
        else:
           return "connection_full_filled"
    else:
        return "noGame"

@app.route("/giveClientData", methods=["POST"])
def giveClientData():
    if "clientCrads" in session:
        if session["clientCrads"]["connectorID"] in runningGames:
            return json.dumps(session["clientCrads"])
        else:
            del session["clientCrads"]
            return "closed"
    else:
        return "notFound"

@app.route("/giveRunningGame", methods=["POST"])
def giveRunningGame():
    data_ = request.data.decode("utf-8")
    # ctc id will accept as data_ and runningGames[data_] will be returned.
    try:
        return json.dumps(runningGames[data_])
    except BaseException:
        return "noGame"

@app.route("/getMessages", methods=["POST"])
def giveMessages():
    data_ = json.loads(request.data.decode("utf-8"))
    try:
        if data_["of"] == "client":
            return runningGames[data_["ctc_id"]]["dataForClient"]
        if data_["of"] == "host":
            return runningGames[data_["ctc_id"]]["dataForHost"]
    except BaseException as e:
        print(e)
        return "quit"

@app.route("/setMessages", methods=["POST"])
def setMessages():
    data_ = json.loads(request.data.decode("utf-8"))
    """ 
    forHost ---readby--> clientside
    forClient ---readby--> hostside 
    
    data set by client so it will read by host.
    data set by host so it will read by client.
    """
    try:
        if data_["of"] == "client":
            # went data of client is setting up so it means data set here which is read by hostSide
            runningGames[data_["ctc_id"]]["dataForClient"] = data_["msg"]

        if data_["of"] == "host":
            runningGames[data_["ctc_id"]]["dataForHost"] = data_["msg"]
            # went data of host is setting up so it means data set here which is read by clientSide
        return "ok"
    except BaseException as e:
        print("near line 130", e)

@app.route("/onHostLeave", methods=["POST"])
def onHostLeave():
    try:
        data_ = request.data.decode("utf-8")
        del session["hostLOG"]
        del runningGames[data_]
        return "ok"
    except BaseException as e:
        return "err : "+str(e)

@app.route("/onClientLeave", methods=["POST"])
def onClientLeave():
    try:
        data_ = request.data.decode("utf-8")
        del session["clientCrads"]
        del runningGames[data_]
        return "ok"
    except BaseException as e:
        return "err : "+str(e)

@app.route("/setupReplay", methods=["POST"])
def setup_replay():
    data_ = json.loads(request.data.decode("utf-8"))
    if data_["ctc_id"] not in runningGames:
        return "no_game"
    if data_["who"] == "host":
        runningGames[data_["ctc_id"]]["isClientJoined"] = False
        rand_chance = random.choice(["your_chance", "not_your_chance"])
        runningGames[data_["ctc_id"]]["dataForClient"] = rand_chance
        if runningGames[data_["ctc_id"]]["dataForClient"] == "your_chance":
            runningGames[data_["ctc_id"]]["dataForHost"] = "not_your_chance"
        else:
            runningGames[data_["ctc_id"]]["dataForHost"] = "your_chance"
        return "ok"
    elif data_["who"] == "client":
        if runningGames[data_["ctc_id"]]["isClientJoined"]:
            return "not_reseted"
        else:
            runningGames[data_["ctc_id"]]["isClientJoined"] = True
            return "ok"

@app.route("/help")
def help_page():
    return render_template("help.html")

app.run(host="0.0.0.0", port=8080)