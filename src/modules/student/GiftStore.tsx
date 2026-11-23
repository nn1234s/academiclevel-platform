import React, { useState, useEffect } from 'react';
import { Learner, GiftRequest } from '../../core/types';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { ApiClient } from '../../core/api/apiClient';
import { QuotaService } from '../../services/quotaService';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import {
  Gift,
  Sparkles,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Truck,
  Mail,
  Phone,
  ArrowRight,
  TrendingUp,
  Tag,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Send,
  ShieldCheck,
  Award,
  MapPin,
  Package,
  Home,
  Eye,
  Star,
  Box,
  Info,
  X,
  Globe,
  Flame,
  FileText,
  Printer
} from 'lucide-react';
import { PracticeWorksheetViewer } from './PracticeWorksheetViewer';

interface GiftStoreProps {
  learner: Learner;
  onRefreshLearner: () => void;
  onNavigateToPremium?: () => void;
}

export interface SubmittedPhysicalClaimInfo {
  reqId: string;
  item: PhysicalRewardItem;
  recipientName: string;
  fullAddress: string;
  phone: string;
  coinsCost: number;
  targetEmail: string;
  mailSubject: string;
  mailBody: string;
  mailtoUrl: string;
}

export interface PhysicalRewardItem {
  id: string;
  name: string;
  category: 'PHYSICAL_MERCH';
  coinsCost: number;
  coinsCostFormatted: string;
  image: string;
  badge: string;
  gradient: string;
  description: string;
  popular?: boolean;
  requiredPlan?: 'LITE' | 'PLUS';
  specs: string[];
  features: string[];
  deliveryPartner?: string;
  deliveryTag?: string;
  originalPriceInr?: number;
  estimatedDelivery?: string;
}

