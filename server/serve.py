import flask
from flask import Flask, request,Response
import json
import umsgpack
import nltk
from nltk.util import ngrams

app = Flask(__name__)
global model
model = None
@app.before_first_request
def init():
    global model
    model_f = open("./model.msgpack", "rb")
    model = umsgpack.unpack(model_f)
    model_f.close()


@app.route('/', methods=['POST'])
def receive():
    global model
    term = request.form['term']
    if term is not None:
        tokenize = nltk.word_tokenize(term)
        bigrams = [ngram
                    for ngram in
                    ngrams(tokenize, 2)]
        print(bigrams)
        if len(bigrams)>0:
            lastBigram = bigrams[-1]
            suggesionsList = model[str(lastBigram[0])][str(lastBigram[1])]
           # suggesionsList = ['a','b','d']
            if suggesionsList is not None:
                resp = flask.make_response(json.dumps(suggesionsList))
                resp.headers['Content-Type'] = "application/json"
                resp.headers['Access-Control-Allow-Origin'] = "*"
                return resp
    resp = flask.make_response([])
    resp.headers['Content-Type'] = "application/json"
    resp.headers['Access-Control-Allow-Origin'] = "*"
    return resp

if __name__ == "__main__":
    app.run()