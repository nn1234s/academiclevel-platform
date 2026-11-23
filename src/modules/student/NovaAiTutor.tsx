import React, { useState, useEffect, useRef } from 'react';
import { Board, Grade, Learner, Question } from '../../core/types';
import { NovaAiService, NovaMessage, StudentAiQuota } from '../../services/novaAiService';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  RefreshCw,
  X,
  CheckCircle,
  Zap,
  Volume2,
  VolumeX,
  Copy,
  Check,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  GraduationCap
} from 'lucide-react';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import { STUDYGIRL_100_MESSAGES, getRandomStudyGirlMessage } from '../../data/studygirlMessages';

interface NovaAiTutorProps {
  board: Board;
  grade: Grade;
  activeSubject?: string;
  initialQuestion?: Question | null;
  initialChosenIndex?: number | null;
  onClose?: () => void;
  learner?: Learner | null;
  onCoinsUpdated?: () => void;
}

interface PresetQuestion {
  id: string;
  category: 'MATH' | 'SCIENCE' | 'ENGLISH' | 'SOCIAL' | 'CS' | 'EXAM';
  label: string;
  prompt: string;
}

const PRESET_QUESTIONS: PresetQuestion[] = [
  // Mathematics (Primary, Middle & Secondary)
  {
    id: 'm_add',
    category: 'MATH',
    label: 'Addition & Regrouping (Carry Over)',
    prompt: 'How does carrying over work in multi-digit addition? Can you explain it visually using tens and ones place value blocks with an example like 47 + 38?'
  },
  {
    id: 'm_sub',
    category: 'MATH',
    label: 'Subtraction Across Zeros',
    prompt: 'How do I subtract when there are zeros in the minuend, such as 500 - 267? Please walk me through step-by-step regrouping.'
  },
  {
    id: 'm_div',
    category: 'MATH',
    label: 'Long Division & Remainders',
    prompt: 'What is the step-by-step method to solve long division (Divide, Multiply, Subtract, Bring down)? How do I check if my quotient and remainder are correct?'
  },
  {
    id: 'm_frac',
    category: 'MATH',
    label: 'Fractions with Different Denominators',
    prompt: 'How do I add and subtract fractions with unlike denominators like 2/3 + 4/5? Walk me through finding the LCM and simplifying.'
  },
  {
    id: 'm1',
    category: 'MATH',
    label: 'Quadratic Discriminant & Roots',
    prompt: 'How do I determine the nature of roots of a quadratic equation ax² + bx + c = 0 using the discriminant D = b² - 4ac? Please show step-by-step examples.'
  },
  {
    id: 'm2',
    category: 'MATH',
    label: 'Trigonometry Ratios (Sin, Cos, Tan)',
    prompt: 'Can you explain trigonometric ratios sin θ, cos θ, and tan θ using an intuitive real-life right triangle ladder example?'
  },
  {
    id: 'm3',
    category: 'MATH',
    label: 'Arithmetic Progression (AP) Formula',
    prompt: 'How do we derive the n-th term formula aₙ = a + (n-1)d and sum of n terms Sₙ = n/2[2a + (n-1)d] in an Arithmetic Progression?'
  },
  {
    id: 'm4',
    category: 'MATH',
    label: 'Pythagoras Theorem Proof',
    prompt: 'Can you walk me through the visual and algebraic proof of the Pythagoras Theorem (a² + b² = c²)?'
  },
  {
    id: 'm5',
    category: 'MATH',
    label: 'Mental Math 11x Multiplication',
    prompt: 'What is the fast mental math shortcut to multiply any 2-digit number by 11 in your head under 3 seconds?'
  },
  {
    id: 'm6',
    category: 'MATH',
    label: 'HCF & LCM Real World Problem',
    prompt: 'How do I know whether a word problem requires finding the HCF (Highest Common Factor) or the LCM (Lowest Common Multiple)?'
  },
  {
    id: 'm7',
    category: 'MATH',
    label: 'Circles Tangent Theorem',
    prompt: 'Prove that the lengths of tangents drawn from an external point to a circle are equal. What is the board marking scheme?'
  },

  // Science
  {
    id: 's1',
    category: 'SCIENCE',
    label: "Ohm's Law & Resistance",
    prompt: "Explain Ohm's Law (V = IR) and how resistance depends on length, cross-sectional area, and resistivity of a conductor."
  },
  {
    id: 's2',
    category: 'SCIENCE',
    label: 'Balancing Chemical Equations',
    prompt: 'What is a foolproof step-by-step method to balance complex chemical equations without guessing?'
  },
  {
    id: 's3',
    category: 'SCIENCE',
    label: 'Light Refraction & Snell Law',
    prompt: "Why does a pencil look bent in a glass of water? Explain refraction, refractive index, and Snell's Law."
  },
  {
    id: 's4',
    category: 'SCIENCE',
    label: 'Plant vs Animal Cells',
    prompt: 'What are the key structural differences between plant cells and animal cells (chloroplasts, cell wall, vacuoles)?'
  },
  {
    id: 's5',
    category: 'SCIENCE',
    label: 'Newton Three Laws of Motion',
    prompt: "Can you explain Newton's Three Laws of Motion with simple everyday examples like kicking a ball and seatbelts in cars?"
  },
  {
    id: 's6',
    category: 'SCIENCE',
    label: 'Human Circulatory & Heart',
    prompt: 'How does double circulation work in the human heart? Trace the flow of oxygenated and deoxygenated blood.'
  },

  // English
  {
    id: 'e1',
    category: 'ENGLISH',
    label: 'Active vs Passive Voice',
    prompt: 'How do I convert sentences from Active Voice to Passive Voice across present, past, and continuous tenses?'
  },
  {
    id: 'e2',
    category: 'ENGLISH',
    label: 'Direct to Indirect Speech',
    prompt: 'What are the core reporting verb and pronoun rules for changing Direct Speech into Indirect (Reported) Speech?'
  },
  {
    id: 'e3',
    category: 'ENGLISH',
    label: 'Formal Letter Opening & Closing',
    prompt: 'What are impressive opening hooks and closing formal sign-offs for an official letter to a school principal or newspaper editor?'
  },
  {
    id: 'e4',
    category: 'ENGLISH',
    label: 'Subject-Verb Concord Rules',
    prompt: 'What are the 5 trickiest Subject-Verb Concord rules that students usually get wrong in board exams?'
  },

  // Social Science
  {
    id: 'so1',
    category: 'SOCIAL',
    label: 'Indian Constitution Preamble',
    prompt: 'What do Sovereign, Socialist, Secular, Democratic, and Republic mean in the Preamble of the Indian Constitution?'
  },
  {
    id: 'so2',
    category: 'SOCIAL',
    label: 'The Revolt of 1857 Causes',
    prompt: 'What were the political, economic, military, and immediate causes of the Great Indian Revolt of 1857?'
  },
  {
    id: 'so3',
    category: 'SOCIAL',
    label: 'Indian Monsoon Mechanism',
    prompt: 'Explain the mechanism of the Southwest Monsoon in India, ITCZ shifts, and differential heating of land and water.'
  },
  {
    id: 'so4',
    category: 'SOCIAL',
    label: 'Sectors of Indian Economy',
    prompt: 'Explain Primary, Secondary, and Tertiary sectors of the Indian economy with examples and employment trends.'
  },

  // Computer Science & Coding (Scratch, App Inventor, Thunkable, Web, Python, SQL)
  {
    id: 'cs_scratch',
    category: 'CS',
    label: 'Scratch Loops & Sprite Animation',
    prompt: 'How do "Repeat" blocks, "Forever" loops, and "Next Costume" blocks work together in Scratch to make an animated walking sprite character?'
  },
  {
    id: 'cs_appinventor',
    category: 'CS',
    label: 'MIT App Inventor Button Events',
    prompt: 'How do Button.Click events, TextBoxes, and TextToSpeech components work in MIT App Inventor when creating an interactive Android app?'
  },
  {
    id: 'cs_thunkable',
    category: 'CS',
    label: 'Thunkable Screen Navigation',
    prompt: 'How do you configure navigation between multiple screens and pass variables in Thunkable mobile app builder?'
  },
  {
    id: 'cs_web',
    category: 'CS',
    label: 'HTML5 & CSS Flexbox Center',
    prompt: 'What is semantic HTML5, and what are the exact CSS flexbox properties needed to perfectly center any element horizontally and vertically?'
  },
  {
    id: 'cs1',
    category: 'CS',
    label: 'Python For Loop & Range',
    prompt: 'How does the Python range(start, stop, step) function work in a for loop? Give 3 practical examples.'
  },
  {
    id: 'cs2',
    category: 'CS',
    label: 'Lists vs Tuples in Python',
    prompt: 'What is the difference between mutable Python lists and immutable tuples? When should I use each?'
  },
  {
    id: 'cs3',
    category: 'CS',
    label: 'Functions & Return Values',
    prompt: 'How do functions, parameters, default arguments, and return statements work in Python?'
  },
  {
    id: 'cs_sql',
    category: 'CS',
    label: 'SQL SELECT, WHERE & GROUP BY',
    prompt: 'Can you explain how to query relational tables using SELECT, WHERE, ORDER BY, and GROUP BY with realistic student database examples?'
  },

  // Board Exam & Strategy
  {
    id: 'ex1',
    category: 'EXAM',
    label: 'Board Exam Step-Marking Key',
    prompt: 'How do board examiners award step-marks in 5-mark subjective questions, and how can I write answers to secure full marks?'
  },
  {
    id: 'ex2',
    category: 'EXAM',
    label: '3-Hour Exam Time Management',
    prompt: 'How should a student allocate the 3 hours during a board exam between reading time, Section A, B, C, D, and final revision?'
  },
  {
    id: 'ex3',
    category: 'EXAM',
    label: 'Avoid Silly Math Mistakes',
    prompt: 'What are the top 5 careless mistakes students make in Math exams (like sign flips or unit omissions) and how can I prevent them?'
  }
];

