import nltk
import pandas as pd
import numpy as np
from nltk.sentiment.vader import SentimentIntensityAnalyzer


class Sentiment():

    def commentSentiment(df):
        # estimating the sentiment of each comment
        # BASE = np.os.path.dirname(np.os.path.abspath(__file__))
        # df = pd.read_csv(BASE + 'templates/library/Comments.csv', dtype='unicode')
        OrginalComment = df

        sentimentIntensityAnalyzer = SentimentIntensityAnalyzer()

        negetive = []
        neutral = []
        positive = []

        for index, row in df.iterrows():
            scores = sentimentIntensityAnalyzer.polarity_scores(str(row['Comment']))

            negetive.append(scores['neg'])
            neutral.append(scores['neu'])
            positive.append(scores['pos'])

        df['Negetive'] = negetive
        df['Neutral'] = neutral
        df['Positive'] = positive

        # df.to_csv('CommentsWithSentiments.csv', index=False)
        #
        # # keeping the the heighest value of sentimate
        # df = pd.read_csv('CommentsWithSentiments.csv', dtype={'CommentId': np.int64})
        temp = []
        for index, row in df.iterrows():
            if row['Neutral'] >= row['Negetive']:
                if row['Neutral'] >= row['Positive']:
                    temp.append({'CommentId': row['CommentId'], 'Neutral': 1, 'Positive': 0, 'Negetive': 0})
                else:
                    temp.append({'CommentId': row['CommentId'], 'Neutral': 0, 'Positive': 1, 'Negetive': 0})

            else:
                if row['Negetive'] > row['Positive']:
                    temp.append({'CommentId': row['CommentId'], 'Neutral': 0, 'Positive': 0, 'Negetive': 1})
                else:
                    temp.append({'CommentId': row['CommentId'], 'Neutral': 0, 'Positive': 1, 'Negetive': 0})

        sentiment = pd.DataFrame(temp)

        df = df.drop(['Neutral', 'Positive', 'Negetive'], axis=1)
        merged = pd.merge(df, sentiment, how='left', on='CommentId')
        CommentsWithSentiments = merged
        # merged.to_csv('CommentsWithSentiments.csv', index=False)

        # group by answer id
        # df = pd.read_csv('CommentsWithSentiments.csv')
        df = CommentsWithSentiments
        groupedByDf = merged.groupby('AnswerId', as_index=False).agg({
            "CommentScore": "sum",
            "Positive": "sum",
            "Negetive": "sum",
            "Neutral": "sum"
        })
        #
        # # comments = pd.read_csv('Comments.csv')
        comments = OrginalComment
        comments = comments.drop('CommentScore', 1)
        comments = comments.drop('Neutral', 1)
        comments = comments.drop('Positive', 1)
        comments = comments.drop('Negetive', 1)


        # comments = OrginalComment.drop(['CommentId', 'Comment', 'CommentUserId', 'CommentScore'], axis=1)
        comments = comments.drop_duplicates(subset=['AnswerId', 'QuestionId'])
        # CommentsModefied = pd.merge(comments, groupedByDf)
        # CommentsModefied = pd.merge(comments, groupedByDf, how='left', on='AnswerId')
        # merged.to_csv('CommentsModefied.csv', index=False)
        return pd.merge(comments, groupedByDf, how='left', on='AnswerId')