export const PHYSICAL_REWARDS: PhysicalRewardItem[] = [
  {
    id: 'pokemon-stationery-set',
    name: 'Official Pokémon Licensed 11-Piece Stationery Set',
    category: 'PHYSICAL_MERCH',
    coinsCost: 25000,
    coinsCostFormatted: '25,000 Coins',
    image: '/rewards/pokemon-stationery-set.png',
    badge: '⚡ Official Pokémon Licensed (Lite & Plus Eligible)',
    gradient: 'from-blue-600 via-indigo-600 to-violet-700',
    description: 'Officially licensed Pokémon Sports Time complete 11-piece study stationery kit featuring Pikachu, Scorbunny, Sobble, Grookey, and Jigglypuff. Perfect for all school homework and creative writing tasks.',
    popular: true,
    requiredPlan: 'LITE',
    deliveryPartner: 'Amazon Logistics',
    deliveryTag: 'Delivered using Amazon',
    originalPriceInr: 499,
    estimatedDelivery: '3–5 Business Days',
    specs: ['11 Pcs Complete Set', '9 Smooth Writing Pens', '1 High-Quality Rubber', '1 Safety Sharpener', 'Amazon Doorstep Delivery'],
    features: [
      'Complete 11 pcs Stationery Set – 9 pens, 1 rubber, 1 sharpener included',
      'Smooth Writing Pens – Perfect for homework, school notes, and office tasks',
      'High-Quality Rubber – Erases cleanly without damaging paper',
      'Perfect for Kids & Students – Ideal for school, college, or home study',
      'Multi-Purpose Use – Suitable for school, office, drawing, and writing tasks',
      '100% Genuine Officially Licensed Pokémon merchandise delivered safely using Amazon'
    ]
  },
  {
    id: 'milk-squishy',
    name: 'Milk Bar Slow-Rising Sensory Squishy',
    category: 'PHYSICAL_MERCH',
    coinsCost: 26000,
    coinsCostFormatted: '26,000 Coins',
    image: '/rewards/milk-squishy.png',
    badge: '🥛 Sensory Focus Toy (Lite & Plus Eligible)',
    gradient: 'from-sky-500 via-blue-500 to-indigo-600',
    description: 'Ultra-soft slow-rising Japanese style milk block sensory squishy with cute embossed cartoon cow art. Relieves study stress, exam anxiety, and fidgeting during long study sessions.',
    popular: true,
    requiredPlan: 'LITE',
    deliveryPartner: 'Amazon Logistics',
    deliveryTag: 'Delivered using Amazon',
    originalPriceInr: 399,
    estimatedDelivery: '3–5 Business Days',
    specs: ['Super Slow-Rising PU Foam', 'Sweet Mild Scent', 'Pocket-Friendly Size', 'Tear-Resistant & Washable', 'Amazon Doorstep Delivery'],
    features: [
      'Super Slow-Rising PU Memory Foam – Slowly and gently returns to its original block shape',
      'Study Stress Relief – Relieves mental fatigue, tension, and fidgeting during homework',
      'Sensory Tactile Feel – Ultra-soft velvety skin with cute embossed cow graphic',
      'Child Safe & Non-Toxic – Eco-friendly, odorless PU material safe for everyday school use',
      'Pocket & Desk Size – Easily fits inside backpacks, pencil pouches, and study desks',
      'Delivered securely in damage-proof packaging using Amazon delivery network'
    ]
  },
  {
    id: 'cheese-squishy',
    name: 'Swiss Cheese Wedge Slow-Rising Squishy',
    category: 'PHYSICAL_MERCH',
    coinsCost: 26000,
    coinsCostFormatted: '26,000 Coins',
    image: '/rewards/cheese-squishy.png',
    badge: '🧀 Study Stress Reliever (Lite & Plus Eligible)',
    gradient: 'from-amber-400 via-yellow-500 to-orange-500',
    description: 'Fun realistic textured Swiss cheese wedge squishy toy with holes and tactile grip. Ultra-satisfying slow rebound that keeps hands busy and minds focused while studying.',
    popular: true,
    requiredPlan: 'LITE',
    deliveryPartner: 'Amazon Logistics',
    deliveryTag: 'Delivered using Amazon',
    originalPriceInr: 399,
    estimatedDelivery: '3–5 Business Days',
    specs: ['Realistic Swiss Cheese Texture', 'Slow Rebound Memory Foam', 'Non-Toxic & BPA Free', 'Ergonomic Palm Fit', 'Amazon Doorstep Delivery'],
    features: [
      'Realistic Swiss Cheese Holes – Textured surface provides stimulating tactile feedback',
      'Focus & Calming Tool – Great for ADHD, restlessness, and exam nervousness',
      'Durable Elastic Foam – Withstands thousands of repetitive high-pressure squeezes',
      'Ergonomic Palm Fit – Contoured wedge shape sits comfortably in young scholars hands',
      'Easy to Clean – Wipe with a damp cloth to keep fresh and pristine',
      'Delivered quickly and safely right to your doorstep using Amazon fulfillment'
    ]
  },
  {
    id: 'milton-costa-1000',
    name: 'Milton Costa 1000 PET Water Bottle',
    category: 'PHYSICAL_MERCH',
    coinsCost: 25000,
    coinsCostFormatted: '25,000 Coins',
    image: '/rewards/milton-costa-1000-bottle.png',
    badge: '🎒 Scholar Hydration (Lite & Plus Eligible)',
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    description: '1000ml authentic Milton Costa PET hydration bottle with lemon/mint infusion neck, crystal-clear food-grade body, and leak-proof stainless steel cap.',
    popular: true,
    requiredPlan: 'LITE',
    deliveryPartner: 'Amazon Logistics',
    deliveryTag: 'Delivered using Amazon',
    originalPriceInr: 299,
    estimatedDelivery: '3–5 Business Days',
    specs: ['1000 ml Capacity', 'BPA-Free Food Grade Body', 'Lemon/Herb Infusion Neck', 'Stainless Steel Leak-Proof Cap', 'Amazon Doorstep Delivery'],
    features: [
      '100% Food-Grade BPA-Free Material – Crystal-clear, odorless, and completely child-safe',
      'Flavor Infusion Neck – Built-in strainer for infusing fresh lemon, mint, or fruit slices',
      'Spill-Proof Stainless Steel Cap – Threaded seal prevents leaks inside school bags',
      'Ergonomic Scholar Grip – Lightweight design fits standard bicycle and backpack bottle holders',
      'Delivered safely to your doorstep using Amazon logistics'
    ]
  },
  {
    id: 'steel-water-bottle',
    name: 'Premium Insulated Stainless Steel Water Bottle',
    category: 'PHYSICAL_MERCH',
    coinsCost: 37500,
    coinsCostFormatted: '37,500 Coins',
    image: '/rewards/steel-water-bottle.jpg',
    badge: '🏆 Heavy Duty Thermos (Lite & Plus Eligible)',
    gradient: 'from-slate-700 via-zinc-600 to-slate-900',
    description: 'High-grade double-wall vacuum insulated stainless steel thermos bottle with durable braided carry loop. Keeps water icy cold or warm throughout school and study hours.',
    popular: true,
    requiredPlan: 'LITE',
    deliveryPartner: 'Amazon Logistics',
    deliveryTag: 'Delivered using Amazon',
    originalPriceInr: 899,
    estimatedDelivery: '3–5 Business Days',
    specs: ['Double-Wall Vacuum Insulation', 'SUS304 Stainless Steel', 'Heavy-Duty Carry Strap', 'Condensation-Free Finish', 'Amazon Doorstep Delivery'],
    features: [
      '24h Cold / 12h Hot Temperature Lock – Double-wall vacuum insulation maintains optimal temperature',
      'Pure SUS304 Stainless Steel – Rust-proof, toxin-free interior that never retains past flavors',
      'Heavy-Duty Braided Carry Strap – Easy to carry to school, tuition, sports, and outdoor camps',
      'Sweat-Proof Exterior – Powder-coated matte finish prevents condensation slips',
      'Shipped directly to your home using Amazon delivery network'
    ]
  },
  {
    id: 'nerf-blaster-gun',
    name: 'Hot Fire Rapid Foam Dart Blaster Gun',
    category: 'PHYSICAL_MERCH',
    coinsCost: 38500,
    coinsCostFormatted: '38,500 Coins',
    image: '/rewards/nerf-blaster-gun.jpg',
    badge: '🎯 Action & Recess Fun (Lite & Plus Eligible)',
    gradient: 'from-blue-600 via-cyan-600 to-blue-800',
    description: 'High-velocity Hot Fire foam dart blaster with 10 soft suction foam darts and dual-dart storage rail. High-precision pull-to-prime mechanism for safe, high-energy indoor and garden marksmanship practice.',
    popular: true,
    requiredPlan: 'LITE',
    deliveryPartner: 'Amazon Logistics',
    deliveryTag: 'Delivered using Amazon',
    originalPriceInr: 799,
    estimatedDelivery: '3–5 Business Days',
    specs: ['Hot Fire Blaster Unit', '10 Soft Suction Foam Darts', 'Under-Barrel Dart Storage', 'Up to 35ft Launch Range', 'Amazon Doorstep Delivery'],
    features: [
      'Child-Safe Suction Darts – Soft EVA foam darts stick safely to smooth targets, walls, and glass',
      'High-Power Spring Action – 100% mechanical manual pull-to-prime (no batteries ever needed)',
      'Dual-Dart Tactical Storage – Under-barrel clips hold spare darts for lightning-fast reloads',
      'Ergonomic Marksmanship Grip – Textured handle designed specifically for young champions',
      'Healthy Active Fun – Great for target shooting games and coordination between study breaks',
      'Delivered safely in sealed protective packaging using Amazon logistics'
    ]
  },
  {
    id: 'scholar-legend-badge',
    name: 'Official Pokémon Mewtwo Legend Button Pin Badge (58mm)',
    category: 'PHYSICAL_MERCH',
    coinsCost: 25000,
    coinsCostFormatted: '25,000 Coins',
    image: '/rewards/scholar-pin-badge.png',
    badge: '⚡ Legendary Mewtwo Pin (Lite & Plus Eligible)',
    gradient: 'from-purple-600 via-indigo-600 to-fuchsia-700',
    description: 'Collectible high-gloss button pin badge featuring the iconic Legendary Psychic Pokémon Mewtwo. Perfect for pinning on school backpacks, pencil pouches, jackets, or study display boards. High-gloss water-resistant finish with safety pin backing.',
    popular: true,
    requiredPlan: 'LITE',
    deliveryPartner: 'Amazon Logistics',
    deliveryTag: 'Delivered using Amazon',
    originalPriceInr: 149,
    estimatedDelivery: '3–5 Business Days',
    specs: ['58mm High-Gloss Round Button', 'Vibrant Mewtwo HD Print', 'Stainless Steel Safety Pin Back', 'Backpack, Pouch & Jacket Pin', 'Amazon Doorstep Delivery'],
    features: [
      'High-Gloss Finish – Vibrant, fade-resistant color print with protective clear laminate',
      'Sturdy Safety Pin Back – Secure stainless steel pin clips firmly onto school bags, pouches, or uniforms',
      'Legendary Mewtwo Psychic Artwork – Exclusive collectible pin featuring Mewtwo charging cosmic psychic energy',
      'Water & Scratch Resistant – Built for daily school wear, backpack adventures, and desk display',
      '58mm Perfect Diameter – Bold, eye-catching size that stands out on any bag or hoodie',
      '100% Doorstep Delivery – Shipped safely to your home using Amazon fulfillment network'
    ]
  },
  {
    id: 'mystery-gift-box',
    name: 'Mystery Scholar Surprise Gift Box (1 Physical Item)',
    category: 'PHYSICAL_MERCH',
    coinsCost: 30000,
    coinsCostFormatted: '30,000 Coins',
    image: '/rewards/mystery-gift-box.png',
    badge: '🎁 Mystery Surprise Crate (Lite & Plus Eligible)',
    gradient: 'from-amber-500 via-rose-500 to-indigo-600',
    description: 'The ultimate scholar unboxing surprise! Each Mystery Gift Box contains 1 guaranteed real physical reward chosen at random: Pokémon Trading Cards, Milton Hydration Bottles, Pokémon Stationery Set, Slow-Rising Squishies, Foam Blasters, or secret study gadgets. Note: There is 1 physical item per box, delivered directly to your doorstep via Amazon, Flipkart, or Meesho!',
    popular: true,
    requiredPlan: 'LITE',
    deliveryPartner: 'Amazon • Flipkart • Meesho Logistics',
    deliveryTag: 'Delivered via Amazon / Flipkart / Meesho',
    originalPriceInr: 499,
    estimatedDelivery: '3–5 Business Days',
    specs: [
      '1 Guaranteed Surprise Physical Item',
      'Potential: Pokémon Cards, Bottles, Squishies & Toys',
      'Doorstep Delivery via Amazon / Flipkart / Meesho',
      'Sealed Protective Unboxing Packaging',
      'Worldwide Home Address Eligible'
    ],
    features: [
      '1 Guaranteed Real Physical Item – Every mystery box contains 1 physical reward delivered straight to your door',
      'Exciting Unboxing Potential – You can get Pokémon cards, Milton water bottles, squishies, stationery, or action toys',
      'Multichannel Fast Delivery – Sourced and shipped quickly via Amazon, Flipkart, or Meesho courier networks',
      'Child-Safe & Tested Merchandise – High-quality study toys, hydration gear, and collectible school items',
      'Worldwide Doorstep Courier – Delivered directly to your verified residential address anywhere in the world',
      'Fair-Play Ledger Verified – Instant transaction receipt and live courier tracking from the admin team'
    ]
  }
];

