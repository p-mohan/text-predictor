import logging
import os
import json
from zipfile import ZipFile
from io import StringIO
from threading import Thread
from google.cloud import storage
import umsgpack
import nltk
from nltk.util import ngrams
import flask
from flask import Flask, request,Response, current_app
app = Flask(__name__)
nltk.download('punkt')


# Configure this environment variable via app.yaml
CLOUD_STORAGE_BUCKET = os.environ['CLOUD_STORAGE_BUCKET']
# [end config]

def create_file():
    gcs = storage.Client()

    bucket = gcs.get_bucket(CLOUD_STORAGE_BUCKET)
    blob = storage.Blob('model.zip', bucket)
    zipfile = ZipFile(StringIO(blob.download_as_string()))
    foofile = zipfile.open('model.zip')
    filename = "model.msgpack"
    blob = bucket.blob(filename)
    blob.upload_from_file(foofile)



def get_model():
    with app.app_context():
            gcs = storage.Client()
            bucket = gcs.get_bucket(CLOUD_STORAGE_BUCKET)
            blob = storage.Blob('model.msgpack', bucket)
            setattr(current_app, 'ngramModel',umsgpack.unpackb(blob.download_as_string()))
            print("MODEL INIT COMPLETE")



@app.route('/')
def checkmodel():
   # thr = Thread(target=create_file, args=[])
   # thr.start()
    if not hasattr(current_app, 'ngramModel'):
        response = "".join('Model not available')
    else:
        response = "".join('Model available, good to go.')
    return response

@app.route('/loadmodel')
def loadmodel():
     thr = Thread(target=get_model, args=[])
     thr.start()
     response = "".join('loading model...')
     return response

@app.route('/suggest', methods=['POST'])
def suggest():
    if not hasattr(current_app, 'ngramModel'):
        thr = Thread(target=get_model, args=[])
        thr.start()
    else:
        model = getattr(current_app, 'ngramModel')
        term = request.form['term']
        if term is not None:
            tokenize = nltk.word_tokenize(term)
            bigrams = [ngram
                        for ngram in
                        ngrams(tokenize, 2)]
            #print(bigrams)
            if len(bigrams)>0:
                lastBigram = bigrams[-1]
                #print(lastBigram)
                suggesionsList = model[str(lastBigram[0])][str(lastBigram[1])]
               # suggesionsList = ['a','b','d']
                if suggesionsList is not None:
                    resp = flask.make_response(json.dumps(suggesionsList))
                    resp.headers['Content-Type'] = "application/json"
                    resp.headers['Access-Control-Allow-Origin'] = "*"
                    return resp
    print("suggestionList is empty.")
    resp = flask.make_response("")
    resp.headers['Content-Type'] = "application/json"
    resp.headers['Access-Control-Allow-Origin'] = "*"
    return resp