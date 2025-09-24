
import sys
import util

tokensetFilepath = sys.argv[1]
trainingFilepath = sys.argv[2]

conv = util.TokenNumConverter(tokensetFilepath)
trainingdata = map(conv.toNum, util.loadTokenStrings(trainingFilepath))
print(trainingdata)
