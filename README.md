# Lis Styling Studio

From a lookbook to a working product: shop, custom design studio, account, timeline, and interactive styling games.  
**Course:** Web Technologies 1 (Front End)  
**Author:** Amina Kanybek (Group IT-2506)  

## Live Links
- **GitHub Repository:** https://github.com/aeminaqw28/midterm.git
- **Live Website (GitHub Pages):** https://aeminaqw28.github.io/midterm/

## Project Overview
**Lis Styling Studio** is an eight-page responsive front-end fashion and styling website built with HTML5, CSS3, JavaScript, jQuery, and Bootstrap 5. The project brings together historical fashion lookbooks, an e-commerce studio and custom design commission system, interactive styling activities, and a client-side member account area.

## Pages & Features
1. **Home (`index.html`):** Visual introduction to the studio's four wardrobes (Paris, Europe, America, Qazaqstan) and historical fashion eras.
2. **Studio & Shop (`studio.html`):**
   - Filterable and searchable catalog of 12 ready-to-cut pieces across four wardrobes.
   - Interactive story lightbox modal (*"Read the story"*) with historical background for each piece.
   - Dynamic shopping bag with item quantity controls, automatic 10% bundle discount calculation (3+ pieces), delivery city selection, and checkout validation.
   - Custom design commission form with designer selection, rush-order fee calculation (+25%), and reference image upload preview.
3. **Lookbook (`lookbook.html`):** Curated fashion timeline featuring eight complete outfits, styling details, historical notes, and one-tap saving to the member account.
4. **Style Quiz (`quiz.html`):** Interactive multi-question quiz that calculates and matches the visitor with their signature fashion era.
5. **Look Game (`game.html`):** Interactive era-guessing styling game with live score tracking and best-score persistence.
6. **Wardrobe Planner (`planner.html`):** Interactive Kanban board (*Want to try*, *Styling now*, *Worn*) with search, wardrobe filtering, priority sorting, and progress tracking.
7. **Booking (`booking.html`):** Consultation and fitting session booking form with field validation and confirmation tickets.
8. **Account (`account.html`):** Client-side Sign Up, Log In, and Member Profile dashboard powered by `localStorage` (stores saved looks, order history, quiz match, and game high scores; clearly labeled as a browser-only demo).

## Final Release Improvements
- **Light & Dark Theme Support:** Persistent theme toggle across all pages using CSS custom properties and `localStorage`.
- **Contrast & Accessibility Fixes (`css/contrast-fixes.css`):** Resolved contrast issues in dark mode across light-background cards, modals (including the *"Read the story"* lightbox), shop filter toolbars, validation error inputs, planner columns, and account tabs.
- **Responsive Design:** Tested and adapted across mobile (`375px`), tablet (`768px`), and desktop (`1280px+`) viewports.

## Project File Structure
```text
lis-styling-studio/
├── index.html
├── studio.html
├── lookbook.html
├── booking.html
├── game.html
├── quiz.html
├── planner.html
├── account.html
├── README.md
├── css/
│   ├── style.css
│   ├── studio.css
│   ├── lookbook.css
│   ├── lab.css
│   ├── account.css
│   └── contrast-fixes.css
├── js/
│   ├── site.js
│   ├── studio.js
│   ├── studio-data.js
│   ├── lookbook.js
│   ├── looks-data.js
│   ├── booking.js
│   ├── game.js
│   ├── quiz.js
│   ├── planner.js
│   ├── account.js
│   └── validate.js
└── img/
    └── [Custom SVG illustrations and brand ornaments]
```

## Credits & Technologies Used
- **Bootstrap 5.3.3 (jsDelivr CDN):** Responsive grid system, navigation bar, form controls, and accordion components.
- **jQuery 3.7.1 (code.jquery.com):** Smooth animations, `slideToggle`, fade transitions, and DOM interactions.
- **Google Fonts:** *Bodoni Moda* (display headings) and *Jost* (body typography).
- **Claude (Anthropic):** AI assistance for code structuring, CSS contrast debugging, and custom SVG fashion illustrations (credited in the footer of every page).
- **Historical Fashion References:** Victoria and Albert Museum (V&A) Collections & The Met Costume Institute.
