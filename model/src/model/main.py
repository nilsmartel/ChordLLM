
import sys
from .util import *

tokensetFilepath = sys.argv[1]
trainingFilepath = sys.argv[2]

conv = TokenNumConverter(tokensetFilepath)
trainingdata = map(conv.toNum, loadTokenStrings(trainingFilepath))
print(trainingdata)
