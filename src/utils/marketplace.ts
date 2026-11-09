export type ItemCategory = 'Books' | 'Electronics' | 'Lab Gear' | 'Stationery';

export type ItemCondition = 'Brand New' | 'Survived 2 Semesters' | 'Battle-Scarred';

export type ItemStatus = 'available' | 'reserved' | 'sold';

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  price: number | 'Free';
  condition: ItemCondition;
  status: ItemStatus;
  sellerName: string;
  sellerEmail: string;
  sellerTrust: string;
  sellerHostel?: string;
  imageUrl: string;
  postedAt: string;
  meetingSpot?: string;
  handoverNotes?: string;
}

export const CATEGORIES: readonly ItemCategory[] = [
  'Books',
  'Electronics',
  'Lab Gear',
  'Stationery',
] as const;

export const CONDITIONS: readonly { label: ItemCondition; desc: string; badgeColor: string }[] = [
  {
    label: 'Brand New',
    desc: 'Unopened / Barely touched syllabus',
    badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-900',
  },
  {
    label: 'Survived 2 Semesters',
    desc: 'Faithful companion, all parts working',
    badgeColor: 'bg-amber-100 text-amber-950 border-amber-900',
  },
  {
    label: 'Battle-Scarred',
    desc: 'Highlighted margins & hostel wear, 100% functional',
    badgeColor: 'bg-rose-100 text-rose-950 border-rose-900',
  },
];

export const INITIAL_ITEMS: MarketplaceItem[] = [
  {
    id: 'item-1',
    title: 'Precision Mini Drafter + Protractor Head',
    description: 'Survived ED (Engineering Graphics) labs with flying colors. Smooth steel arm, zero wobble, calibrated millimeter scale. Essential for 1st-year Mech, Civil, & Electrical branches.',
    category: 'Stationery',
    price: 350,
    condition: 'Survived 2 Semesters',
    status: 'available',
    sellerName: 'Rohan Deshmukh',
    sellerEmail: 'rohan.d@college.edu.in',
    sellerTrust: '👍 14 Swaps',
    sellerHostel: 'Hostel 4, Room 218',
    imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    postedAt: '2 hours ago',
    meetingSpot: 'Central Workshop porch or Library Gate',
    handoverNotes: 'Includes the padded carrying canvas case and clamps.',
  },
  {
    id: 'item-2',
    title: '2nd-Year CSE Core Textbooks (DSA + OS + Discrete Math)',
    description: 'Complete holy trinity bundle: Cormen (CLRS) Data Structures, Silberschatz Operating Systems, and Kenneth Rosen Discrete Math. Scribbled with golden exam tips in margins.',
    category: 'Books',
    price: 'Free',
    condition: 'Battle-Scarred',
    status: 'available',
    sellerName: 'Ananya Roy',
    sellerEmail: 'ananya.roy@college.edu.in',
    sellerTrust: '🎓 Trusted Senior (22 Swaps)',
    sellerHostel: 'Kalpana Chawla Hall, Wing B',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    postedAt: '4 hours ago',
    meetingSpot: 'Nescafe Kiosk near CS Dept',
    handoverNotes: 'Passing down to any junior taking DSA this semester. Free giveaway!',
  },
  {
    id: 'item-3',
    title: 'Cotton Lab Coat (Unisex, Size M, Flame & Stain Resistant)',
    description: 'Prescribed pure white heavy-drill cotton coat for Chemistry and Material Science practicals. Washed and ironed. Deep pockets that actually fit test-tube tongs.',
    category: 'Lab Gear',
    price: 150,
    condition: 'Survived 2 Semesters',
    status: 'reserved',
    sellerName: 'Kabir Mehta',
    sellerEmail: 'kabir.m@college.edu.in',
    sellerTrust: '👍 8 Swaps',
    sellerHostel: 'Hostel 7, Ground Floor',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    postedAt: 'Yesterday',
    meetingSpot: 'Main Canteen staircase',
    handoverNotes: 'No acid burns or tears, good as new.',
  },
  {
    id: 'item-4',
    title: 'Casio fx-991EX ClassWiz Scientific Calculator',
    description: 'The legendary ClassWiz with natural textbook display and matrix/vector solver. Approved by university examination board for semester finals. Fresh cell battery installed.',
    category: 'Electronics',
    price: 750,
    condition: 'Brand New',
    status: 'available',
    sellerName: 'Tanvi Sen',
    sellerEmail: 'tanvi.sen@college.edu.in',
    sellerTrust: '⭐ 4.9 • 11 Swaps',
    sellerHostel: 'Gargi Hall, Room 104',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
    postedAt: 'Yesterday',
    meetingSpot: 'SAC Student Activity Center',
    handoverNotes: 'Comes with hard slide-on protective case.',
  },
  {
    id: 'item-5',
    title: 'A1 Engineering Sheet Container Tube & Clips',
    description: 'Expandable waterproof chart tube with adjustable carrying strap. Kept my drawings crinkle-free through monsoon semesters. Giving away free to anyone who needs it.',
    category: 'Stationery',
    price: 'Free',
    condition: 'Battle-Scarred',
    status: 'sold',
    sellerName: 'Vikas Patel',
    sellerEmail: 'vikas.p@college.edu.in',
    sellerTrust: '⚡ 19 Swaps',
    sellerHostel: 'Hostel 2, Room 302',
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
    postedAt: '3 days ago',
    meetingSpot: 'Civil Seminar Hall lobby',
    handoverNotes: 'Includes 4 jumbo drawing board butterfly clips.',
  },
  {
    id: 'item-6',
    title: 'Arduino Uno R3 Microcontroller + Sensor Shield Kit',
    description: 'Original Italian design board with ultrasonic distance sensor, breadboard, servo motor, and jumper wires. Perfect for IoT or Mechatronics micro-projects.',
    category: 'Electronics',
    price: 600,
    condition: 'Brand New',
    status: 'available',
    sellerName: 'Preeti Nair',
    sellerEmail: 'preeti.n@college.edu.in',
    sellerTrust: '👍 6 Swaps',
    sellerHostel: 'Sarojini Naidu Bhawan',
    imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80',
    postedAt: '4 days ago',
    meetingSpot: 'Robotics Lab foyer',
    handoverNotes: 'Tested and flashed with blink firmware. Fully verified pins.',
  },
];

