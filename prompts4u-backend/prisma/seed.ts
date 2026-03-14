import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const components = [
  // Hero Sections
  {
    name: 'Modern Hero with CTA',
    description: 'Clean hero section with headline, subheadline, and dual CTAs',
    category: 'hero',
    tier: 'free' as const,
    tags: ['hero', 'cta', 'modern'],
    promptContent: `Create a modern hero section with the following:
- Large bold headline (48-64px)
- Supporting subheadline (18-20px, muted color)
- Two CTAs: primary button (solid) and secondary button (outline)
- Subtle gradient background or clean solid color
- Optional: illustration or image on the right side
- Use Tailwind CSS with responsive design
- Include smooth fade-in animation on mount
- Max-width container with proper padding`,
  },
  {
    name: 'Hero with Stats',
    description: 'Hero section featuring key metrics and social proof',
    category: 'hero',
    tier: 'paid' as const,
    tags: ['hero', 'stats', 'social-proof'],
    promptContent: `Create a hero section with integrated statistics:
- Headline and subheadline on the left
- 3-4 stat cards showing key metrics (e.g., "10k+ Users", "99% Uptime")
- Each stat has a number (bold, large) and label (muted)
- Trust badges or customer logos below stats
- Clean grid layout with proper spacing
- Use Tailwind CSS, fully responsive
- Add subtle hover effects on stat cards`,
  },
  {
    name: 'Split Hero with Form',
    description: 'Two-column hero with lead capture form',
    category: 'hero',
    tier: 'paid' as const,
    tags: ['hero', 'form', 'lead-capture'],
    promptContent: `Create a split-layout hero section:
- Left column: Headline, subheadline, bullet points with checkmarks
- Right column: Lead capture form with email input and submit button
- Form has subtle shadow and rounded corners
- Bullet points highlight key benefits
- Mobile: stack columns vertically
- Use Tailwind CSS
- Include form validation states`,
  },

  // Headers / Navbars
  {
    name: 'Simple Navbar',
    description: 'Clean navigation bar with logo and links',
    category: 'header',
    tier: 'free' as const,
    tags: ['navbar', 'header', 'navigation'],
    promptContent: `Create a simple, clean navbar:
- Logo on the left (text or image)
- Navigation links in the center (Home, Features, Pricing, About)
- CTA button on the right ("Get Started")
- Sticky positioning on scroll
- Mobile: hamburger menu that opens a drawer
- Use Tailwind CSS
- Subtle border-bottom or shadow`,
  },
  {
    name: 'Mega Menu Navbar',
    description: 'Advanced navbar with dropdown mega menus',
    category: 'header',
    tier: 'paid' as const,
    tags: ['navbar', 'mega-menu', 'dropdown'],
    promptContent: `Create a navbar with mega menu dropdowns:
- Logo and navigation items
- On hover over "Products" or "Features", show a full-width mega menu
- Mega menu contains categorized links with icons
- Include featured item or promo section in mega menu
- Smooth transitions and animations
- Use Tailwind CSS with proper z-index
- Mobile: accordion-style expandable menu`,
  },

  // Pricing Sections
  {
    name: 'Three Tier Pricing',
    description: 'Classic three-column pricing table',
    category: 'pricing',
    tier: 'free' as const,
    tags: ['pricing', 'tiers', 'conversion'],
    promptContent: `Create a three-tier pricing section:
- Toggle for Monthly/Yearly billing (20% discount for yearly)
- Three cards: Starter (free), Pro ($20/mo), Enterprise (custom)
- Middle card (Pro) is highlighted/popular
- Each card has: plan name, price, description, feature list with checkmarks, CTA button
- Feature comparison across tiers
- Use Tailwind CSS, fully responsive
- Hover effects on cards`,
  },
  {
    name: 'Usage-Based Pricing',
    description: 'Modern pricing with usage sliders',
    category: 'pricing',
    tier: 'paid' as const,
    tags: ['pricing', 'usage-based', 'slider'],
    promptContent: `Create a usage-based pricing component:
- Interactive slider to select usage level (e.g., API calls, storage)
- Price updates dynamically based on slider position
- Show breakdown: base price + usage overage
- Include a comparison table below
- Clean, modern design with gradients
- Use Tailwind CSS
- Smooth animations on price changes`,
  },

  // Testimonials
  {
    name: 'Testimonial Grid',
    description: 'Grid of customer testimonials with avatars',
    category: 'testimonials',
    tier: 'free' as const,
    tags: ['testimonials', 'social-proof', 'grid'],
    promptContent: `Create a testimonial grid section:
- 3x2 grid of testimonial cards
- Each card: quote, customer name, role, company, avatar
- Subtle quote icon decoration
- Consistent card styling with shadow
- Use Tailwind CSS
- Responsive: 3 columns on desktop, 2 on tablet, 1 on mobile
- Optional: star ratings`,
  },
  {
    name: 'Featured Testimonial Carousel',
    description: 'Sliding carousel of detailed testimonials',
    category: 'testimonials',
    tier: 'paid' as const,
    tags: ['testimonials', 'carousel', 'featured'],
    promptContent: `Create a testimonial carousel:
- Large featured testimonial with customer photo
- Navigation dots and arrows
- Auto-play option
- Customer details: name, role, company logo
- Background gradient or subtle pattern
- Use Tailwind CSS
- Smooth slide transitions with framer-motion`,
  },

  // Features Sections
  {
    name: 'Features Grid with Icons',
    description: 'Bento-box style features showcase',
    category: 'features',
    tier: 'free' as const,
    tags: ['features', 'grid', 'icons'],
    promptContent: `Create a features showcase grid:
- Section headline and subheadline
- 3x3 grid of feature cards
- Each card: icon, feature name, short description
- Alternating background colors for visual interest
- Hover effects on cards
- Use Tailwind CSS
- Lucide icons for visual consistency`,
  },
  {
    name: 'Zigzag Feature List',
    description: 'Alternating left-right feature highlights',
    category: 'features',
    tier: 'free' as const,
    tags: ['features', 'alternating', 'detailed'],
    promptContent: `Create an alternating feature list:
- 4-6 feature sections stacked vertically
- Each section: image/illustration on one side, text on the other
- Alternate: image left/text right, then image right/text left
- Feature name, description, bullet points
- Use Tailwind CSS
- Responsive: stack on mobile
- Subtle scroll animations`,
  },

  // About/Team Sections
  {
    name: 'About Section with Mission',
    description: 'Company about section with mission statement',
    category: 'about',
    tier: 'free' as const,
    tags: ['about', 'mission', 'story'],
    promptContent: `Create an about section:
- Section headline ("About Us" or similar)
- Mission statement paragraph
- 3-4 core values with icons
- Brief company story
- Optional: team photo or office image
- Use Tailwind CSS
- Clean, professional typography`,
  },
  {
    name: 'Team Grid',
    description: 'Team member cards with social links',
    category: 'about',
    tier: 'paid' as const,
    tags: ['team', 'members', 'social'],
    promptContent: `Create a team member grid:
- Section headline ("Meet the Team")
- Grid of team cards (3-4 per row)
- Each card: photo, name, role, bio (2 lines), social links (LinkedIn, Twitter)
- Hover effect: show social links
- Consistent card styling
- Use Tailwind CSS
- Responsive grid layout`,
  },

  // CTAs
  {
    name: 'Simple CTA Banner',
    description: 'Full-width call-to-action banner',
    category: 'cta',
    tier: 'free' as const,
    tags: ['cta', 'banner', 'conversion'],
    promptContent: `Create a CTA banner section:
- Full-width container with gradient background
- Centered headline and subheadline
- Single prominent CTA button
- Optional: small trust indicator below button
- High contrast for visibility
- Use Tailwind CSS
- Works as page divider or bottom CTA`,
  },
  {
    name: 'CTA with Email Capture',
    description: 'CTA section with integrated email form',
    category: 'cta',
    tier: 'free' as const,
    tags: ['cta', 'email', 'lead-capture'],
    promptContent: `Create a CTA with email capture:
- Headline encouraging signup
- Email input field with inline submit button
- "No spam, unsubscribe anytime" microcopy
- Background pattern or gradient
- Validation states for email input
- Use Tailwind CSS
- Mobile: stack input and button`,
  },

  // FAQs
  {
    name: 'Accordion FAQ',
    description: 'Expandable FAQ accordion',
    category: 'faq',
    tier: 'free' as const,
    tags: ['faq', 'accordion', 'help'],
    promptContent: `Create an FAQ accordion:
- Section headline ("Frequently Asked Questions")
- 6-8 FAQ items in accordion format
- Click to expand/collapse answer
- Smooth animation on expand
- Plus/minus or chevron icon indicator
- Use Tailwind CSS
- Clean typography and spacing`,
  },
  {
    name: 'FAQ with Search',
    description: 'Searchable FAQ with categorized questions',
    category: 'faq',
    tier: 'paid' as const,
    tags: ['faq', 'search', 'categories'],
    promptContent: `Create a searchable FAQ:
- Search bar at top (filters questions in real-time)
- Category tabs (General, Billing, Technical, etc.)
- Accordion FAQ items within each category
- Highlight search matches
- "Still need help?" CTA at bottom
- Use Tailwind CSS
- Client-side search implementation`,
  },

  // Footers
  {
    name: 'Simple Footer',
    description: 'Clean footer with links and copyright',
    category: 'footer',
    tier: 'free' as const,
    tags: ['footer', 'links', 'copyright'],
    promptContent: `Create a simple footer:
- 3-4 columns of links (Product, Company, Resources, Legal)
- Logo and tagline at top
- Social media icons
- Copyright notice at bottom
- Separator line between sections
- Use Tailwind CSS
- Consistent link styling with hover states`,
  },
  {
    name: 'Mega Footer',
    description: 'Comprehensive footer with newsletter signup',
    category: 'footer',
    tier: 'paid' as const,
    tags: ['footer', 'newsletter', 'comprehensive'],
    promptContent: `Create a comprehensive mega footer:
- Top section: newsletter signup with email input
- Main section: 5-6 columns of organized links
- Bottom section: logo, social icons, copyright, language/country selector
- Background color distinct from page
- Use Tailwind CSS
- Responsive: stack columns on mobile`,
  },

  // Additional Premium Components
  {
    name: 'Dashboard Sidebar',
    description: 'Collapsible navigation sidebar for dashboards',
    category: 'header',
    tier: 'paid' as const,
    tags: ['sidebar', 'dashboard', 'navigation'],
    promptContent: `Create a dashboard sidebar:
- Logo at top
- Navigation items with icons (Lucide)
- Collapsible/expandable on mobile
- Active state highlighting
- User profile section at bottom with dropdown
- Smooth transitions
- Use Tailwind CSS
- Fixed positioning, full height`,
  },
  {
    name: 'Comparison Table',
    description: 'Feature comparison table for pricing',
    category: 'pricing',
    tier: 'paid' as const,
    tags: ['comparison', 'table', 'features'],
    promptContent: `Create a feature comparison table:
- Rows: individual features
- Columns: different plans (Free, Pro, Enterprise)
- Checkmarks or X for feature availability
- Sticky first column for feature names
- Hover effects on rows
- Use Tailwind CSS
- Responsive: horizontal scroll on mobile`,
  },
  {
    name: 'Cookie Consent Banner',
    description: 'GDPR-compliant cookie consent banner',
    category: 'cta',
    tier: 'free' as const,
    tags: ['cookie', 'gdpr', 'consent'],
    promptContent: `Create a cookie consent banner:
- Fixed position at bottom of page
- Headline about cookie usage
- Brief description
- Two buttons: "Accept All" and "Manage Preferences"
- Clean, non-intrusive design
- Use Tailwind CSS
- Dismiss on accept, persists in localStorage`,
  },
  {
    name: '404 Error Page',
    description: 'Creative 404 not found page',
    category: 'features',
    tier: 'free' as const,
    tags: ['404', 'error', 'page'],
    promptContent: `Create a 404 error page:
- Large "404" text (stylized)
- "Page not found" headline
- Helpful subheadline
- "Go back home" button
- Optional: illustration or fun animation
- Centered layout
- Use Tailwind CSS
- Full viewport height`,
  },
  {
    name: 'Search Results Page',
    description: 'Search results with filters and pagination',
    category: 'features',
    tier: 'paid' as const,
    tags: ['search', 'results', 'filters'],
    promptContent: `Create a search results page:
- Search bar at top with current query
- Results count ("Found 23 results")
- Sidebar with filter options (category, date, type)
- Results list with title, description, metadata
- Pagination at bottom
- Empty state for no results
- Use Tailwind CSS
- Responsive: filters become drawer on mobile`,
  },
  {
    name: 'Contact Form Section',
    description: 'Professional contact form with validation',
    category: 'features',
    tier: 'free' as const,
    tags: ['contact', 'form', 'validation'],
    promptContent: `Create a contact form section:
- Headline ("Get in Touch")
- Form fields: Name, Email, Subject, Message
- Real-time validation with error messages
- Submit button with loading state
- Success message on submission
- Contact info sidebar (email, phone, address)
- Use Tailwind CSS + React Hook Form
- Accessible form labels`,
  },
  {
    name: 'Video Hero Section',
    description: 'Hero with background video',
    category: 'hero',
    tier: 'paid' as const,
    tags: ['hero', 'video', 'background'],
    promptContent: `Create a video hero section:
- Full-width background video (muted, looping)
- Overlay for text readability
- Centered headline and CTA
- Play/pause control (optional)
- Fallback image for mobile
- Use Tailwind CSS
- Optimized video loading`,
  },
  {
    name: 'App Download Section',
    description: 'Mobile app download CTAs',
    category: 'cta',
    tier: 'free' as const,
    tags: ['app', 'download', 'mobile'],
    promptContent: `Create an app download section:
- Headline encouraging app download
- App Store and Google Play badges
- Feature highlights or QR code
- Phone mockup showing app
- Clean, modern design
- Use Tailwind CSS
- Responsive layout`,
  },
  {
    name: 'Integration Logos Grid',
    description: 'Grid of integration/company logos',
    category: 'features',
    tier: 'free' as const,
    tags: ['integrations', 'logos', 'partners'],
    promptContent: `Create an integrations logo grid:
- Section headline ("Integrates with...")
- Grid of company logos (6-12)
- Grayscale logos with color on hover
- Consistent sizing and spacing
- Optional: "View all integrations" link
- Use Tailwind CSS
- Responsive grid`,
  },
  {
    name: 'Before/After Comparison',
    description: 'Side-by-side before/after showcase',
    category: 'features',
    tier: 'paid' as const,
    tags: ['comparison', 'before-after', 'showcase'],
    promptContent: `Create a before/after comparison:
- Two cards side by side
- "Before" card: shows old/problem state (red/warning styling)
- "After" card: shows new/solution state (green/success styling)
- Each has bullet points or feature list
- Visual indicator (arrow) between them
- Use Tailwind CSS
- Responsive: stack on mobile`,
  },
  {
    name: 'Milestone Timeline',
    description: 'Company milestones or product roadmap',
    category: 'about',
    tier: 'paid' as const,
    tags: ['timeline', 'milestones', 'roadmap'],
    promptContent: `Create a milestone timeline:
- Vertical or horizontal timeline
- 5-7 milestone cards with dates
- Each milestone: title, description, optional icon
- Connected by a line
- Alternating sides (for vertical)
- Use Tailwind CSS
- Responsive: simplify on mobile`,
  },
  {
    name: 'Live Counter Section',
    description: 'Animated counters showing live stats',
    category: 'features',
    tier: 'paid' as const,
    tags: ['counters', 'stats', 'animated'],
    promptContent: `Create an animated counter section:
- 4 stat counters in a row
- Each: number that counts up on scroll, label
- Optional: icon above each counter
- Use intersection observer for scroll trigger
- Smooth counting animation
- Use Tailwind CSS
- Responsive: 2x2 or stacked on mobile`,
  },
];

async function main() {
  console.log('Start seeding...');

  for (const component of components) {
    const slug = component.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const created = await prisma.component.create({
      data: {
        ...component,
        slug,
        previewCode: null,
        previewImageUrl: null,
        copyCount: 0,
      },
    });
    console.log(`Created component: ${created.name}`);
  }

  console.log('Seeding finished!');
  console.log(`Created ${components.length} components.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
