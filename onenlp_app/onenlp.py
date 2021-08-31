from re import escape
import spacy
from nltk.tokenize import sent_tokenize, RegexpTokenizer
from nltk.corpus import wordnet, stopwords, wordnet
import json
import nltk
from nltk import ngrams
from collections import Counter
from textblob import TextBlob
from textblob import Word
from spacy import displacy
from spacy.lang.en.stop_words import STOP_WORDS
from string import punctuation
from heapq import nlargest
from spacy.matcher import Matcher
import html

nltk_stop_words = set(stopwords.words("english"))
nlp = spacy.load("en_core_web_sm")

# ---------------------- DESCRIPTION ----------------------------
# -----------------
# Tuple ----> (word, pre , post)
# -----------------
# ========> mcw = most common words 
# ----------------------------------------------------------------


def build_summary(doc):
  doc = nlp(doc)
  keyword = []
  stopwords = list(STOP_WORDS)
  pos_tag = ['PROPN', 'ADJ', 'NOUN', 'VERB']

  for token in doc:
    if(token.text in stopwords or token.text in punctuation):
          continue
    if(token.pos_ in pos_tag):
      keyword.append(token.text)

  freq_word = Counter(keyword)
  max_freq = Counter(keyword).most_common(1)[0][1]
  for word in freq_word.keys():  
          freq_word[word] = (freq_word[word]/max_freq)


  sent_strength={}
  for sent in doc.sents:
      for word in sent:
          if word.text in freq_word.keys():
              if sent in sent_strength.keys():
                  sent_strength[sent]+=freq_word[word.text]
              else:
                  sent_strength[sent]=freq_word[word.text]

  summarized_sentences = nlargest(3, sent_strength, key=sent_strength.get)

  final_sentences = [ w.text for w in summarized_sentences ]
  summary = ' '.join(final_sentences)
  return summary

# ======= Props =========
POSITIVE = 'Positive'
NEGATIVE = 'Negative'
NEUTRAL = 'Neutral'
CONFUSED = 'Confused'

def sentiment_analysis(text):
    try:
        blob = TextBlob(text.decode('ascii', errors="replace"))
    except Exception as e:
        text = text.encode('utf-8')
        blob = TextBlob(text.decode('ascii', errors="replace"))
    sentiment_polarity = blob.sentiment.polarity
    if sentiment_polarity < 0:
        sentiment = NEGATIVE
    elif sentiment_polarity <= 0.2:
        sentiment = NEUTRAL
    else:
        sentiment = POSITIVE
    return sentiment