/**
 * Validates institutional student email format.
 * Strict check: must end with @college.edu.in or institutional .edu.in format.
 */
export function validateCollegeEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { isValid: false, error: 'Please enter your student email address.' };
  }

  // Check general email regex syntax
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email structure (e.g., yourname@college.edu.in).' };
  }

  // Institutional gatekeeping check: must be @college.edu.in or .edu.in domain
  const isInstitutional = trimmed.endsWith('@college.edu.in') || trimmed.endsWith('.edu.in') || trimmed.endsWith('@college.ac.in');
  if (!isInstitutional) {
    return {
      isValid: false,
      error: 'Access restricted to verified college student IDs only.',
    };
  }

  return { isValid: true };
}

/**
 * Extracts a human-friendly student name from email username.
 * e.g. "rohan.deshmukh@college.edu.in" -> "Rohan Deshmukh"
 */
export function extractStudentName(email: string): string {
  const username = email.split('@')[0] || 'Student';
  const parts = username.replace(/[0-9_]/g, ' ').split(/[.\s]+/);
  const formatted = parts
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
  return formatted || 'College Peer';
}

/**
 * Filters items based on search query, category pill, and optional price filter.
 */
export function filterMarketplaceItems(
  items: MarketplaceItem[],
  query: string,
  categoryFilter: string,
  onlyFree: boolean = false
): MarketplaceItem[] {
  const q = query.trim().toLowerCase();

  return items.filter(item => {
    // Search query match in title, description, category, or sellerName
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.sellerName.toLowerCase().includes(q) ||
      item.condition.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    // Category match
    if (categoryFilter !== 'All') {
      if (categoryFilter === 'Free') {
        if (item.price !== 'Free') return false;
      } else if (item.category !== categoryFilter) {
        return false;
      }
    }

    // Explicit Free Only toggle
    if (onlyFree && item.price !== 'Free') {
      return false;
    }

    return true;
  });
}

