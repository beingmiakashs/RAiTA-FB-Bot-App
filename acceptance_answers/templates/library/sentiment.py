import pandas as pd
import numpy as np
from nltk.sentiment.vader import SentimentIntensityAnalyzer

#estimating the sentiment of each comment 
df = pd.read_csv('Comments.csv', dtype='unicode')
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

df.to_csv('CommentsWithSentiments.csv', index=False)

#keeping the the heighest value of sentimate
df = pd.read_csv('CommentsWithSentiments.csv', dtype={'CommentId': np.int64})
temp = []
for index, row in df.iterrows(): 
	if row['Neutral'] >= row['Negetive']:
		if row['Neutral'] >= row['Positive']:
			temp.append({'CommentId':row['CommentId'],'Neutral':1,'Positive':0,'Negetive':0})
		else:
			temp.append({'CommentId':row['CommentId'],'Neutral':0,'Positive':1,'Negetive':0})

	else:
		if row['Negetive'] > row['Positive']:
			temp.append({'CommentId':row['CommentId'],'Neutral':0,'Positive':0,'Negetive':1})
		else:
			temp.append({'CommentId':row['CommentId'],'Neutral':0,'Positive':1,'Negetive':0})

sentiment = pd.DataFrame(temp)

df = df.drop(['Neutral','Positive','Negetive'], axis=1)
merged = pd.merge(df, sentiment, how='left', on='CommentId')
merged.to_csv('CommentsWithSentiments.csv', index=False)

#group by answer id
df = pd.read_csv('CommentsWithSentiments.csv')
groupedByDf = df.groupby('AnswerId', as_index=False).agg({
	"CommentScore": "sum",
	"Positive": "sum",
	"Negetive": "sum",
	"Neutral": "sum"
})

comments = pd.read_csv('Comments.csv')
comments = comments.drop(['CommentId','CommentScore','Comment','CommentUserId'], axis=1)
comments.drop_duplicates(subset=['AnswerId', 'QuestionId'])
merged = pd.merge(comments, groupedByDf, how='left', on='AnswerId')
merged.to_csv('CommentsModefied.csv', index=False)