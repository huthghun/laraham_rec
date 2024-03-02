import plotly.graph_objects as go
import plotly
import pandas as pd
import numpy as np
import json
import networkx as nx
import math
from pymongo import MongoClient
import config
import helper
import plotly.express as px

uri = config.getUri()
client = MongoClient(uri)
db = client.course_system
courses_collection = db["courses_en"]
cu_collection = db["course_users"]
colors = [
    "#ff0000",
    "#008000",
    "#0000ff",
    "#ffff00",
    "#ffa500",
    "#ffc0cb",
    "#964b00",
    "#deb887",
    "#5f9ea0",
    "#7fff00",
    "#d2691e",
    "#ff7f50",
    "#6495ed",
    "#fff8dc",
    "#dc143c",
    "#00ffff",
    "#ffd700",
    "#c0c0c0",
    "#008080",
    "#2e8b57",
    "#fff5ee",
    "#a0522d",
    "#40e0d0",
    "#7f00ff",
    "#9400d3",
    "#ff1493",
    "#00bfff",
]


def getDataForGraph(args, n, min_score, study):
    courses = list(courses_collection.find(args))
    nodes = []
    edges = []
    edges2 = []
    for i, course in enumerate(courses):
        count = len(
            list(
                map(
                    lambda x: (
                        x["rating1"] + x["rating2"] + x["rating3"] + x["rating4"]
                    )
                    / 4,
                    list(cu_collection.find({"cid": course["_id"]})),
                )
            )
        )
        nodes.append(
            {
                "id": course["_id"],
                "labelProperty": course["title"],
                "size": 300 * (count + 1),
                "color": colors[i],
            }
        )
        course["rec"] = list(
            map(
                lambda x: (x["_id"], x["score"]),
                helper.get_recs(courses, [course], n, study),
            )
        )
        for node, score in course["rec"]:
            if (
                course["_id"] != node
                and not ((course["_id"], node) in edges2)
                and not ((node, course["_id"]) in edges2)
                and score >= min_score
            ):
                edges2.append((course["_id"], node))
                edges.append(
                    {
                        "source": course["_id"],
                        "target": node,
                        "label": "{0:.3g}".format(score),
                        "strokeWidth": min(5, int(score * 20)),
                    }
                )

    return {"links": edges, "nodes": nodes}


