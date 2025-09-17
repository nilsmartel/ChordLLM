# Expects first argument to be a valid filename
#
# This command rewrites all non-ascii whitespace into plain ascii whitespace " "
perl -CSD -i -ple 's/\s+[^\S\n]/ /g' $1
