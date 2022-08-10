# OpenAPI Spectral Rulesets, Rules and Functions #

**Warning: Work in progess**

# What's in this folder

- `rules` contains individual rules (coming as a usable Spectral Ruleset) with their tests, samples, metadata and documentation
- `rulesets` contains rulesets that are composed of selected `rules`
- `functions` contains custom functions with their tests, samples, metadata and documentation
- `sources` contains the raw collected material and the refinements in progress
# From sources to rules/rulesets/functions

In `sources` elements go from one status/folder:

1. `raw` contains raw collected raw material (rulesets, rules, functions, ...)
2. `selected` contains material selected for refining.
3. `refining-rules` contains rules that are working on (re-design, test, documentation) along with link to their source raw material.
4.  Once 3 is done, elements go to `../rules`