/**
 * Formats item price cleanly for display with currency styling.
 */
export function formatPrice(price: number | 'Free'): string {
  if (price === 'Free' || price === 0) {
    return 'Free';
  }
  return `₹${price}`;
}

/**
 * Updates an item's status ('available' | 'reserved' | 'sold') immutably.
 */
export function updateItemStatus(
  items: MarketplaceItem[],
  itemId: string,
  newStatus: ItemStatus
): MarketplaceItem[] {
  return items.map(item => (item.id === itemId ? { ...item, status: newStatus } : item));
}

// -------------------------------------------------------------
// PHASE 3: ISO (IN SEARCH OF) TYPES & SEED DATA
// -------------------------------------------------------------
export interface IsoRequest {
  id: string;
  title: string;
  category: ItemCategory;
  description: string;
  requesterName: string;
  requesterEmail: string;
  requesterHostel?: string;
  urgency: 'Urgent' | 'This Week' | 'Flexible';
  postedAt: string;
  offeringNote?: string;
}

export const INITIAL_ISO_REQUESTS: IsoRequest[] = [
  {
    id: 'iso-1',
    title: 'Need 2nd Sem Engineering Physics Notes & Question Bank',
    category: 'Books',
    description: 'Midterms next week! Desperately need handwritten notes for Quantum Mechanics & Electromagnetics. Willing to photocopy and return or buy outright.',
    requesterName: 'Aarav Sharma',
    requesterEmail: 'aarav.s@college.edu.in',
    requesterHostel: 'Hostel 3, Room 112',
    urgency: 'Urgent',
    postedAt: '1 hour ago',
    offeringNote: 'Will treat to Nescafe coffee + samosas!',
  },
  {
    id: 'iso-2',
    title: 'Looking for 830-Point Breadboard + Jumper Wires',
    category: 'Electronics',
    description: 'Working on Digital IC practical assignment for Friday. Just need a functional breadboard and ~20 male-to-male jumper wires.',
    requesterName: 'Pooja Iyer',
    requesterEmail: 'pooja.iyer@college.edu.in',
    requesterHostel: 'Sarojini Naidu Hall',
    urgency: 'This Week',
    postedAt: '3 hours ago',
    offeringNote: 'Can pay ₹100-150 or return after evaluation.',
  },
  {
    id: 'iso-3',
    title: 'Standard Drafter Table Clamp & Butterfly Screws',
    category: 'Stationery',
    description: 'Lost the desk clamp for my Omega mini-drafter while moving rooms. The arms are fine, just need the clamp hardware!',
    requesterName: 'Nikhil Verma',
    requesterEmail: 'nikhil.v@college.edu.in',
    requesterHostel: 'Hostel 1, Ground Floor',
    urgency: 'Urgent',
    postedAt: '5 hours ago',
    offeringNote: 'Budget ₹100 or bartering with A1 sheets.',
  },
  {
    id: 'iso-4',
    title: 'Pure Cotton Lab Coat (Size L or XL)',
    category: 'Lab Gear',
    description: 'Lost my lab coat in the Organic Chem lab. Assistant is strict about lab coat policy for next lab session.',
    requesterName: 'Meera Nambiar',
    requesterEmail: 'meera.n@college.edu.in',
    requesterHostel: 'Gargi Hall, Wing C',
    urgency: 'This Week',
    postedAt: 'Yesterday',
    offeringNote: 'Looking to buy for ₹100-200.',
  },
  {
    id: 'iso-5',
    title: 'Discrete Mathematics by Kenneth Rosen (7th/8th Ed)',
    category: 'Books',
    description: 'Looking for a physical copy to prepare for GATE and sem end. Highlighting and folded pages are totally welcome.',
    requesterName: 'Siddharth Jain',
    requesterEmail: 'siddharth.j@college.edu.in',
    requesterHostel: 'Hostel 5, Room 402',
    urgency: 'Flexible',
    postedAt: '2 days ago',
    offeringNote: 'Can swap with my 1st sem Engineering Mechanics book.',
  },
];

