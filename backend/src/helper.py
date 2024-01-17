import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import numpy as np
from mlxtend.frequent_patterns import apriori, association_rules


def json2df(data):
    data2 = []
    for i in data:
        tags = i["tags"]
        data2 += list(map(lambda x: {"_id": i["_id"], "tag": x}, tags))
    return pd.DataFrame(data2)


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
    sim_scores = list(filter(lambda x: x[0] != idx, sim_scores))
    top_similar = sim_scores[1 : num_recommend + 1]
    top_similar = list(map(lambda x: x[0], top_similar))
    top_similar_data = list(map(lambda i: data_1[i], top_similar))
    return top_similar_data


def get_recommendations2(data_1, cid):
    data = list(
        map(
            lambda x: {"_id": x["_id"], "description": " ".join(x["keywords"])},
            data_1,
        )
    )
    df = pd.DataFrame(data)

    indices = pd.Series(df.index, index=df["_id"])
    idx = indices[cid]
    print(idx)
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
    print(pred)
    return list(filter(lambda i: i["_id"] in pred, courses_data))
