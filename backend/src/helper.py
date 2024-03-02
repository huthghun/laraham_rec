import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import *
import numpy as np
from mlxtend.frequent_patterns import apriori, association_rules
from surprise import Dataset
from surprise import Reader
from surprise import SVD
import torch
import transformers
from pymongo import MongoClient
import config

uri = config.getUri()
client = MongoClient(uri)
db = client.course_system
courses_collection = db["courses_en"]

# Load the BERT model
bert_tokenizer = transformers.BertTokenizer.from_pretrained("bert-base-uncased")
bert_model = transformers.BertModel.from_pretrained("bert-base-uncased")
bert_model.eval()


def get_courses_similarity(s1, s2):
    s1 = bert_tokenizer.encode(s1)
    s2 = bert_tokenizer.encode(s2)
    s1 = torch.tensor(s1)

    s1 = s1.unsqueeze(
        0
    )  # add an extra dimension, why ? the model needs to be fed in batches, we give a dummy batch 1

    s2 = torch.tensor(s2).unsqueeze(0)

    # Pass it to the model for inference
    with torch.no_grad():
        output_1 = bert_model(s1)
        output_2 = bert_model(s2)

    logits_s1 = output_1[
        0
    ]  # The last hidden-state is the first element of the output tuple
    logits_s2 = output_2[0].detach()

    logits_s1 = logits_s1.detach()  # to remove the last part we call detach

    logits_s1 = torch.squeeze(logits_s1)  # lets remove the batch dimension by squeeze
    logits_s2 = torch.squeeze(logits_s2)
    a = logits_s1.reshape(
        1, logits_s1.numel()
    )  # we lay the vector flat make it 1, **768 via reshape; numel is number of elements
    b = logits_s2.reshape(1, logits_s2.numel())

    # so we pad the tensors to be same shape
    if a.shape[1] < b.shape[1]:
        pad_size = (0, b.shape[1] - a.shape[1])
        a = torch.nn.functional.pad(a, pad_size, mode="constant", value=0)
    else:
        pad_size = (0, a.shape[1] - b.shape[1])
        b = torch.nn.functional.pad(b, pad_size, mode="constant", value=0)

    # Calculate the cosine similarity
    cos_sim = cosine_similarity(a, b)
    return cos_sim[0][0]


mai_similar_matrix = []
bai_similar_matrix = []
bai_courses_data = list(courses_collection.find({"study": "BAI"}))
mai_courses_data = list(courses_collection.find({"study": "MAI"}))
for c in mai_courses_data:
    scores = {}
    for m in mai_courses_data:
        if c["_id"] != m["_id"]:
            s1 = (
                ", ".join(m["keywords"])
                + ", "
                + m["teacher"]
                + ", "
                + m["requirements"]
                + ", "
                + str(m["credits"])
                + ", "
                + m["rotation"]
                + ", "
                + str(m["sws"])
                + ", "
                + m["study"]
                + ", "
                + m["language"]
            )
            s2 = (
                ", ".join(c["keywords"])
                + ", "
                + c["teacher"]
                + ", "
                + c["requirements"]
                + ", "
                + str(c["credits"])
                + ", "
                + c["rotation"]
                + ", "
                + str(c["sws"])
                + ", "
                + c["study"]
                + ", "
                + c["language"]
            )
            score = get_courses_similarity(s1, s2)
            m["score"] = score
            scores[m["_id"]] = score
    mai_similar_matrix.append({"_id": c["_id"], "scores": scores})
    print(c["_id"])
for c in bai_courses_data:
    scores = {}
    for m in bai_courses_data:
        if c["_id"] != m["_id"]:
            s1 = (
                ", ".join(m["keywords"])
                + ", "
                + m["teacher"]
                + ", "
                + m["requirements"]
                + ", "
                + str(m["credits"])
                + ", "
                + m["rotation"]
                + ", "
                + str(m["sws"])
                + ", "
                + m["study"]
                + ", "
                + m["language"]
            )
            s2 = (
                ", ".join(c["keywords"])
                + ", "
                + c["teacher"]
                + ", "
                + c["requirements"]
                + ", "
                + str(c["credits"])
                + ", "
                + c["rotation"]
                + ", "
                + str(c["sws"])
                + ", "
                + c["study"]
                + ", "
                + c["language"]
            )
            score = get_courses_similarity(s1, s2)
            m["score"] = score
            scores[m["_id"]] = score
    bai_similar_matrix.append({"_id": c["_id"], "scores": scores})
    print(c["_id"])