def getGoFigure(args, n):
    courses = list(courses_collection.find(args))
    nodes = list(map(lambda x: x["_id"], courses))
    edges = []
    edges_scores = []
    mnode_txt = []
    for course in courses:
        course["rec"] = helper.get_cf_scores(courses, course["_id"], n)
        for node, score in course["rec"]:
            if course["_id"] != node and not ((course["_id"], node) in edges):
                edges.append((course["_id"], node, score))
                edges_scores.append("score: " + str(score))

    G1 = nx.Graph()
    G1.add_nodes_from(nodes)
    G1.add_weighted_edges_from(edges)
    pos = nx.spring_layout(G1, seed=7)
    for i, idx in enumerate(pos):
        G1.nodes[idx]["pos"] = list(pos[idx])
        G1.nodes[idx]["info"] = courses_collection.find_one({"_id": idx})
        count = list(
            map(
                lambda x: (x["rating1"] + x["rating2"] + x["rating3"] + x["rating4"])
                / 4,
                list(cu_collection.find({"cid": idx})),
            )
        )
        G1.nodes[idx]["info"]["count"] = len(count)
        if sum(count) > 0:
            G1.nodes[idx]["info"]["avg"] = "{0:.3g}".format(sum(count) / len(count))
        else:
            G1.nodes[idx]["info"]["avg"] = 0
    edge_x = []
    edge_y = []
    for edge in G1.edges():
        x0, y0 = G1.nodes[edge[0]]["pos"]
        x1, y1 = G1.nodes[edge[1]]["pos"]
        edge_x.append(x0)
        edge_x.append(x1)
        edge_x.append(None)
        edge_y.append(y0)
        edge_y.append(y1)
        edge_y.append(None)

    edge_trace = go.Scatter(
        x=edge_x,
        y=edge_y,
        line=dict(width=1.5, color="#888"),
        hoverinfo="text",
        hovertemplate="Edge %{hovertext}<extra></extra>",
        hovertext=mnode_txt,
        mode="lines",
    )

    node_x = []
    node_y = []
    node_text = []
    node_size = []
    for node in G1.nodes():
        x, y = G1.nodes[node]["pos"]
        node_text.append(
            G1.nodes[node]["info"]["title"]
            + "<br>Language: "
            + G1.nodes[node]["info"]["language"]
            + "<br>Rotation: "
            + str(G1.nodes[node]["info"]["rotation"])
            + "<br>SWS: "
            + str(G1.nodes[node]["info"]["sws"])
            + "<br>Credits: "
            + str(G1.nodes[node]["info"]["credits"])
            + "<br># Rating: "
            + str(G1.nodes[node]["info"]["count"])
            + "<br>Ø Rating: "
            + str(G1.nodes[node]["info"]["avg"])
        )
        node_x.append(x)
        node_y.append(y)
        count = G1.nodes[node]["info"]["count"]
        node_size.append((count + 1) * 20)

    node_trace = go.Scatter(
        x=node_x,
        y=node_y,
        mode="markers",
        hoverinfo="text",
        marker=dict(
            reversescale=True,
            color=[
                "red",
                "green",
                "blue",
                "yellow",
                "orange",
                "pink",
                "brown",
                "burlywood",
                "cadetblue",
                "chartreuse",
                "chocolate",
                "coral",
                "cornflowerblue",
                "cornsilk",
                "crimson",
                "cyan",
                "gold",
                "silver",
                "teal",
                "seagreen",
                "seashell",
                "sienna",
                "turquoise",
                "violet",
                "darkviolet",
                "deeppink",
                "deepskyblue",
            ],
            opacity=1.0,
            line_width=1,
        ),
        marker_size=node_size,
    )

    node_trace.text = node_text
    edge_trace.text = edges_scores
    fig = go.Figure(
        data=[edge_trace, node_trace],
        layout=go.Layout(
            title="",
            width=1000,
            height=600,
            titlefont_size=16,
            showlegend=False,
            hovermode="closest",
            margin=dict(b=20, l=5, r=5, t=40),
            annotations=[
                dict(
                    text="",
                    showarrow=False,
                    xref="paper",
                    yref="paper",
                    x=0.005,
                    y=-0.002,
                )
            ],
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        ),
    )
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON


