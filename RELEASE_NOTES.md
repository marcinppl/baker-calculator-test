# Baker Calculator 0.2.0

Applied the September 5 review to the existing GitHub test app.

- Three main views: Convert, Tools, Recipes.
- Original logo restored; its light background blends into the ivory header with CSS. Instagram uses an accessible camera icon.
- Gram calculations only accept whole-gram input. Fractional gram entries show an error while being edited and drop the decimal part when leaving the field. Other units accept decimals. Gram output is rounded and labelled approximate; positive amounts below half a gram display <1 g instead of zero.
- Precise mass conversions and separate US/metric volume measures, including mL and L. Ingredient references and preparation methods are available in Our measures.
- Functional dough hydration (target and analysis, with starter flour/water), equal-depth pan scaling, recipe scaling, and oven conversion with labelled fan guidance.
- IndexedDB recipe notes and photos, reopening, editing, confirmed deletion, JSON backup and restore. User text is rendered literally.
- Migration from bcFreshRecipes and bcRecipeLibraryV1, including legacy IndexedDB photos. Original storage is preserved. Recovery is performed once per legacy format; deleting a recovered recipe does not resurrect it.
- Offline asset cache, home-screen manifest, readable navigation, associated field labels and native accessible dialogs.

Validation: `npm install && npm test`. The suite covers 20 groups, including 11,520 conversion round trips, independent known-result examples, whole-gram validation, starter accounting, pan and oven equations, legacy photo migration, backup validation, and recipe create/edit/delete rendering. Dev dependencies are only for tests; the app has no runtime CDN dependencies.

Ingredient sources: King Arthur Baking ingredient weight chart; FAO Small-Scale Dairy Farming Manual for milk/water approximations; FAGE Total 5% US nutrition label for that specific yogurt. US nutrition-label cup volume follows FDA guidance (240 mL); the converter separately labels US customary cups and metric cups.

Remaining device checks before a wider launch: actual iPhone Safari camera/photo selection, keyboard layout, Add to Home Screen, offline restart and backup download/restore. Browser and simulated storage testing do not certify physical device behaviour.