def get_recs(courses, my_courses, n=4, study="MAI"):
    similar_matrix = mai_similar_matrix
    if study == "BAI":
        similar_matrix = bai_similar_matrix

    my_courses_id = list(map(lambda x: x["_id"], my_courses))
    courses = list(filter(lambda x: not (x["_id"] in my_courses_id), courses))
    res = list(
        map(
            lambda x: x["scores"],
            list(filter(lambda x: x["_id"] in my_courses_id, similar_matrix)),
        )
    )
    res2 = {k: sum(d[k] for d in res if k in d) for k in set(k for d in res for k in d)}
    res3 = [(key, value) for key, value in res2.items()]

    sorted_scores = list(
        filter(
            lambda x: not (x[0] in my_courses_id),
            sorted(res3, key=lambda x: x[1], reverse=True),
        )
    )
    res_n_rec = []
    for id, score in sorted_scores:
        tmp_list = list(filter(lambda x: x["_id"] == id, courses))
        if len(tmp_list) > 0:
            tmp = tmp_list[0]
            tmp["score"] = score
            res_n_rec.append(tmp)

    sorted_scores = sorted(res_n_rec, key=lambda x: x["score"], reverse=True)
    return sorted_scores[0:n]


def json2df(data):
    data2 = []
    for i in data:
        tags = i["tags"]
        data2 += list(map(lambda x: {"_id": i["_id"], "tag": x}, tags))
    return pd.DataFrame(data2)


def append_score_to_list(liste, scores):
    res = []
    for i, s in scores:
        tmp = liste[i]
        tmp["score"] = s
        res.append(tmp)
    return res


def get_recommendations(data_1, cid, num_recommend=4):
    data = list(
        map(
            lambda x: {"_id": x["_id"], "description": " ".join(x["keywords"])},
            data_1,
        )
    )
    df = pd.DataFrame(data)

    indices = pd.Series(df.index, index=df["_id"])
    idx = indices[cid]
    df["description"] = df["description"].fillna("")
    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(df["description"])

    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

    sim_scores = list(enumerate(cosine_sim[idx]))

    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    # sim_scores = list(filter(lambda x: x[0] != idx, sim_scores))
    top_similar = sim_scores[0 : num_recommend + 1]
    # top_similar = list(map(lambda x: x[0], top_similar))
    # top_similar_data = list(map(lambda i:{data_1[i]}, top_similar))
    top_similar_data = append_score_to_list(data_1, top_similar)
    return top_similar_data


def get_recommendations2(data_1, cid):
    data = list(
        map(
            lambda x: {"_id": x["_id"], "description": x["description"]},
            data_1,
        )
    )
    df = pd.DataFrame(data)

    indices = pd.Series(df.index, index=df["_id"])
    idx = indices[cid]
    df["description"] = df["description"].fillna("")
    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(df["description"])

    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

    sim_scores = list(cosine_sim[idx])

    return sim_scores


def get_similar(data, my_courses, num_recommend=4):
    res = list(map(lambda i: get_recommendations2(data, i), my_courses))
    res = [sum(x) for x in zip(*res)]
    sim_scores = list(enumerate(res))
    df = pd.DataFrame(data)

    indices = pd.Series(df.index, index=df["_id"])
    my_courses = list(map(lambda x: indices[x], my_courses))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = list(filter(lambda x: not (x[0] in my_courses), sim_scores))
    top_similar = sim_scores[1 : num_recommend + 1]
    top_similar = list(map(lambda x: x[0], top_similar))
    top_similar_data = list(map(lambda i: data[i], top_similar))

    return top_similar_data


def get_matrix(data_1):
    data = list(
        map(
            lambda x: {"_id": x["_id"], "description": " ".join(x["keywords"])},
            data_1,
        )
    )
    df = pd.DataFrame(data)
    df["description"] = df["description"].fillna("")
    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(df["description"])

    cosine_sim = list(linear_kernel(tfidf_matrix, tfidf_matrix))
    return cosine_sim


