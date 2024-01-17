from functools import reduce
from bson.objectid import ObjectId

from flask import Flask, request
import json
from flask import Flask, jsonify
from pymongo import MongoClient
import random
import helper
import config

uri = config.getUri()
client = MongoClient(uri)
db = client.course_system
collection = db["courses_new"]
u_collection = db["users"]
cu_collection = db["course_users"]

# from src import helper

app = Flask(__name__)


@app.route("/login", methods=["POST"])
def login():
    data = json.loads(request.data)
    res = u_collection.find_one(data)
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
        user = request.args.get("uid")
        res = collection.find_one({"_id": course_id})
        ratings = list(cu_collection.find({"cid": course_id}))
        enrolled = len(list(filter(lambda x: x["uid"] == user, ratings))) > 0

        res2 = list(collection.find({"study": res["study"]}))
        rec = helper.get_recommendations(res2, res["_id"])
        together = helper.association_rule(
            cu_collection, collection, course_id, res["study"]
        )
        return {
            "res": res,
            "rec": rec,
            "enrolled": enrolled,
            "ratings": {
                "count": len(ratings),
                "r1": sum(list(map(lambda x: x["rating1"], ratings))),
                "r2": sum(list(map(lambda x: x["rating2"], ratings))),
                "r3": sum(list(map(lambda x: x["rating3"], ratings))),
            },
            "together": together,
        }
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
    for item in cu_ids:
        c_res = c_res + list(collection.find({"_id": item}))

    r_res = list(collection.find({"study": study}))
    r_res = helper.get_similar(r_res, cu_ids)
    return {"user": u_res, "my_courses": c_res, "rec": r_res}


@app.route("/rating", methods=["POST"])
def addRating():
    body = request.json
    print(body)
    res = "error"
    u_res = list(cu_collection.find({"cid": body["cid"], "uid": body["uid"]}))
    if len(u_res) == 0:
        res = cu_collection.insert_one(body)
        print(res)
        res = "ok"
    return {"res": res}


@app.route("/test2", methods=["GET"])
def test2():
    # uid = request.args.get("uid")
    # u_res = u_collection.find_one({"_id": ObjectId(uid)})
    # study = u_res["study"]
    # r_res = list(collection.find({"study": study}))
    # res = helper.get_matrix(r_res)
    # res = list(map(lambda x: x["_id"], r_res))
    course_id = request.args.get("id")
    together = helper.association_rule(cu_collection, collection, course_id, "MAI")
    return {"res": together}


if __name__ == "__main__":
    app.run()