export const GiftStore: React.FC<GiftStoreProps> = ({ learner, onRefreshLearner, onNavigateToPremium }) => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedVoucherId, setCopiedVoucherId] = useState<string | null>(null);

  // Physical Merchandise & International Worldwide Delivery States
  const [selectedPhysicalItem, setSelectedPhysicalItem] = useState<PhysicalRewardItem | null>(null);
  const [recipientCountry, setRecipientCountry] = useState<string>('India');
  const [customCountry, setCustomCountry] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>(learner.fullName || '');
  const [flatHouse, setFlatHouse] = useState<string>('');
  const [streetArea, setStreetArea] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [physicalPhone, setPhysicalPhone] = useState<string>(learner.phone || '');
  const [submittedPhysicalClaim, setSubmittedPhysicalClaim] = useState<SubmittedPhysicalClaimInfo | null>(null);
  const [copiedPhysicalEmailText, setCopiedPhysicalEmailText] = useState(false);
  const [previewProductItem, setPreviewProductItem] = useState<PhysicalRewardItem | null>(null);

  // Digital Study Power-Up States (Streak Freeze, Avatar Frames, Worksheets)
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState<boolean>(false);
  const [powerUpSuccess, setPowerUpSuccess] = useState<string>('');
  const [powerUpError, setPowerUpError] = useState<string>('');

  const isWorksheetUnlocked = typeof window !== 'undefined' && (
    localStorage.getItem(`al_unlocked_worksheets_${learner.id}`) === 'true' ||
    (learner.metadataJson && JSON.parse(learner.metadataJson || '{}').unlockedWorksheets)
  );

  const handleBuyStreakFreeze = () => {
    setPowerUpSuccess('');
    setPowerUpError('');
    const cost = 15;
    if (learner.coinBalance < cost) {
      setPowerUpError(`Insufficient coins. You have ${learner.coinBalance} coins, but 15 are required.`);
      return;
    }
    const tx = CoinLedgerService.appendTransaction(learner.id, -cost, 'MALL_PURCHASE', {
      item: 'STREAK_FREEZE_1X'
    });
    if (tx.success) {
      learner.streakFreezesAvailable = (learner.streakFreezesAvailable || 0) + 1;
      StorageRLSLayer.saveLearner(learner, learner.id);
      onRefreshLearner();
      setPowerUpSuccess('Streak Freeze purchased! Your study streak is protected for 1 missed day.');
    } else {
      setPowerUpError(tx.error || 'Transaction failed.');
    }
  };

  const handleBuyAvatarFrame = (frameName: string, cost: number) => {
    setPowerUpSuccess('');
    setPowerUpError('');
    if (learner.coinBalance < cost) {
      setPowerUpError(`Insufficient coins. You have ${learner.coinBalance} coins, but ${cost} are required.`);
      return;
    }
    const tx = CoinLedgerService.appendTransaction(learner.id, -cost, 'MALL_PURCHASE', {
      item: `AVATAR_FRAME_${frameName.toUpperCase()}`
    });
    if (tx.success) {
      learner.avatarFrame = frameName;
      StorageRLSLayer.saveLearner(learner, learner.id);
      onRefreshLearner();
      setPowerUpSuccess(`Equipped ${frameName} Avatar Frame!`);
    } else {
      setPowerUpError(tx.error || 'Transaction failed.');
    }
  };

  const handleUnlockWorksheets = () => {
    setPowerUpSuccess('');
    setPowerUpError('');
    if (learner.coinBalance < 30) {
      setPowerUpError(`Insufficient coins. You have ${learner.coinBalance} coins, but 30 coins are required for Practice Worksheets.`);
      return;
    }
    const tx = CoinLedgerService.appendTransaction(learner.id, -30, 'MALL_PURCHASE', {
      item: 'PRACTICE_WORKSHEETS_ALL_CLASSES'
    });
    if (tx.success) {
      localStorage.setItem(`al_unlocked_worksheets_${learner.id}`, 'true');
      onRefreshLearner();
      setPowerUpSuccess('🎉 Practice Worksheets unlocked for all classes! Opening your printable worksheet generator...');
      setIsWorksheetModalOpen(true);
    } else {
      setPowerUpError(tx.error || 'Transaction failed.');
    }
  };

  const handleCopyVoucher = (code: string, id: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedVoucherId(id);
      setTimeout(() => setCopiedVoucherId(null), 2500);
    } catch {}
  };

  const getVoucherDetails = (req: GiftRequest): string => {
    if (req.voucherCode) return req.voucherCode;
    const match = req.shippingAddress?.match(/Voucher Code:\s*([^\s|]+)/i);
    if (match && match[1]) return match[1];
    return 'AL-AMZ-READY-2026';
  };

  const getRedemptionHelp = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('amazon')) {
      return {
        url: 'https://www.amazon.in/addgiftcard',
        instructions: 'Open Amazon App → Amazon Pay → Add Gift Card to balance, paste code.'
      };
    }
    if (t.includes('google')) {
      return {
        url: 'https://play.google.com/redeem',
        instructions: 'Open Play Store → Top right profile icon → Payments & subscriptions → Redeem code.'
      };
    }
    if (t.includes('flipkart')) {
      return {
        url: 'https://www.flipkart.com',
        instructions: 'Open Flipkart App → Account → My Cards & Wallet → Add Flipkart Gift Card.'
      };
    }
    if (t.includes('swiggy')) {
      return {
        url: 'https://www.swiggy.com',
        instructions: 'Open Swiggy App → Account → Swiggy Money → Add Gift Card / Voucher.'
      };
    }
    return {
      url: '',
      instructions: 'Funds transferred directly to your submitted UPI ID. Check your UPI app!'
    };
  };

  // Unit Economics Guard: Check scholar subscription status and learning milestones
  const quota = QuotaService.evaluateQuota(learner);
  const isEnrolledScholar = quota.hasActiveSubscription || learner.role === 'SUPER_ADMIN';
  const minLevelsRequired = 3;

  // Genuine Curriculum Mastery: Count mastered course levels from learner record, quota, and storage progress
  const progressList = typeof window !== 'undefined'
    ? (StorageRLSLayer.getProgressForLearner(learner.id, learner.id) || [])
    : [];
  const completedProgressLevels = progressList.filter(
    p => p.isCompleted || (p.bestScorePercent && p.bestScorePercent >= 70)
  ).length;

  const levelsCount = Math.max(
    Number(learner.levelsCompletedCount || 0),
    Number(quota.levelsCompleted || 0),
    completedProgressLevels,
    Number(learner.quizzesCompletedCount || 0)
  );
  const hasAcademicMilestone = levelsCount >= minLevelsRequired || learner.role === 'SUPER_ADMIN';

  // Ensure learner object stays synchronized across storage
  if (typeof window !== 'undefined' && levelsCount > (learner.levelsCompletedCount || 0)) {
    learner.levelsCompletedCount = levelsCount;
    StorageRLSLayer.saveLearner(learner, learner.id);
  }

  const [existingRequests, setExistingRequests] = useState<GiftRequest[]>(() =>
    StorageRLSLayer.getGiftRequestsForLearner(learner.id)
  );

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const res = await ApiClient.getMyGifts(learner.id);
        if (res && res.success && Array.isArray(res.requests)) {
          res.requests.forEach(r => StorageRLSLayer.saveGiftRequest(r));
          setExistingRequests(res.requests);
          return;
        }
      } catch {
        // Fallback to local
      }
      const local = StorageRLSLayer.getGiftRequestsForLearner(learner.id);
      setExistingRequests(local);
    };
    fetchGifts();
  }, [learner.id]);

  // Calculate progress toward next reachable physical reward milestone
  const nextTargetReward = PHYSICAL_REWARDS.find(r => r.coinsCost > learner.coinBalance) || PHYSICAL_REWARDS[PHYSICAL_REWARDS.length - 1];
  const progressPercent = Math.min(100, (learner.coinBalance / nextTargetReward.coinsCost) * 100);

  const handleOpenProductDetails = (item: PhysicalRewardItem) => {
    setPreviewProductItem(item);
    setMessage(null);
  };

  const handleOpenPhysicalModal = (item: PhysicalRewardItem) => {
    // Show product details and Amazon delivery information popup before redeeming!
    setPreviewProductItem(item);
    setMessage(null);
  };

  const handleProceedToAddressForm = (item: PhysicalRewardItem) => {
    setPreviewProductItem(null);
    setSelectedPhysicalItem(item);
    setMessage(null);
  };

  const handleConfirmPhysicalRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhysicalItem) return;

    if (!isEnrolledScholar) {
      setMessage({
        type: 'error',
        text: '🌟 Enrolled Scholar Privilege: Physical merchandise claims are exclusively reserved for active Lite (₹49) or Plus (₹129) subscribers. Upgrade your plan to unlock doorstep reward deliveries!'
      });
      return;
    }

    if (!hasAcademicMilestone) {
      setMessage({
        type: 'error',
        text: `🎯 Proof of Study Milestone: Complete at least ${minLevelsRequired} curriculum levels with >= 70% score (currently completed: ${levelsCount}/${minLevelsRequired}) to verify genuine learning progress before redeeming.`
      });
      return;
    }

    if (learner.coinBalance < selectedPhysicalItem.coinsCost) {
      setMessage({
        type: 'error',
        text: `Insufficient Study Coins. Required: ${selectedPhysicalItem.coinsCost.toLocaleString()} (${selectedPhysicalItem.coinsCostFormatted}), Available: ${learner.coinBalance.toLocaleString()} Coins.`
      });
      return;
    }

    const effectiveCountry = recipientCountry === 'Worldwide / Other Country' && customCountry.trim()
      ? customCountry.trim()
      : recipientCountry;

    if (
      !recipientName.trim() ||
      !flatHouse.trim() ||
      !streetArea.trim() ||
      !city.trim() ||
      !stateName.trim() ||
      !pincode.trim() ||
      !physicalPhone.trim()
    ) {
      setMessage({
        type: 'error',
        text: 'Please complete all courier shipping address fields (Recipient Name, House/Flat, Street/Locality, City, State/Province, Postal/ZIP Code, and Phone) so courier can deliver.'
      });
      return;
    }

    const cleanPin = pincode.trim().toUpperCase();
    if (cleanPin.length < 3 || cleanPin.length > 12) {
      setMessage({ type: 'error', text: 'Please enter a valid postal / ZIP code (3 to 12 alphanumeric characters).' });
      return;
    }

    const digitsOnly = physicalPhone.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      setMessage({ type: 'error', text: 'Please enter a valid phone / WhatsApp number with country code (7 to 15 digits).' });
      return;
    }
    const cleanPhone = physicalPhone.trim();

    const fullShippingAddress = `[PHYSICAL DELIVERY VIA AMAZON WORLDWIDE] Country: ${effectiveCountry} | Recipient: ${recipientName.trim()} | Flat/House: ${flatHouse.trim()} | Street/Area: ${streetArea.trim()}${landmark.trim() ? ` | Landmark: ${landmark.trim()}` : ''} | City: ${city.trim()} | State/Province: ${stateName.trim()} | Postal/ZIP: ${cleanPin} | Phone: ${cleanPhone}`;

    const targetEmail = 'academiclevels@gmail.com';

    // 1. Append-only ledger debit
    const tx = CoinLedgerService.appendTransaction(
      learner.id,
      -selectedPhysicalItem.coinsCost,
      'GIFT_STORE_REDEMPTION',
      {
        itemId: selectedPhysicalItem.id,
        itemName: selectedPhysicalItem.name,
        isPhysical: true,
        shippingAddress: fullShippingAddress,
        country: effectiveCountry,
        phone: cleanPhone,
        dispatchedTo: targetEmail
      }
    );

    if (!tx.success) {
      setMessage({ type: 'error', text: tx.error || 'Ledger transaction failed.' });
      return;
    }

    // 2. Queue physical merchandise request
    const reqId = 'phys_req_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const newRequest: GiftRequest = {
      id: reqId,
      learnerId: learner.id,
      learnerName: learner.fullName,
      itemTitle: selectedPhysicalItem.name,
      coinsCost: selectedPhysicalItem.coinsCost,
      shippingAddress: fullShippingAddress,
      contactPhone: cleanPhone,
      status: 'PENDING_APPROVAL',
      isPhysical: true,
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StorageRLSLayer.saveGiftRequest(newRequest);
    setExistingRequests(prev => [newRequest, ...prev]);

    // 3. Sync to backend database
    ApiClient.redeemGift({
      learnerId: learner.id,
      level: 0,
      brand: selectedPhysicalItem.name,
      rsAmount: 0,
      coinsCost: selectedPhysicalItem.coinsCost,
      deliveryEmail: learner.email || `${cleanPhone.replace(/\D/g, '')}@sms.academiclevel.in`,
      deliveryPhone: cleanPhone,
      itemTitle: selectedPhysicalItem.name,
      shippingAddress: fullShippingAddress,
      isPhysical: true,
      levelsCount,
      quizzesCount: Number(learner.quizzesCompletedCount || 0)
    } as any).catch(() => {});

    // 4. Format official email request
    const mailSubject = `[Physical Reward Claim - ${effectiveCountry}] ${selectedPhysicalItem.name} - ${recipientName.trim()} (${learner.fullName})`;
    const mailBody = `Hello AcademicLevel Fulfillment Team,

I have accumulated Study Coins on AcademicLevel and redeemed a physical reward for worldwide doorstep courier delivery!

Redemption Details:
• Student Name: ${learner.fullName}
• Recipient Name: ${recipientName.trim()}
• Destination Country: ${effectiveCountry}
• Student Email: ${learner.email}
• WhatsApp / Courier Phone: ${cleanPhone}
• Board & Class: ${learner.board} Class ${learner.grade}
• Learner ID: ${learner.id}
• Selected Reward: ${selectedPhysicalItem.name}
• Coins Debited: ${selectedPhysicalItem.coinsCost.toLocaleString()} Coins
• Doorstep Courier Shipping Address:
  ${flatHouse.trim()}, ${streetArea.trim()}${landmark.trim() ? `, Near ${landmark.trim()}` : ''}
  City: ${city.trim()}, State/Province: ${stateName.trim()} - Postal/ZIP: ${cleanPin}
  Country: ${effectiveCountry}
• Request ID: ${reqId}
• Submitted At: ${new Date().toLocaleString()}

Please verify my coin ledger record, pack my item, and update the courier tracking status (Ordered / Shipped / Delivered).

Thank you,
${recipientName.trim()}`;

    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

    setSubmittedPhysicalClaim({
      reqId,
      item: selectedPhysicalItem,
      recipientName: recipientName.trim(),
      fullAddress: fullShippingAddress,
      phone: cleanPhone,
      coinsCost: selectedPhysicalItem.coinsCost,
      targetEmail,
      mailSubject,
      mailBody,
      mailtoUrl
    });

    onRefreshLearner();
    setSelectedPhysicalItem(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-slate-900">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-indigo-50 border border-amber-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-700 uppercase bg-amber-100 border border-amber-300 px-3 py-1 rounded-full inline-flex items-center space-x-1.5 mb-3">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>🌍 Truly Worldwide Rewards • 100% Physical Rewards &amp; Merchandise</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Scholar&apos;s Physical Rewards Store &amp; Global Arena
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Convert your hard-earned Study Coins into real physical scholar merchandise delivered worldwide, and essential study power-ups!
              <br />
              <strong className="text-amber-700">100% Physical Doorstep Courier Delivery to any country</strong> via Amazon Worldwide &amp; global logistics partners.
            </p>
          </div>

          <div className="bg-white border border-amber-300 rounded-3xl p-5 text-center min-w-[200px] shadow-sm">
            <span className="text-[11px] text-slate-500 block font-medium">Your Study Coins</span>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <StudyCoinIcon className="w-7 h-7" glow />
              <span className="text-3xl font-black text-amber-600 font-mono">
                {learner.coinBalance.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">Append-Only Ledger Verified</span>
          </div>
        </div>

        {/* Dynamic Progress toward next milestone */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-1 mb-2">
            <span className="text-slate-700 font-semibold flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>
                Target: {nextTargetReward.name} ({nextTargetReward.coinsCostFormatted})
              </span>
            </span>
            <span className="font-mono text-amber-700 font-bold">
              {learner.coinBalance.toLocaleString()} / {nextTargetReward.coinsCost.toLocaleString()} Coins ({progressPercent.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scholar Economics & Trust Badge */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold text-lg flex-shrink-0 mt-0.5">
            🛡️
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Physical Parcel Fulfillment &amp; Fair-Play Economics</span>
              {isEnrolledScholar ? (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  ✓ Scholar Enrolled
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  Free Tier • Upgrade to Claim
                </span>
              )}
              {hasAcademicMilestone ? (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Milestone Verified ({levelsCount}/3 Levels Mastered)</span>
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  🎯 Proof of Study: {levelsCount}/3 Levels
                </span>
              )}
            </div>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              Earn <strong className="text-amber-400">+25 coins</strong> per level mastered (70%+ accuracy) plus daily streak bonuses. Physical scholar merchandise items are reserved for enrolled Lite/Plus Scholars with min. 3 levels mastered. Digital study power-ups (Streak Freezes, Frames, Worksheets) are available to all students instantly!
            </p>
          </div>
        </div>
        {!isEnrolledScholar && onNavigateToPremium && (
          <button
            onClick={onNavigateToPremium}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex-shrink-0 shadow-md transition-all flex items-center justify-center space-x-1"
          >
            <span>Upgrade Plan (From ₹49)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Feedback Alert */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center space-x-2.5 animate-in fade-in duration-200 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-red-950/40 border-red-800 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <span className="leading-relaxed">{message.text}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. PHYSICAL SCHOLAR MERCHANDISE (WORLDWIDE DOORSTEP DELIVERY) */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span>Physical Scholar Merchandise (Worldwide Doorstep Delivery)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Authentic study merchandise, toys, and hydration gear shipped directly to your verified address in any country worldwide! Both Lite &amp; Plus scholars are eligible!
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider self-start sm:self-auto flex items-center gap-1.5 shadow-sm">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>🌍 Free Doorstep Delivery Worldwide (Amazon &amp; Global Couriers)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PHYSICAL_REWARDS.map(item => {
            const canAfford = learner.coinBalance >= item.coinsCost;
            const isSuperAdmin = learner.role === 'SUPER_ADMIN';
            const existingClaims = existingRequests.filter(r => r.status !== 'REJECTED');
            const hasUsedLimit = quota.activePlan === 'LITE' && existingClaims.length >= 1 && !isSuperAdmin;

            let buttonDisabled = !canAfford || !isEnrolledScholar || hasUsedLimit;
            let buttonLabel = canAfford
              ? `Claim to Home Address`
              : `Need ${(item.coinsCost - learner.coinBalance).toLocaleString()} more Coins`;

            if (!isEnrolledScholar) {
              buttonDisabled = true;
              buttonLabel = 'Requires Lite (₹49) or Plus (₹129)';
            } else if (hasUsedLimit) {
              buttonDisabled = true;
              buttonLabel = 'Term Limit Reached (1 Claim/60d)';
            }

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all group ${
                  canAfford && !buttonDisabled
                    ? 'border-amber-400 hover:border-amber-500 shadow-amber-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {item.popular && (
                  <span className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase px-3.5 py-1 rounded-bl-2xl tracking-wider shadow-xs">
                    Scholar Favorite
                  </span>
                )}

                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                      Physical Item
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">{item.badge}</span>
                  </div>

                  {/* Product Visual Image Showcase */}
                  <div
                    onClick={() => handleOpenProductDetails(item)}
                    className="w-full h-56 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center p-4 mb-4 relative overflow-hidden group-hover:border-amber-300 transition-all cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm border border-slate-200 px-2.5 py-1 rounded-xl text-[10px] text-amber-800 flex items-center space-x-1.5 font-mono shadow-xs">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      <span>{item.deliveryTag || 'Delivered using Amazon'}</span>
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-slate-200 text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                      <Eye className="w-3 h-3 text-amber-600" />
                      <span>View Details</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => handleOpenProductDetails(item)}
                    className="text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  {/* Specs Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.specs.map((spec, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-50 rounded-lg text-[10px] text-slate-600 border border-slate-200 font-mono">
                        ✓ {spec}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Required Coins:</span>
                    <span className="font-mono font-black text-amber-700 text-base flex items-center space-x-1">
                      <StudyCoinIcon className="w-4 h-4" />
                      <span>{item.coinsCost.toLocaleString()} Coins</span>
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenProductDetails(item)}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Details &amp; Amazon</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPhysicalModal(item)}
                    disabled={buttonDisabled}
                    className={`py-2.5 px-3 font-black text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      !buttonDisabled
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-950/40'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span className="truncate">{buttonLabel}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DIGITAL STUDY POWER-UPS & UTILITIES (15 to 30 COINS) */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Digital Study Power-Ups &amp; Academic Perks</span>
          </h2>
          <p className="text-xs text-slate-400">
            Instant digital utilities: protect your study streaks, equip profile frames, and generate practice worksheets.
          </p>
        </div>

        {/* Notifications for Power-ups */}
        {powerUpSuccess && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800 rounded-2xl text-xs text-emerald-300 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{powerUpSuccess}</span>
          </div>
        )}

        {powerUpError && (
          <div className="p-3.5 bg-red-950/40 border border-red-800 rounded-2xl text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{powerUpError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Streak Freeze Shield */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-400 transition-all shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Streak Freeze Shield</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Missing a study day won&apos;t reset your streak. Automatically activates if you miss 24 hours.
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span>Active Freezes:</span>
                <span className="font-mono font-bold text-amber-700">{learner.streakFreezesAvailable || 0}</span>
              </div>
            </div>

            <button
              onClick={handleBuyStreakFreeze}
              className="mt-6 w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <StudyCoinIcon className="w-4 h-4" />
              <span>Buy Freeze (15 Coins)</span>
            </button>
          </div>

          {/* Emerald Frame */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-400 transition-all shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Emerald Scholar Frame</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Equip an exclusive animated emerald border for your avatar across StudentPacks and leaderboards.
              </p>
            </div>

            <button
              onClick={() => handleBuyAvatarFrame('Emerald', 20)}
              className="mt-6 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <StudyCoinIcon className="w-4 h-4" />
              <span>{learner.avatarFrame === 'Emerald' ? 'Equipped' : 'Equip (20 Coins)'}</span>
            </button>
          </div>

          {/* Practice Worksheets Generator */}
          <div className={`border rounded-3xl p-6 flex flex-col justify-between transition-all shadow-sm ${
            isWorksheetUnlocked
              ? 'bg-gradient-to-br from-indigo-50/60 via-white to-emerald-50/60 border-emerald-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-indigo-400'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                {isWorksheetUnlocked ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Unlocked &amp; Ready</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300">
                    30 Coins
                  </span>
                )}
              </div>

              <h3 className="font-bold text-white text-base">Class Practice Worksheets &amp; PDF</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Generate curriculum practice worksheets from the 12,000-question bank for all classes (1–12), with rough work workspace and detachable step-by-step solutions.
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  All Classes (1 to 12)
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  1-Click PDF Print
                </span>
              </div>
            </div>

            {isWorksheetUnlocked ? (
              <button
                onClick={() => setIsWorksheetModalOpen(true)}
                className="mt-6 w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>📄 Open &amp; Print Worksheets</span>
              </button>
            ) : (
              <button
                onClick={handleUnlockWorksheets}
                className="mt-6 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <StudyCoinIcon className="w-4 h-4" />
                <span>Unlock Practice Worksheets (30 Coins)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Redemption History */}
      {existingRequests.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Truck className="w-4 h-4 text-amber-600" />
            <span>Your Redemptions &amp; Delivery Tracking ({existingRequests.length})</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {existingRequests.map(req => {
              const isPhysical = req.isPhysical || (req.shippingAddress && (req.shippingAddress.includes('[PHYSICAL DELIVERY]') || req.shippingAddress.includes('[PHYSICAL DELIVERY VIA AMAZON]'))) || req.itemTitle.toLowerCase().includes('bottle') || req.itemTitle.toLowerCase().includes('squishy') || req.itemTitle.toLowerCase().includes('blaster') || req.itemTitle.toLowerCase().includes('stationery') || req.itemTitle.toLowerCase().includes('badge') || req.itemTitle.toLowerCase().includes('box') || req.itemTitle.toLowerCase().includes('mystery');
              const code = getVoucherDetails(req);
              const help = getRedemptionHelp(req.itemTitle);
              const isDispatched = req.status === 'APPROVED_DISPATCHED';
              const isOrdered = req.status === 'ORDERED';
              const isShipped = req.status === 'SHIPPED';
              const isDelivered = req.status === 'DELIVERED';

              return (
                <div key={req.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-slate-900 text-sm">{req.itemTitle}</p>
                        <span className="text-amber-700 font-mono text-xs flex items-center gap-1 font-bold">
                          <StudyCoinIcon className="w-3.5 h-3.5" />
                          <span>(-{req.coinsCost.toLocaleString()} Coins)</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        📍 <strong>Destination:</strong> {req.shippingAddress.replace('[PHYSICAL DELIVERY VIA AMAZON WORLDWIDE]', '').replace('[PHYSICAL DELIVERY VIA AMAZON]', '').replace('[PHYSICAL DELIVERY]', '').trim()}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Phone: {req.contactPhone} • Requested on: {new Date(req.requestedAt).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isShipped
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : isOrdered
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : isDispatched
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span>
                          {isDelivered
                            ? '🎉 Delivered to Doorstep'
                            : isShipped
                            ? '🚚 Shipped via Courier'
                            : isOrdered
                            ? '📦 Order Placed with Courier'
                            : isDispatched
                            ? '✓ Dispatched & Ready to Use'
                            : req.status === 'REJECTED'
                            ? 'Rejected'
                            : isPhysical
                            ? '⏳ Preparing Shipment'
                            : '⏳ Verification in Progress'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Physical Parcel Tracking Card */}
                  {isPhysical && (isShipped || isOrdered || isDelivered) && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-white to-sky-50 border border-sky-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-sky-800 flex items-center space-x-1.5">
                          <Truck className="w-4 h-4 text-sky-600" />
                          <span>
                            {isDelivered
                              ? 'Delivered to Doorstep'
                              : isShipped
                              ? 'In Transit with Courier Partner'
                              : 'Order Confirmed & Processing'}
                          </span>
                        </span>
                        {req.courierName && (
                          <span className="text-[10px] font-mono text-sky-700 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-full font-bold">
                            Carrier: {req.courierName}
                          </span>
                        )}
                      </div>
                      {req.trackingId && (
                        <div className="bg-white p-3 rounded-xl border border-sky-200 flex items-center justify-between shadow-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Tracking ID / AWB:</span>
                            <span className="font-mono text-sm font-black text-amber-700 tracking-wider select-all">
                              {req.trackingId}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Live on Courier Portal
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dispatched Voucher Code Banner & 1-Click Copy */}
                  {isDispatched && !isPhysical && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-2 border-emerald-300 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-800 flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span>Voucher Code Generated &amp; Verified</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          Ready to Redeem
                        </span>
                      </div>

                      {/* Monospace Code Box */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                            Digital Voucher Code:
                          </span>
                          <span className="font-mono text-base sm:text-lg font-black text-slate-900 tracking-widest selection:bg-emerald-500">
                            {code}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopyVoucher(code, req.id)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all flex-shrink-0 cursor-pointer"
                        >
                          {copiedVoucherId === req.id ? (
                            <>
                              <Check className="w-4 h-4 text-slate-950" />
                              <span>Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-slate-950" />
                              <span>Copy Voucher Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Instructions */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
                        <span>💡 {help.instructions}</span>
                        {help.url && (
                          <a
                            href={help.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1 hover:underline"
                          >
                            <span>Open Redemption Page</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2.5: PRODUCT DETAILS & AMAZON DELIVERY POPUP       */}
      {/* ======================================================== */}
      {previewProductItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border-2 border-amber-400 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl text-slate-900 relative my-6 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setPreviewProductItem(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 transition-colors z-10 cursor-pointer"
              aria-label="Close product details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Body (Scrollable) */}
            <div className="overflow-y-auto pr-1 space-y-5">
              {/* Product Header & Category Pill */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                    Physical Scholar Merchandise
                  </span>
                  <span className="text-[10px] font-bold text-amber-700">
                    {previewProductItem.badge}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {previewProductItem.name}
                </h2>
              </div>

              {/* Product Image & Amazon Badge Showcase */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                <div className="sm:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                  <img
                    src={previewProductItem.image}
                    alt={previewProductItem.name}
                    className="w-full h-52 sm:h-56 object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>In Stock</span>
                  </div>
                </div>

                <div className="sm:col-span-7 space-y-3">
                  {/* Coin Price & Value Tag */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Redemption Cost</span>
                      <div className="flex items-center space-x-1.5 text-xl sm:text-2xl font-black font-mono text-amber-700">
                        <StudyCoinIcon className="w-6 h-6" glow />
                        <span>{previewProductItem.coinsCost.toLocaleString()} Coins</span>
                      </div>
                    </div>
                    {previewProductItem.originalPriceInr && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Retail Value</span>
                        <span className="text-sm font-bold text-slate-400 line-through">₹{previewProductItem.originalPriceInr}</span>
                        <span className="text-[10px] font-bold text-emerald-600 block">100% Free with Coins</span>
                      </div>
                    )}
                  </div>

                  {/* OFFICIAL AMAZON / FLIPKART / MEESHO DELIVERY BOX */}
                  <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-amber-300 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-800 flex items-center space-x-1.5">
                        <Truck className="w-4 h-4 text-amber-600" />
                        <span>{previewProductItem.deliveryTag || 'Delivered using Amazon'}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-300">
                        {previewProductItem.deliveryPartner || 'Amazon Logistics'}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600">
                      <p className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span><strong>Free Doorstep Delivery</strong> worldwide • Zero courier fees</span>
                      </p>
                      <p className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span><strong>Live Tracking:</strong> Real-time courier AWB tracking ID provided</span>
                      </p>
                      <p className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span><strong>Dispatched in 24–48 Hours:</strong> Carefully packaged and shipped</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {previewProductItem.description}
                  </p>
                </div>
              </div>

              {/* DETAILED FEATURES & BULLETS */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Key Features &amp; Quality Highlights</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs text-slate-700">
                  {previewProductItem.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-600 font-bold mt-0.5">•</span>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TECHNICAL SPECIFICATIONS */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Technical Specifications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {previewProductItem.specs.map((sp, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-mono font-medium flex items-center space-x-1.5 shadow-xs"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{sp}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <div className="text-xs text-slate-400">
                <span>Your Balance: </span>
                <strong className={`font-mono ${learner.coinBalance >= previewProductItem.coinsCost ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {learner.coinBalance.toLocaleString()} Coins
                </strong>
                {learner.coinBalance < previewProductItem.coinsCost && (
                  <span className="text-rose-400 block text-[11px]">
                    (Need {(previewProductItem.coinsCost - learner.coinBalance).toLocaleString()} more coins)
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewProductItem(null)}
                  className="flex-1 sm:flex-initial py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={learner.coinBalance < previewProductItem.coinsCost || !isEnrolledScholar}
                  onClick={() => handleProceedToAddressForm(previewProductItem)}
                  className={`flex-1 sm:flex-initial py-2.5 px-5 font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                    learner.coinBalance >= previewProductItem.coinsCost && isEnrolledScholar
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-950/40 hover:scale-[1.02]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>
                    {!isEnrolledScholar
                      ? 'Requires Lite (₹49) or Plus (₹129)'
                      : learner.coinBalance < previewProductItem.coinsCost
                      ? `Need ${(previewProductItem.coinsCost - learner.coinBalance).toLocaleString()} Coins`
                      : 'Claim & Enter Delivery Address →'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Physical Merchandise Courier Address Input */}
      {selectedPhysicalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-slate-900 relative my-8">
            <button
              onClick={() => setSelectedPhysicalItem(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                const item = selectedPhysicalItem;
                setSelectedPhysicalItem(null);
                setPreviewProductItem(item);
              }}
              className="text-[11px] text-slate-500 hover:text-amber-700 font-semibold mb-3 flex items-center space-x-1 cursor-pointer"
            >
              <span>← Back to Product Details</span>
            </button>

            <div className="text-center mb-5">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-800 uppercase bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                  Physical Scholar Merchandise
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center space-x-1 shadow-xs">
                  <Truck className="w-3 h-3 text-amber-600" />
                  <span>{selectedPhysicalItem.deliveryTag || 'Delivered using Amazon'}</span>
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center justify-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <span>Claim {selectedPhysicalItem.name}</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Cost: <strong className="text-amber-700">{selectedPhysicalItem.coinsCost.toLocaleString()} Study Coins</strong> ({selectedPhysicalItem.coinsCostFormatted}) • Free Doorstep Delivery
              </p>
            </div>

            {/* Amazon Worldwide Delivery Notice */}
            <div className="p-3 bg-gradient-to-r from-amber-50 via-indigo-50/50 to-emerald-50 border border-amber-200 rounded-2xl flex items-center space-x-2.5 text-xs text-amber-900 mb-4">
              <Globe className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Truly Worldwide Doorstep Delivery:</strong> We ship directly to students in <strong>any country worldwide</strong> via Amazon Global and international courier networks with live tracking updates!
              </span>
            </div>

            <form onSubmit={handleConfirmPhysicalRedeem} className="space-y-3.5 text-xs">
              {/* Destination Country / Region */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5 text-sky-600" />
                  <span>Destination Country / Region <span className="text-rose-600">*</span></span>
                </label>
                <select
                  value={recipientCountry}
                  onChange={e => setRecipientCountry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none"
                >
                  <option value="India">🇮🇳 India</option>
                  <option value="United States">🇺🇸 United States</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="Australia">🇦🇺 Australia</option>
                  <option value="Singapore">🇸🇬 Singapore</option>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="France">🇫🇷 France</option>
                  <option value="Japan">🇯🇵 Japan</option>
                  <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                  <option value="Qatar">🇶🇦 Qatar</option>
                  <option value="Kuwait">🇰🇼 Kuwait</option>
                  <option value="Malaysia">🇲🇾 Malaysia</option>
                  <option value="New Zealand">🇳🇿 New Zealand</option>
                  <option value="South Africa">🇿🇦 South Africa</option>
                  <option value="Antarctica">🇦🇶 Antarctica (Polar Research Station / Base / Scientific Camp)</option>
                  <option value="Worldwide / Other Country">🌍 Worldwide / Other Country</option>
                </select>
                {recipientCountry === 'Worldwide / Other Country' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      placeholder="Please enter your country name"
                      value={customCountry}
                      onChange={e => setCustomCountry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Recipient Full Name */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Recipient Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Student or Parent Name"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none"
                  />
                </div>

                {/* Phone with Country Code */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Phone / WhatsApp (with Country Code) <span className="text-rose-600">*</span></span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210 or +1 4155552671"
                    value={physicalPhone}
                    onChange={e => setPhysicalPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Flat / House / Floor */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center space-x-1">
                  <Home className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Flat / House No. / Building / Floor <span className="text-rose-600">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 302, Sai Residency, Plot No. 42 / 123 Main St"
                  value={flatHouse}
                  onChange={e => setFlatHouse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              {/* Street / Locality */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Street / Area / Colony / Locality <span className="text-rose-600">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Downtown, Baker Street, Kharavela Nagar"
                  value={streetArea}
                  onChange={e => setStreetArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Prominent Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Royal High School, Opposite Central Park"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* City */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    City / Town <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New York / London / Delhi"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>

                {/* State / Province */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    State / Province / Region <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CA / Ontario / Odisha"
                    value={stateName}
                    onChange={e => setStateName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>

                {/* Postal / ZIP Code */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Postal / ZIP Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="e.g. 751001 / 90210 / SW1A 1AA"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none uppercase"
                  />
                </div>
              </div>

              {/* Coin Debit Summary */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center justify-between">
                <span>Coins to be debited:</span>
                <span className="font-mono font-bold text-amber-800 flex items-center gap-1">
                  <StudyCoinIcon className="w-3.5 h-3.5" />
                  <span>-{selectedPhysicalItem.coinsCost.toLocaleString()} Coins</span>
                </span>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPhysicalItem(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Confirm &amp; Ship to Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Physical Claim Email Request Confirmation */}
      {submittedPhysicalClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-slate-900 relative space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                <Package className="w-7 h-7 text-amber-600" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-800 uppercase bg-amber-100 border border-amber-300 px-3 py-1 rounded-full inline-block">
                Courier Claim Dispatched
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {submittedPhysicalClaim.item.name} Claimed!
              </h3>
              <p className="text-xs text-slate-600">
                Your <strong className="text-amber-700 inline-flex items-center gap-1"><StudyCoinIcon className="w-3.5 h-3.5" /> {submittedPhysicalClaim.coinsCost.toLocaleString()} Study Coins</strong> have been debited from the ledger. An official parcel dispatch request has been logged to the admin queue.
              </p>
            </div>

            {/* Email Dispatch Action Buttons */}
            <div className="space-y-2.5">
              <a
                href={submittedPhysicalClaim.mailtoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Open Mail &amp; Notify academiclevels@gmail.com</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(submittedPhysicalClaim.mailBody);
                  setCopiedPhysicalEmailText(true);
                  setTimeout(() => setCopiedPhysicalEmailText(false), 2500);
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {copiedPhysicalEmailText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied Courier Claim Text to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Pre-filled Courier Claim Text</span>
                  </>
                )}
              </button>
            </div>

            {/* Request Summary details */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <span className="text-slate-900 font-bold">{submittedPhysicalClaim.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">WhatsApp / Phone:</span>
                <span className="text-emerald-700 font-bold">{submittedPhysicalClaim.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Partner:</span>
                <span className="text-amber-800 font-bold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Delivered using Amazon</span>
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500">Shipping Address:</span>
                <span className="text-amber-900 break-words text-[11px] font-semibold">{submittedPhysicalClaim.fullAddress.replace('[PHYSICAL DELIVERY VIA AMAZON WORLDWIDE]', '').replace('[PHYSICAL DELIVERY VIA AMAZON]', '').replace('[PHYSICAL DELIVERY]', '').trim()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Request ID:</span>
                <span className="text-indigo-700 font-bold">{submittedPhysicalClaim.reqId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Courier Status:</span>
                <span className="text-amber-400 font-bold">Queued for Order Placement</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Our fulfillment team reviews your address, places the courier shipment, and updates the tracking ID right here on your dashboard!
            </p>

            <button
              type="button"
              onClick={() => setSubmittedPhysicalClaim(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Done &amp; Return to Gift Store
            </button>
          </div>
        </div>
      )}

      {/* PRACTICE WORKSHEETS MODAL */}
      {isWorksheetModalOpen && (
        <PracticeWorksheetViewer
          learner={learner}
          onClose={() => setIsWorksheetModalOpen(false)}
        />
      )}
    </div>
  );
};
