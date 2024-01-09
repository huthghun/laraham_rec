from functools import reduce
from bson.objectid import ObjectId

from flask import Flask, request
import json
from flask import Flask
from pymongo import MongoClient
import random
import helper

uri = ""  # db-uri
client = MongoClient(uri)
db = client.course_system
collection = db["courses"]
u_collection = db["users"]
cu_collection = db["course_users"]

# from src import helper

app = Flask(__name__)


@app.route("/login", methods=["POST"])
def login():
    data = json.loads(request.data)
    print(data)
    res = u_collection.find_one(data)
    print(res)
    res["_id"] = str(res["_id"])

    return res


@app.route("/test", methods=["GET", "POST"])
def test():
    study = request.args.get("s")

    if study != "":
        res = list(collection.find({"study": study}))
    else:
        res = list(collection.find({}))
    return {"res": res}


@app.route("/db", methods=["GET"])
def get_course():
    try:
        course_id = request.args.get("id")
        res = collection.find_one({"_id": course_id})
        res2 = list(collection.find({"study": res["study"]}))
        rec = helper.get_recommendations(res2, res["_id"])
        print(rec)
        print(res2)
        res3 = list(
            filter(lambda x: (x["_id"] in rec) and x["_id"] != res["_id"], res2)
        )
        return {"res": res, "rec": res3}
    except Exception as e:
        print(e)
        return type(e)


@app.route("/home", methods=["GET"])
def home():
    uid = request.args.get("uid")
    u_res = u_collection.find_one({"_id": ObjectId(uid)})
    u_res["_id"] = str(u_res["_id"])
    cu_res = list(cu_collection.find({"uid": uid}))
    study = u_res["study"]
    c_res = []
    cu_ids = list(map(lambda x: x["cid"], cu_res))
    print(cu_ids)
    for item in cu_ids:
        c_res = c_res + list(collection.find({"_id": item}))

    r_res = list(collection.find({"study": study}))
    r_res = helper.get_similar(r_res, cu_ids)
    return {"user": u_res, "my_courses": c_res, "rec": r_res}


@app.route("/test2", methods=["GET"])
def test2():
    study = "BAI"

    if study != "":
        res = list(
            map(
                lambda x: {"_id": x["_id"], "description": x["description"]},
                collection.find({"study": study}),
            )
        )
    else:
        res = list(
            map(
                lambda x: {"_id": x["_id"], "description": x["description"]},
                collection.find({}),
            )
        )
    return {"res": res}


if __name__ == "__main__":
    app.run()
