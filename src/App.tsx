import React, { useState, useEffect, useId, useRef } from 'react';
import { supabase } from './supabaseClient';
import {
  GraduationCap,
  Search,
  Plus,
  LogOut,
  Sparkles,
  MapPin,
  Tag,
  ShieldCheck,
  ShieldAlert,
  ThumbsUp,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  MessageSquare,
  BookOpen,
  Cpu,
  FlaskConical,
  Ruler,
  Clock,
  ArrowRight,
  ArrowLeft,
  Gift,
  Send,
  SlidersHorizontal,
  Flame,
  Zap,
  HelpCircle,
  Check,
  ShoppingBag,
  Compass,
  User,
  Flag,
  Trash2,
  Package,
} from 'lucide-react';
import {
  MarketplaceItem,
  ItemCategory,
  ItemCondition,
  ItemStatus,
  CATEGORIES,
  CONDITIONS,
  INITIAL_ITEMS,
  IsoRequest,
  INITIAL_ISO_REQUESTS,
  ChatMessage,
  validateCollegeEmail,
  extractStudentName,
  filterMarketplaceItems,
  filterIsoRequests,
  formatPrice,
  updateItemStatus,
  getInitialChatMessages,
  getSimulatedSellerReply,
  deleteMarketplaceItem,
  deleteIsoRequest,
  reportAndHideItem,
  getUserMarketplaceItems,
  getUserIsoRequests,
} from './utils/marketplace';

// Preset sample photos for easy item listing
const PRESET_PHOTOS: { label: string; url: string; category: ItemCategory }[] = [
  {
    label: 'Engineering Drafter / Tools',
    category: 'Stationery',
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Engineering & CS Textbooks',
    category: 'Books',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Lab Coat & Safety Glasses',
    category: 'Lab Gear',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Scientific Calculator',
    category: 'Electronics',
    url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Microcontroller / Arduino Board',
    category: 'Electronics',
    url: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Art & Drawing Tubes / Stencils',
    category: 'Stationery',
    url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
  },
];

