from flask import *

import json
import mysql.connector
import os
from dotenv import load_dotenv


app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True # disable sorting the keys of JSON objects alphabetically
app.config['JSON_SORT_KEYS'] = False


load_dotenv()  # take environment variables from .env.
mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Tj920419#!",
    database="travel",
)
mydb.ping(reconnect=True, attempts=1, delay=0)

if (mydb.is_connected()):
    print("Connected")
else:
    print("Not connected")
mycursor = mydb.cursor()
cursor = mydb.cursor(dictionary=True)


# Pages
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/attraction/<id>")
def attraction(id):
    return render_template("attraction.html")


@app.route("/booking")
def booking():
    return render_template("booking.html")


@app.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")


# 旅遊景點API
@app.route("/api/attractions")
def getAttractions():
    try:
        page = request.args.get("page", 0)
        page = int(page)
        keyword = request.args.get("keyword", "")

        start = page*12
        cursor.execute(
            "SELECT * FROM TaipeiTravel where name LIKE %s LIMIT %s, 12", (('%'+keyword+'%'), start))
        results = cursor.fetchall()
        # print(results)

        if keyword == "" and len(results) == 0:
            return jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
            }), 500
        elif len(results) == 0:
            return jsonify({
                "error": True,
                "message": "查無資訊"
            })
        else:
            spotList = []
            for result in results:
                spot = {}
                spot["id"] = result['id']
                spot["name"] = result['name']
                spot["category"] = result["category"]
                spot["description"] = result["description"]
                spot["address"] = result["address"]
                spot["transport"] = result["transport"]
                spot["mrt"] = result["mrt"]
                spot["latitude"] = float(result["latitude"])
                spot["longitude"] = float(result["longitude"])
                spot["images"] = result["images"].split(",")[:-1]
                spotList.append(spot)
            # print(spotList)

            if len(spotList) < 12:
                nextpage = None
                print(len(spotList))
            else:
                nextpage = page+1

            SearchResult = {
                "nextPage": nextpage,
                "data": spotList
            }
            return jsonify(SearchResult), 200
    except:
        return jsonify({
            "error": True,
            "message": "伺服器內部錯誤"
        }), 500


@app.route('/api/attraction/<attractionId>')
def getAttractionsId(attractionId):
    cursor.execute("SELECT * FROM TaipeiTravel WHERE id=%s", (attractionId,))
    results = cursor.fetchall()

    if len(results) == 0:
        SearchResult = {
            "error": True,
            "message": "景點編號不正確"
        }
        return jsonify(SearchResult), 500
    else:
        spotList = []
        for result in results:
            spot = {}
            spot["id"] = result['id']
            spot["name"] = result['name']
            spot["category"] = result["category"]
            spot["description"] = result["description"]
            spot["address"] = result["address"]
            spot["transport"] = result["transport"]
            spot["mrt"] = result["mrt"]
            spot["latitude"] = float(result["latitude"])
            spot["longitude"] = float(result["longitude"])
            spot["images"] = result["images"].split(",")[:-1]
            spotList.append(spot)

        SearchResult = {
            "data": spotList
        }
        return jsonify(SearchResult), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
