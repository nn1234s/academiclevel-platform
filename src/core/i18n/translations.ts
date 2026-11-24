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
  nav_mistake_vault: string;
  nav_duel_arena: string;
  nav_leagues: string;
  nav_student_packs: string;
  nav_spin_wheel: string;
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
  dash_daily_spin_sub: string;
  dash_scholarships: string;
  dash_mistake_vault: string;
  dash_mistake_vault_sub: string;
  dash_duel_arena: string;
  dash_duel_arena_sub: string;
  dash_leagues: string;
  dash_leagues_sub: string;
  dash_mailbox: string;
  dash_mailbox_sub: string;
  dash_gift_store: string;
  dash_gift_store_sub: string;
  dash_qotd: string;
  dash_qotd_sub: string;

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
    welcome_title: 'Welcome to AcademicLevel 🚀',
    how_wanna_see_ui: 'Select your preferred interface language',
    btn_hindi: 'Hinglish (Hindi + English)',
    btn_hindi_sub: 'Easy Hinglish for concepts, quiz questions & Nova hints',
    btn_english: 'English',
    btn_english_sub: 'Standard academic English interface and navigation',

    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    nav_curriculum: 'Curriculum & Passes',
    nav_practice: 'Daily Practice',
    nav_courses: 'Syllabus & Levels',
    nav_nova_ai: 'Nova AI Tutor 🎀',
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
    nav_mistake_vault: 'Mistake Vault 📓',
    nav_duel_arena: '1v1 Coin Duel ⚔️',
    nav_leagues: 'Scholar Leagues 🏆',
    nav_student_packs: 'StudentPacks Community 👥',
    nav_spin_wheel: 'Daily Spin Wheel 🎡',
    lang_label: 'Language',

    dash_welcome: 'Welcome back,',
    dash_sub: 'Ready to master your chapters today?',
    dash_streak: 'Day Streak 🔥',
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
    dash_ask_nova: 'Ask Nova AI Tutor',
    dash_ask_nova_sub: 'Instant 1-on-1 friendly concept breakdowns without giving away direct answers',
    dash_switch_class: 'Switch Class',
    dash_daily_spin: 'Daily Study Spin Wheel',
    dash_daily_spin_sub: '24h UTC Cooldown',
    dash_scholarships: 'Worldwide Scholarships',
    dash_mistake_vault: 'Mistake Vault (Error Notebook)',
    dash_mistake_vault_sub: 'Master your past missed questions to earn +10 Coins each!',
    dash_duel_arena: '1v1 Coin Clash Arena',
    dash_duel_arena_sub: 'Play rapid 5-question battles against online scholars or friends',
    dash_leagues: 'Weekly Scholar Leagues',
    dash_leagues_sub: 'Climb from Bronze to Diamond Champion with weekly coin rewards',
    dash_mailbox: 'Student Mailbox',
    dash_mailbox_sub: 'Quiz reports, diagnostic cards & Nova notes',
    dash_gift_store: 'Rewards Store',
    dash_gift_store_sub: 'Toys, stationery, badges & water bottles',
    dash_qotd: 'Question of Day',
    dash_qotd_sub: 'Daily streak booster question',

    quiz_question: 'Question',
    quiz_of: 'of',
    quiz_select_option: 'Select the correct option below:',
    quiz_submit: 'Submit Answer',
    quiz_next: 'Next Question',
    quiz_hint: 'Need a Hint?',
    quiz_ask_nova: 'Ask Nova AI for Help',
    quiz_correct: 'Brilliant! Correct Answer! 🎯',
    quiz_incorrect: 'Incorrect. Here is the step-by-step concept:',
    quiz_explanation: 'Step-by-Step Explanation',
    quiz_exit: 'Exit Assessment',
    quiz_exit_scary_title: 'Did you experience an internet issue or leave on purpose?',
    quiz_exit_scary_sub: 'Leaving mid-quiz will not save this run. Enter parent pin to exit or return to quiz.',
    quiz_return_to_quiz: 'Return to Quiz',
    quiz_confirm_exit: 'Confirm Exit (Requires Parent PIN)',
    quiz_parent_pin_placeholder: 'Enter 4-digit Parent PIN',
    quiz_complete_title: 'Assessment Complete! 🎉',
    quiz_coins_earned: 'Study Coins Earned',

    nova_greeting: 'Hi! I am Nova, your 24/7 AI Tutor. What concept would you like to master today? 🎀',
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
    welcome_title: 'AcademicLevel mein aapka swagat hai! 🚀',
    how_wanna_see_ui: 'Aap kis bhasha mein padhna pasand karenge?',
    btn_hindi: 'Hinglish (Hindi + English)',
    btn_hindi_sub: 'Aasan Hinglish mein questions, explanations aur Nova AI hints',
    btn_english: 'English Interface',
    btn_english_sub: 'Standard academic English interface and navigation',

    nav_home: 'Home 🏠',
    nav_dashboard: 'Dashboard 📊',
    nav_curriculum: 'Syllabus & Passes 📜',
    nav_practice: 'Daily Practice 🎯',
    nav_courses: 'Syllabus & Chapters 📚',
    nav_nova_ai: 'Nova AI Tutor 🎀',
    nav_qotd: 'Aaj Ka Sawal (QOTD) ⚡',
    nav_gift_store: 'Rewards Store 🎁',
    nav_coin_mall: 'Coin Mall 🪙',
    nav_mailbox: 'Mailbox & Reports 📬',
    nav_certificates: 'Certificates 🏅',
    nav_profile: 'Meri Profile 👤',
    nav_logout: 'Log Out 🚪',
    nav_signin: 'Sign In (Login)',
    nav_special_offer: 'Special ₹49 Offer 🔥',
    nav_gold_pass: 'GOLD PASS 👑',
    nav_mistake_vault: 'Mistake Vault (Galati Sudharo) 📓',
    nav_duel_arena: '1v1 Coin Duel ⚔️',
    nav_leagues: 'Weekly Leagues 🏆',
    nav_student_packs: 'StudentPacks Community 👥',
    nav_spin_wheel: 'Daily Spin Wheel 🎡',
    lang_label: 'Language',

    dash_welcome: 'Wapas Swagat Hai,',
    dash_sub: 'Aaj kaunsa chapter master karna hai?',
    dash_streak: 'Study Streak 🔥',
    dash_streak_sub: 'Rozana padho aur apni learning flame banaye rakho!',
    dash_coins: 'Study Coins',
    dash_coins_sub: 'Real gifts, toys, bottles aur vouchers redeem karo!',
    dash_quizzes: 'Quizzes Solved',
    dash_quizzes_sub: 'Sabhi subjects aur syllabus chapters mein',
    dash_accuracy: 'Mastery Accuracy',
    dash_start_practice: 'Daily Practice Shuru Karo',
    dash_continue_journey: 'Wahin se continue karo jahan choda tha',
    dash_choose_subject: 'Subject Select Karo',
    dash_choose_chapter: 'Chapter Select Karo',
    dash_take_quiz: 'Adaptive Quiz Start Karo',
    dash_worksheets: 'Practice Worksheets',
    dash_worksheets_sub: 'Step-by-step solutions ke saath printable offline worksheets',
    dash_ask_nova: 'Nova AI Tutor Se Pucho',
    dash_ask_nova_sub: 'Bina direct answer leak kiye easy step-by-step hints paayein',
    dash_switch_class: 'Class Change Karo',
    dash_daily_spin: 'Daily Study Spin Wheel',
    dash_daily_spin_sub: 'Har 24 ghante mein free spin',
    dash_scholarships: 'Worldwide Scholarships',
    dash_mistake_vault: 'Mistake Vault (Galati Sudharo)',
    dash_mistake_vault_sub: 'Purani galatiyon ko master karke +10 Coins jeeto!',
    dash_duel_arena: '1v1 Coin Clash Arena',
    dash_duel_arena_sub: 'Classmates ya online scholars ke saath live 5-question duel khele',
    dash_leagues: 'Weekly Scholar Leagues',
    dash_leagues_sub: 'Weekly rankings me top 5 me aakar agle tier me promote ho!',
    dash_mailbox: 'Student Mailbox',
    dash_mailbox_sub: 'Quiz reports, diagnostic cards aur Nova notes',
    dash_gift_store: 'Rewards Store',
    dash_gift_store_sub: 'Real toys, badges, stationery aur bottles',
    dash_qotd: 'Aaj Ka Sawal (QOTD)',
    dash_qotd_sub: 'Rozana streak booster challenge',

    quiz_question: 'Question',
    quiz_of: 'ka',
    quiz_select_option: 'Sahi option choose karo:',
    quiz_submit: 'Answer Submit Karo',
    quiz_next: 'Agla Question →',
    quiz_hint: '💡 Hint Chahiye?',
    quiz_ask_nova: 'Nova AI Tutor Se Hint Lo',
    quiz_correct: 'Superb! Bilkul Sahi Jawab! (+1 Score) 🎯',
    quiz_incorrect: 'Oho, galat ho gaya! Niche step-by-step concept dekho:',
    quiz_explanation: 'Step-by-Step Concept Breakdown',
    quiz_exit: 'Quiz Chhodein',
    quiz_exit_scary_title: 'Internet issue tha ya sach mein exit karna chahte ho?',
    quiz_exit_scary_sub: 'Quiz beech mein chhodne par progress save nahi hogi. Exit ke liye 4-digit Parent PIN daalein ya wapas chalo.',
    quiz_return_to_quiz: 'Wapas Quiz Mein Chalo (Return to Quiz)',
    quiz_confirm_exit: 'Parent PIN Verify Karke Exit Karo',
    quiz_parent_pin_placeholder: '4-digit Parent PIN enter karo',
    quiz_complete_title: 'Level Mastery Complete! Bahut Badhiya! 🎉',
    quiz_coins_earned: 'Study Coins Jeete',

    nova_greeting: 'Hello! Main hoon Nova, aapki 24/7 AI Tutor. Aaj kaunsa topic clear karna hai? 🎀',
    nova_placeholder: 'Apne syllabus se koi bhi doubt pucho — main step-by-step guide karungi...',
    nova_send: 'Nova ko Send Karo',
    nova_thinking: 'Nova AI aapka concept step-by-step decode kar rahi hai...',

    common_free: 'FREE',
    common_level: 'Level',
    common_chapter: 'Chapter',
    common_subject: 'Subject',
    common_class: 'Class',
    common_board: 'Board',
    common_save: 'Save Karein',
    common_cancel: 'Cancel Karein',
    common_close: 'Band Karein'
  }
};
