export type Language = 'en' | 'hi';

export interface Translations {
  // Language Modal & Preference
  welcome_title: string;
  how_wanna_see_ui: string;
  btn_hindi: string;
  btn_hindi_sub: string;
  btn_english: string;
  btn_english_sub: string;

  // Header & Navigation
  nav_home: string;
  nav_dashboard: string;
  nav_curriculum: string;
  nav_practice: string;
  nav_courses: string;
  nav_nova_ai: string;
  nav_qotd: string;
  nav_gift_store: string;
  nav_coin_mall: string;
  nav_mailbox: string;
  nav_certificates: string;
  nav_profile: string;
  nav_logout: string;
  nav_signin: string;
  nav_special_offer: string;
  nav_gold_pass: string;
  lang_label: string;

  // Student Dashboard
  dash_welcome: string;
  dash_sub: string;
  dash_streak: string;
  dash_streak_sub: string;
  dash_coins: string;
  dash_coins_sub: string;
  dash_quizzes: string;
  dash_quizzes_sub: string;
  dash_accuracy: string;
  dash_start_practice: string;
  dash_continue_journey: string;
  dash_choose_subject: string;
  dash_choose_chapter: string;
  dash_take_quiz: string;
  dash_worksheets: string;
  dash_worksheets_sub: string;
  dash_ask_nova: string;
  dash_ask_nova_sub: string;
  dash_switch_class: string;
  dash_daily_spin: string;
  dash_scholarships: string;

  // Quiz Engine
  quiz_question: string;
  quiz_of: string;
  quiz_select_option: string;
  quiz_submit: string;
  quiz_next: string;
  quiz_hint: string;
  quiz_ask_nova: string;
  quiz_correct: string;
  quiz_incorrect: string;
  quiz_explanation: string;
  quiz_exit: string;
  quiz_exit_scary_title: string;
  quiz_exit_scary_sub: string;
  quiz_return_to_quiz: string;
  quiz_confirm_exit: string;
  quiz_parent_pin_placeholder: string;
  quiz_complete_title: string;
  quiz_coins_earned: string;

  // Nova AI Tutor
  nova_greeting: string;
  nova_placeholder: string;
  nova_send: string;
  nova_thinking: string;

  // Common UI
  common_free: string;
  common_level: string;
  common_chapter: string;
  common_subject: string;
  common_class: string;
  common_board: string;
  common_save: string;
  common_cancel: string;
  common_close: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    welcome_title: 'Welcome to AcademicLevel?',
    how_wanna_see_ui: 'How you wanna see UI?',
    btn_hindi: 'Hindi | Hinglish',
    btn_hindi_sub: 'Hinglish & Hindi for easy understanding, quizzes & hints',
    btn_english: 'English',
    btn_english_sub: 'Standard academic English interface and navigation',

    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    nav_curriculum: 'Curriculum & Offers',
    nav_practice: 'Daily Practice',
    nav_courses: 'Syllabus & Levels',
    nav_nova_ai: 'Nova AI Tutor',
    nav_qotd: 'Daily Challenge',
    nav_gift_store: 'Gift Store',
    nav_coin_mall: 'Coin Mall',
    nav_mailbox: 'Mailbox',
    nav_certificates: 'Certificates',
    nav_profile: 'My Profile',
    nav_logout: 'Log Out',
    nav_signin: 'Sign In (Existing User)',
    nav_special_offer: 'Special ₹49 Offer',
    nav_gold_pass: 'GOLD PASS',
    lang_label: 'Language',

