from flask import *

import json
import mysql.connector
import os
import requests
import datetime
from dotenv import load_dotenv
from mysql.connector import pooling


app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
# disable sorting the keys of JSON objects alphabetically
app.config['JSON_SORT_KEYS'] = False
app.config['SECRET_KEY'] = os.urandom(24)

# take environment variables from .env.
load_dotenv()  

# use a connection pool with MySQL
connection_pool = pooling.MySQLConnectionPool(
    pool_name="TaipeiTravelpool",
    pool_size=5,
    pool_reset_session=True,
    host=os.getenv("DBHOST"),
    user=os.getenv("DBUSER"),
    password=os.getenv("DBPASSWORD"),
    database=os.getenv("DBDATABSE"),
)

# Get connection obj. from a pool
connection_object = connection_pool.get_connection()
if connection_object.is_connected():
    print("Connected")
else:
    print("Not connected")
cursor = connection_object.cursor(dictionary=True)


# mydb = mysql.connector.connect(
#     host=os.getenv("DBHOST"),
#     user=os.getenv("DBUSER"),
#     password=os.getenv("DBPASSWORD"),
#     database=os.getenv("DBDATABSE"),
# )
# mydb.ping(reconnect=True, attempts=1, delay=0)

# if (mydb.is_connected()):
#     print("Connected")
# else:
#     print("Not connected")
# mycursor = mydb.cursor()
# cursor = mydb.cursor(dictionary=True)


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


# 使用者API
@app.route("/api/user", methods=["GET"])
def getUser():
    if "user" in session:
        data = {
            "id": session["user"]['id'],
            "name": session["user"]['name'],
            "email": session["user"]['email'],
        }
        return jsonify({"data": data}), 200
    else:
        return jsonify({ "data": None }), 200

@app.route("/api/user", methods=["POST"])
def userRegister():
    try:
        name = request.get_json()["name"]
        email = request.get_json()["email"]
        password = request.get_json()["password"]

        if not (name and email and password):
            return jsonify({ 
                "error": True, 
                "message": "註冊失敗，姓名、帳號和密碼不得為空" 
            }), 400

        cursor.execute('SELECT * FROM user WHERE email = %s', (email,))
        CurrentUser=cursor.fetchone()
        if CurrentUser:
            return jsonify({ 
                "error": True, 
                "message": "註冊失敗，此信箱已被使用" 
            }), 400
        else:
            cursor.execute('INSERT INTO user VALUES (default, %s, %s, %s, default)', (name, email, password))
            connection_object.commit()
            return jsonify({ 
                "ok": True 
            }), 200
    except Exception as err:
        print(err)
        return jsonify({ 
            "error": True, 
            "message": "伺服器內部錯誤" 
        }), 500
   
@app.route("/api/user", methods=["PATCH"])
def userLogin():
    try:
        email = request.get_json()["email"]
        password = request.get_json()["password"]
        if not (email and password):
            return jsonify({ "error": True, "message": "登入失敗，帳號、密碼不得為空" })

        cursor.execute('SELECT * FROM user WHERE email = %s AND password = %s', (email, password))
        CurrentUser=cursor.fetchone()
        if CurrentUser: 
            session["user"] = {
            "id": CurrentUser["id"],
            "name": CurrentUser["name"],
            "email": CurrentUser["email"]
            }
            # print(session['user'])
            return jsonify({ 
                "ok": True }), 200
        else:
             return jsonify({"error": True, "message": "登入失敗，帳號或密碼錯誤"}), 400
    except Exception as err:
        print(err)
        return jsonify({
            "error": True, 
            "message": "伺服器內部錯誤"}), 500

@app.route("/api/user", methods=["DELETE"])
def userLogout():
    try:
        session.pop("user", None)
        if "user" not in session:
            return jsonify({
                "ok": True }), 200
        else: 
            return jsonify({
                "error": True, 
                "message": "發生錯誤，請重試"
                }), 400
    except Exception as err:
        print(err)
        return jsonify({
            "error": True, 
            "message": "伺服器內部錯誤"}), 500


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
    # except:
    #     return jsonify({
    #         "error": True,
    #         "message": "伺服器內部錯誤"
    #     }), 500
    except Exception as err:
        print(err)
        return jsonify({
            "error": True, 
            "message": "伺服器內部錯誤"}), 500


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

