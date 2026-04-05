# Weather Art Generation Skill

## Overview
This skill provides a toolkit for generating, sourcing, and applying stylized background imagery to UI elements, specifically for weather dashboard conditions cards.

## Workflow

1. **Categorize weather**: Identify the condition (e.g., 'rainy', 'sunny', 'cloudy').
2. **Select aesthetic**: Choose a style (e.g., 'minimalist', 'gradient-noise', 'procedural-shapes').
3. **Generate/Fetch**: Use integrated CSS/SVG techniques to create the background without external heavy dependencies.

## Key Techniques

- **CSS Shapes**: Use radial/linear gradients combined with `background-blend-mode`.
- **CSS Noise/Grain**: Use repeating svg patterns or small data-uri encoded noise textures to give a "procedural" feel.
- **Dynamic CSS Classes**: Define utility classes in `globals.css` that map weather conditions to specific background visual styles.
