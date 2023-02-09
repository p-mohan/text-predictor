
def getTrigrams(fileId,corpus_root):
   from nltk.util import ngrams
   from nltk.corpus import PlaintextCorpusReader
   from nltk.tokenize.treebank import TreebankWordTokenizer
   from nltk.tokenize.punkt import PunktSentenceTokenizer
   tbt = TreebankWordTokenizer()
   punk = PunktSentenceTokenizer()
   reader = PlaintextCorpusReader(corpus_root, '.*')
   txt = reader.raw(fileId)
   print (txt[0:100])
   trigrams = [ngram
               for sent in punk.tokenize(txt)
               for ngram in  ngrams(tbt.tokenize(sent), 3)]
   return trigrams
