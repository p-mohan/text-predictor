# text-predictor
In the Shiny app there will be a text box where users can input text. When at least two words are typed, the app will suggest a list of words from the language model. For example, if you type “Expecting a” the app will suggest “baby, package” as a drop down list. The goal of this app will be to make smart a autocomplete system to speed up typing by predicting words.

## Model
A trigram model is built using Kneser-Ney smoothing. Given a bigram “expecting a” the model would know the probability of a word already seen in the training set. For instance “expecting a baby” or “expecting a package”.The UI would then display a list of suggestions (of the third word in the trigram) sorted by the probability of that trigram and the user can choose one if that is what they are expecting.
For more details and frequency diagrams see https://rpubs.com/p-mohan/275564