export const NovaAiTutor: React.FC<NovaAiTutorProps> = ({
  board,
  grade,
  activeSubject = 'Mathematics',
  initialQuestion,
  initialChosenIndex,
  onClose,
  learner,
  onCoinsUpdated,
}) => {
  const [messages, setMessages] = useState<NovaMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quota, setQuota] = useState<StudentAiQuota | null>(null);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);
  const [refillStatus, setRefillStatus] = useState<{ success: boolean; text: string } | null>(null);
  const [activePresetCategory, setActivePresetCategory] = useState<'ALL' | 'MATH' | 'SCIENCE' | 'ENGLISH' | 'SOCIAL' | 'CS' | 'EXAM'>('ALL');
  const [showPresetDrawer, setShowPresetDrawer] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Check if learner is an active subscriber with unlimited access
  const isSubscriber = Boolean(
    quota?.isSubscriber ||
    quota?.dailyLimit === Infinity ||
    (learner as any)?.hasActiveSubscription ||
    (learner as any)?.activeSub ||
    (learner as any)?.activePlan ||
    (learner as any)?.subscriptionExpiresAt
  );

  // Load student AI message quota
  const loadQuota = async () => {
    if (!learner?.id) return;
    try {
      const q = await NovaAiService.getStudentQuota(learner.id);
      if (q) setQuota(q);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadQuota();
  }, [learner?.id]);

  // Speech synthesis helper
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (msgId: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleBuyMessages = async (packType: 'PACK_5' | 'PACK_12') => {
    if (!learner?.id) return;
    setIsRefilling(true);
    setRefillStatus(null);
    const cost = packType === 'PACK_5' ? 10 : 20;

    if ((learner.coinBalance || 0) < cost) {
      setRefillStatus({
        success: false,
        text: `Insufficient AL Coins! You need ${cost} coins, but have ${learner.coinBalance || 0}. Earn coins by completing quizzes!`
      });
      setIsRefilling(false);
      return;
    }

    const res = await NovaAiService.buyAiMessages(learner.id, packType);
    if (res.success) {
      setRefillStatus({ success: true, text: res.message });
      if (res.quota) setQuota(res.quota);
      onCoinsUpdated?.();
      setTimeout(() => {
        setShowRefillModal(false);
        setRefillStatus(null);
      }, 1800);
    } else {
      setRefillStatus({ success: false, text: res.message });
    }
    setIsRefilling(false);
  };

  // Initialize tutor welcome
  const initWelcome = () => {
    let welcomeText = '';
    if (initialQuestion && initialChosenIndex !== null && initialChosenIndex !== undefined) {
      setIsTyping(true);
      NovaAiService.explainMistake(
        initialQuestion,
        initialChosenIndex,
        board,
        grade
      ).then(txt => {
        setMessages([
          {
            id: 'msg_welcome_' + Date.now(),
            sender: 'NOVA',
            text: txt,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsTyping(false);
      });
      return;
    }

    const randomMsg = getRandomStudyGirlMessage();
    welcomeText = `🎀 hey bestie! i'm nova, your cute study buddy ✨\n\n${randomMsg.text}\n\nwhat chapter or puzzle are we solving today? ask me anything or click below to start a quiz! 🌸💖`;

    setMessages([
      {
        id: 'msg_welcome_' + Date.now(),
        sender: 'NOVA',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleTriggerBestieCheer = () => {
    const msg = getRandomStudyGirlMessage();
    const bestieMsg: NovaMessage = {
      id: 'msg_bestie_' + Date.now(),
      sender: 'NOVA',
      text: `${msg.emoji} **study bestie message #${msg.id} • ${msg.tag}**\n\n${msg.text}\n\nlet's crush a quiz together right now! click any chapter quiz to start 🌸💖`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, bestieMsg]);
  };

  useEffect(() => {
    initWelcome();
  }, [board, grade, activeSubject, initialQuestion, initialChosenIndex]);

  const executeSend = async (queryText: string) => {
    if (!queryText.trim() || isTyping) return;

    // Check if daily quota is exhausted (bypassed for active subscribers or guests)
    if (learner && !isSubscriber && quota && quota.remainingToday <= 0) {
      setShowRefillModal(true);
      const limitMsg: NovaMessage = {
        id: 'msg_limit_' + Date.now(),
        sender: 'NOVA',
        text: `🪙 **daily free ai messages reached!**\n\nyou did so many questions today bestie! unlock 5 extra study buddy chats for just 10 AL Coins with the refill button 🌸✨`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, limitMsg]);
      return;
    }

    const userMsg: NovaMessage = {
      id: 'msg_u_' + Date.now(),
      sender: 'STUDENT',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const historyPayload = messages.slice(-4).map(m => ({
        role: (m.sender === 'STUDENT' ? 'user' : 'model') as 'user' | 'model',
        text: m.text.slice(0, 250)
      }));
      const response = await NovaAiService.answerStudentQuery(
        queryText,
        board,
        grade,
        activeSubject,
        historyPayload,
        learner?.id
      );
      const aiMsg: NovaMessage = {
        id: 'msg_nova_' + Date.now(),
        sender: 'NOVA',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      loadQuota();
    } catch {
      const bestieCheer = getRandomStudyGirlMessage();
      const fallbackMsg: NovaMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'NOVA',
        text: `🎀 hey bestie! ${bestieCheer.text}\n\nready to test your brain? let's take a quiz and stack up those coins! 🌸`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    const text = inputValue.trim();
    setInputValue('');
    executeSend(text);
  };

  const filteredPresets = PRESET_QUESTIONS.filter(p =>
    activePresetCategory === 'ALL' ? true : p.category === activePresetCategory
  );

  return (
    <div className="flex flex-col h-[650px] max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl text-slate-900 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-indigo-50 p-4 border-b border-pink-200/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-pink-900/20 text-lg">
            🎧
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <span>nova</span>
                <span className="text-[11px] font-normal text-slate-500">• your study bestie 🎀</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700 border border-pink-200">
                Class {grade} {board}
              </span>
              {!learner && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Guest Mode
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 flex items-center space-x-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>100+ cute study brain boosts preloaded • works offline 🌸</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
              initWelcome();
            }}
            title="Restart Conversation"
            className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {learner && (
            <button
              onClick={() => {
                setRefillStatus(null);
                setShowRefillModal(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-all cursor-pointer shadow-xs"
              title="AI Credits Limit: 8,500 Credits"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {quota ? `${quota.remainingToday.toLocaleString()} / 8,500 Credits` : '8,500 Credits'}
              </span>
              <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.5 rounded uppercase font-black">
                +Refill
              </span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Preset Questions Drawer Toggle Bar */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 text-indigo-700 font-bold">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span>Preset Question Library ({PRESET_QUESTIONS.length} Questions)</span>
        </div>
        <button
          onClick={() => setShowPresetDrawer(prev => !prev)}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-[11px] transition-all cursor-pointer"
        >
          <span>{showPresetDrawer ? 'Hide Library' : 'Browse Presets'}</span>
          {showPresetDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Preset Library */}
      {showPresetDrawer && (
        <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2.5 max-h-48 overflow-y-auto animate-fadeIn">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
            {[
              { id: 'ALL', label: 'All Subjects' },
              { id: 'MATH', label: '📐 Math' },
              { id: 'SCIENCE', label: '🔬 Science' },
              { id: 'ENGLISH', label: '📚 English' },
              { id: 'SOCIAL', label: '🌍 Social' },
              { id: 'CS', label: '💻 Coding' },
              { id: 'EXAM', label: '🎯 Exam Strategy' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActivePresetCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap font-bold transition-all cursor-pointer ${
                  activePresetCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredPresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => {
                  setShowPresetDrawer(false);
                  executeSend(preset.prompt);
                }}
                className="text-left p-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all text-xs group cursor-pointer shadow-xs"
              >
                <div className="font-bold text-slate-900 group-hover:text-indigo-700 flex items-center justify-between">
                  <span>{preset.label}</span>
                  <span className="text-[10px] text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ask Nova &rarr;
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{preset.prompt}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'STUDENT' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs ${
                msg.sender === 'STUDENT'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              {msg.sender === 'STUDENT' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'STUDENT'
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.text}

              <div
                className={`text-[9px] mt-2 pt-1 border-t flex items-center justify-between ${
                  msg.sender === 'STUDENT'
                    ? 'text-indigo-200 border-indigo-500/30'
                    : 'text-slate-400 border-slate-100'
                }`}
              >
                <span>{msg.timestamp}</span>

                {msg.sender === 'NOVA' && (
                  <div className="flex items-center space-x-2">
                    {/* Read Out Loud Button */}
                    <button
                      onClick={() => handleToggleSpeak(msg.id, msg.text)}
                      className="hover:text-indigo-600 text-slate-500 transition-colors flex items-center space-x-1 cursor-pointer"
                      title="Read explanation out loud"
                    >
                      {speakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          <span className="text-amber-600 font-bold">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="hover:text-indigo-600 text-slate-500 transition-colors flex items-center space-x-1 cursor-pointer"
                      title="Copy explanation to clipboard"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-slate-600 text-xs italic p-3 bg-white rounded-2xl border border-slate-200 shadow-xs w-fit animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-500" />
            <span>nova is preparing a cute, simple explanation for you... 🎀✨</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-gradient-to-r from-pink-50/60 via-purple-50/60 to-indigo-50/60 border-t border-pink-100 flex items-center space-x-2 overflow-x-auto text-[11px] no-scrollbar">
        <button
          onClick={handleTriggerBestieCheer}
          className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold transition-all cursor-pointer shadow-xs flex items-center space-x-1 active:scale-95 shrink-0"
          title="100 preloaded brain study motivation messages"
        >
          <span>🎀 bestie study vibe (100 inside)</span>
        </button>
        <button
          onClick={() => executeSend(`can you simplify the hardest concept in ${activeSubject || 'this chapter'} with a super cute example?`)}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          💡 simplify concept
        </button>
        <button
          onClick={() => executeSend(`give me a fun brain study tip to remember formulas easily!`)}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          🧠 brain memory hack
        </button>
        <button
          onClick={() => executeSend(`what's a silly mistake students make in ${activeSubject || 'our syllabus'} exams?`)}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          ⚠️ silly mistakes to avoid
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={`ask your study bestie anything or get motivation... 🎀`}
          className="flex-1 bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Modal: Refill AI Messages using AL Coins */}
      {showRefillModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-left">
            <button
              onClick={() => {
                setShowRefillModal(false);
                setRefillStatus(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Unlock Extra AI Messages</h4>
                <p className="text-[11px] text-slate-500">
                  Your Balance: <strong className="text-amber-600 font-mono inline-flex items-center gap-1"><StudyCoinIcon className="w-3.5 h-3.5" /> {learner?.coinBalance || 0} AL Coins</strong>
                </p>
              </div>
            </div>

            {refillStatus && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center space-x-2 ${
                  refillStatus.success
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border border-rose-300 text-rose-800'
                }`}
              >
                {refillStatus.success ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" /> : <X className="w-4 h-4 shrink-0 text-rose-600" />}
                <span>{refillStatus.text}</span>
              </div>
            )}

            {isSubscriber ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Unlimited Nova AI Active</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                    You have active <strong className="text-emerald-700 font-semibold">{quota?.planTier || (learner as any)?.activePlan || 'PLUS'} Scholar</strong> status. All daily Socratic AI query caps are lifted!
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setShowRefillModal(false)}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-5">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-all flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs text-slate-900">5 Extra AI Messages</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Standard
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Valid today and carried over until used.
                      </p>
                    </div>
                    <button
                      onClick={() => handleBuyMessages('PACK_5')}
                      disabled={isRefilling}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <StudyCoinIcon className="w-4 h-4" />
                      <span>10 Coins</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-amber-200 hover:border-amber-400 transition-all flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs text-slate-900">12 Extra AI Messages</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Best Value (+2 Free)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Save 4 AL Coins for exam preparation.
                      </p>
                    </div>
                    <button
                      onClick={() => handleBuyMessages('PACK_12')}
                      disabled={isRefilling}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <StudyCoinIcon className="w-4 h-4" />
                      <span>20 Coins</span>
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 text-center">
                  Need more coins? Ace your quizzes (&ge; 70% score for Level mastery) or spin the daily wheel to earn coins!
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
