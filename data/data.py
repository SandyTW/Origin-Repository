import json
import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="Tj920419#!",
  database="travel",
)
mycursor = mydb.cursor()
cursor=mydb.cursor(dictionary=True)

with open('taipei-attractions.json', "r", encoding='utf-8') as response:
    data = json.load(response)
    spotlist=data["result"]["results"]


for spot in spotlist:
    Id=spot['_id']
    name = spot['stitle']
    category = spot['CAT2']
    description = spot['xbody']
    address = spot['address']
    transport = spot['info']
    mrt = spot['MRT']
    latitude = spot['latitude']
    longitude = spot['longitude']
    files = spot['file'].split('http')

    imageList=[]
    for img in files:
        if img[-3:].lower()=='jpg' or img[-3:].lower()=='png':
            imageList.append(f'http{img}')
    images=str(imageList)

    sql='INSERT INTO TaipeiTravel VALUES (%s, %s, %s, %s,%s, %s, %s,%s, %s, %s)'
    value = (Id, name, category, description, address, transport, mrt, latitude, longitude, images,)
    cursor.execute(sql, value)
    mydb.commit()
mydb.close()



    

    