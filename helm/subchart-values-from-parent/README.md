# Subchart values and parent charts

I wanted to see how helm behaves when two keys exist in a parent and child chart's values.

It turns out that maps get merged, but lists are completely replaced.


```
% helm template .
---
# Source: parent/charts/child/templates/test.yaml
Map:
foo: bar
one: two


List:
- test
- foo
```