    dash_welcome: 'Welcome back,',
    dash_sub: 'Ready to master your chapters today?',
    dash_streak: 'Day Streak',
    dash_streak_sub: 'Keep studying daily to maintain your learning flame!',
    dash_coins: 'Study Coins',
    dash_coins_sub: 'Redeem for real gifts, stationery & books in Gift Store',
    dash_quizzes: 'Quizzes Completed',
    dash_quizzes_sub: 'Across all subjects and syllabus nodes',
    dash_accuracy: 'Mastery Accuracy',
    dash_start_practice: 'Start Daily Practice',
    dash_continue_journey: 'Continue Where You Left Off',
    dash_choose_subject: 'Select Subject',
    dash_choose_chapter: 'Select Chapter',
    dash_take_quiz: 'Take Adaptive Quiz',
    dash_worksheets: 'Download Worksheets',
    dash_worksheets_sub: 'Offline printable worksheets with step-by-step solutions',
    dash_ask_nova: 'Ask Socratic Nova AI',
    dash_ask_nova_sub: 'Instant 1-on-1 concept breakdowns without giving away direct answers',
    dash_switch_class: 'Switch Class',
    dash_daily_spin: 'Daily Study Spin Wheel',
    dash_scholarships: 'Worldwide Scholarships',

    quiz_question: 'Question',
    quiz_of: 'of',
    quiz_select_option: 'Select the correct option below:',
    quiz_submit: 'Submit Answer',
    quiz_next: 'Next Question',
    quiz_hint: 'Need a Hint?',
    quiz_ask_nova: 'Ask Nova AI for Help',
    quiz_correct: 'Brilliant! Correct Answer!',
    quiz_incorrect: 'Incorrect. Here is the step-by-step concept:',
    quiz_explanation: 'Step-by-Step Explanation',
    quiz_exit: 'Exit Assessment',
    quiz_exit_scary_title: 'Was this a internet error? Or have you left on Purpose?',
    quiz_exit_scary_sub: 'Enter parent pin to exit or return to quiz',
    quiz_return_to_quiz: 'Return to Quiz',
    quiz_confirm_exit: 'Confirm Exit (Requires Parent PIN)',
    quiz_parent_pin_placeholder: 'Enter 4-digit Parent PIN',
    quiz_complete_title: 'Assessment Complete!',
    quiz_coins_earned: 'Study Coins Earned',

    nova_greeting: 'Hi! I am Nova, your 24/7 Socratic AI Tutor. What concept would you like to master today?',
    nova_placeholder: 'Ask any question from your CBSE, ICSE, or IGCSE syllabus...',
    nova_send: 'Send to Nova',
    nova_thinking: 'Nova AI is breaking down your concept step-by-step...',

