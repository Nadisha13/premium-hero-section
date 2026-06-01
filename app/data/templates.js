export const TEMPLATES = [
  // FREE
  {
    id: "basic-free",
    name: "Minimal Static",
    brand: "generic",
    tier: "free",
    tagline: "Simple & Effective Collection",
    description: "A clean, static form layout perfect for standard data collection without the bells and whistles.",
    accentColor: "#64748b",
    bgColor: "#ffffff",
    bgGradient: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    buttonText: "Use Free Template",
    fields: [
      { name: "name", label: "Full Name", type: "text", placeholder: "John Doe", required: true },
      { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com", required: true }
    ],
    features: ["Standard inputs", "Responsive layout", "Clean typography"]
  },

  // FASHION
  {
    id: "fashion-pro",
    name: "Editorial Couture",
    brand: "fashion",
    tier: "pro",
    tagline: "Vogue Editorial Styling",
    description: "High-end static editorial layout with premium typography and sophisticated spacing.",
    accentColor: "#d97706",
    bgColor: "#FAF6F0",
    bgGradient: "linear-gradient(135deg, #FAF6F0 0%, #EFE9DB 100%)",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    buttonText: "Select Pro Design",
    fields: [
      { name: "name", label: "Full Name", type: "text", placeholder: "e.g. Sarah Jenkins", required: true },
      { name: "email", label: "Email Address", type: "email", placeholder: "sarah@example.com", required: true },
      { name: "preference", label: "Primary Style Preference", type: "select", options: ["Womenswear", "Menswear", "Gender-Neutral"], required: true }
    ],
    features: ["High-end editorial images", "Warm editorial typography", "Serif headers"]
  },
  {
    id: "fashion-premium",
    name: "Runway Cinematic",
    brand: "fashion",
    tier: "premium",
    tagline: "Haute Couture Motion",
    description: "Cinematic dark theme with slow-motion fabric movement and luxury model showcase.",
    accentColor: "#c5a880",
    bgColor: "#121212",
    bgGradient: "linear-gradient(180deg, #1c1c1c 0%, #0d0d0d 100%)",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    video: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-on-a-runway-41804-large.mp4",
    buttonText: "Apply For Membership",
    fields: [
      { name: "name", label: "Full Name", type: "text", placeholder: "e.g. Julian Vance", required: true },
      { name: "email", label: "Email Address", type: "email", placeholder: "julian@luxury.com", required: true },
      { name: "interest", label: "Interested in", type: "select", options: ["Bespoke Tailoring", "Limited Run Collections"], required: true }
    ],
    features: ["Cinematic dark theme", "Autoplay video background", "Glittering gold borders", "Micro-interactivity"]
  },

  // JEWELRY
  {
    id: "jewelry-pro",
    name: "Minimalist Lustre",
    brand: "jewelry",
    tier: "pro",
    tagline: "Fine Jewelry, Crafted For Eternity",
    description: "High-detail jewelry photography with gold reflections and a minimal luxury aesthetic.",
    accentColor: "#7c2d12",
    bgColor: "#FCFBF7",
    bgGradient: "linear-gradient(135deg, #FCFBF7 0%, #F5F1E6 100%)",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
    buttonText: "Subscribe to Gallery",
    fields: [
      { name: "name", label: "First Name", type: "text", placeholder: "Elena", required: true },
      { name: "email", label: "Email Address", type: "email", placeholder: "elena@example.com", required: true }
    ],
    features: ["Clean high-key contrast", "Dainty inputs", "Classic luxury spacing"]
  },
  {
    id: "jewelry-premium",
    name: "Bespoke Royal Carat",
    brand: "jewelry",
    tier: "premium",
    tagline: "Bespoke Jewelry Consultations",
    description: "Sparkling diamond cinematic video with flashy luxury motion and animated glow.",
    accentColor: "#d4af37",
    bgColor: "#0f172a",
    bgGradient: "linear-gradient(135deg, #090d16 0%, #172554 100%)",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    video: "https://assets.mixkit.co/videos/preview/mixkit-diamond-ring-on-a-mirror-with-water-droplets-40539-large.mp4",
    buttonText: "Book Artisan Consult",
    fields: [
      { name: "name", label: "Full Name", type: "text", placeholder: "Victoria Sterling", required: true },
      { name: "budget", label: "Budget Range", type: "select", options: ["$5,000+", "$15,000+", "$50,000+"], required: true }
    ],
    features: ["Midnight Navy elegance", "Autoplay video", "Gold foil shadow glows"]
  },

  // TECH
  {
    id: "tech-pro",
    name: "Cyber Grid Console",
    brand: "tech",
    tier: "pro",
    tagline: "The Future of Computing is Here",
    description: "Futuristic UI static artwork with cyber dashboard previews and monospace typography.",
    accentColor: "#06b6d4",
    bgColor: "#0f172a",
    bgGradient: "linear-gradient(180deg, #0b0f19 0%, #020617 100%)",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    buttonText: "Request SDK Access",
    fields: [
      { name: "name", label: "Developer Name", type: "text", placeholder: "Aiden Mercer", required: true },
      { name: "role", label: "Environment", type: "select", options: ["Node.js / React", "Rust / WASM"], required: true }
    ],
    features: ["Tech grid blueprint backdrops", "Monospace headings", "Cyberpunk neon accents"]
  },
  {
    id: "tech-premium",
    name: "Vibrant Glassmorphic HUD",
    brand: "tech",
    tier: "premium",
    tagline: "Architecting the Next Digital Realm",
    description: "Animated holographic videos with moving neon grids and HUD-style motion graphics.",
    accentColor: "#a855f7",
    bgColor: "#05020c",
    bgGradient: "radial-gradient(circle at top left, #2b1154 0%, #05020b 60%)",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    video: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-cyber-city-4098-large.mp4",
    buttonText: "Reserve Kit & Enter Portal",
    fields: [
      { name: "name", label: "Developer Name", type: "text", placeholder: "Elena Rostova", required: true },
      { name: "github", label: "GitHub Profile", type: "text", placeholder: "https://github.com/elena", required: true }
    ],
    features: ["Frosted glass card filters", "Dynamic purple/orange neon gradients", "Holographic video background"]
  },

  // SKINCARE
  {
    id: "skincare-pro",
    name: "Organic Botanical Dew",
    brand: "skincare",
    tier: "pro",
    tagline: "Radiant Skin, Sourced by Nature",
    description: "Clean organic product photography with soft pastel gradients and minimal layout.",
    accentColor: "#15803d",
    bgColor: "#f7f8f6",
    bgGradient: "linear-gradient(135deg, #f7f8f6 0%, #e2e8df 100%)",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80",
    buttonText: "Claim Free Sample",
    fields: [
      { name: "name", label: "Full Name", type: "text", placeholder: "Sophia Thorne", required: true },
      { name: "skinType", label: "Skin Condition", type: "select", options: ["Dry & Sensitive", "Oily & Acne-Prone"], required: true }
    ],
    features: ["Minimal organic layout", "Warm sage green accents", "Clean soft inputs"]
  },
  {
    id: "skincare-premium",
    name: "Lavender Glow Concierge",
    brand: "skincare",
    tier: "premium",
    tagline: "Bespoke Dermatological Formulas",
    description: "Slow-motion serum videos featuring airy luxury commercial style and premium aesthetics.",
    accentColor: "#7e22ce",
    bgColor: "#FAF8FC",
    bgGradient: "linear-gradient(135deg, #FAF8FC 0%, #E9E1F0 100%)",
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80",
    video: "https://assets.mixkit.co/videos/preview/mixkit-macro-shot-of-a-liquid-bubble-moving-over-water-28688-large.mp4",
    buttonText: "Request Prescription",
    fields: [
      { name: "name", label: "Full Name", type: "text", placeholder: "Isabella Martinez", required: true },
      { name: "primaryConcern", label: "Primary Goal", type: "select", options: ["Anti-Aging & Firming", "Hydration Boost"], required: true }
    ],
    features: ["Soft lavender/pink gradients", "Cinematic liquid motion", "Premium consultation fields"]
  },

  // GYM
  {
    id: "gym-pro",
    name: "High-Octane Iron",
    brand: "gym",
    tier: "pro",
    tagline: "No Excuses. Only Progress.",
    description: "Powerful athlete photography paired with bold, aggressive layouts for maximum impact.",
    accentColor: "#dc2626",
    bgColor: "#0a0a0a",
    bgGradient: "linear-gradient(135deg, #111111 0%, #000000 100%)",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    buttonText: "Claim 3-Day Pass",
    fields: [
      { name: "name", label: "Full Name", type: "text", placeholder: "Marcus Steele", required: true },
      { name: "phone", label: "Mobile Number", type: "tel", placeholder: "555-019-2834", required: true }
    ],
    features: ["High contrast red/black theme", "Slanted geometric badges", "Urgent CTA styling"]
  },
  {
    id: "gym-premium",
    name: "Championship Alpha Core",
    brand: "gym",
    tier: "premium",
    tagline: "Elite Performance, Curated Coaching",
    description: "Intense workout cinematic clips with dynamic motion and high-energy transitions.",
    accentColor: "#ea580c",
    bgColor: "#080705",
    bgGradient: "linear-gradient(135deg, #140d07 0%, #050302 100%)",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80",
    video: "https://assets.mixkit.co/videos/preview/mixkit-man-training-with-a-kettlebell-in-the-gym-23112-large.mp4",
    buttonText: "Schedule Bio-Assessment",
    fields: [
      { name: "name", label: "Full Name", type: "text", placeholder: "Drake Vance", required: true },
      { name: "goal", label: "Fitness Objectives", type: "select", options: ["Competitive Bodybuilding", "Speed & Agility"], required: true }
    ],
    features: ["Intense dynamic motion", "Vibrant glowing orange styling", "Interactive biometric goals"]
  },

  // COFFEE
  {
    id: "coffee-pro",
    name: "Cozy Brew Artisan",
    brand: "coffee",
    tier: "pro",
    tagline: "Sourcing Beans, Spreading Warmth",
    description: "Warm artisan café imagery featuring cozy earthy tones and rustic aesthetics.",
    accentColor: "#854d0e",
    bgColor: "#FAF6F0",
    bgGradient: "linear-gradient(135deg, #FAF6F0 0%, #EFE5D3 100%)",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80",
    buttonText: "Join The Brew Club",
    fields: [
      { name: "name", label: "First Name", type: "text", placeholder: "Clara", required: true },
      { name: "brewMethod", label: "Favorite Brew Method", type: "select", options: ["Pour Over (V60)", "Espresso Machine"], required: true }
    ],
    features: ["Rustic typography", "Creamy organic colors", "Warm focus states"]
  },
  {
    id: "coffee-premium",
    name: "Reserve Roast Subscription",
    brand: "coffee",
    tier: "premium",
    tagline: "Rare Micro-Lot Coffee Subscriptions",
    description: "Cinematic coffee pour videos with steam motion visuals and moody shop atmosphere.",
    accentColor: "#b45309",
    bgColor: "#1e1b18",
    bgGradient: "linear-gradient(135deg, #1e1b18 0%, #12100e 100%)",
    image: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=800&q=80",
    video: "https://assets.mixkit.co/videos/preview/mixkit-coffee-maker-making-coffee-2879-large.mp4",
    buttonText: "Configure Coffee Box",
    fields: [
      { name: "name", label: "Full Name", type: "text", placeholder: "Gavin Croft", required: true },
      { name: "roastPreference", label: "Roast Profile", type: "select", options: ["Light (Floral)", "Medium (Nutty)", "Dark (Smoky)"], required: true }
    ],
    features: ["Cinematic pouring video", "Dark Espresso backdrop", "Copper accents"]
  },

  // FURNITURE
  {
    id: "furniture-pro",
    name: "Mid-Century Modernist",
    brand: "furniture",
    tier: "pro",
    tagline: "Functional Art for Living Spaces",
    description: "Architectural interior photography showcasing minimal luxury homes.",
    accentColor: "#1e3a8a",
    bgColor: "#FAF9F5",
    bgGradient: "linear-gradient(135deg, #FAF9F5 0%, #EAE7DC 100%)",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    buttonText: "Request Printed Catalog",
    fields: [
      { name: "name", label: "Full Name", type: "text", placeholder: "Oliver Finch", required: true },
      { name: "address", label: "Shipping Address", type: "text", placeholder: "123 Interior Way", required: true }
    ],
    features: ["Clean mid-century lines", "Teak and forest accents", "Descriptive fields"]
  },
  {
    id: "furniture-premium",
    name: "Architectural Bespoke Atelier",
    brand: "furniture",
    tier: "premium",
    tagline: "Architectural Interior Consultations",
    description: "Cinematic luxury interior walkthrough videos with slow camera pans and designer atmosphere.",
    accentColor: "#022c22",
    bgColor: "#141716",
    bgGradient: "linear-gradient(135deg, #171c1b 0%, #0d0f0f 100%)",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
    video: "https://assets.mixkit.co/videos/preview/mixkit-modern-living-room-with-a-large-sofa-51084-large.mp4",
    buttonText: "Schedule Planning Session",
    fields: [
      { name: "name", label: "Full Name", type: "text", placeholder: "Marcus Thorne", required: true },
      { name: "budget", label: "Project Budget", type: "select", options: ["$25,000 - $75,000", "$75,000+"], required: true }
    ],
    features: ["Interior walkthrough video", "Serif headers with glowing borders", "Ultra-premium editorial layout"]
  }
];