def getFigure(rec, course):
    nodes = []
    cid = course["_id"]
    course["score"] = 1.0
    rec2 = [e for e in rec]
    rec2.append(course)
    for i, c in enumerate(rec2):
        count = list(
            map(
                lambda x: (x["rating1"] + x["rating2"] + x["rating3"] + x["rating4"])
                / 4,
                list(cu_collection.find({"cid": c["_id"]})),
            )
        )
        if sum(count) > 0:
            avg = "{0:.3g}".format(sum(count) / len(count))
        else:
            avg = 0
        if c["_id"] == cid:
            nodes.append(
                (
                    c["_id"],
                    {
                        "pos": [0, 0],
                        "info": c,
                        "count": len(count),
                        "avg": avg,
                    },
                )
            )
        else:
            nodes.append(
                (
                    c["_id"],
                    {
                        "pos": [
                            (1 - c["score"]) * math.sin(math.pi * i / (len(rec2) / 2)),
                            (1 - c["score"]) * math.cos(math.pi * i / (len(rec2) / 2)),
                        ],
                        "info": c,
                        "count": len(count),
                        "avg": avg,
                    },
                )
            )

    # nodes = list(map(lambda x: (x["_id"], {"pos": [math.acos((x['score']-1))*10,math.asin((1-x['score']))*10] if x["_id"]!=cid else [10*math.acos(0),10*math.asin(1)] , "info":x}), rec))
    edges = list(
        map(
            lambda x: (cid, x[0]),
            list(filter(lambda x: x[0] != cid, nodes)),
        )
    )

    G = nx.Graph()
    G.add_nodes_from(nodes)
    G.add_edges_from(edges)

    # pos = nx.spring_layout(G)

    edge_x = []
    edge_y = []
    for edge in G.edges():
        x0, y0 = G.nodes[edge[0]]["pos"]
        x1, y1 = G.nodes[edge[1]]["pos"]
        edge_x.append(x0)
        edge_x.append(x1)
        edge_x.append(None)
        edge_y.append(y0)
        edge_y.append(y1)
        edge_y.append(None)

    edge_trace = go.Scatter(
        x=edge_x,
        y=edge_y,
        line=dict(width=1.5, color="#888"),
        hoverinfo="none",
        mode="lines",
    )

    node_x = []
    node_y = []
    node_text = []
    node_label = []
    node_size = []
    for node in G.nodes():
        x, y = G.nodes[node]["pos"]
        node_text.append(
            "Title: "
            + G.nodes[node]["info"]["title"]
            + "<br>Language: "
            + G.nodes[node]["info"]["language"]
            + "<br>Rotation: "
            + str(G.nodes[node]["info"]["rotation"])
            + "<br>SWS: "
            + str(G.nodes[node]["info"]["sws"])
            + "<br>Credits: "
            + str(G.nodes[node]["info"]["credits"])
            + "<br>Score: "
            + "{0:.3g}".format(G.nodes[node]["info"]["score"])
            + "<br># Rating: "
            + str(G.nodes[node]["count"])
            + "<br>Ø Rating: "
            + str(G.nodes[node]["avg"])
        )
        node_label.append(G.nodes[node]["info"]["title"])
        node_x.append(x)
        node_y.append(y)
        count = G.nodes[node]["count"]
        node_size.append((count + 1) * 20)

    node_trace = go.Scatter(
        x=node_x,
        y=node_y,
        mode="markers+text",
        hoverinfo="text",
        hovertext="hovertext",
        text="text",
        textposition="top center",
        marker=dict(
            reversescale=True,
            color=[
                "red",
                "green",
                "blue",
                "yellow",
                "orange",
                "pink",
                "brown",
                "burlywood",
                "cadetblue",
                "chartreuse",
                "chocolate",
                "coral",
                "cornflowerblue",
                "cornsilk",
                "crimson",
                "cyan",
                "gold",
                "silver",
                "teal",
                "seagreen",
                "seashell",
                "sienna",
                "turquoise",
                "violet",
                "darkviolet",
                "deeppink",
                "deepskyblue",
            ],
            opacity=1.0,
            line_width=1,
        ),
        marker_size=node_size,
    )

    node_trace.hovertext = node_text
    node_trace.text = node_label

    fig = go.Figure(
        data=[edge_trace, node_trace],
        layout=go.Layout(
            title="",
            titlefont_size=16,
            showlegend=False,
            hovermode="closest",
            margin=dict(b=20, l=5, r=5, t=40),
            annotations=[
                dict(
                    text="",
                    showarrow=False,
                    xref="paper",
                    yref="paper",
                    x=0.005,
                    y=-0.002,
                )
            ],
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        ),
    )

    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

    return graphJSON