/**
 * Pure filter function for ISO requests
 */
export function filterIsoRequests(
  requests: IsoRequest[],
  query: string,
  categoryFilter: string
): IsoRequest[] {
  const q = query.trim().toLowerCase();

  return requests.filter(req => {
    const matchesQuery =
      !q ||
      req.title.toLowerCase().includes(q) ||
      req.description.toLowerCase().includes(q) ||
      req.category.toLowerCase().includes(q) ||
      req.requesterName.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    if (categoryFilter !== 'All' && req.category !== categoryFilter) {
      return false;
    }

    return true;
  });
}

// -------------------------------------------------------------
// PHASE 3: IN-APP CHAT DRAWER TYPES & CONVERSATION GENERATOR
// -------------------------------------------------------------
export interface ChatMessage {
  id: string;
  sender: 'me' | 'seller';
  text: string;
  timestamp: string;
}

export function getInitialChatMessages(item: MarketplaceItem, currentUserName: string): ChatMessage[] {
  return [
    {
      id: 'msg-seed-1',
      sender: 'seller',
      text: `Hey ${currentUserName}! Thanks for checking out my ${item.title}. Let me know if you want to inspect it in person.`,
      timestamp: 'Just now',
    },
  ];
}

export function getSimulatedSellerReply(item: MarketplaceItem, userMessage: string): string {
  const lower = userMessage.toLowerCase();
  const spot = item.meetingSpot || 'Central Library porch';

  if (lower.includes('available') || lower.includes('still have')) {
    return `Hey! Yes, it's 100% available. Let's meet at 4 PM near ${spot}!`;
  }
  if (lower.includes('meet') || lower.includes('time') || lower.includes('today') || lower.includes('when')) {
    return `Works for me! Let's meet right outside ${spot}. Look for me in a college hoodie!`;
  }
  if (lower.includes('price') || lower.includes('discount') || lower.includes('₹') || lower.includes('offer') || lower.includes('less')) {
    return item.price === 'Free'
      ? `It's already a 100% free giveaway for campus peers! Just take good care of it.`
      : `I kept the price fair for campus peers at ₹${item.price}, but we can round it down slightly if you pick it up today!`;
  }
  if (lower.includes('condition') || lower.includes('working') || lower.includes('damage')) {
    return `Condition is "${item.condition}". You can inspect every inch thoroughly before paying.`;
  }
  return `Sounds good! Let's meet at 4 PM near ${spot}. I'll bring the item along.`;
}

// -------------------------------------------------------------
// PROFILE & MODERATION HELPERS
// -------------------------------------------------------------
export function deleteMarketplaceItem(items: MarketplaceItem[], itemId: string): MarketplaceItem[] {
  return items.filter(item => item.id !== itemId);
}

export function deleteIsoRequest(requests: IsoRequest[], requestId: string): IsoRequest[] {
  return requests.filter(req => req.id !== requestId);
}

export function reportAndHideItem(items: MarketplaceItem[], itemId: string): MarketplaceItem[] {
  return items.filter(item => item.id !== itemId);
}

export function getUserMarketplaceItems(items: MarketplaceItem[], userEmail: string | null): MarketplaceItem[] {
  if (!userEmail) return [];
  const normalized = userEmail.trim().toLowerCase();
  return items.filter(item => item.sellerEmail.trim().toLowerCase() === normalized);
}

export function getUserIsoRequests(requests: IsoRequest[], userEmail: string | null): IsoRequest[] {
  if (!userEmail) return [];
  const normalized = userEmail.trim().toLowerCase();
  return requests.filter(req => req.requesterEmail.trim().toLowerCase() === normalized);
}



