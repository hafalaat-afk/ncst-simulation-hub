# NCST Simulation Hub

A fully static, GitHub Pages-ready website for APS201 and APS301 science lessons.

## Included simulations

1. SI Units & Scientific Notation
2. Static Electricity
3. Electric Field
4. Current, Charge Flow & Potential Difference
5. Hooke's Law, Extension & Elastic Limit
6. Acids, Bases, pH & Neutralization
7. Periodic Trends & Chemical Behaviour

No framework, server, login, database, or paid service is required.

## Files

- `index.html` — website structure and simulation panels
- `styles.css` — responsive design and dark mode
- `app.js` — all simulation logic

## Publish on GitHub Pages

1. Sign in to GitHub.
2. Create a new public repository, for example `science-simulations`.
3. Upload `index.html`, `styles.css`, and `app.js` to the root of the repository.
4. Open the repository **Settings**.
5. Select **Pages** in the left menu.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select branch **main** and folder **/(root)**, then save.
8. After GitHub publishes it, the website address will normally be:
   `https://YOUR-USERNAME.github.io/science-simulations/`

## Editing lesson text

You can edit headings, instructions, challenge questions, and course labels directly inside `index.html`.

## Adding a school logo

Create an `assets` folder, add your logo as `logo.png`, then replace the atom icon in the header with an image tag such as:

```html
<img src="assets/logo.png" alt="School logo" class="school-logo">
```

## Student privacy

The site runs entirely in the student's browser. This version does not collect, store, or transmit student names, answers, or analytics.