# 預定行程API
@app.route("/api/booking", methods=["GET"])
def getBooking():
    try:
        if 'user' in session:
            if 'booking' not in session:
                return {"data": None}
            else:
                attractionId=session["booking"]['attractionId']
                date = session["booking"]['date']
                time = session["booking"]['time']
                price = session["booking"]['price']
                
                cursor.execute("SELECT * FROM TaipeiTravel WHERE id=%s", (attractionId,))
                results = cursor.fetchall()

                for result in results:
                    attraction = {}
                    attraction ["id"] = result['id']
                    attraction ["name"] = result['name']
                    attraction ["address"] = result["address"]
                    attraction ["images"] = result["images"].split(",")[:-1]
                
                data = {
                        "attraction": attraction,
                        "date": date,
                        "time": time,
                        "price": price
                }
                
                return jsonify({"data": data}), 200
        else:
            return jsonify({
                "error": True, 
                "message": "未登入系統，拒絕存取"}), 403
    
    except Exception as err:
        print(err)
        return jsonify({
            "error": True, 
            "message": "伺服器內部錯誤"}), 500


@app.route("/api/booking", methods=["POST"])
def postBooking():
    try:
        if 'user' in session:
            attractionId = request.get_json()["attractionId"]
            date = request.get_json()["date"]
            time = request.get_json()["time"]
            price = int(request.get_json()["price"])

            if not (attractionId and date and time and price):
                return jsonify({ 
                    "error": True, 
                    "message": "行程建立失敗，日期輸入不正確"}), 400
            
            session["booking"] = {
                "attractionId": attractionId,
                "date": date,
                "time": time,
                "price": price,
            }
            # print(session['booking'])            
            return jsonify({ "ok": True }), 200
        else:
            return jsonify({
                "error": True, 
                "message": "未登入系統，拒絕存取"}), 403

    except Exception as err:
        print(err)
        return jsonify({
            "error": True, 
            "message": "伺服器內部錯誤"}), 500

@app.route("/api/booking", methods=["DELETE"])
def deleteBooking():
    try:
        if 'user' in session:
            session.pop("booking", None)
            return jsonify({
                "ok": True }), 200
        else:
            return jsonify({
                "error": True, 
                "message": "未登入系統，拒絕存取"}), 403
    except Exception as err:
        print(err)
        return jsonify({
            "error": True, 
            "message": "伺服器內部錯誤"}), 500


#建立新的訂單，並完成付款程序
@app.route("/api/orders", methods=["POST"])
def postOrder():
    try:
        if 'user' not in session:
            return jsonify({
                "error": True, 
                "message": "未登入系統，拒絕存取"}), 403

        if not (request.get_json()["contact"]["name"] and request.get_json()["contact"]["email"] and request.get_json()["contact"]["phone"]):
            return jsonify({ 
                    "error": True, 
                    "message": "訂單建立失敗，聯絡資訊不完整"}), 400

        price = request.get_json()["order"]["price"]
        userID = session["user"]["id"]
        phone = request.get_json()["contact"]["phone"]
        attractionID = session["booking"]["attractionId"]
        date = request.get_json()["order"]["trip"]["date"]
        time = request.get_json()["order"]["trip"]["time"]
    

        #後端建立訂單編號和資料，紀錄訂單付款狀態為【未付款】
        now = datetime.datetime.now()
        orderNumber = now.strftime("%Y%m%d%H%M%S-") + str(userID)
        status = 1  #1【未付款】
        
        cursor.execute('INSERT INTO orderEntry VALUES (default, %s, default, %s, %s, %s, %s, %s, %s, %s, default)', (orderNumber, price, userID, phone, attractionID, date, time, status))
        connection_object.commit()

        url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
        headers = {
            "content-type": 'application/json',
            "x-api-key": os.getenv("TAPPAY_partner_key"),
        }
        tappayData = json.dumps({
            "prime": request.get_json()["prime"],
            "partner_key": os.getenv("TAPPAY_partner_key"),
            "merchant_id": "PadaProject_TAISHIN",
            "details": "TapPay Test",
            "amount": request.get_json()["order"]["price"],
            "order_number": orderNumber,
            "cardholder": {
                "phone_number": request.get_json()["contact"]["phone"],
                "name": request.get_json()["contact"]["name"],
                "email": request.get_json()["contact"]["email"],
            }
        })
        response = requests.post(url = url, data = tappayData, headers = headers)
        data = response.json()
        print(data)
    
        if data["status"]==0:
            status = data["status"]  #【付款成功】
            cursor.execute('UPDATE orderEntry SET bank_transaction_id = %s, status = %s WHERE order_number = %s', (data["bank_transaction_id"], status, orderNumber,))
            connection_object.commit()

            cursor.execute('SELECT * FROM orderEntry WHERE order_number = %s', (orderNumber,))
            extractData=cursor.fetchone()

            return jsonify ({
                "data": {
                    "number": extractData["order_number"],
                    "payment": {
                        "status": extractData["status"],
                        "message": "付款成功"
                    }
                }
            }), 200
        else:
            status = data["status"] #【付款失敗】
            cursor.execute('UPDATE orderEntry SET status = %s WHERE order_number = %s', (status, orderNumber,))
            connection_object.commit()

            cursor.execute('SELECT * FROM orderEntry WHERE order_number = %s', (orderNumber,))
            extractData=cursor.fetchone()

            return jsonify ({
                "data": {
                    "number": extractData["order_number"],
                    "payment": {
                        "status": extractData["status"],
                        "message": "付款失敗，請聯絡客服並提供以下編號"
                    }   
                }
            }), 200
    except Exception as err:
        print(err)
        return jsonify({
            "error": True, 
            "message": "伺服器內部錯誤"}), 500