    common_free: 'FREE',
    common_level: 'Level',
    common_chapter: 'Chapter',
    common_subject: 'Subject',
    common_class: 'Class',
    common_board: 'Board',
    common_save: 'Save',
    common_cancel: 'Cancel',
    common_close: 'Close'
  },
  hi: {
    welcome_title: 'Welcome to AcademicLevel?',
    how_wanna_see_ui: 'How you wanna see UI?',
    btn_hindi: 'Hindi | Hinglish',
    btn_hindi_sub: 'हिंदी & Hinglish — Padhai, quizzes aur hints aasan bhasha mein',
    btn_english: 'English',
    btn_english_sub: 'Standard academic English interface and navigation',

    nav_home: 'होम (Home)',
    nav_dashboard: 'डैशबोर्ड (Dashboard)',
    nav_curriculum: 'सिलेबस और ऑफर्स (Offers)',
    nav_practice: 'रोज़ाना अभ्यास (Practice)',
    nav_courses: 'पाठ्यक्रम (Syllabus)',
    nav_nova_ai: 'नोवा AI गुरु (Nova AI)',
    nav_qotd: 'आज का सवाल (Daily Quiz)',
    nav_gift_store: 'इनाम स्टोर (Gifts)',
    nav_coin_mall: 'कॉइन मॉल (Coins)',
    nav_mailbox: 'डाकघर (Mailbox)',
    nav_certificates: 'सर्टिफिकेट्स (Certificates)',
    nav_profile: 'मेरी प्रोफाइल (Profile)',
    nav_logout: 'लॉग आउट (Log Out)',
    nav_signin: 'साइन इन (Existing User)',
    nav_special_offer: 'स्पेशल ₹49 ऑफर',
    nav_gold_pass: 'गोल्ड पास (GOLD)',
    lang_label: 'भाषा (Language)',

    dash_welcome: 'स्वागत है,',
    dash_sub: 'आज कौन सा चैप्टर मास्टर करना है?',
    dash_streak: 'दिनों की स्ट्रीक (Streak)',
    dash_streak_sub: 'रोज़ाना पढ़ाई करके अपनी लर्निंग स्ट्रीक बनाए रखें!',
    dash_coins: 'स्टडी कॉइन्स (Coins)',
    dash_coins_sub: 'गिफ्ट स्टोर में असली किताबें, स्टेशनरी और इनाम पाएं',
    dash_quizzes: 'क्विज़ हल किए (Solved)',
    dash_quizzes_sub: 'सभी विषयों और सिलेबस चैप्टर्स में',
    dash_accuracy: 'सटीकता (Accuracy)',
    dash_start_practice: 'अभ्यास शुरू करें (Start Practice)',
    dash_continue_journey: 'जहाँ छोड़ा था वहाँ से शुरू करें',
    dash_choose_subject: 'सब्जेक्ट चुनें (Select Subject)',
    dash_choose_chapter: 'चैप्टर चुनें (Select Chapter)',
    dash_take_quiz: 'क्विज़ हल करें (Take Quiz)',
    dash_worksheets: 'वर्कशीट डाउनलोड करें (PDF)',
    dash_worksheets_sub: 'स्टेप-बाय-स्टेप हल के साथ ऑफलाइन प्रिंटेबल वर्कशीट्स',
    dash_ask_nova: 'नोवा AI गुरु से पूछें',
    dash_ask_nova_sub: 'डायरेक्ट उत्तर बताए बिना आसान हिंट्स और कॉन्सेप्ट क्लैरिटी',
    dash_switch_class: 'क्लास बदलें (Change Class)',
    dash_daily_spin: 'डेली स्टडी स्पिन व्हील (Spin)',
    dash_scholarships: 'ग्लोबल स्कॉलरशिप्स (Scholarships)',

    quiz_question: 'सवाल',
    quiz_of: 'में से',
    quiz_select_option: 'नीचे सही विकल्प (Option) चुनिए:',
    quiz_submit: 'उत्तर सबमिट करें (Submit)',
    quiz_next: 'अगला सवाल (Next Question)',
    quiz_hint: 'हिंट चाहिए? (Need Hint)',
    quiz_ask_nova: 'नोवा AI से मदद लें (Ask Nova)',
    quiz_correct: 'शानदार! बिल्कुल सही जवाब! (+Study Coins)',
    quiz_incorrect: 'यह गलत जवाब है. स्टेप-बाय-स्टेप हल देखें:',
    quiz_explanation: 'स्टेप-बाय-स्टेप व्याख्या (Explanation)',
    quiz_exit: 'क्विज़ छोड़ें (Exit)',
    quiz_exit_scary_title: 'Was this a internet error? Or have you left on Purpose?',
    quiz_exit_scary_sub: 'Enter parent pin to exit or return to quiz',
    quiz_return_to_quiz: 'वापस क्विज़ पर लौटें (Return to Quiz)',
    quiz_confirm_exit: 'एग्जिट कन्फर्म करें (पेरेंट पिन जरूरी)',
    quiz_parent_pin_placeholder: '4-अंकों का पेरेंट पिन दर्ज करें',
    quiz_complete_title: 'क्विज़ पूरा हुआ! शाबाश!',
    quiz_coins_earned: 'जीते गए स्टडी कॉइन्स',

    nova_greeting: 'नमस्ते! मैं नोवा हूँ, आपका 24/7 AI पढ़ाई साथी. आज कौन सा कॉन्सेप्ट समझना है?',
    nova_placeholder: 'अपने CBSE, ICSE या IGCSE सिलेबस से कोई भी सवाल पूछें...',
    nova_send: 'नोवा को भेजें (Send)',
    nova_thinking: 'नोवा AI आपके सवाल का आसान स्टेप-बाय-स्टेप हल तैयार कर रहा है...',

    common_free: 'मुफ़्त (FREE)',
    common_level: 'लेवल',
    common_chapter: 'चैप्टर',
    common_subject: 'विषय',
    common_class: 'कक्षा',
    common_board: 'बोर्ड',
    common_save: 'सेव करें',
    common_cancel: 'रद्द करें',
    common_close: 'बंद करें'
  }
};
