'''
-------------------------------------------------
|	Author	: Sk. Md. Shariful Islam Arafat     |
|	Id 		: 011132012							|
-------------------------------------------------
'''

import time
import numpy as np
import pandas as pd
import pylab as p
import graphlab
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import AdaBoostClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.feature_selection import RFE
from sklearn.externals import joblib

pd.options.mode.chained_assignment = None  #default='warn'

features = ['QuestionScore', 'QuestionCommentCount', 'QuestionFavoriteCount', 'QuestionViewCount', 'AnswerCount', 'AnswerScore', 'AnswerCommentCount', 'CommentScore', 'Negetive', 'Positive', 'Neutral']

df = pd.read_csv('CommentsModefied.csv')

#if AcceptedAnswerId is Nan then IsAccepted will be 0 otherwise it will be 1
df['IsAccepted'] = np.where(np.isnan(df['AcceptedAnswerId']), 0, 1)

subset_df = df[features]
subset_df = subset_df.fillna(0)		#the missing values are replaced with 0

X = subset_df.values
y = df.IsAccepted.values

X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=200)

# opening txt file to append result
text_file = open("output.txt", "a")

#Randomforest METHOD TO PREDICT
text_file.write('Random Forest\n')
text_file.write('______________\n')
start = time.time()
clf = RandomForestClassifier()
clf = RFE(clf, 10)	#second perameter is the number of features
clf.fit(X_train, y_train)
end = time.time()
text_file.write('Accuracy: '+str(round(clf.score(X_test,y_test)*100, 2))+'%\n')
text_file.write('Time: '+str(round(end - start, 2))+'sec\n')
text_file.write('Num of Features: '+str(clf.n_features_)+'\n')
text_file.write('Features sorted by their rank:'+'\n')
text_file.write(str(sorted(zip(map(lambda x: round(x, 4), clf.ranking_), features))))
text_file.write('\n______________\n')
prediction = clf.predict(X)

text_file.close()

#merging the result with input
result_column = pd.DataFrame({'Prediction': prediction})
df = df.merge(result_column, left_index = True, right_index = True)
df.to_csv('Prediction.csv', index=False)

#storing the model for further use
joblib.dump(clf, 'answer_accepted_model.pkl')