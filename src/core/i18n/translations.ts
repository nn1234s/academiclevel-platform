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
    btn_hindi: 'Hindi',
    btn_hindi_sub: 'Hinglish UI — Padhai, quizzes aur hints aasan Hinglish mein',
    btn_english: 'English',
    btn_english_sub: 'Standard academic English interface and navigation',

    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    nav_curriculum: 'Curriculum & Offers',
    nav_practice: 'Daily Practice',
    nav_courses: 'Courses & Chapters',
    nav_nova_ai: 'Nova AI Tutor',
    nav_qotd: 'Daily Challenge',
    nav_gift_store: 'Gift Store',
    nav_coin_mall: 'Coin Mall',
    nav_mailbox: 'Mailbox',
    nav_certificates: 'Certificates',
    nav_profile: 'My Profile',
    nav_logout: 'Log Out',
    nav_signin: 'Sign In',
    nav_special_offer: 'Special ₹49 Offer',
    nav_gold_pass: 'GOLD PASS',
    lang_label: 'Language',

    dash_welcome: 'Welcome back,',
    dash_sub: 'Aaj kaunsa chapter master karna hai?',
    dash_streak: 'Study Streak',
    dash_streak_sub: 'Rozana padhai karo aur learning flame maintain rakho!',
    dash_coins: 'Study Coins',
    dash_coins_sub: 'Gift Store mein real gifts, stationery aur books redeem karo!',
    dash_quizzes: 'Quizzes Solved',
    dash_quizzes_sub: 'Sabhi subjects aur syllabus chapters mein',
    dash_accuracy: 'Accuracy',
    dash_start_practice: 'Daily Practice Shuru Karo',
    dash_continue_journey: 'Jahan choda tha wahan se start karo',
    dash_choose_subject: 'Subject Select Karo',
    dash_choose_chapter: 'Chapter Select Karo',
    dash_take_quiz: 'Quiz Solve Karo',
    dash_worksheets: 'Worksheets Download Karo',
    dash_worksheets_sub: 'Step-by-step solutions ke saath printable offline worksheets',
    dash_ask_nova: 'Nova AI Guru Se Pucho',
    dash_ask_nova_sub: 'Bina direct answer leak kiye easy step-by-step hints paayein',
    dash_switch_class: 'Class Change Karo',
    dash_daily_spin: 'Daily Study Spin Wheel',
    dash_scholarships: 'Worldwide Scholarships',

    quiz_question: 'Question',
    quiz_of: 'of',
    quiz_select_option: 'Answer karne ke liye niche ek option select karo:',
    quiz_submit: 'Submit Answer',
    quiz_next: 'Next Question',
    quiz_hint: 'Hint chahiye?',
    quiz_ask_nova: 'Nova AI Tutor se pucho',
    quiz_correct: 'Shabash! Bilkul sahi answer! (+1 Score)',
    quiz_incorrect: 'Galat answer. Niche step-by-step solution dekhein:',
    quiz_explanation: 'Step-by-Step Explanation',
    quiz_exit: 'Exit Quiz',
    quiz_exit_scary_title: 'Was this a internet error? Or have you left on Purpose?',
    quiz_exit_scary_sub: 'Enter parent pin to exit or return to quiz',
    quiz_return_to_quiz: 'Return to Quiz',
    quiz_confirm_exit: 'Confirm Exit (Requires Parent PIN)',
    quiz_parent_pin_placeholder: '4-digit Parent PIN enter karo',
    quiz_complete_title: 'Level Mastery Complete! 🎉',
    quiz_coins_earned: 'Study Coins Jeete',

    nova_greeting: 'Hello! Main hoon Nova, aapka 24/7 Socratic AI Tutor. Aaj kaunsa concept master karna hai?',
    nova_placeholder: 'Apne syllabus se koi bhi doubt pucho, main step-by-step guide karunga...',
    nova_send: 'Send to Nova',
    nova_thinking: 'Nova AI aapka concept step-by-step decode kar raha hai...',

    common_free: 'FREE',
    common_level: 'Level',
    common_chapter: 'Chapter',
    common_subject: 'Subject',
    common_class: 'Class',
    common_board: 'Board',
    common_save: 'Save',
    common_cancel: 'Cancel',
    common_close: 'Close'
  }
};
