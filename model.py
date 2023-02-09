from nltk.corpus import PlaintextCorpusReader
import nltk.util
import nltk.corpus
import nltk

import umsgpack
import trigrams
import itertools
import pp
ppservers = ()
job_server = pp.Server(ppservers=ppservers)
print ("Starting pp with", job_server.get_ncpus(), "workers")

corpus_root = './en_US'
reader = PlaintextCorpusReader(corpus_root, '.*')
print(len(reader.fileids()))

trigrams1 = []
jobs = [(input, job_server.submit(trigrams.getTrigrams,(input,),(), ("nltk.corpus","nltk.util","nltk","nltk.tokenize.treebank","nltk.tokenize.punkt"), callback=trigrams1.append)) for input in reader.fileids()]

job_server.print_stats()

trigrams = [w
            for doc in trigrams1
            for w in doc]
job_server.destroy()
freq_dist = nltk.FreqDist(trigrams)
freq_dist.plot(50,cumulative=False)
del trigrams


#freq_dist.N()

#freq_dist.most_common(50)
kneser_ney = nltk.KneserNeyProbDist(freq_dist)
del freq_dist
prob_sum = 0
sample_count = 0

model = {}
for i in kneser_ney.samples():
    prob = kneser_ney.prob(i)
    if prob >= 0.001:
        if not i[0] in model.keys():
            model[i[0]] = {i[1]: {}}
        if not i[1] in  model[i[0]].keys():
            model[i[0]][i[1]] = {}
        model[i[0]][i[1]].update({i[2]: prob})



        if i[0] == "city" and i[1] == "of":
            prob_sum += kneser_ney.prob(i)
            sample_count += 1
            print ("{0}:{1}".format(i, kneser_ney.prob(i)))

print (prob_sum)
print (sample_count)

model_f = open("./model.msgpack", "wb")
umsgpack.pack(model, model_f)
model_f.close()