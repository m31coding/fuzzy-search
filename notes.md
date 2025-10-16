- Implement Suffix Array searcher.

https://en.wikipedia.org/wiki/Suffix_array

```python
n = len(S)

def search(P: str) -> tuple[int, int]:
    """
    Return indices (s, r) such that the interval A[s:r] (including the end
    index) represents all suffixes of S that start with the pattern P.
    """
    # Find starting position of interval
    l = 0  # in Python, arrays are indexed starting at 0
    r = n
    while l < r:
        mid = (l + r) // 2  # division rounding down to nearest integer
        # suffixAt(A[i]) is the ith smallest suffix
        if P > suffixAt(A[mid]):
            l = mid + 1
        else:
            r = mid
    s = l
    
    # Find ending position of interval
    r = n
    while l < r:
        mid = (l + r) // 2
        if suffixAt(A[mid]).startswith(P):
            l = mid + 1
        else:
            r = mid
    return (s, r)
```

Chat GPT (verify!)

```js
function compareSubstringsOrdinal(strA, indexA, strB, indexB, length) {
  const lenA = strA.length;
  const lenB = strB.length;
  const endA = Math.min(indexA + length, lenA);
  const endB = Math.min(indexB + length, lenB);

  let iA = indexA;
  let iB = indexB;

  while (iA < endA && iB < endB) {
    const codeA = strA.charCodeAt(iA);
    const codeB = strB.charCodeAt(iB);

    if (codeA < codeB) return -1;
    if (codeA > codeB) return 1;

    iA++;
    iB++;
  }

  // If both ran out at the same time, they're equal
  const lenComparedA = endA - indexA;
  const lenComparedB = endB - indexB;

  if (lenComparedA === lenComparedB) return 0;
  return lenComparedA < lenComparedB ? -1 : 1;
}
```

Attribution (Chat GPT)

```text
/*
  Original: https://github.com/eranmeir/Sufa-Suffix-Array-Csharp
  Copyright (c) 2012 Eran Meir
  SPDX-License-Identifier: MIT

  Translation to TypeScript, modifications and refactoring
  (c) 2025 Kevin Schaal
*/
```

Todo
====

Test empty term.