#根據訂單編號取得訂單資訊
@app.route('/api/order/<orderNumber>',methods=["GET"])
def orderNumber(orderNumber):
    try:
        if 'user' not in session:
            return jsonify({
                "error": True, 
                "message": "未登入系統，拒絕存取"}), 403
        
        url = 'https://sandbox.tappaysdk.com/tpc/transaction/query'
        headers = {
            "content-type": 'application/json',
            "x-api-key": os.getenv("TAPPAY_partner_key"),
        }
        queryData = json.dumps({
            "partner_key": os.getenv("TAPPAY_partner_key"),
            "filters": {
                "order_number": orderNumber
            }
        })
        record = requests.post(url = url, data = queryData, headers = headers)
        result = record.json()
        
        if result["number_of_transactions"]==0:
            return {"data": None}

        #record_status: 0-銀行已授權交易，但尚未請款; 1 - 交易完成; 4 - 待付款
        if result["trade_records"][0]["record_status"] == 1:
            cursor.execute("SELECT orderEntry.order_number, orderEntry.bank_transaction_id, orderEntry.date, orderEntry.time, orderEntry.price, orderEntry.attraction_id, TaipeiTravel.name, TaipeiTravel.address, TaipeiTravel.images FROM orderEntry INNER JOIN TaipeiTravel on orderEntry.attraction_id = TaipeiTravel.id WHERE order_number=%s", (orderNumber,))
            tripResults = cursor.fetchall()
            
            for tripResult in tripResults:
                data = {
                    "number": orderNumber,
                    "price": result["trade_records"][0]["amount"],
                    "trip": {
                        "attraction": {
                            "id": tripResult["attraction_id"],
                            "name": tripResult["name"],
                            "address": tripResult["address"],
                            "image": tripResult["images"].split(",")[:-1][0],
                        },
                        "date": tripResult["date"],
                        "time": tripResult["time"]
                    },
                    "contact": {
                    "name": result["trade_records"][0]["cardholder"]["name"],
                    "email": result["trade_records"][0]["cardholder"]["email"],
                    "phone": result["trade_records"][0]["cardholder"]["phone_number"],
                    },
                    "status":"1-交易完成"
                }            
            return jsonify({
                "data": data }), 200

        if result["trade_records"][0]["record_status"] == 0:
            cursor.execute("SELECT orderEntry.order_number, orderEntry.bank_transaction_id, orderEntry.date, orderEntry.time, orderEntry.price, orderEntry.attraction_id, TaipeiTravel.name, TaipeiTravel.address, TaipeiTravel.images FROM orderEntry INNER JOIN TaipeiTravel on orderEntry.attraction_id = TaipeiTravel.id WHERE order_number=%s", (orderNumber,))
            tripResults = cursor.fetchall()
            
            for tripResult in tripResults:
                data = {
                    "number": orderNumber,
                    "price": result["trade_records"][0]["amount"],
                    "trip": {
                        "attraction": {
                            "id": tripResult["attraction_id"],
                            "name": tripResult["name"],
                            "address": tripResult["address"],
                            "image": tripResult["images"].split(",")[:-1][0],
                        },
                        "date": tripResult["date"],
                        "time": tripResult["time"]
                    },
                    "contact": {
                    "name": result["trade_records"][0]["cardholder"]["name"],
                    "email": result["trade_records"][0]["cardholder"]["email"],
                    "phone": result["trade_records"][0]["cardholder"]["phone_number"],
                    },
                    "status":"1-交易完成"
                }            
            return jsonify({
                "data": data }), 200
           
    except Exception as err:
        print(err)
        return jsonify({
            "error": True, 
            "message": "伺服器內部錯誤"}), 500
    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)