from typing import final


def loadTokenStrings(filepath: str):
    content = open(filepath).read()
    return content.split("\n")

@final
class TokenNumConverter:
    def __init__(self, tokensetFilepath: str):
        self.tokenset = loadTokenStrings(tokensetFilepath)

    def toToken(self, num: int):
        return self.tokenset[num]

    def toNum(self, token: str):
        # we only have 256 tokens, so this will be quite fast.
        return self.tokenset.index(token)