def arl_recommender(rules_df, cid, rec_count=10):
    sorted_rules = rules_df.sort_values(
        "lift", ascending=False
    )  # we rank the rules that we have calculated before, according to the lift.
    recommendation_list = (
        []
    )  # Since we can make more than one suggestion, we have created a suggestion list.
    for i, product in enumerate(sorted_rules["antecedents"]):
        for j in list(product):  # We convert the values we have captured into a list.
            if j == cid:
                recommendation_list.append(list(sorted_rules.iloc[i]["consequents"]))
    res = recommendation_list[0:rec_count]
    return np.unique(np.array([x for xs in res for x in xs]))


def association_rule(cu_collection, courses, course_id, study):
    ratings = list(cu_collection.find({"study": study}))
    data = pd.DataFrame(ratings)

    matrix_data = (
        data.groupby(["uid", "cid"])["cid"]
        .count()
        .unstack()
        .fillna(0)
        .applymap(lambda x: 1 if x > 0 else 0)
    )

    frequent_itemsets = apriori(
        matrix_data.astype("bool"), min_support=0.01, use_colnames=True
    )

    rules = association_rules(frequent_itemsets, metric="support", min_threshold=0.01)

    pred = arl_recommender(rules, course_id)
    courses_data = courses.find()
    return list(filter(lambda i: i["_id"] in pred, courses_data))


def get_cf_scores(data_1, cid, num_recommend=4):
    data = list(
        map(
            lambda x: {
                "_id": x["_id"],
                "description": " ".join(x["keywords"])
                + ", "
                + x["teacher"]
                + ", "
                + x["requirements"]
                + ", "
                + str(x["credits"])
                + ", "
                + x["rotation"]
                + ", "
                + str(x["sws"])
                + ", "
                + x["study"]
                + ", "
                + x["language"],
            },
            data_1,
        )
    )
    df = pd.DataFrame(data)

    indices = pd.Series(df.index, index=df["_id"])
    idx = indices[cid]
    df["description"] = df["description"].fillna("")
    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(df["description"])

    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    sim_scores = list(enumerate(cosine_sim[idx]))

    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    top_similar = sim_scores[0 : num_recommend + 1]
    top_similar = list(map(lambda x: (data_1[x[0]]["_id"], x[1]), top_similar))

    return top_similar


def find_course_and_put_score(courses, cid, score):
    res = [x for x in courses if x["_id"] == cid][0]
    res["score"] = score
    return res


def get_rec_cf_rating(rating_col, courses_col, study, user_id, n_items):
    courses = list(courses_col.find({"study": study}))
    ratings = list(rating_col.find({"study": study}))
    ratings = list(
        map(
            lambda x: {
                "cid": x["cid"],
                "uid": x["uid"],
                "rating": (x["rating1"] + x["rating2"] + x["rating3"] + x["rating4"])
                / 4,
            },
            ratings,
        )
    )
    ratings_data = pd.DataFrame(ratings)
    courses_data = pd.DataFrame(courses)
    reader = Reader(rating_scale=(1, 5))
    # Loads Pandas dataframe
    data = Dataset.load_from_df(ratings_data[["uid", "cid", "rating"]], reader)
    trainset = data.build_full_trainset()
    svd = SVD(n_factors=100, biased=True, random_state=15, verbose=True)
    svd.fit(trainset)
    # Get a list of all courses IDs from dataset
    courses_ids = courses_data["_id"].unique()
    # Get a list of all courses IDs that have been rated by user
    course_ids_user = list(ratings_data.loc[ratings_data["uid"] == user_id, "cid"])
    # Get a list off all courses IDS that that have not been rated by user
    course_ids_to_pred = np.setdiff1d(courses_ids, course_ids_user)

    # Apply a rating of 3 to all interactions (only to match the Surprise dataset format)
    test_set = [[user_id, course_id, 3] for course_id in course_ids_to_pred]
    # Predict the ratings and generate recommendations
    predictions = svd.test(test_set)
    pred_ratings = np.array([pred.est for pred in predictions])
    # Rank top-n courses based on the predicted ratings
    index_max = (-pred_ratings).argsort()[:n_items]

    res = list(
        map(
            lambda i: find_course_and_put_score(
                courses, course_ids_to_pred[i], pred_ratings[i]
            ),
            index_max,
        )
    )
    return res
