# Golpo AI Website Clone

A complete clone of the Golpo AI websites (golpoai.com and video.golpoai.com) built with HTML, CSS, and JavaScript.

## Project Structure

```
golpoai-clone/
├── main-site/              # Clone of golpoai.com
│   ├── index.html          # Main landing page
│   ├── css/
│   │   └── style.css       # Styling for main site
│   ├── js/
│   │   └── main.js         # JavaScript functionality
│   └── images/             # Image assets
│
├── video-site/             # Clone of video.golpoai.com
│   ├── index.html          # Video platform page
│   ├── css/
│   │   └── style.css       # Styling for video site
│   ├── js/
│   │   └── app.js          # JavaScript functionality
│   └── images/             # Image assets
│
└── README.md               # This file
```

## Features

### Main Site (golpoai.com)
- Modern landing page design
- Hero section with call-to-action buttons
- Features grid showcasing key capabilities
- Responsive navigation
- Footer with company information
- Y Combinator badge
- Smooth scroll animations

### Video Site (video.golpoai.com)
- Comprehensive video platform interface
- 6-tier pricing system (Free, Starter, Professional, Business, Agency, Enterprise)
- Monthly/Annual billing toggle
- Example video showcases
- Interactive FAQ section with 4 categories:
  - General
  - Pricing
  - Features
  - Technical
- Social media integration
- Responsive design for all devices

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript**: Interactive features and animations
- **SVG**: Vector graphics for logos and icons

## Key Features Implemented

### 1. Responsive Design
- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly interface

### 2. Interactive Elements
- Pricing toggle (Monthly/Annual)
- Collapsible FAQ sections
- Category-based FAQ filtering
- Smooth scroll navigation
- Hover effects and transitions

### 3. Animations
- Scroll-triggered animations
- Header hide/show on scroll
- Card hover effects
- FAQ accordion animations

### 4. Dark Mode Support
- Prefers-color-scheme media query
- Automatic dark mode detection
- Optimized colors for both themes

## How to Use

### Local Development

1. **Navigate to the project directory:**
   ```bash
   cd golpoai-clone
   ```

2. **Open the websites:**
   - Main site: Open `main-site/index.html` in your browser
   - Video site: Open `video-site/index.html` in your browser

3. **Using a local server (recommended):**
   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Then visit:
   # Main site: http://localhost:8000/main-site/
   # Video site: http://localhost:8000/video-site/
   ```

### Navigation Between Sites

- From the main site, click "Golpo Video" button to navigate to the video site
- From the video site, click "Home" in the navigation to return to the main site

## Customization

### Changing Colors

Edit the CSS variables in the respective `style.css` files:

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #1e40af;
    --text-color: #333;
    /* ... more variables */
}
```

### Adding Images

Place your images in the `images/` folder within each site directory and update the `src` attributes in the HTML files.

### Modifying Pricing Plans

Edit the pricing section in `/video-site/index.html` to update plan details, features, and prices.

### Updating FAQ Content

Modify the FAQ sections in `/video-site/index.html` to add, remove, or edit questions and answers.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- Minimal external dependencies
- Optimized CSS with efficient selectors
- Lazy loading for animations
- Compressed SVG graphics
- Efficient JavaScript event handling

## Accessibility Features

- Semantic HTML5 elements
- ARIA labels for icons
- Keyboard navigation support
- High contrast colors
- Readable font sizes

## Future Enhancements

Potential additions for production use:

1. **Backend Integration**
   - User authentication
   - Payment processing
   - Video generation API

2. **Additional Features**
   - Video upload functionality
   - User dashboard
   - Analytics tracking
   - Blog section
   - Search functionality

3. **Optimization**
   - Image optimization
   - Code minification
   - CDN integration
   - Service worker for offline support

## Credits

This is a clone project created for educational/demonstration purposes, inspired by:
- https://golpoai.com/
- https://video.golpoai.com/

Original design and concept by Red Tree Inc. / Golpo AI.

## License

This is a demonstration project. For production use, ensure you have appropriate permissions and licenses.

---

**Built with ❤️ using vanilla HTML, CSS, and JavaScript**