def get_top_n(study, n):
    courses = list(courses_collection.find({"study": study}))
    for course in courses:
        ratings = list(
            map(
                lambda x: {
                    "total": (x["rating1"] + x["rating2"] + x["rating3"] + x["rating4"])
                    / 4,
                    "rating1": x["rating1"],
                    "rating2": x["rating2"],
                    "rating3": x["rating3"],
                    "rating4": x["rating4"],
                },
                list(cu_collection.find({"cid": course["_id"]})),
            )
        )
        course["count"] = len(ratings)
        if len(ratings) > 0:
            course["avg_total"] = sum(c["total"] for c in ratings) / len(ratings)
            course["avg_rating1"] = sum(c["rating1"] for c in ratings) / len(ratings)
            course["avg_rating2"] = sum(c["rating2"] for c in ratings) / len(ratings)
            course["avg_rating3"] = sum(c["rating3"] for c in ratings) / len(ratings)
            course["avg_rating4"] = sum(c["rating4"] for c in ratings) / len(ratings)
        else:
            course["avg"] = 0
            course["avg_rating1"] = 0
            course["avg_rating2"] = 0
            course["avg_rating3"] = 0
            course["avg_rating4"] = 0

    data = pd.DataFrame(courses)
    sorted_data = data.sort_values(
        by=[
            "count",
            "avg_total",
            "avg_rating1",
            "avg_rating2",
            "avg_rating3",
            "avg_rating4",
        ],
        ascending=False,
    ).head(n)
    fig = go.Figure()
    fig.add_trace(
        go.Bar(name="# ratings", x=sorted_data["title"], y=sorted_data["count"])
    )
    fig.add_trace(
        go.Bar(name="Ø total", x=sorted_data["title"], y=sorted_data["avg_total"])
    )
    fig.add_trace(
        go.Bar(name="Ø happy", x=sorted_data["title"], y=sorted_data["avg_rating1"])
    )
    fig.add_trace(
        go.Bar(name="Ø helpful", x=sorted_data["title"], y=sorted_data["avg_rating2"])
    )
    fig.add_trace(
        go.Bar(name="Ø easy", x=sorted_data["title"], y=sorted_data["avg_rating3"])
    )
    fig.add_trace(
        go.Bar(
            name="Ø recommending", x=sorted_data["title"], y=sorted_data["avg_rating4"]
        )
    )
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

    return graphJSON


def get_pie_chart_rotation(study):
    courses = list(courses_collection.find({"study": study}))
    ratings = list(cu_collection.find())
    # ratings_cids = list(map(lambda x: x["cid"], ratings))
    ss_courses = list(
        map(lambda x: x["_id"], list(filter(lambda x: x["rotation"] == "SS", courses)))
    )
    ws_courses = list(
        map(lambda x: x["_id"], list(filter(lambda x: x["rotation"] == "WS", courses)))
    )
    other_courses = list(
        map(
            lambda x: x["_id"],
            list(
                filter(
                    lambda x: x["rotation"] != "SS" and x["rotation"] != "WS", courses
                )
            ),
        )
    )

    data = [
        {
            "rotation": "SS",
            "count_courses": len(ss_courses),
            "ratings": len(list(filter(lambda x: x["cid"] in ss_courses, ratings))),
        },
        {
            "rotation": "WS",
            "count_courses": len(ws_courses),
            "ratings": len(list(filter(lambda x: x["cid"] in ws_courses, ratings))),
        },
        {
            "rotation": "other",
            "count_courses": len(other_courses),
            "ratings": len(list(filter(lambda x: x["cid"] in other_courses, ratings))),
        },
    ]
    df = pd.DataFrame(data)

    fig = px.pie(df, values="ratings", names="rotation")
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

    return graphJSON


def get_pie_chart_language(study):
    courses = list(courses_collection.find({"study": study}))
    ratings = list(cu_collection.find())
    # ratings_cids = list(map(lambda x: x["cid"], ratings))
    en_courses = list(
        map(
            lambda x: x["_id"],
            list(filter(lambda x: x["language"] == "english", courses)),
        )
    )
    de_courses = list(
        map(
            lambda x: x["_id"],
            list(filter(lambda x: x["language"] == "german", courses)),
        )
    )
    both_courses = list(
        map(
            lambda x: x["_id"],
            list(
                filter(
                    lambda x: x["language"] != "german" and x["language"] != "english",
                    courses,
                )
            ),
        )
    )

    data = [
        {
            "language": "english",
            "count_courses": len(en_courses),
            "ratings": len(list(filter(lambda x: x["cid"] in en_courses, ratings))),
        },
        {
            "language": "german",
            "count_courses": len(de_courses),
            "ratings": len(list(filter(lambda x: x["cid"] in de_courses, ratings))),
        },
        {
            "language": "both",
            "count_courses": len(both_courses),
            "ratings": len(list(filter(lambda x: x["cid"] in both_courses, ratings))),
        },
    ]
    df = pd.DataFrame(data)

    fig = px.pie(df, values="ratings", names="language")
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

    return graphJSON