class OneNLP(object):
  def __init__(self, text = None):
    self.text = text or ""

  # === NLP Main functions ===
  def get_most_common_ngram(self, text_block,num, exclude_numeric=False, n=1):
    """
    Given a text_block, return a Counter of the most frequent n-grams excluding nltk_stop_words.
    """
    text_block = text_block.lower()
    if exclude_numeric:
        tokenizer = RegexpTokenizer("[A-Za-z']+")
    else:
        tokenizer = RegexpTokenizer("[\w']+")
    
    text_token = tokenizer.tokenize(text_block)
    text_token = [w for w in text_token if w not in nltk_stop_words] 
    text_count = Counter(w for w in ngrams(text_token, n))
    return text_count.most_common(num)
    
  def word_preprocessing(self, x):
    sents = sent_tokenize(x)
    words = []
    mod_words = []
    synonyms = []

    for i in sents:
      doc = nlp(i)
      for token in doc:
        if token.text != "," and token.text != "." and token.text != '\"' and token.text != ";":
          words.append([token.text, "", ""])
        else:
          words[-1][2] = token.text


    for i in [i[0] for i in words]:
      if i != "," or i != "." or i != '\"':
        s = []
        r = []
        for syn in wordnet.synsets(i):
          for l in syn.lemmas():
            s.append(l.name())
        synonyms.append(list(set(s)))
        s = []


    for i in range(len(synonyms)):
      if synonyms[i] == []:
        try:
          mod_words[i -1] = str(mod_words[i -1]) + " " + str(words[i][0])
        except IndexError:
          pass
      else:
        mod_words.append(words[i][0])
    synonyms = list(filter(None, synonyms))

    for i in range(len(words)):
      try:
        words[i][0] = mod_words[i]
      except IndexError:
        pass
    return words, synonyms

  def get_noun(self, x):
    x = TextBlob(x)
    return x.noun_phrases

  def get_adverbs(self, x):
    x = TextBlob(x)
    obj = x.tags
    adverbs = ["RB", "RBR", "RBS", "WRB"]
    res = []
    for i in obj:
      if i[1] in adverbs:
        res.append(i[0])
    return res

  def get_verbs(self, x):
    x = TextBlob(x)
    obj = x.tags
    verbs = ['VB',"VBD" , "VBG" , "VBN" , "VBP" , "VBZ"]
    res = []
    for i in obj:
      if i[1] in verbs:
        res.append(i[0])
    return res

  def all_pos(self, x):
    x = TextBlob(x)
    return x.tags

  def get_mcw(self, x):
    mcw = self.get_most_common_ngram(x, 10)
    return mcw

  def get_summary(self, x):
    return build_summary(x)

  def build(self, text):
    words, syn = self.word_preprocessing(text)
    data = []

    for i,j,k,l in zip([i[0] for i in words] , syn, [i[1] for i in words], [i[2] for i in words]):
      data.append({
          "text": i,
          "syn": j,
          "pre": k,
          "post": l
        })
    res = json.dumps({"data": data})
    return res

  def process_props(self, text):
    context = {
      "mcw": self.get_mcw(text),
      "pos": {
        "noun": self.get_noun(text),
        "adverb": self.get_adverbs(text),
        "verb": self.get_verbs(text),
        "all_pos": self.all_pos(text)
      },
      "summary": self.get_summary(text)
    }
    res = json.dumps(context)
    return res

  def generate_summary(self, text):
    context = {
      "summary": self.get_summary(text)
    }
    res = json.dumps(context)
    return res

  def get_sentences(self, text):
    sents = sent_tokenize(text)
    context = {
      "sentences": sents,
      "sent_count": len(sents)
    }
    res = json.dumps(context)
    return res 

  def dependency_visualizer(self, text):
    doc = nlp(text)
    html = displacy.render(doc, style="dep")
    context = {
      "dependency": html
    }
    res = json.dumps(context)
    return res 

  def sentiment_analysis(self, text):
    context = {
      "sentiment": sentiment_analysis(text)
    }
    res = json.dumps(context)
    return res   

  def oppositeWord(self, text):
    antonyms = []

    for syn in wordnet.synsets(text):
      for l in syn.lemmas():
        if l.antonyms():
          antonyms.append(l.antonyms()[0].name())

    if antonyms == []:
      antonyms = ["Sorry , No results found ;("]

    context = {
      "antonyms": antonyms
    }
    res = json.dumps(context)
    return res 

  def usageOfWord(self, text):
    context = {
      "definitions": Word(text).definitions
    }
    res = json.dumps(context)
    return res 

  def phrase_matcher(self, text, patterns):
    matchez = []
    doc = nlp(text)
    matcher = Matcher(nlp.vocab)
    # my_pattern = [{"LEMMA": "visit"}, {"POS": "PROPN"}]

    pat = json.loads(patterns) 
    matcher.add("Visting_places", [json.loads(i["value"]) for i in pat])
    matches = matcher(doc)

    # Counting the no of matches
    # print(len(matches))

    for match_id, start, end in matches:
      matchez.append(doc[start:end].text)
      print("Match found:", doc[start:end].text)


    context = {
      "matched_phrases": matchez
    }
    res = json.dumps(context)
    return res   