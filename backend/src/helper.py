import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel


def json2df(data):
    data2 = []
    for i in data:
        tags = i["tags"]
        data2 += list(map(lambda x: {"_id": i["_id"], "tag": x}, tags))
    print(data2)
    return pd.DataFrame(data2)


def get_recommendations(data_1, cid, num_recommend=4):
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
    print(tfidf_matrix.shape)

    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)
    print(cosine_sim.shape)

    print(idx)
    sim_scores = list(enumerate(cosine_sim[idx]))

    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    top_similar = sim_scores[1 : num_recommend + 1]
    top_similar = list(map(lambda x: str(x[0]), top_similar))

    return top_similar


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

    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    top_similar = sim_scores[1 : num_recommend + 1]
    top_similar = list(map(lambda x: str(x[0]), top_similar))

    return list(
        filter(
            lambda x: (x["_id"] in top_similar) and not (x["_id"] in my_courses), data
        )
    )
