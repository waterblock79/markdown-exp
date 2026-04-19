---
style: LaTeX
---

# My Document

## Author

## February 4, 2026

<double-column>

### What is this?

This is a $\LaTeX$-style appearance.

1. You can insert **tables**:

   | Month Number | Month Name |
   | ------------ | ---------- |
   | 1            | January    |
   | 2            | February   |
   | 3            | March      |
   | 4            | April      |
   | 5            | May        |

   Graph 1   Example{ align=center }

2. You can also insert **images**:

   ![Image 1   Example](./images/graph.svg){ width=128px }

3. **`Code block`** is also available:

   ```c
   #include <stdio.h>
   int main() {
      printf("Hello, world!");
   }
   ```

4. use **`double-column`** tag to create double column layout:

   ```html
   <double-column>

   Your Content

   </double-column>
   ```

5. We use **`CMU Typewriter Text`** font for **code block**, **`CMU Serif Roman`** for **normal text**, and **`Noto Serif SC`** for **中文字体**.