export default function App() {
  // Authentication state
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab navigation state: Marketplace Feed vs ISO Board vs My Profile
  const [activeTab, setActiveTab] = useState<'marketplace' | 'iso' | 'profile'>('marketplace');

  // Marketplace items & filters
  const [items, setItems] = useState<MarketplaceItem[]>(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [freeOnly, setFreeOnly] = useState<boolean>(false);

  // ISO Board state & filters
  const [isoRequests, setIsoRequests] = useState<IsoRequest[]>(INITIAL_ISO_REQUESTS);
  const [isoSearchQuery, setIsoSearchQuery] = useState('');
  const [isoSelectedCategory, setIsoSelectedCategory] = useState<string>('All');
  const [isIsoModalOpen, setIsIsoModalOpen] = useState(false);
  const [matchedIsoIds, setMatchedIsoIds] = useState<Set<string>>(new Set());

  // ISO Form state
  const [newIsoTitle, setNewIsoTitle] = useState('');
  const [newIsoCategory, setNewIsoCategory] = useState<ItemCategory>('Books');
  const [newIsoDescription, setNewIsoDescription] = useState('');
  const [newIsoUrgency, setNewIsoUrgency] = useState<'Urgent' | 'This Week' | 'Flexible'>('This Week');
  const [newIsoOffering, setNewIsoOffering] = useState('');
  const [isoFormError, setIsoFormError] = useState<string | null>(null);

  // Modals & detail view
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MarketplaceItem | null>(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  // In-App Chat Drawer state
  const [activeChatItem, setActiveChatItem] = useState<MarketplaceItem | null>(null);
  const [chatThreads, setChatThreads] = useState<Record<string, ChatMessage[]>>({});
  const [chatInputText, setChatInputText] = useState('');
  const [isSellerTyping, setIsSellerTyping] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Feature 2: Quick Report / Flag System state
  const [itemPendingReport, setItemPendingReport] = useState<MarketplaceItem | null>(null);
  const [reportReason, setReportReason] = useState<string>('Spam or commercial scalper');

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New item form state (Marketplace)
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<ItemCategory>('Books');
  const [newPrice, setNewPrice] = useState<string>('');
  const [isGivingFree, setIsGivingFree] = useState(false);
  const [newCondition, setNewCondition] = useState<ItemCondition>('Survived 2 Semesters');
  const [newMeetingSpot, setNewMeetingSpot] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(PRESET_PHOTOS[0].url);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Form input accessible IDs
  const titleInputId = useId();
  const descInputId = useId();
  const categorySelectId = useId();
  const priceInputId = useId();
  const freeCheckboxId = useId();
  const conditionSelectId = useId();
  const meetingSpotInputId = useId();

  const isoTitleInputId = useId();
  const isoDescInputId = useId();
  const isoCategorySelectId = useId();
  const isoUrgencySelectId = useId();
  const isoOfferingInputId = useId();

  // Support ?autostart=1 query parameter to skip login for fast testing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setCurrentUserEmail('student.lead@college.edu.in');
    }
  }, []);

  // Listen for Escape key to close modals & drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (itemPendingReport) {
          setItemPendingReport(null);
        } else if (activeChatItem) {
          setActiveChatItem(null);
        } else if (selectedItemForDetail) {
          setSelectedItemForDetail(null);
        } else if (isListingModalOpen) {
          setIsListingModalOpen(false);
        } else if (isIsoModalOpen) {
          setIsIsoModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itemPendingReport, activeChatItem, selectedItemForDetail, isListingModalOpen, isIsoModalOpen]);

  // Auto-scroll chat to bottom when messages update
  useEffect(() => {
    if (activeChatItem) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatThreads, activeChatItem, isSellerTyping]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4500);
  };

  // Login handler with strict institutional check
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCollegeEmail(loginInput);
    if (!validation.isValid) {
      setAuthError(validation.error || 'Access restricted to verified college student IDs only.');
      return;
    }
    setAuthError(null);
    const cleaned = loginInput.trim().toLowerCase();
    setCurrentUserEmail(cleaned);
    showToast(`Welcome back, ${extractStudentName(cleaned)}! 👋`);
  };

  const handleLogout = () => {
    setCurrentUserEmail(null);
    setLoginInput('');
    setAuthError(null);
    setSelectedItemForDetail(null);
    setIsListingModalOpen(false);
    setIsIsoModalOpen(false);
    setActiveChatItem(null);
    setItemPendingReport(null);
    setActiveTab('marketplace');
  };

  // -------------------------------------------------------------
  // MARKETPLACE LISTING LOGIC
  // -------------------------------------------------------------
  const handleOpenListModal = () => {
    setNewTitle('');
    setNewDescription('');
    setNewCategory('Books');
    setNewPrice('');
    setIsGivingFree(false);
    setNewCondition('Survived 2 Semesters');
    setNewMeetingSpot('');
    setSelectedImageUrl(PRESET_PHOTOS[0].url);
    setCustomImageUrl('');
    setFormError(null);
    setIsListingModalOpen(true);
  };

  const handlePostItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Please enter a descriptive item title.');
      return;
    }
    if (!newDescription.trim()) {
      setFormError('Please provide a short description or condition summary.');
      return;
    }

    let finalPrice: number | 'Free' = 'Free';
    if (!isGivingFree) {
      const parsed = parseFloat(newPrice);
      if (isNaN(parsed) || parsed < 0) {
        setFormError('Please enter a valid price in ₹ or check "Giving it away for free".');
        return;
      }
      finalPrice = parsed === 0 ? 'Free' : parsed;
    }

    const sellerName = currentUserEmail ? extractStudentName(currentUserEmail) : 'Student';
    const finalImage = customImageUrl.trim() || selectedImageUrl;

    const newItem: MarketplaceItem = {
      id: `item-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      price: finalPrice,
      condition: newCondition,
      status: 'available',
      sellerName,
      sellerEmail: currentUserEmail || 'student@college.edu.in',
      sellerTrust: '👍 Verified Peer',
      sellerHostel: 'Hostel Block',
      imageUrl: finalImage,
      postedAt: 'Just now',
      meetingSpot: newMeetingSpot.trim() || 'College Library or SAC Canteen',
      handoverNotes: isGivingFree
        ? 'Free give-away to help a campus peer.'
        : 'Available for cash or UPI at handover.',
    };

    setItems(prev => [newItem, ...prev]);
    setIsListingModalOpen(false);
    setSelectedCategory('All');
    setSearchQuery('');
    setFreeOnly(false);
    showToast(`🎉 "${newItem.title}" has been listed on CampusBarter!`);
  };

  // Change status of item (Available / Reserved / Sold)
  const handleStatusChange = (itemId: string, newStatus: ItemStatus) => {
    setItems(prev => updateItemStatus(prev, itemId, newStatus));

    if (selectedItemForDetail && selectedItemForDetail.id === itemId) {
      setSelectedItemForDetail(prev => (prev ? { ...prev, status: newStatus } : null));
    }

    const statusLabels: Record<ItemStatus, string> = {
      available: 'Available',
      reserved: 'Reserved',
      sold: 'Sold Out',
    };
    showToast(`⚡ Status updated to "${statusLabels[newStatus]}"!`);
  };

  // Delete an item listing (from My Profile)
  const handleDeleteItem = (itemId: string, itemTitle: string) => {
    setItems(prev => deleteMarketplaceItem(prev, itemId));
    if (selectedItemForDetail?.id === itemId) {
      setSelectedItemForDetail(null);
    }
    if (activeChatItem?.id === itemId) {
      setActiveChatItem(null);
    }
    showToast(`🗑️ "${itemTitle}" removed from your listings.`);
  };

  // Delete an ISO request (from My Profile)
  const handleDeleteIsoRequest = (requestId: string, reqTitle: string) => {
    setIsoRequests(prev => deleteIsoRequest(prev, requestId));
    showToast(`🗑️ ISO beacon "${reqTitle}" removed.`);
  };

  // Vouch for seller action (when item is sold)
  const handleVouchForSeller = (item: MarketplaceItem) => {
    const alertMessage = `Simulating a +1 trust rating submission for ${item.sellerName}. Thanks for keeping the campus safe!`;
    try {
      window.alert(alertMessage);
    } catch {
      // In case iframe restricts alerts
    }
    showToast(`🌟 +1 Trust rating submitted for ${item.sellerName}!`);
  };

  // -------------------------------------------------------------
  // FEATURE 2: QUICK REPORT / FLAG SYSTEM
  // -------------------------------------------------------------
  const handleInitiateReport = (item: MarketplaceItem) => {
    setItemPendingReport(item);
    setReportReason('Spam or commercial scalper');
  };

  const handleConfirmReport = (item: MarketplaceItem) => {
    const itemId = item.id;
    // Immediately remove the item from the active feed state array
    setItems(prev => reportAndHideItem(prev, itemId));

    if (selectedItemForDetail?.id === itemId) {
      setSelectedItemForDetail(null);
    }
    if (activeChatItem?.id === itemId) {
      setActiveChatItem(null);
    }
    setItemPendingReport(null);

    const alertMsg = '🚨 Listing reported and hidden. Thanks for keeping the campus community safe, admin notified!';
    try {
      window.alert(alertMsg);
    } catch {
      // safe fallback for restricted iframes
    }
    showToast(alertMsg);
  };

  // -------------------------------------------------------------
  // IN-APP CHAT DRAWER LOGIC
  // -------------------------------------------------------------
  const handleOpenChatDrawer = (item: MarketplaceItem) => {
    if (item.status === 'sold' || item.status === 'reserved') {
      showToast(`Cannot contact seller: Item is currently marked as ${item.status}.`);
      return;
    }

    if (!chatThreads[item.id]) {
      const studentName = currentUserEmail ? extractStudentName(currentUserEmail) : 'Campus Peer';
      setChatThreads(prev => ({
        ...prev,
        [item.id]: getInitialChatMessages(item, studentName),
      }));
    }

    setActiveChatItem(item);
    setChatInputText('');
    setIsSellerTyping(false);
  };

  const handleSendChatMessage = (messageToSend?: string) => {
    if (!activeChatItem) return;
    const text = (messageToSend || chatInputText).trim();
    if (!text) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text,
      timestamp: 'Just now',
    };

    const itemId = activeChatItem.id;
    setChatThreads(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), newMessage],
    }));
    setChatInputText('');

    setIsSellerTyping(true);
    setTimeout(() => {
      const replyText = getSimulatedSellerReply(activeChatItem, text);
      const sellerReplyMessage: ChatMessage = {
        id: `msg-seller-${Date.now()}`,
        sender: 'seller',
        text: replyText,
        timestamp: 'Just now',
      };
      setChatThreads(prev => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), sellerReplyMessage],
      }));
      setIsSellerTyping(false);
    }, 1000);
  };

  // -------------------------------------------------------------
  // ISO (IN SEARCH OF) LOGIC
  // -------------------------------------------------------------
  const handleOpenIsoModal = () => {
    setNewIsoTitle('');
    setNewIsoCategory('Books');
    setNewIsoDescription('');
    setNewIsoUrgency('This Week');
    setNewIsoOffering('');
    setIsoFormError(null);
    setIsIsoModalOpen(true);
  };

  const handlePostIsoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIsoTitle.trim()) {
      setIsoFormError('Please enter what item you are looking for.');
      return;
    }
    if (!newIsoDescription.trim()) {
      setIsoFormError('Please provide a short description or syllabus requirement.');
      return;
    }

    const requesterName = currentUserEmail ? extractStudentName(currentUserEmail) : 'Student Peer';
    const newRequest: IsoRequest = {
      id: `iso-${Date.now()}`,
      title: newIsoTitle.trim(),
      category: newIsoCategory,
      description: newIsoDescription.trim(),
      requesterName,
      requesterEmail: currentUserEmail || 'student@college.edu.in',
      requesterHostel: 'Campus Hostel',
      urgency: newIsoUrgency,
      postedAt: 'Just now',
      offeringNote: newIsoOffering.trim() || undefined,
    };

    setIsoRequests(prev => [newRequest, ...prev]);
    setIsIsoModalOpen(false);
    showToast(`📢 ISO request for "${newRequest.title}" posted to campus!`);
  };

  const handleIHaveThis = (request: IsoRequest) => {
    const alertMessage = `Simulating match! Notifying ${request.requesterName} that you have their requested item.`;
    try {
      window.alert(alertMessage);
    } catch {
      // In case iframe restricts alerts
    }
    setMatchedIsoIds(prev => new Set(prev).add(request.id));
    showToast(`🎯 Matched! ${request.requesterName} has been notified on campus.`);
  };

  const filteredMarketplaceItems = filterMarketplaceItems(
    items,
    searchQuery,
    selectedCategory,
    freeOnly
  );

  const filteredIsoList = filterIsoRequests(isoRequests, isoSearchQuery, isoSelectedCategory);

  // User's own items and requests for Profile View
  const userItems = getUserMarketplaceItems(items, currentUserEmail);
  const userIsoRequests = getUserIsoRequests(isoRequests, currentUserEmail);

  // -------------------------------------------------------------
  // SCREEN 1: LOGIN / GATEKEEPING SCREEN
  // -------------------------------------------------------------
  if (!currentUserEmail) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] text-[#1a1a1a] flex flex-col justify-between selection:bg-[#ff5722] selection:text-white">
        {/* Top Minimal Strip */}
        <header className="w-full border-b-2 border-[#1a1a1a] bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-[#ff5722] text-white p-1.5 rounded border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span className="font-heading font-black text-xl tracking-tight">CampusBarter</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider bg-[#00e599] px-2.5 py-1 rounded border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
            Verified Student Hub
          </span>
        </header>

        {/* Center Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            {/* Playful top banner sticker */}
            <div className="flex justify-between items-end mb-2 px-1">
              <span className="text-xs font-black uppercase tracking-widest text-[#ff5722] bg-[#ffe600] px-3 py-1 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] -rotate-1">
                Zero Scalpers • 100% Peer-to-Peer
              </span>
              <span className="text-xs font-bold text-stone-500">v3.5 Live</span>
            </div>

            {/* Brutalist Login Card */}
            <div className="bg-white border-2 border-[#1a1a1a] rounded-xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1a1a1a]">
              <div className="space-y-2 mb-6">
                <h1 className="font-heading text-3xl font-black tracking-tight text-[#1a1a1a]">
                  Pass down your gear.
                </h1>
                <p className="text-sm font-medium text-stone-600 leading-relaxed">
                  Drafters, textbooks, calculators &amp; lab coats from your seniors. Verified campus email required.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="student-email-input" className="block text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
                      College Email Address
                    </label>
                    <span className="text-[11px] font-semibold text-stone-500">
                      Must end in @college.edu.in
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="student-email-input"
                      type="text"
                      value={loginInput}
                      onChange={e => {
                        setLoginInput(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      placeholder="e.g. arjun.sharma@college.edu.in"
                      className="w-full bg-[#fdfbf7] border-2 border-[#1a1a1a] rounded-lg px-4 py-3 text-sm font-medium text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ff5722] shadow-[2px_2px_0px_0px_#1a1a1a] transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Quirky Red Error Display */}
                {authError && (
                  <div
                    role="alert"
                    className="p-3 bg-rose-50 border-2 border-rose-900 rounded-lg shadow-[3px_3px_0px_0px_#881337] flex items-start space-x-2.5 animate-shake"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-rose-950 uppercase tracking-wide">
                        Hold up! College IDs only
                      </p>
                      <p className="text-xs font-medium text-rose-800 mt-0.5">
                        {authError}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-[#ff5722] hover:bg-[#f4511e] active:scale-95 text-white font-heading font-black text-base uppercase tracking-wider rounded-lg border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] hover:shadow-[2px_2px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Enter Campus Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Demo Shortcuts */}
              <div className="mt-6 pt-5 border-t-2 border-dashed border-stone-200">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
                    Quick test shortcuts:
                  </span>
                  <span className="text-[10px] text-stone-400">Click to autofill</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginInput('kabir.m@college.edu.in');
                      setAuthError(null);
                    }}
                    className="text-left px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-800 rounded text-xs font-semibold text-emerald-900 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center space-x-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="truncate">kabir.m@college.edu.in (Has 1 item listed)</span>
                    </span>
                    <span className="text-[10px] font-black uppercase bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-950 flex-shrink-0 ml-1">
                      Valid ID
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginInput('random.guest@gmail.com');
                      setAuthError(null);
                    }}
                    className="text-left px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded text-xs font-semibold text-rose-900 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center space-x-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                      <span className="truncate">random.guest@gmail.com</span>
                    </span>
                    <span className="text-[10px] font-black uppercase bg-rose-200 px-1.5 py-0.5 rounded text-rose-950 flex-shrink-0 ml-1">
                      Test Error
                    </span>
                  </button>
                </div>
              </div>

              {/* Safety badge */}
              <div className="mt-5 flex items-center justify-center space-x-2 text-stone-500 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Restricted domain • Handover on campus only</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-stone-200 py-3 text-center text-xs text-stone-500">
          CampusBarter prototype &bull; Built for college students &bull; Handover at SAC, Library &amp; Hostels
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: MAIN DASHBOARD & TABS
  // -------------------------------------------------------------
  const studentDisplayName = extractStudentName(currentUserEmail);

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#1a1a1a] selection:bg-[#ff5722] selection:text-white flex flex-col">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-[#1a1a1a] text-white px-5 py-3.5 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#00e599] flex items-center space-x-3 animate-bounce"
        >
          <Sparkles className="w-5 h-5 text-[#00e599] flex-shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white ml-2 text-xs uppercase font-bold cursor-pointer"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sticky Top Navbar */}
      <nav className="sticky top-0 z-40 bg-[#fdfbf7]/95 backdrop-blur-md border-b-2 border-[#1a1a1a] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand */}
          <div
            onClick={() => setActiveTab('marketplace')}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="bg-[#ff5722] text-white p-2 rounded-lg border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="font-heading font-black text-xl sm:text-2xl tracking-tight text-[#1a1a1a]">
                CampusBarter
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-black uppercase tracking-wider bg-[#00e599] px-2 py-0.5 rounded border border-[#1a1a1a]">
                Verified Peer Hub
              </span>
            </div>
          </div>

          {/* Right Controls: Action Button + User Profile Shortcut + Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {activeTab === 'iso' ? (
              <button
                onClick={handleOpenIsoModal}
                className="bg-[#ffe600] hover:bg-[#fed000] active:scale-95 text-[#1a1a1a] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[1px_1px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-heading font-black text-xs sm:text-sm tracking-wide uppercase flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Post an ISO Request</span>
              </button>
            ) : (
              <button
                onClick={handleOpenListModal}
                className="bg-[#00e599] hover:bg-[#00cf8a] active:scale-95 text-[#1a1a1a] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[1px_1px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-heading font-black text-xs sm:text-sm tracking-wide uppercase flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>List New Item</span>
              </button>
            )}

            {/* User Profile Pill button */}
            <button
              onClick={() => setActiveTab('profile')}
              title="View My Profile & Listings"
              className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg border-2 border-[#1a1a1a] transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#ffe600] shadow-[2px_2px_0px_0px_#1a1a1a]'
                  : 'bg-white hover:bg-stone-50 shadow-[2px_2px_0px_0px_#1a1a1a]'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white border border-[#1a1a1a] flex items-center justify-center text-xs font-black">
                {studentDisplayName.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-[#1a1a1a] leading-none">{studentDisplayName}</p>
                <p className="text-[10px] text-stone-500 leading-tight truncate max-w-[130px]">
                  {currentUserEmail}
                </p>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Log out of campus session"
              className="p-2 sm:px-3 sm:py-2 bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 active:scale-95 border-2 border-[#1a1a1a] rounded-lg shadow-[2px_2px_0px_0px_#1a1a1a] font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ------------------------------------------------------------- */}
      {/* TOP NAVIGATION / TAB SWITCHER: MARKETPLACE, ISO, MY PROFILE */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-white border-b-2 border-black px-4 sm:px-8 py-2.5 shadow-[0px_2px_0px_0px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented View Switcher */}
          <div className="inline-flex p-1 bg-stone-100 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] self-start sm:self-auto overflow-x-auto max-w-full">
            {/* Tab 1: Marketplace */}
            <button
              type="button"
              onClick={() => setActiveTab('marketplace')}
              className={`px-3.5 sm:px-4 py-2 rounded-lg font-heading font-black text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5 sm:space-x-2 transition-all cursor-pointer flex-shrink-0 ${
                activeTab === 'marketplace'
                  ? 'bg-[#1a1a1a] text-white shadow-[2px_2px_0px_0px_#ff5722]'
                  : 'text-stone-700 hover:text-black hover:bg-stone-200/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Marketplace</span>
              <span
                className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'marketplace'
                    ? 'bg-[#00e599] text-black'
                    : 'bg-white border border-black text-black'
                }`}
              >
                {items.length}
              </span>
            </button>

            {/* Tab 2: ISO Board (Looking For) */}
            <button
              type="button"
              onClick={() => setActiveTab('iso')}
              className={`px-3.5 sm:px-4 py-2 rounded-lg font-heading font-black text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5 sm:space-x-2 transition-all cursor-pointer flex-shrink-0 ${
                activeTab === 'iso'
                  ? 'bg-[#ffe600] text-black shadow-[2px_2px_0px_0px_#1a1a1a] font-black'
                  : 'text-stone-700 hover:text-black hover:bg-stone-200/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>ISO Board (Looking For)</span>
              <span
                className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'iso'
                    ? 'bg-black text-white'
                    : 'bg-white border border-black text-black'
                }`}
              >
                {isoRequests.length}
              </span>
            </button>

            {/* Tab 3: My Profile (Feature 1) */}
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 sm:px-4 py-2 rounded-lg font-heading font-black text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5 sm:space-x-2 transition-all cursor-pointer flex-shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-[#ff5722] text-white shadow-[2px_2px_0px_0px_#1a1a1a]'
                  : 'text-stone-700 hover:text-black hover:bg-stone-200/60'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white text-black border border-black flex items-center justify-center text-[9px] font-black">
                {studentDisplayName.charAt(0)}
              </div>
              <span>My Profile</span>
              <span
                className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'profile'
                    ? 'bg-white text-black'
                    : 'bg-stone-200 border border-black text-black'
                }`}
              >
                {userItems.length + userIsoRequests.length}
              </span>
            </button>
          </div>

          {/* Quick Subtitle Microcopy */}
          <div className="text-xs font-bold text-stone-600 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00e599]" />
            <span>
              {activeTab === 'marketplace'
                ? 'Buying, claiming & passing down gear from seniors'
                : activeTab === 'iso'
                ? 'Student requests: Have something a peer needs? Claim the match!'
                : 'Manage your listings, toggle item availability, and resolve ISOs'}
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: MARKETPLACE FEED */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'marketplace' && (
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 flex-1">
          {/* Campus Hero Card */}
          <section className="bg-gradient-to-r from-[#ffe600] via-[#ffd000] to-[#ffaa00] border-2 border-[#1a1a1a] rounded-xl p-5 sm:p-7 shadow-[6px_6px_0px_0px_#1a1a1a] mb-8 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] mb-3 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#ff5722]" />
                <span>Campus Clearance • No Strangers Allowed</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-[#1a1a1a] leading-tight">
                What are you passing down this semester?
              </h2>
              <p className="mt-2 text-sm sm:text-base font-semibold text-stone-900 leading-relaxed">
                Don&apos;t let your 1st-year drafters and ₹800 engineering books gather dust in the hostel room. Hand them over directly to your campus juniors.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <span className="bg-white/80 backdrop-blur px-2.5 py-1 rounded border border-[#1a1a1a]">
                  ⚡ {items.filter(i => i.price === 'Free').length} Free Giveaways Live
                </span>
                <span className="bg-white/80 backdrop-blur px-2.5 py-1 rounded border border-[#1a1a1a]">
                  🤝 Handover at Library or Canteen
                </span>
                <span className="bg-white/80 backdrop-blur px-2.5 py-1 rounded border border-[#1a1a1a]">
                  🎓 Verified @college.edu.in
                </span>
              </div>
            </div>
          </section>

          {/* Search & Real-Time Filter Section */}
          <section className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Chunky Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search textbooks, drafters, calculators, lab coats, components..."
                  className="w-full pl-12 pr-10 py-3.5 bg-white border-2 border-[#1a1a1a] rounded-xl text-sm font-semibold text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff5722] shadow-[3px_3px_0px_0px_#1a1a1a] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1a1a1a] p-1 cursor-pointer"
                    aria-label="Clear search text"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Free Giveaway Toggle */}
              <button
                onClick={() => setFreeOnly(!freeOnly)}
                className={`px-4 py-3 rounded-xl border-2 border-[#1a1a1a] font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  freeOnly
                    ? 'bg-[#00e599] text-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a] translate-x-[2px] translate-y-[2px]'
                    : 'bg-white hover:bg-emerald-50 text-stone-800 shadow-[3px_3px_0px_0px_#1a1a1a]'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Free Giveaways Only</span>
                {freeOnly && <span className="bg-white px-1.5 py-0.2 rounded text-[10px]">ON</span>}
              </button>
            </div>

            {/* Horizontal Category Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500 mr-1 flex items-center space-x-1 flex-shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Category:</span>
              </span>

              {/* All Pill */}
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-full font-heading font-black text-xs tracking-wide uppercase border-2 border-[#1a1a1a] transition-all flex-shrink-0 cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-[#1a1a1a] text-white shadow-[3px_3px_0px_0px_#ff5722]'
                    : 'bg-white hover:bg-stone-100 text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
                }`}
              >
                All Items ({items.length})
              </button>

              {/* Books Pill */}
              <button
                onClick={() => setSelectedCategory('Books')}
                className={`px-4 py-2 rounded-full font-heading font-black text-xs tracking-wide uppercase border-2 border-[#1a1a1a] transition-all flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
                  selectedCategory === 'Books'
                    ? 'bg-[#ffe600] text-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]'
                    : 'bg-white hover:bg-stone-100 text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Books</span>
              </button>

              {/* Electronics Pill */}
              <button
                onClick={() => setSelectedCategory('Electronics')}
                className={`px-4 py-2 rounded-full font-heading font-black text-xs tracking-wide uppercase border-2 border-[#1a1a1a] transition-all flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
                  selectedCategory === 'Electronics'
                    ? 'bg-[#ff5722] text-white shadow-[3px_3px_0px_0px_#1a1a1a]'
                    : 'bg-white hover:bg-stone-100 text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Electronics</span>
              </button>

              {/* Lab Gear Pill */}
              <button
                onClick={() => setSelectedCategory('Lab Gear')}
                className={`px-4 py-2 rounded-full font-heading font-black text-xs tracking-wide uppercase border-2 border-[#1a1a1a] transition-all flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
                  selectedCategory === 'Lab Gear'
                    ? 'bg-[#00e599] text-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]'
                    : 'bg-white hover:bg-stone-100 text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Lab Gear</span>
              </button>

              {/* Stationery Pill */}
              <button
                onClick={() => setSelectedCategory('Stationery')}
                className={`px-4 py-2 rounded-full font-heading font-black text-xs tracking-wide uppercase border-2 border-[#1a1a1a] transition-all flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
                  selectedCategory === 'Stationery'
                    ? 'bg-purple-200 text-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]'
                    : 'bg-white hover:bg-stone-100 text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Stationery</span>
              </button>
            </div>
          </section>

          {/* Results Counter & Active Query Info */}
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-xs font-black uppercase tracking-wider text-stone-600">
              Showing {filteredMarketplaceItems.length} {filteredMarketplaceItems.length === 1 ? 'item' : 'items'} available on campus
            </p>
            {(searchQuery || selectedCategory !== 'All' || freeOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setFreeOnly(false);
                }}
                className="text-xs font-bold text-[#ff5722] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Empty State */}
          {filteredMarketplaceItems.length === 0 && (
            <div className="bg-white border-2 border-[#1a1a1a] rounded-xl p-10 text-center shadow-[4px_4px_0px_0px_#1a1a1a] my-8">
              <div className="w-16 h-16 bg-[#ffe600] rounded-full border-2 border-[#1a1a1a] flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_#1a1a1a]">
                <Search className="w-8 h-8 text-[#1a1a1a]" />
              </div>
              <h3 className="font-heading text-xl font-black text-[#1a1a1a]">
                No items match your campus search
              </h3>
              <p className="text-sm font-medium text-stone-600 max-w-md mx-auto mt-2">
                No senior has listed &quot;{searchQuery}&quot; yet. Be the first to pass it down, or try adjusting your filters!
              </p>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setFreeOnly(false);
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border-2 border-[#1a1a1a] rounded-lg text-xs font-bold uppercase cursor-pointer"
                >
                  Clear all filters
                </button>
                <button
                  onClick={handleOpenListModal}
                  className="px-4 py-2 bg-[#ff5722] text-white border-2 border-[#1a1a1a] rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_0px_#1a1a1a] cursor-pointer"
                >
                  List this item
                </button>
              </div>
            </div>
          )}

          {/* Responsive Item Grid: 1 col mobile, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarketplaceItems.map(item => {
              const isFree = item.price === 'Free';
              const conditionMeta = CONDITIONS.find(c => c.label === item.condition) || CONDITIONS[1];

              return (
                <article
                  key={item.id}
                  className="group bg-white border-2 border-[#1a1a1a] rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_#1a1a1a] hover:shadow-[6px_6px_0px_0px_#1a1a1a] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between relative"
                >
                  {/* Top Image & Floating Badges */}
                  <div>
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100 border-b-2 border-[#1a1a1a]">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          item.status === 'sold'
                            ? 'grayscale contrast-125 opacity-75'
                            : 'group-hover:scale-105'
                        }`}
                        loading="lazy"
                      />

                      {/* Heavy Tilted "SOLD OUT" Badge Across Image */}
                      {item.status === 'sold' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/30">
                          <span className="font-heading font-black text-xl sm:text-2xl uppercase tracking-widest text-white bg-rose-600 px-5 py-1.5 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-12 animate-pulse">
                            SOLD OUT
                          </span>
                        </div>
                      )}

                      {/* Yellow "RESERVED" Badge */}
                      {item.status === 'reserved' && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                          <span className="text-[11px] font-black uppercase tracking-wider bg-yellow-300 text-black px-3 py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            ⚠️ RESERVED
                          </span>
                        </div>
                      )}

                      {/* Category pill pinned top left */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        <span className="text-[11px] font-black uppercase tracking-wider bg-white/95 backdrop-blur px-2.5 py-1 rounded border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
                          {item.category}
                        </span>
                      </div>

                      {/* Price tag pinned top right */}
                      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5">
                        {/* Feature 2: Small discrete Quick Report / Flag Button on card */}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleInitiateReport(item);
                          }}
                          title="Report this listing"
                          className="p-1 bg-white hover:bg-rose-100 text-stone-600 hover:text-rose-700 rounded border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer"
                          aria-label={`Report ${item.title}`}
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>

                        {isFree ? (
                          <span className="text-xs font-black uppercase tracking-widest bg-[#00e599] text-[#1a1a1a] px-3 py-1 rounded border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] flex items-center space-x-1 animate-pulse">
                            <Gift className="w-3.5 h-3.5" />
                            <span>FREE!</span>
                          </span>
                        ) : (
                          <span className="text-xs font-black bg-[#ffe600] text-[#1a1a1a] px-3 py-1 rounded border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>

                      {/* Condition sticker pinned bottom left */}
                      <div className="absolute bottom-2.5 left-3 z-10">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a] ${conditionMeta.badgeColor}`}
                        >
                          {item.condition}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div
                      onClick={() => setSelectedItemForDetail(item)}
                      className="p-4 sm:p-5 cursor-pointer"
                    >
                      <h3 className="font-heading font-black text-lg text-[#1a1a1a] line-clamp-1 group-hover:text-[#ff5722] transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs font-medium text-stone-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Seller details & meetup spot */}
                      <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 truncate">
                          <div className="w-6 h-6 rounded-full bg-stone-200 border border-[#1a1a1a] flex items-center justify-center text-[10px] font-black text-stone-800 flex-shrink-0">
                            {item.sellerName.charAt(0)}
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-[#1a1a1a] truncate block leading-tight">
                              {item.sellerName}
                            </span>
                            <span className="text-[10px] text-stone-500 font-semibold block leading-tight">
                              {item.sellerTrust}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-stone-500 flex items-center space-x-1 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{item.postedAt}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-4 sm:p-5 pt-0">
                    {item.status === 'sold' ? (
                      <div className="space-y-1">
                        <button
                          disabled
                          aria-label={`Claim ${item.title} (Sold Out)`}
                          className="w-full py-2.5 px-4 bg-stone-200 text-stone-500 font-heading font-black text-xs uppercase tracking-wider rounded-lg border-2 border-stone-400 cursor-not-allowed flex items-center justify-center space-x-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Sold Out (Claim Disabled)</span>
                        </button>
                        <button
                          onClick={() => setSelectedItemForDetail(item)}
                          className="w-full text-center text-[10px] font-bold text-stone-500 hover:text-black underline cursor-pointer"
                        >
                          View item details / feedback
                        </button>
                      </div>
                    ) : item.status === 'reserved' ? (
                      <button
                        onClick={() => setSelectedItemForDetail(item)}
                        className="w-full py-2.5 px-4 bg-yellow-100 hover:bg-yellow-200 active:scale-95 text-[#1a1a1a] font-heading font-black text-xs uppercase tracking-wider rounded-lg border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[1px_1px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <span>View Item (Reserved)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedItemForDetail(item)}
                        className="w-full py-2.5 px-4 bg-white hover:bg-[#ff5722] hover:text-white active:scale-95 text-[#1a1a1a] font-heading font-black text-xs uppercase tracking-wider rounded-lg border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[1px_1px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <span>Claim It / View Item</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: ISO (IN SEARCH OF) BOARD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'iso' && (
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 flex-1">
          {/* ISO Board Hero Banner */}
          <section className="bg-gradient-to-r from-[#ffe600] via-[#00e599] to-[#70efde] border-2 border-[#1a1a1a] rounded-xl p-5 sm:p-7 shadow-[6px_6px_0px_0px_#1a1a1a] mb-8 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] mb-3 text-xs font-black uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-black" />
                <span>Campus Peer-to-Peer Beacons</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-[#1a1a1a] leading-tight">
                Can&apos;t find what you need? Post an ISO beacon!
              </h2>
              <p className="mt-2 text-sm sm:text-base font-semibold text-stone-900 leading-relaxed">
                Looking for 2nd-sem Physics notes, a specific lab coat size, or a missing drafter clamp? Broadcast your request here so seniors and peers can match with you instantly.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <button
                  onClick={handleOpenIsoModal}
                  className="bg-black text-white hover:bg-stone-800 active:scale-95 px-4 py-2 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-1.5 uppercase font-heading font-black cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Post an ISO Request</span>
                </button>
                <span className="bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-black flex items-center space-x-1">
                  <span>⚡ {isoRequests.length} Active Requests</span>
                </span>
              </div>
            </div>
          </section>

          {/* Search & Category Filter for ISO Board */}
          <section className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* ISO Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500 pointer-events-none" />
                <input
                  type="text"
                  value={isoSearchQuery}
                  onChange={e => setIsoSearchQuery(e.target.value)}
                  placeholder="Search student requests: notes, lab gear, calculators, breadboards..."
                  className="w-full pl-12 pr-10 py-3.5 bg-white border-2 border-[#1a1a1a] rounded-xl text-sm font-semibold text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff5722] shadow-[3px_3px_0px_0px_#1a1a1a] transition-all"
                />
                {isoSearchQuery && (
                  <button
                    onClick={() => setIsoSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1a1a1a] p-1 cursor-pointer"
                    aria-label="Clear search text"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Secondary Post ISO Action Button */}
              <button
                onClick={handleOpenIsoModal}
                className="px-5 py-3.5 bg-[#ffe600] hover:bg-[#fed000] active:scale-95 text-black font-heading font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Post an ISO Request</span>
              </button>
            </div>

            {/* Category Pills for ISO Board */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500 mr-1 flex items-center space-x-1 flex-shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Category:</span>
              </span>

              {['All', 'Books', 'Electronics', 'Lab Gear', 'Stationery'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setIsoSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full font-heading font-black text-xs tracking-wide uppercase border-2 border-[#1a1a1a] transition-all flex-shrink-0 cursor-pointer ${
                    isoSelectedCategory === cat
                      ? 'bg-[#1a1a1a] text-white shadow-[3px_3px_0px_0px_#ffe600]'
                      : 'bg-white hover:bg-stone-100 text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Results Counter */}
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-xs font-black uppercase tracking-wider text-stone-600">
              Showing {filteredIsoList.length} {filteredIsoList.length === 1 ? 'student request' : 'student requests'}
            </p>
            {(isoSearchQuery || isoSelectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setIsoSearchQuery('');
                  setIsoSelectedCategory('All');
                }}
                className="text-xs font-bold text-[#ff5722] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Empty State */}
          {filteredIsoList.length === 0 && (
            <div className="bg-white border-2 border-[#1a1a1a] rounded-xl p-10 text-center shadow-[4px_4px_0px_0px_#1a1a1a] my-8">
              <div className="w-16 h-16 bg-[#ffe600] rounded-full border-2 border-[#1a1a1a] flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_#1a1a1a]">
                <Compass className="w-8 h-8 text-[#1a1a1a]" />
              </div>
              <h3 className="font-heading text-xl font-black text-[#1a1a1a]">
                No ISO requests match your search
              </h3>
              <p className="text-sm font-medium text-stone-600 max-w-md mx-auto mt-2">
                Need something specific that isn&apos;t listed yet? Be the first to post an ISO request!
              </p>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setIsoSearchQuery('');
                    setIsoSelectedCategory('All');
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border-2 border-[#1a1a1a] rounded-lg text-xs font-bold uppercase cursor-pointer"
                >
                  Clear search
                </button>
                <button
                  onClick={handleOpenIsoModal}
                  className="px-4 py-2 bg-[#ff5722] text-white border-2 border-[#1a1a1a] rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_0px_#1a1a1a] cursor-pointer"
                >
                  Post this request
                </button>
              </div>
            </div>
          )}

          {/* ISO Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIsoList.map(req => {
              const isMatched = matchedIsoIds.has(req.id);
              const urgencyMeta =
                req.urgency === 'Urgent'
                  ? { bg: 'bg-rose-100 text-rose-950 border-rose-900', icon: Flame }
                  : req.urgency === 'This Week'
                  ? { bg: 'bg-amber-100 text-amber-950 border-amber-900', icon: Zap }
                  : { bg: 'bg-emerald-100 text-emerald-950 border-emerald-900', icon: Clock };
              const UrgencyIcon = urgencyMeta.icon;

              return (
                <article
                  key={req.id}
                  className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Pill Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider bg-[#ffe600] px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        {req.category}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border flex items-center space-x-1 ${urgencyMeta.bg}`}
                      >
                        <UrgencyIcon className="w-3 h-3 flex-shrink-0" />
                        <span>{req.urgency}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-black text-lg text-black leading-snug">
                      {req.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-xs font-medium text-stone-700 leading-relaxed">
                      {req.description}
                    </p>

                    {/* Offering / Barter Note */}
                    {req.offeringNote && (
                      <div className="mt-3 bg-amber-50 p-2.5 rounded-lg border border-amber-300 text-xs font-semibold text-amber-950 flex items-start space-x-2">
                        <Gift className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-bold">Offering:</strong> {req.offeringNote}
                        </span>
                      </div>
                    )}

                    {/* Requester Profile */}
                    <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <div className="w-7 h-7 rounded-full bg-[#00e599] border-2 border-black flex items-center justify-center font-black text-xs text-black">
                          {req.requesterName.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="font-black text-black leading-tight truncate">
                            {req.requesterName}
                          </p>
                          <p className="text-[10px] text-stone-500 font-semibold leading-tight truncate">
                            {req.requesterHostel || 'Campus Hostel'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-500 font-bold flex items-center space-x-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{req.postedAt}</span>
                      </span>
                    </div>
                  </div>

                  {/* Primary Action Button: "I Have This!" */}
                  <div className="mt-5 pt-2">
                    {isMatched ? (
                      <button
                        type="button"
                        onClick={() => handleIHaveThis(req)}
                        className="w-full py-2.5 px-4 bg-emerald-50 text-emerald-950 font-heading font-black text-xs uppercase tracking-wider rounded-lg border-2 border-emerald-900 shadow-[2px_2px_0px_0px_#065f46] flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3] text-emerald-700" />
                        <span>Matched! Click to Re-notify</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleIHaveThis(req)}
                        className="w-full py-3 px-4 bg-[#00e599] hover:bg-[#00cf8a] active:scale-95 text-black font-heading font-black text-xs uppercase tracking-wider rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <HeartHandshake className="w-4 h-4 text-black stroke-[2.5]" />
                        <span>I Have This!</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FEATURE 1: VIEW 3: "MY LISTINGS" & PROFILE TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'profile' && (
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 flex-1">
          {/* User Profile Overview Card */}
          <section className="bg-white border-2 border-black rounded-2xl p-6 sm:p-7 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-[#ff5722] text-white border-2 border-black flex items-center justify-center font-heading font-black text-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                {studentDisplayName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h2 className="font-heading font-black text-2xl text-black">
                    {studentDisplayName}
                  </h2>
                  <span className="text-[11px] font-black uppercase tracking-wider bg-[#00e599] text-black px-2.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    Verified Student ID
                  </span>
                </div>
                <p className="text-sm font-semibold text-stone-600 mt-0.5">
                  {currentUserEmail}
                </p>
                <p className="text-xs font-bold text-stone-500 mt-1">
                  🎓 Campus Peer Community &bull; Zero Scalper Zone
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-[#fdfbf7] p-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="block font-heading font-black text-xl text-black">
                  {userItems.length}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-600">
                  My Items
                </span>
              </div>
              <div className="bg-[#fdfbf7] p-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="block font-heading font-black text-xl text-black">
                  {userIsoRequests.length}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-600">
                  My ISOs
                </span>
              </div>
              <div className="bg-[#fdfbf7] p-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="block font-heading font-black text-xl text-emerald-700">
                  {userItems.filter(i => i.price === 'Free').length}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-600">
                  Giveaways
                </span>
              </div>
            </div>
          </section>

          {/* Section 1: My Marketplace Items */}
          <section className="space-y-4 mb-10">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-[#ff5722]" />
                <h3 className="font-heading font-black text-xl text-black">
                  My Marketplace Listings ({userItems.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleOpenListModal}
                className="px-3.5 py-1.5 bg-[#00e599] hover:bg-[#00cf8a] active:scale-95 text-black font-heading font-black text-xs uppercase tracking-wider rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>List Another Item</span>
              </button>
            </div>

            {/* Empty State for User Listings */}
            {userItems.length === 0 ? (
              <div className="bg-white border-2 border-black rounded-2xl p-8 sm:p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] my-4">
                <div className="w-16 h-16 bg-[#ffe600] rounded-full border-2 border-black flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Package className="w-8 h-8 text-black" />
                </div>
                <h4 className="font-heading text-xl font-black text-black">
                  You haven&apos;t passed anything down yet.
                </h4>
                <p className="text-sm font-medium text-stone-600 max-w-md mx-auto mt-2 leading-relaxed">
                  Time to clear out your shelf! That 1st-year drafter, unused textbook, or lab coat will make a junior&apos;s semester much easier.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleOpenListModal}
                    className="px-6 py-3 bg-[#ff5722] hover:bg-[#f4511e] active:scale-95 text-white font-heading font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] inline-flex items-center space-x-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>List Your First Item</span>
                  </button>
                </div>
              </div>
            ) : (
              /* User Listings Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userItems.map(item => (
                  <article
                    key={item.id}
                    className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
                  >
                    <div>
                      {/* Image with status badge */}
                      <div className="relative h-44 w-full bg-stone-100 border-b-2 border-black">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className={`w-full h-full object-cover ${
                            item.status === 'sold' ? 'grayscale contrast-125 opacity-75' : ''
                          }`}
                        />
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            {item.category}
                          </span>
                        </div>
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <span className="text-xs font-black bg-[#ffe600] px-2.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 z-10">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-black ${
                              item.status === 'available'
                                ? 'bg-[#00e599] text-black'
                                : item.status === 'reserved'
                                ? 'bg-yellow-300 text-black'
                                : 'bg-rose-500 text-white'
                            }`}
                          >
                            Status: {item.status}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-heading font-black text-base text-black line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs font-medium text-stone-600 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                        <p className="text-[11px] font-bold text-stone-500">
                          📍 Spot: {item.meetingSpot || 'Library Handover'}
                        </p>
                      </div>
                    </div>

                    {/* Management Controls */}
                    <div className="p-4 pt-0 space-y-2.5 border-t border-stone-100 mt-2">
                      <div className="pt-2">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5">
                          Change Listing Status:
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, 'available')}
                            className={`py-1.5 px-1 rounded-lg border-2 border-black font-heading font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                              item.status === 'available'
                                ? 'bg-[#00e599] text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                            }`}
                          >
                            🟢 Avail
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, 'reserved')}
                            className={`py-1.5 px-1 rounded-lg border-2 border-black font-heading font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                              item.status === 'reserved'
                                ? 'bg-yellow-300 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                            }`}
                          >
                            🟡 Rsrv
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, 'sold')}
                            className={`py-1.5 px-1 rounded-lg border-2 border-black font-heading font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                              item.status === 'sold'
                                ? 'bg-rose-500 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                            }`}
                          >
                            🔴 Sold
                          </button>
                        </div>
                      </div>

                      {/* Delete Listing Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id, item.title)}
                        className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-900 font-heading font-black text-xs uppercase tracking-wider rounded-lg border-2 border-rose-900 shadow-[2px_2px_0px_0px_#881337] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                        <span>Delete Listing</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: My ISO Requests */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-[#ffe600]" />
                <h3 className="font-heading font-black text-xl text-black">
                  My ISO Requests ({userIsoRequests.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleOpenIsoModal}
                className="px-3.5 py-1.5 bg-[#ffe600] hover:bg-[#fed000] active:scale-95 text-black font-heading font-black text-xs uppercase tracking-wider rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Post New ISO</span>
              </button>
            </div>

            {userIsoRequests.length === 0 ? (
              <div className="bg-white border-2 border-black rounded-xl p-6 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xs font-bold text-stone-600">
                  No active ISO requests. Looking for course materials or components? Post a request!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userIsoRequests.map(req => (
                  <div
                    key={req.id}
                    className="bg-white border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase bg-[#ffe600] px-2 py-0.5 rounded border border-black">
                          {req.category}
                        </span>
                        <span className="text-[10px] font-black uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-black">
                          {req.urgency}
                        </span>
                      </div>
                      <h4 className="font-heading font-black text-sm text-black">
                        {req.title}
                      </h4>
                      <p className="text-xs font-medium text-stone-600 mt-1 line-clamp-2">
                        {req.description}
                      </p>
                      {req.offeringNote && (
                        <p className="text-[11px] font-bold text-amber-900 mt-1.5">
                          🎁 {req.offeringNote}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteIsoRequest(req.id, req.title)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-900 rounded-lg border-2 border-rose-900 shadow-[1px_1px_0px_0px_#881337] transition-all cursor-pointer flex-shrink-0"
                      title="Delete / Resolve ISO Request"
                    >
                      <Trash2 className="w-4 h-4 text-rose-700" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* ----------------------------------------------------------- */}
      {/* MODAL 1: ITEM DETAIL / CONTACT VIEW */}
      {/* ----------------------------------------------------------- */}
      {selectedItemForDetail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-modal-title"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setSelectedItemForDetail(null);
            }
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Modal Outer Container */}
          <div className="relative max-w-2xl w-full my-auto">
            {/* Prominent Quirky Brutalist Close Button */}
            <button
              type="button"
              onClick={() => setSelectedItemForDetail(null)}
              className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 z-50 p-2.5 sm:p-3 bg-white hover:bg-[#ffe600] active:scale-95 text-black rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center cursor-pointer group"
              aria-label="Close item detail view and return to main feed"
              title="Close (Return to feed)"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3] text-black group-hover:rotate-90 transition-transform duration-200" />
            </button>

            {/* Modal Card */}
            <div className="bg-[#fdfbf7] border-2 border-[#1a1a1a] rounded-2xl w-full shadow-[8px_8px_0px_0px_#1a1a1a] overflow-hidden relative">
              {/* Modal Image Header */}
              <div className="relative h-64 sm:h-72 w-full bg-stone-900 border-b-2 border-[#1a1a1a]">
                <img
                  src={selectedItemForDetail.imageUrl}
                  alt={selectedItemForDetail.title}
                  className={`w-full h-full object-cover ${
                    selectedItemForDetail.status === 'sold' ? 'grayscale contrast-125 opacity-75' : ''
                  }`}
                />

                {/* Heavy Tilted "SOLD OUT" Stamp in Detail Header */}
                {selectedItemForDetail.status === 'sold' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/30">
                    <span className="font-heading font-black text-2xl uppercase tracking-widest text-white bg-rose-600 px-6 py-2 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-12 animate-pulse">
                      SOLD OUT
                    </span>
                  </div>
                )}

                {/* Yellow "RESERVED" Banner */}
                {selectedItemForDetail.status === 'reserved' && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                    <span className="text-xs font-black uppercase tracking-wider bg-yellow-300 text-black px-3.5 py-1 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      ⚠️ RESERVED
                    </span>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 z-10">
                  <span className="text-xs font-black uppercase tracking-wider bg-white px-3 py-1 rounded border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
                    {selectedItemForDetail.category}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider bg-[#ffe600] px-3 py-1 rounded border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
                    {selectedItemForDetail.condition}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h2
                      id="detail-modal-title"
                      className="font-heading text-2xl sm:text-3xl font-black text-[#1a1a1a] leading-tight"
                    >
                      {selectedItemForDetail.title}
                    </h2>
                    <p className="text-xs text-stone-500 font-bold mt-1">
                      Listed {selectedItemForDetail.postedAt} &bull; Campus Handover Only
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {selectedItemForDetail.price === 'Free' ? (
                      <span className="text-base font-black uppercase tracking-wider bg-[#00e599] text-[#1a1a1a] px-4 py-2 rounded-lg border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] inline-flex items-center space-x-1.5">
                        <Gift className="w-4 h-4" />
                        <span>FREE GIVEAWAY</span>
                      </span>
                    ) : (
                      <span className="text-xl font-heading font-black bg-[#ffe600] text-[#1a1a1a] px-4 py-2 rounded-lg border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] inline-block">
                        {formatPrice(selectedItemForDetail.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white p-4 rounded-xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-500 mb-1">
                    Item Description &amp; History
                  </h4>
                  <p className="text-sm font-medium text-stone-800 leading-relaxed whitespace-pre-line">
                    {selectedItemForDetail.description}
                  </p>
                  {selectedItemForDetail.handoverNotes && (
                    <p className="text-xs font-bold text-stone-600 mt-3 pt-3 border-t border-stone-200">
                      💡 <span className="underline">Seller Note:</span> {selectedItemForDetail.handoverNotes}
                    </p>
                  )}
                </div>

                {/* Verified Seller Box with Lightweight Trust Score */}
                <div className="bg-amber-50/80 p-4 rounded-xl border-2 border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#ff5722] text-white border-2 border-[#1a1a1a] flex items-center justify-center font-black text-sm">
                      {selectedItemForDetail.sellerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-heading font-black text-sm text-[#1a1a1a]">
                          {selectedItemForDetail.sellerName}
                        </span>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-[11px] font-black bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-1">
                          <span>{selectedItemForDetail.sellerTrust || '👍 12 Swaps'}</span>
                        </span>
                      </div>
                      <span className="text-xs text-stone-600 font-semibold">
                        {selectedItemForDetail.sellerEmail}
                      </span>
                      {selectedItemForDetail.sellerHostel && (
                        <p className="text-[11px] text-stone-500 font-bold">
                          🏠 {selectedItemForDetail.sellerHostel}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-bold text-stone-600 bg-white px-3 py-1.5 rounded-lg border border-[#1a1a1a] flex items-center space-x-1.5 self-start sm:self-auto">
                    <MapPin className="w-3.5 h-3.5 text-[#ff5722]" />
                    <span>Spot: {selectedItemForDetail.meetingSpot || 'Library Ground Floor'}</span>
                  </div>
                </div>

                {/* Seller Simulation Controls (Available / Reserved / Sold) */}
                <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-950 px-2 py-0.5 rounded border border-black">
                        Seller Controls
                      </span>
                      <span className="text-xs font-bold text-stone-600">Simulate status change:</span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-wide">
                      Current:{' '}
                      <span
                        className={`px-2 py-0.5 rounded border border-black text-[11px] ${
                          selectedItemForDetail.status === 'available'
                            ? 'bg-[#00e599] text-black'
                            : selectedItemForDetail.status === 'reserved'
                            ? 'bg-yellow-300 text-black'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {selectedItemForDetail.status}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedItemForDetail.id, 'available')}
                      className={`py-2 px-2 rounded-lg border-2 border-black font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                        selectedItemForDetail.status === 'available'
                          ? 'bg-[#00e599] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]'
                          : 'bg-white hover:bg-stone-100 text-stone-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:scale-95'
                      }`}
                    >
                      <span>🟢 Available</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedItemForDetail.id, 'reserved')}
                      className={`py-2 px-2 rounded-lg border-2 border-black font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                        selectedItemForDetail.status === 'reserved'
                          ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]'
                          : 'bg-white hover:bg-stone-100 text-stone-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:scale-95'
                      }`}
                    >
                      <span>🟡 Reserved</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedItemForDetail.id, 'sold')}
                      className={`py-2 px-2 rounded-lg border-2 border-black font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                        selectedItemForDetail.status === 'sold'
                          ? 'bg-rose-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]'
                          : 'bg-white hover:bg-stone-100 text-stone-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:scale-95'
                      }`}
                    >
                      <span>🔴 Sold Out</span>
                    </button>
                  </div>
                </div>

                {/* Meetup Zone Safety Banner */}
                <div className="bg-yellow-300 border-2 border-black rounded-xl p-3.5 sm:p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-start space-x-3">
                  <ShieldAlert className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <div className="text-xs font-bold text-black leading-relaxed">
                    Campus Vibe Check: Always meet in public, well-lit spots like the Central Library, Main Canteen, or Admin Block. Never transfer money before inspecting the item.
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="space-y-3 pt-1">
                  {/* Conditional "Vouch for Seller" button when Sold */}
                  {selectedItemForDetail.status === 'sold' && (
                    <button
                      type="button"
                      onClick={() => handleVouchForSeller(selectedItemForDetail)}
                      className="w-full py-3.5 px-4 bg-[#00e599] hover:bg-[#00cf8a] active:scale-95 text-black font-heading font-black text-sm uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <ThumbsUp className="w-4 h-4 text-black stroke-[3]" />
                      <span>Vouch for Seller (+1 Trust Rating)</span>
                    </button>
                  )}

                  {/* Main Contact Button: Launches In-App Chat Drawer */}
                  {selectedItemForDetail.status === 'sold' ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-4 px-6 bg-stone-200 text-stone-500 font-heading font-black text-base uppercase tracking-wider rounded-xl border-2 border-stone-400 cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Lock className="w-5 h-5 text-stone-400" />
                      <span>Item Sold Out (Contact Disabled)</span>
                    </button>
                  ) : selectedItemForDetail.status === 'reserved' ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-4 px-6 bg-amber-100 text-amber-900 font-heading font-black text-base uppercase tracking-wider rounded-xl border-2 border-amber-400 cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Lock className="w-5 h-5 text-amber-800" />
                      <span>Item Reserved for Peer (Contact Paused)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedItemForDetail;
                        setSelectedItemForDetail(null);
                        handleOpenChatDrawer(target);
                      }}
                      className="w-full py-4 px-6 bg-[#ff5722] hover:bg-[#f4511e] active:scale-95 text-white font-heading font-black text-base uppercase tracking-wider rounded-xl border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] hover:shadow-[2px_2px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>Slide into DMs (Open Chat Drawer)</span>
                    </button>
                  )}

                  {/* Feature 2: Report Listing button in detail view */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleInitiateReport(selectedItemForDetail)}
                      className="text-xs font-bold text-stone-500 hover:text-rose-700 flex items-center space-x-1.5 cursor-pointer p-1"
                    >
                      <Flag className="w-3.5 h-3.5 text-stone-400 hover:text-rose-600" />
                      <span>Report listing for spam or guideline violation</span>
                    </button>
                  </div>

                  {/* Secondary Return to Campus Feed button */}
                  <button
                    type="button"
                    onClick={() => setSelectedItemForDetail(null)}
                    className="w-full py-3 px-4 bg-white hover:bg-stone-100 active:scale-95 text-[#1a1a1a] font-heading font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                    <span>Close &amp; Return to Campus Feed</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* FEATURE 2 MODAL: REPORT CONFIRMATION DIALOG */}
      {/* ----------------------------------------------------------- */}
      {itemPendingReport && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#fdfbf7] border-2 border-black rounded-2xl max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden my-auto relative">
            <div className="bg-rose-500 text-white border-b-2 border-black p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flag className="w-5 h-5" />
                <h3 id="report-modal-title" className="font-heading font-black text-lg text-white">
                  Report Listing
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setItemPendingReport(null)}
                className="p-1.5 bg-white text-black rounded-full border border-black cursor-pointer"
                aria-label="Close report dialog"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm font-bold text-black leading-snug">
                Report this item for spam or inappropriate content?
              </p>

              {/* Item Card preview */}
              <div className="bg-white p-3 rounded-xl border-2 border-black text-xs flex items-center space-x-3">
                <img
                  src={itemPendingReport.imageUrl}
                  alt={itemPendingReport.title}
                  className="w-12 h-12 rounded-lg object-cover border border-black flex-shrink-0"
                />
                <div className="truncate">
                  <p className="font-black text-black truncate">{itemPendingReport.title}</p>
                  <p className="text-[11px] text-stone-500 font-semibold truncate">
                    Seller: {itemPendingReport.sellerName}
                  </p>
                </div>
              </div>

              {/* Select Reason */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Select Violation Reason:
                </label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Spam or commercial scalper">Commercial scalper / Unaffiliated spam</option>
                  <option value="Inappropriate content">Inappropriate / Non-campus content</option>
                  <option value="Misleading item / Counterfeit">Misleading description / Broken item</option>
                  <option value="Overpricing violation">Overpriced syllabus material</option>
                </select>
              </div>

              <p className="text-[11px] text-stone-500 font-medium">
                Confirming will immediately hide this listing from your feed and flag it for campus moderators.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setItemPendingReport(null)}
                  className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs uppercase rounded-lg border-2 border-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmReport(itemPendingReport)}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-heading font-black text-xs uppercase tracking-wider rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Confirm Report &amp; Hide</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* INTEGRATED IN-APP CHAT DRAWER */}
      {/* ----------------------------------------------------------- */}
      {activeChatItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Chat with ${activeChatItem.sellerName} regarding ${activeChatItem.title}`}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setActiveChatItem(null);
            }
          }}
        >
          {/* Slide-over Drawer Panel */}
          <div className="w-full max-w-lg bg-[#fdfbf7] h-full border-l-3 border-black shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="bg-white border-b-2 border-black p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#ff5722] text-white border-2 border-black flex items-center justify-center font-black text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {activeChatItem.sellerName.charAt(0)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00e599] border-2 border-black" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-heading font-black text-base text-black">
                        {activeChatItem.sellerName}
                      </h3>
                      <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-950 px-1.5 py-0.5 rounded border border-black">
                        {activeChatItem.sellerTrust}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-bold">
                      {activeChatItem.sellerHostel || 'Campus Hostel'} &bull; Online Now
                    </p>
                  </div>
                </div>

                {/* Close Drawer Button */}
                <button
                  type="button"
                  onClick={() => setActiveChatItem(null)}
                  className="p-2 bg-stone-100 hover:bg-[#ffe600] active:scale-95 text-black rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  aria-label="Close in-app chat drawer"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Pinned Item Summary Bar */}
              <div className="bg-[#fdfbf7] p-2.5 rounded-xl border-2 border-black flex items-center justify-between gap-3 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center space-x-2.5 truncate">
                  <img
                    src={activeChatItem.imageUrl}
                    alt={activeChatItem.title}
                    className="w-11 h-11 rounded-lg object-cover border border-black flex-shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-xs font-black text-black truncate leading-tight">
                      {activeChatItem.title}
                    </p>
                    <p className="text-[10px] text-stone-600 font-semibold truncate mt-0.5">
                      📍 {activeChatItem.meetingSpot || 'Library Handover'}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {activeChatItem.price === 'Free' ? (
                    <span className="text-xs font-black uppercase bg-[#00e599] px-2 py-1 rounded border border-black">
                      FREE!
                    </span>
                  ) : (
                    <span className="text-xs font-black bg-[#ffe600] px-2 py-1 rounded border border-black">
                      {formatPrice(activeChatItem.price)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fdfbf7]">
              {/* Vibe check notice */}
              <div className="text-center my-1">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-yellow-200 text-stone-900 px-3 py-1 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  🔒 Campus Encrypted • Verified Students Only
                </span>
              </div>

              {(chatThreads[activeChatItem.id] || []).map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl border-2 border-black text-xs font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] leading-relaxed ${
                      msg.sender === 'me'
                        ? 'bg-[#ffe600] text-black rounded-tr-none'
                        : 'bg-white text-stone-900 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-bold text-stone-400 mt-1 px-1">
                    {msg.sender === 'me' ? 'You' : activeChatItem.sellerName} &bull; {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {isSellerTyping && (
                <div className="flex flex-col items-start animate-fade-in">
                  <div className="bg-white border-2 border-black rounded-2xl rounded-tl-none p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-stone-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-stone-500 animate-bounce delay-100" />
                    <span className="w-2 h-2 rounded-full bg-stone-500 animate-bounce delay-200" />
                    <span className="text-[10px] font-bold text-stone-500 ml-1.5">
                      {activeChatItem.sellerName} is typing...
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatMessagesEndRef} />
            </div>

            {/* Quick Chips & Chat Input Footer */}
            <div className="bg-white border-t-2 border-black p-3.5 space-y-2.5">
              {/* Quick Tap Chips */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-black uppercase text-stone-400 flex-shrink-0">
                  Quick tap:
                </span>
                {[
                  'Is this still available?',
                  'Can we meet at library today?',
                  'Can you do ₹50 less?',
                  'What is the exact condition?',
                ].map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSendChatMessage(prompt)}
                    className="text-[11px] font-bold bg-[#fdfbf7] hover:bg-[#ffe600] text-black px-2.5 py-1 rounded-full border border-black flex-shrink-0 transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input & Send Form */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={chatInputText}
                  onChange={e => setChatInputText(e.target.value)}
                  placeholder={`Message ${activeChatItem.sellerName}...`}
                  className="flex-1 bg-[#fdfbf7] border-2 border-black rounded-xl px-3.5 py-2.5 text-xs font-semibold text-black placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                />
                <button
                  type="submit"
                  disabled={!chatInputText.trim() || isSellerTyping}
                  className="p-2.5 bg-[#ff5722] hover:bg-[#f4511e] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* MODAL 2: LIST AN ITEM / "PASS IT ON" FORM (MARKETPLACE) */}
      {/* ----------------------------------------------------------- */}
      {isListingModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="list-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#fdfbf7] border-2 border-[#1a1a1a] rounded-2xl max-w-xl w-full shadow-[8px_8px_0px_0px_#1a1a1a] overflow-hidden my-8 relative">
            {/* Header */}
            <div className="bg-white border-b-2 border-[#1a1a1a] p-5 sm:p-6 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#ff5722] bg-amber-100 px-2 py-0.5 rounded border border-[#1a1a1a]">
                  Pass it on to a junior
                </span>
                <h2 id="list-modal-title" className="font-heading text-2xl font-black text-[#1a1a1a] mt-1">
                  List Item on CampusBarter
                </h2>
              </div>
              <button
                onClick={() => setIsListingModalOpen(false)}
                className="p-2 bg-stone-100 hover:bg-stone-200 text-[#1a1a1a] rounded-full border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] cursor-pointer"
                aria-label="Close listing form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePostItem} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div role="alert" className="p-3 bg-rose-50 border-2 border-rose-900 rounded-lg text-xs font-bold text-rose-900 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Item Title */}
              <div>
                <label htmlFor={titleInputId} className="block text-xs font-black uppercase tracking-wider text-[#1a1a1a] mb-1">
                  Item Title *
                </label>
                <input
                  id={titleInputId}
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Casio fx-991EX Calculator / 2nd Year Mechanical Drafter"
                  className="w-full bg-white border-2 border-[#1a1a1a] rounded-lg px-3.5 py-2.5 text-sm font-semibold text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                />
              </div>

              {/* 2. Description */}
              <div>
                <label htmlFor={descInputId} className="block text-xs font-black uppercase tracking-wider text-[#1a1a1a] mb-1">
                  Description &amp; Condition Notes *
                </label>
                <textarea
                  id={descInputId}
                  required
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="e.g. Barely used during 1st sem graphics labs. Comes with carrying case, clamp, and spare ruler."
                  className="w-full bg-white border-2 border-[#1a1a1a] rounded-lg px-3.5 py-2.5 text-sm font-semibold text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                />
              </div>

              {/* 3. Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={categorySelectId} className="block text-xs font-black uppercase tracking-wider text-[#1a1a1a] mb-1">
                    Category *
                  </label>
                  <select
                    id={categorySelectId}
                    name="category"
                    value={newCategory}
                    onChange={e => {
                      const cat = e.target.value as ItemCategory;
                      setNewCategory(cat);
                      const preset = PRESET_PHOTOS.find(p => p.category === cat);
                      if (preset) setSelectedImageUrl(preset.url);
                    }}
                    className="w-full bg-white border-2 border-[#1a1a1a] rounded-lg px-3.5 py-2.5 text-sm font-bold text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={conditionSelectId} className="block text-xs font-black uppercase tracking-wider text-[#1a1a1a] mb-1">
                    Condition *
                  </label>
                  <select
                    id={conditionSelectId}
                    name="condition"
                    value={newCondition}
                    onChange={e => setNewCondition(e.target.value as ItemCondition)}
                    className="w-full bg-white border-2 border-[#1a1a1a] rounded-lg px-3.5 py-2.5 text-sm font-bold text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                  >
                    {CONDITIONS.map(c => (
                      <option key={c.label} value={c.label}>
                        {c.label} ({c.desc})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Price & Free Checkbox */}
              <div className="bg-white p-3.5 rounded-xl border-2 border-[#1a1a1a]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label htmlFor={priceInputId} className="block text-xs font-black uppercase tracking-wider text-[#1a1a1a] mb-1">
                      Asking Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-500">
                        ₹
                      </span>
                      <input
                        id={priceInputId}
                        type="number"
                        min="0"
                        step="10"
                        disabled={isGivingFree}
                        value={isGivingFree ? '0' : newPrice}
                        onChange={e => setNewPrice(e.target.value)}
                        placeholder="350"
                        className={`w-full pl-8 pr-3.5 py-2 border-2 border-[#1a1a1a] rounded-lg text-sm font-bold text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#ff5722] ${
                          isGivingFree ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Free Checkbox */}
                  <div className="flex items-center space-x-2.5 sm:mt-5 bg-emerald-50 p-2.5 rounded-lg border border-emerald-800">
                    <input
                      id={freeCheckboxId}
                      type="checkbox"
                      checked={isGivingFree}
                      onChange={e => {
                        setIsGivingFree(e.target.checked);
                        if (e.target.checked) setNewPrice('');
                      }}
                      className="w-4 h-4 text-emerald-600 rounded border-2 border-[#1a1a1a] focus:ring-[#00e599] cursor-pointer"
                    />
                    <label htmlFor={freeCheckboxId} className="text-xs font-black text-emerald-950 cursor-pointer select-none">
                      Giving it away for free / Donation
                    </label>
                  </div>
                </div>
              </div>

              {/* 5. Preferred Meetup Spot */}
              <div>
                <label htmlFor={meetingSpotInputId} className="block text-xs font-black uppercase tracking-wider text-[#1a1a1a] mb-1">
                  Preferred Handover Spot on Campus
                </label>
                <input
                  id={meetingSpotInputId}
                  type="text"
                  value={newMeetingSpot}
                  onChange={e => setNewMeetingSpot(e.target.value)}
                  placeholder="e.g. Library porch, SAC Nescafe, or Hostel 4 common room"
                  className="w-full bg-white border-2 border-[#1a1a1a] rounded-lg px-3.5 py-2.5 text-sm font-semibold text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                />
              </div>

              {/* 6. Photo Selection */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#1a1a1a] mb-1.5">
                  Select Photo Preset or Custom URL
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {PRESET_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedImageUrl(preset.url);
                        setCustomImageUrl('');
                      }}
                      className={`relative h-16 rounded-lg overflow-hidden border-2 text-left transition-all cursor-pointer ${
                        selectedImageUrl === preset.url && !customImageUrl
                          ? 'border-[#ff5722] ring-2 ring-[#ff5722] shadow-[2px_2px_0px_0px_#1a1a1a]'
                          : 'border-[#1a1a1a] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/40 flex items-end p-1 text-[9px] font-black text-white truncate">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  value={customImageUrl}
                  onChange={e => setCustomImageUrl(e.target.value)}
                  placeholder="Or paste an Unsplash / direct image URL..."
                  className="w-full bg-white border-2 border-[#1a1a1a] rounded-lg px-3 py-2 text-xs font-medium text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsListingModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border-2 border-[#1a1a1a] text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#ff5722] hover:bg-[#f4511e] active:scale-95 text-white font-heading font-black text-xs uppercase tracking-wider rounded-lg border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[1px_1px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                >
                  Post Item to Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* MODAL 3: "POST AN ISO REQUEST" */}
      {/* ----------------------------------------------------------- */}
      {isIsoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="iso-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#fdfbf7] border-2 border-black rounded-2xl max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden my-8 relative">
            {/* Header */}
            <div className="bg-[#ffe600] border-b-2 border-black p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                  Campus ISO Beacon
                </span>
                <h2 id="iso-modal-title" className="font-heading text-2xl font-black text-black mt-1">
                  Post an ISO Request
                </h2>
                <p className="text-xs text-stone-800 font-semibold mt-0.5">
                  Let campus know what you desperately need
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsIsoModalOpen(false)}
                className="p-2 bg-white hover:bg-stone-100 active:scale-95 text-black rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                aria-label="Close ISO request form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePostIsoRequest} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {isoFormError && (
                <div role="alert" className="p-3 bg-rose-50 border-2 border-rose-900 rounded-lg text-xs font-bold text-rose-900 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{isoFormError}</span>
                </div>
              )}

              {/* 1. Item Name */}
              <div>
                <label htmlFor={isoTitleInputId} className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                  Item Name / What are you looking for? *
                </label>
                <input
                  id={isoTitleInputId}
                  type="text"
                  required
                  value={newIsoTitle}
                  onChange={e => setNewIsoTitle(e.target.value)}
                  placeholder="e.g. 2nd Sem Physics Notes / Size M Lab Coat / Mini Drafter Clamp"
                  className="w-full bg-white border-2 border-black rounded-lg px-3.5 py-2.5 text-sm font-semibold text-black placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                />
              </div>

              {/* 2. Category & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={isoCategorySelectId} className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                    Category *
                  </label>
                  <select
                    id={isoCategorySelectId}
                    value={newIsoCategory}
                    onChange={e => setNewIsoCategory(e.target.value as ItemCategory)}
                    className="w-full bg-white border-2 border-black rounded-lg px-3.5 py-2.5 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={isoUrgencySelectId} className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                    Urgency Level *
                  </label>
                  <select
                    id={isoUrgencySelectId}
                    value={newIsoUrgency}
                    onChange={e => setNewIsoUrgency(e.target.value as 'Urgent' | 'This Week' | 'Flexible')}
                    className="w-full bg-white border-2 border-black rounded-lg px-3.5 py-2.5 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                  >
                    <option value="Urgent">🔥 Urgent (Exam / Lab in 24-48 hrs)</option>
                    <option value="This Week">⚡ This Week</option>
                    <option value="Flexible">🌱 Flexible (Sometime this sem)</option>
                  </select>
                </div>
              </div>

              {/* 3. Description */}
              <div>
                <label htmlFor={isoDescInputId} className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                  Description &amp; Syllabus / Spec Details *
                </label>
                <textarea
                  id={isoDescInputId}
                  required
                  rows={3}
                  value={newIsoDescription}
                  onChange={e => setNewIsoDescription(e.target.value)}
                  placeholder="e.g. Need handwritten notes covering Quantum Mechanics and Electromagnetics units for upcoming midterms."
                  className="w-full bg-white border-2 border-black rounded-lg px-3.5 py-2.5 text-sm font-semibold text-black placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                />
              </div>

              {/* 4. What you can offer */}
              <div>
                <label htmlFor={isoOfferingInputId} className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                  What you can offer / Barter deal (Optional)
                </label>
                <input
                  id={isoOfferingInputId}
                  type="text"
                  value={newIsoOffering}
                  onChange={e => setNewIsoOffering(e.target.value)}
                  placeholder="e.g. Budget ₹150, or will treat to canteen coffee & samosa, or swap with chem notes"
                  className="w-full bg-white border-2 border-black rounded-lg px-3.5 py-2.5 text-sm font-semibold text-black placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsIsoModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border-2 border-black text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#ff5722] hover:bg-[#f4511e] active:scale-95 text-white font-heading font-black text-xs uppercase tracking-wider rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                >
                  Publish ISO Beacon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline helper icon for handshake
function HeartHandshake(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
      <path d="m18 15-2-2" />
      <path d="m15 18-2-2" />
    </svg>
  );
}
