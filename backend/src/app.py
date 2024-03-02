from functools import reduce
from bson.objectid import ObjectId

from flask import Flask, request, jsonify
import json
from pymongo import MongoClient
import random
import helper
import config
import visual

uri = config.getUri()
client = MongoClient(uri)
db = client.course_system
collection = db["courses_en"]
u_collection = db["users"]
cu_collection = db["course_users"]

# from src import helper

app = Flask(__name__)


@app.route("/login", methods=["POST"])
def login():
    data = json.loads(request.data)
    res = u_collection.find_one(data)
    print(res)
    if res != None:
        res["_id"] = str(res["_id"])
    else:
        res = {"err": "error"}

    return res


@app.route("/signup", methods=["POST"])
def signup():
    data = json.loads(request.data)
    print(data)
    res = u_collection.find_one({"email": data["email"]})
    if res == None:
        insert_res = u_collection.insert_one(data)
        print(insert_res)
        res = u_collection.find_one({"email": data["email"]})
        res["_id"] = str(res["_id"])
    else:
        res = {"err": "error"}
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
        rec = helper.get_recs(res2, [res], study=res["study"])
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
                "r4": sum(list(map(lambda x: x["rating4"], ratings))),
            },
            "together": together,
            "vis": visual.getFigure(rec, res),
        }
    except Exception as e:
        print(e)
        return {"message": str(e)}


@app.route("/home", methods=["GET"])
def home():
    uid = request.args.get("uid")
    # args = uid = json.load(request.args.get("f"))
    # print(args)
    u_res = u_collection.find_one({"_id": ObjectId(uid)})
    u_res["_id"] = str(u_res["_id"])
    study = u_res["study"]
    cu_res = list(cu_collection.find({"uid": uid, "study": study}))
    courses = list(collection.find({"study": study}))
    cu_ids = list(map(lambda x: x["cid"], cu_res))
    my_courses = list(filter(lambda x: x["_id"] in cu_ids, courses))
    r_res = helper.get_recs(courses, my_courses, study=study)
    rec2 = helper.get_rec_cf_rating(cu_collection, collection, study, uid, 4)

    return {
        "user": u_res,
        "my_courses": my_courses,
        "rec": r_res,
        # "vis": vis_res,
        "rec2": rec2,
    }


@app.route("/rating", methods=["POST"])
def addRating():
    body = request.json
    res = "error"
    u_res = list(cu_collection.find({"cid": body["cid"], "uid": body["uid"]}))
    if len(u_res) == 0:
        res = cu_collection.insert_one(body)
        res = "ok"
    return {"res": res}


@app.route("/test2", methods=["GET"])
def test2():
    course_id = request.args.get("id")
    res = collection.find_one({"_id": course_id})
    res2 = list(collection.find({"study": res["study"]}))

    rec = helper.get_recommendations(res2, res["_id"], len(res2) - 1)
    return {"res": rec}


@app.route("/vis", methods=["POST"])
def vis():
    data = json.loads(request.data)
    for k, v in list(data.items()):
        if v is None or v == "":
            del data[k]
    print(data)
    vis_res = visual.getGoFigure(data, 4)
    return {"vis": vis_res}


@app.route("/vis2", methods=["POST"])
def vis2():
    req = json.loads(request.data)
    graph_typ = req["type"]
    if graph_typ == 0:
        data = req["args"]
        for k, v in list(data.items()):
            if v is None or v == "":
                del data[k]
        vis_res = visual.getDataForGraph(data, 4, req["score"], req["args"]["study"])
        return {"vis": vis_res}
    elif graph_typ == 1:
        vis_res = visual.get_top_n(req["args"]["study"], 5)
        return {"vis": vis_res}
    elif graph_typ == 2:
        if req["goal"] == "rotation":
            vis_res = visual.get_pie_chart_rotation(req["args"]["study"])
        else:
            vis_res = visual.get_pie_chart_language(req["args"]["study"])
        return {"vis": vis_res}


if __name__ == "__main__":
    app.run()
