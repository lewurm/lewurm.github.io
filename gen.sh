#!/bin/zsh


for i in geocaching rbr hl10 hl11 uni; do
    /Users/lewurm/.local/pipx/venvs/mako/bin/python3.12 indexer.py $i
done
