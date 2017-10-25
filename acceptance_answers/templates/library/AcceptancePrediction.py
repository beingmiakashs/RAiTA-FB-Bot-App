import os
import time
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import AdaBoostClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.feature_selection import RFE
from sklearn.externals import joblib

pd.options.mode.chained_assignment = None  #default='warn'

class AcceptancePrediction():
    def prediction(BASE, df):
        features = ['QuestionScore', 'QuestionCommentCount', 'QuestionFavoriteCount', 'QuestionViewCount',
                    'AnswerCount', 'AnswerScore', 'AnswerCommentCount', 'CommentScore', 'Negetive', 'Positive',
                    'Neutral']
        #
        # df['IsAccepted'] = np.where(pd.isnull(df['AcceptedAnswerId']), 0, 1)
        #
        subset_df = df[features]
        subset_df = subset_df.fillna(0)  # the missing values are replaced with 0
        #
        X = subset_df.values
        #
        clf = joblib.load(BASE + '/templates/pkl/answer_accepted_model.pkl')
        #
        predict = clf.predict_proba(X) * 100
        my_accept_predict = []
        my_not_accept_predict = []

        for i in range(len(predict)):
            my_accept_predict.append(predict[i][1])
            my_not_accept_predict.append(predict[i][0])


        result_column = pd.DataFrame({'AcceptPrediction': my_accept_predict, 'NotAcceptPrediction': my_not_accept_predict})
        df_result = df.merge(result_column, left_index=True, right_index=True)
        # df_result.to_csv(BASE + '/templates/library/result.csv', index=False)

        return df_result
