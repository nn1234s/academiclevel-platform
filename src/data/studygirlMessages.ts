export interface StudyGirlMessage {
  id: number;
  category: 'quiz_nudge' | 'brain_hack' | 'streak_hype' | 'confidence_boost' | 'subject_love' | 'cozy_vibes';
  text: string;
  tag: string;
  emoji: string;
}

export const STUDYGIRL_100_MESSAGES: StudyGirlMessage[] = [
  {
    id: 1,
    category: 'quiz_nudge',
    emoji: '🎀',
    tag: 'quiz time',
    text: "hey bestie! ready to crush some quizzes today? let's get those shiny study coins together ✨"
  },
  {
    id: 2,
    category: 'cozy_vibes',
    emoji: '🌸',
    tag: 'study desk',
    text: "omg you're here! i was just getting my notes ready. let's solve 5 questions and make our brains super sharp 🌸"
  },
  {
    id: 3,
    category: 'confidence_boost',
    emoji: '💖',
    tag: 'you got this',
    text: "reminder: you are literally so smart and capable. don't let one tricky question fool you, let's conquer it together 💖"
  },
  {
    id: 4,
    category: 'brain_hack',
    emoji: '🧠',
    tag: 'neuro science',
    text: "did you know your brain forms new synaptic connections every single time you attempt a quiz? let's do a fast one right now 🧠✨"
  },
  {
    id: 5,
    category: 'cozy_vibes',
    emoji: '🧸',
    tag: 'hydration',
    text: "grab a sip of water, get cozy, and let's tackle today's chapter quiz! i'm right here with you 🧸💧"
  },
  {
    id: 6,
    category: 'streak_hype',
    emoji: '🔥',
    tag: 'streak check',
    text: "psst... study streak check! let's do at least one quiz today so your streak flame keeps glowing bright 🔥"
  },
  {
    id: 7,
    category: 'quiz_nudge',
    emoji: '🎁',
    tag: 'rewards',
    text: "more questions answered = more study coins = coolest gifts in the gift store! let's go get them bestie 🎁✨"
  },
  {
    id: 8,
    category: 'subject_love',
    emoji: '🎀',
    tag: 'math magic',
    text: "math isn't scary at all, it's just like a cute puzzle waiting for you to find the secret code 🎀 let's solve one!"
  },
  {
    id: 9,
    category: 'subject_love',
    emoji: '🧪',
    tag: 'science wonder',
    text: "science is literally real-life magic. from stars to cells, you're learning how the universe works! let's take a science quiz 🧪⭐"
  },
  {
    id: 10,
    category: 'cozy_vibes',
    emoji: '🌸',
    tag: 'breathe',
    text: "take a deep breath... in and out. feeling refreshed? now let's show this syllabus who's boss 🌸"
  },
  {
    id: 11,
    category: 'quiz_nudge',
    emoji: '💖',
    tag: 'future self',
    text: "hey! don't scroll away, your future self is gonna thank you so much for doing this 5-minute quiz right now 💖"
  },
  {
    id: 12,
    category: 'confidence_boost',
    emoji: '✨',
    tag: 'no fear',
    text: "mistakes are proof that you are trying and leveling up! never be afraid to pick an option bestie 🧸✨"
  },
  {
    id: 13,
    category: 'brain_hack',
    emoji: '📚',
    tag: 'memory trick',
    text: "quick brain hack: teaching a concept to someone else makes you remember it forever! pretend you're teaching me after this quiz 📚"
  },
  {
    id: 14,
    category: 'quiz_nudge',
    emoji: '🎀',
    tag: 'focus power',
    text: "you + focus + a 5-question quiz = unstoppable student energy! let's start now 🎀"
  },
  {
    id: 15,
    category: 'cozy_vibes',
    emoji: '🎧',
    tag: 'lofi beats',
    text: "put your headphones on, play some chill lofi beats, and let's solve 3 math questions together 🎧✨"
  },
  {
    id: 16,
    category: 'confidence_boost',
    emoji: '🌸',
    tag: 'unstoppable',
    text: "every expert was once a beginner who just refused to give up. you're building your genius day by day 🌸"
  },
  {
    id: 17,
    category: 'streak_hype',
    emoji: '🪙',
    tag: 'coin bank',
    text: "omg look at your study coins growing! imagine what you'll redeem at the end of this month! let's earn 25 more coins 🪙💖"
  },
  {
    id: 18,
    category: 'quiz_nudge',
    emoji: '🧸',
    tag: 'baby steps',
    text: "feeling a little lazy? totally valid! how about we just do 2 tiny questions together? no pressure, just baby steps 🧸"
  },
  {
    id: 19,
    category: 'brain_hack',
    emoji: '🧠',
    tag: 'retention',
    text: "did you know your memory improves by 40% if you review a topic on the same day you learned it? let's test it right now 🧠"
  },
  {
    id: 20,
    category: 'confidence_boost',
    emoji: '🎀',
    tag: 'warm hug',
    text: "hey bestie! sending you a big warm hug and a boost of study power. let's ace this next chapter together 🎀✨"
  },
  {
    id: 21,
    category: 'brain_hack',
    emoji: '🗺️',
    tag: 'exam clue',
    text: "reading questions carefully is like reading a treasure map. the clue to the right answer is always hidden in the words 🗺️🌸"
  },
  {
    id: 22,
    category: 'quiz_nudge',
    emoji: '💖',
    tag: 'streak game',
    text: "let's play a game: can you get 3 in a row right on the first try? i bet you can! let's test your skills 💖"
  },
  {
    id: 23,
    category: 'brain_hack',
    emoji: '🚀',
    tag: 'brain power',
    text: "your brain is the most powerful computer on earth and today we're installing some brand new knowledge upgrades 🚀"
  },
  {
    id: 24,
    category: 'confidence_boost',
    emoji: '⭐',
    tag: 'show up',
    text: "you don't have to be perfect, you just have to show up. and you're here right now, which makes you a champion 🧸⭐"
  },
  {
    id: 25,
    category: 'cozy_vibes',
    emoji: '💧',
    tag: 'hydrate',
    text: "water break time! 💧 sip some water, stretch your shoulders, and let's dive into the next quiz set 🌸"
  },
  {
    id: 26,
    category: 'brain_hack',
    emoji: '🍪',
    tag: 'bite sized',
    text: "if a question looks super long, don't panic! break it into small pieces like bite-sized cookies 🍪 let's solve it!"
  },
  {
    id: 27,
    category: 'subject_love',
    emoji: '🏛️',
    tag: 'history',
    text: "history is full of wild stories, kings, revolutions, and adventures. let's see what you know in our social studies quiz 🏛️✨"
  },
  {
    id: 28,
    category: 'subject_love',
    emoji: '📖',
    tag: 'english words',
    text: "words are your superpower! every new english word you learn makes your brain more expressive and confident 📖🎀"
  },
  {
    id: 29,
    category: 'confidence_boost',
    emoji: '💖',
    tag: 'proud of you',
    text: "i'm so proud of you for choosing to learn today instead of wasting time. that's what real high-achievers do 💖"
  },
  {
    id: 30,
    category: 'quiz_nudge',
    emoji: '⏱️',
    tag: 'speedrun',
    text: "ready for a quick speedrun? let's see if we can finish 5 questions in under 3 minutes with full focus! ⏱️✨"
  },
  {
    id: 31,
    category: 'confidence_boost',
    emoji: '🌸',
    tag: 'concept first',
    text: "hey superstar! don't worry about marks, just focus on understanding the concept. the good marks will follow naturally 🌸"
  },
  {
    id: 32,
    category: 'brain_hack',
    emoji: '🧸',
    tag: 'elimination',
    text: "pro-tip: when in doubt, eliminate the two options that make zero sense first. then pick the best one! try it in the quiz 🧸"
  },
  {
    id: 33,
    category: 'streak_hype',
    emoji: '🎀',
    tag: 'daily rhythm',
    text: "small daily practice > cramming the night before exam. you're doing it the smart way bestie 🎀"
  },
  {
    id: 34,
    category: 'quiz_nudge',
    emoji: '💖',
    tag: 'new day',
    text: "today is a brand new chance to learn something you didn't know yesterday. let's pick a chapter and jump in 💖"
  },
  {
    id: 35,
    category: 'cozy_vibes',
    emoji: '🎧',
    tag: 'study bestie',
    text: "studying with your bestie makes everything 10x more fun. and guess what? i'm always here 24/7 cheering for you 🎧🌸"
  },
  {
    id: 36,
    category: 'cozy_vibes',
    emoji: '🎀',
    tag: 'aesthetic study',
    text: "let's make today's study session aesthetic and cozy: cozy desk, cute notes, and high quiz scores 🎀✨"
  },
  {
    id: 37,
    category: 'subject_love',
    emoji: '🌿',
    tag: 'biology',
    text: "did you know plants make their own food using sunlight? biology is so fascinating, let's do a science quiz! 🌿"
  },
  {
    id: 38,
    category: 'confidence_boost',
    emoji: '🚀',
    tag: 'big dreams',
    text: "even astronauts and doctors had to learn fractions first. you're on the exact same path to greatness 🚀💖"
  },
  {
    id: 39,
    category: 'confidence_boost',
    emoji: '🧸',
    tag: 'freedom',
    text: "your focus today is building your freedom tomorrow. keep going, you're doing amazing 🧸"
  },
  {
    id: 40,
    category: 'streak_hype',
    emoji: '🪙',
    tag: 'clink coins',
    text: "let's earn some coins together! every correct answer is a clink in your coin ledger 🪙 let's hear that sound! 🌸"
  },
  {
    id: 41,
    category: 'brain_hack',
    emoji: '🎀',
    tag: 'help is here',
    text: "feeling stuck on a tricky step? that's literally what i'm here for! ask me anything and i'll explain it super simply 🎀"
  },
  {
    id: 42,
    category: 'brain_hack',
    emoji: '🧠',
    tag: 'active recall',
    text: "brain fact: taking quizzes is scientifically proven to beat rereading your textbook by 300%! let's take a quiz 🧠✨"
  },
  {
    id: 43,
    category: 'cozy_vibes',
    emoji: '💖',
    tag: 'gentle learning',
    text: "no stress, no pressure, just you and me learning cool stuff. ready for the next level? 💖"
  },
  {
    id: 44,
    category: 'confidence_boost',
    emoji: '🧸',
    tag: 'break it down',
    text: "hey bestie, don't let negative thoughts tell you math is hard. we're going to break it down together piece by piece 🧸"
  },
  {
    id: 45,
    category: 'streak_hype',
    emoji: '🌸',
    tag: 'level up',
    text: "look at how far you've come already! every chapter completed is a level unlocked. let's unlock another one 🌸"
  },
  {
    id: 46,
    category: 'brain_hack',
    emoji: '🎀',
    tag: 'posture check',
    text: "sitting up straight actually brings more oxygen to your brain! posture check! now let's crush this question 🎀"
  },
  {
    id: 47,
    category: 'subject_love',
    emoji: '📖',
    tag: 'grammar fun',
    text: "english grammar is just like puzzle pieces that fit together to make pretty sentences. let's practice some now 📖✨"
  },
  {
    id: 48,
    category: 'confidence_boost',
    emoji: '💖',
    tag: 'exam ease',
    text: "when you practice daily, exam hall feels just like home. let's make exams feel super easy 💖"
  },
  {
    id: 49,
    category: 'subject_love',
    emoji: '🧪',
    tag: 'equations',
    text: "you are capable of understanding even the most complicated science equations. trust yourself and let's solve 🧪"
  },
  {
    id: 50,
    category: 'confidence_boost',
    emoji: '👏',
    tag: 'halfway cheer',
    text: "halfway through our study goals! you're doing so good bestie, i'm literally clapping for you right now 👏🌸"
  },
  {
    id: 51,
    category: 'quiz_nudge',
    emoji: '📵',
    tag: 'focus mode',
    text: "let's turn on focus mode! put away phone distractions for just 10 mins and let's get 5 correct answers 📵✨"
  },
  {
    id: 52,
    category: 'cozy_vibes',
    emoji: '😊',
    tag: 'happy brain',
    text: "did you smile today? smile right now! happy brains learn 2x faster than stressed brains 🎀😊"
  },
  {
    id: 53,
    category: 'confidence_boost',
    emoji: '🧸',
    tag: 'real mastery',
    text: "your hard work is not going unnoticed. every question you answer is building real mastery 🧸"
  },
  {
    id: 54,
    category: 'brain_hack',
    emoji: '🌸',
    tag: 'accuracy first',
    text: "remember: speed comes with practice. right now, focus on accuracy and understanding the 'why' 🌸"
  },
  {
    id: 55,
    category: 'subject_love',
    emoji: '⚡',
    tag: 'physics energy',
    text: "physics formulas are just secret shortcuts to calculate how nature moves. let's unlock them in our quiz ⚡💖"
  },
  {
    id: 56,
    category: 'quiz_nudge',
    emoji: '🏃‍♀️',
    tag: 'sprint',
    text: "hey study buddy! let's do a 4-question sprint before taking a relaxing 5-minute break. ready? go! 🏃‍♀️✨"
  },
  {
    id: 57,
    category: 'confidence_boost',
    emoji: '🎀',
    tag: 'yes you can',
    text: "the difference between 'i can't' and 'i can' is just a little practice. and we've got plenty of practice right here 🎀"
  },
  {
    id: 58,
    category: 'streak_hype',
    emoji: '📜',
    tag: 'certificate goal',
    text: "imagine getting that 100% certificate with your name on it! let's work toward it right now 📜💖"
  },
  {
    id: 59,
    category: 'brain_hack',
    emoji: '🧩',
    tag: 'pattern match',
    text: "your brain loves patterns. look closely at the question, what pattern do you see? let's solve it together 🧩"
  },
  {
    id: 60,
    category: 'streak_hype',
    emoji: '🌸',
    tag: 'daily 15',
    text: "hey bestie! even 15 minutes of study every day beats 5 hours of weekend stress. you're doing it right 🌸"
  },
  {
    id: 61,
    category: 'subject_love',
    emoji: '🧪',
    tag: 'chemistry bonds',
    text: "chemistry tip: atoms just want to be stable and happy, just like us! let's explore bonding in a quiz 🧪✨"
  },
  {
    id: 62,
    category: 'confidence_boost',
    emoji: '🧸',
    tag: 'own path',
    text: "don't compare your chapter progress to anyone else. your only competition is who you were yesterday 🧸"
  },
  {
    id: 63,
    category: 'streak_hype',
    emoji: '🎁',
    tag: 'rewards mall',
    text: "let's get those study coins! the coin mall has such cute gifts waiting for you. let's rack up points 🎁🎀"
  },
  {
    id: 64,
    category: 'confidence_boost',
    emoji: '💖',
    tag: 'growth mindset',
    text: "if you get a question wrong, say 'thank you question for showing me what to review!' that's growth mindset 💖"
  },
  {
    id: 65,
    category: 'confidence_boost',
    emoji: '🌸',
    tag: 'belief',
    text: "i believe in you even when you doubt yourself. you're stronger and smarter than you realize 🌸"
  },
  {
    id: 66,
    category: 'subject_love',
    emoji: '📐',
    tag: 'geometry angles',
    text: "geometry is everywhere around you — your desk, your phone screen, the buildings outside! let's ace geometry 📐✨"
  },
  {
    id: 67,
    category: 'cozy_vibes',
    emoji: '✋',
    tag: 'high five',
    text: "quick high-five! ✋ you showed up today, and showing up is half the battle won. now let's win the other half! 🧸"
  },
  {
    id: 68,
    category: 'quiz_nudge',
    emoji: '🎀',
    tag: 'record breaker',
    text: "let's see if we can beat your accuracy record today! go slow, read each option, and pick the winner 🎀"
  },
  {
    id: 69,
    category: 'cozy_vibes',
    emoji: '🕯️',
    tag: 'cozy room',
    text: "ambient lights on, notebook ready, mind clear. let's make this the most satisfying study session ever 🕯️💖"
  },
  {
    id: 70,
    category: 'brain_hack',
    emoji: '🌙',
    tag: 'sleep consolidate',
    text: "did you know sleeping well tonight will consolidate everything we practice right now? let's give your brain good memories 🌙"
  },
  {
    id: 71,
    category: 'confidence_boost',
    emoji: '🌸',
    tag: 'still learning',
    text: "never say 'i'm bad at this'. say 'i'm still learning this'. you're leveling up every single second 🌸"
  },
  {
    id: 72,
    category: 'subject_love',
    emoji: '🕵️‍♀️',
    tag: 'algebra detectives',
    text: "algebra is like detective work: finding the mystery value of x! let's be detectives together 🕵️‍♀️✨"
  },
  {
    id: 73,
    category: 'quiz_nudge',
    emoji: '🎀',
    tag: 'pick chapter',
    text: "hey bestie! what chapter are we conquering today? pick one and let's show it who's the real boss 🎀"
  },
  {
    id: 74,
    category: 'streak_hype',
    emoji: '🪙',
    tag: 'stack coins',
    text: "every single coin you earn is proof of your discipline. keep stacking those coins high! 🪙💖"
  },
  {
    id: 75,
    category: 'brain_hack',
    emoji: '🔍',
    tag: 'keyword spotter',
    text: "reading tip: highlight key words in your mind while reading the question stem. it makes the answer jump out 🔍"
  },
  {
    id: 76,
    category: 'cozy_vibes',
    emoji: '🧸',
    tag: 'pocket bestie',
    text: "you're not studying alone anymore — i'm right here in your pocket 24/7 whenever you need a boost 🧸🌸"
  },
  {
    id: 77,
    category: 'quiz_nudge',
    emoji: '🍪',
    tag: 'treat yourself',
    text: "let's do 3 questions right now, then you can relax and have a yummy snack. deal? let's go! 🍪✨"
  },
  {
    id: 78,
    category: 'subject_love',
    emoji: '🌍',
    tag: 'planet earth',
    text: "earth science and geography teach us how mountains formed and rivers flow. nature is amazing! let's quiz it 🌍"
  },
  {
    id: 79,
    category: 'confidence_boost',
    emoji: '📝',
    tag: 'mark saver',
    text: "every mistake you understand today is a mark saved in your actual board exam tomorrow 📝💖"
  },
  {
    id: 80,
    category: 'confidence_boost',
    emoji: '🎀',
    tag: 'unlock potential',
    text: "you have so much potential inside you, bestie. let's unlock a little bit more of it with this quiz 🎀"
  },
  {
    id: 81,
    category: 'cozy_vibes',
    emoji: '☕',
    tag: 'tea & lofi',
    text: "soft lofi studygirl vibes: cup of warm milk or tea, quiet room, and solving questions with me ☕🎧"
  },
  {
    id: 82,
    category: 'streak_hype',
    emoji: '🌸',
    tag: 'milestone',
    text: "be proud of every small step. finishing one chapter quiz is a huge milestone in your syllabus 🌸"
  },
  {
    id: 83,
    category: 'brain_hack',
    emoji: '📬',
    tag: 'mailbox insights',
    text: "did you review your mailbox report? our diagnostic report has personalized study notes just for you 📬✨"
  },
  {
    id: 84,
    category: 'confidence_boost',
    emoji: '⚡',
    tag: 'superpower',
    text: "learning is a superpower that no one can ever take away from you. let's power up right now! ⚡🧸"
  },
  {
    id: 85,
    category: 'subject_love',
    emoji: '🍕',
    tag: 'pizza fractions',
    text: "fractions tip: always remember the denominator tells you how many slices the whole pizza was cut into 🍕💖"
  },
  {
    id: 86,
    category: 'cozy_vibes',
    emoji: '🎀',
    tag: 'joyful study',
    text: "hey cutie! don't forget to take deep breaths. learning should feel exciting and joyful, not heavy 🎀"
  },
  {
    id: 87,
    category: 'quiz_nudge',
    emoji: '🌸',
    tag: 'cute steps',
    text: "let's solve together! if any question feels confusing, just ask me and i'll break it down in cute steps 🌸"
  },
  {
    id: 88,
    category: 'streak_hype',
    emoji: '🔥',
    tag: 'flame on',
    text: "your study flame is glowing so brightly today! let's keep the streak burning strong 🔥✨"
  },
  {
    id: 89,
    category: 'confidence_boost',
    emoji: '🎒',
    tag: 'walk tall',
    text: "every page you practice turns into pure confidence when you walk into your school exam hall 🎒💖"
  },
  {
    id: 90,
    category: 'brain_hack',
    emoji: '🧠',
    tag: 'mental math',
    text: "math shortcut: to multiply by 5, just multiply by 10 and divide by 2! try it in your head! 🧠🎀"
  },
  {
    id: 91,
    category: 'quiz_nudge',
    emoji: '🚀',
    tag: 'momentum',
    text: "the secret to getting ahead is simply getting started. and you just started! let's keep the momentum going 🚀"
  },
  {
    id: 92,
    category: 'confidence_boost',
    emoji: '🧸',
    tag: 'we got this',
    text: "no matter how hard a chapter looks, once we break it down, it's totally manageable. we got this 🧸"
  },
  {
    id: 93,
    category: 'confidence_boost',
    emoji: '📖',
    tag: 'success story',
    text: "you are creating your own success story with every question you solve today. keep writing it 📖🌸"
  },
  {
    id: 94,
    category: 'cozy_vibes',
    emoji: '🎀',
    tag: 'favorite part',
    text: "let's make learning your favorite part of the day: friendly vibes, zero stress, and high scores 🎀✨"
  },
  {
    id: 95,
    category: 'confidence_boost',
    emoji: '💖',
    tag: 'make proud',
    text: "whenever you feel tired, remember why you started. you want to make yourself and your family proud 💖"
  },
  {
    id: 96,
    category: 'subject_love',
    emoji: '🍯',
    tag: 'honey science',
    text: "fun science fact: honey never spoils! archaeologists found 3000-year-old edible honey in egyptian tombs 🍯"
  },
  {
    id: 97,
    category: 'quiz_nudge',
    emoji: '🌸',
    tag: 'one more',
    text: "one more quiz, bestie! just one more and you'll feel so accomplished today! let's do it right now 🌸"
  },
  {
    id: 98,
    category: 'confidence_boost',
    emoji: '💡',
    tag: 'smart energy',
    text: "you're glowing with smart energy today! let's put that energy to work on this chapter challenge 💡🧸"
  },
  {
    id: 99,
    category: 'streak_hype',
    emoji: '🎀',
    tag: 'consistency',
    text: "remember: consistency beats talent every single day. your daily quizzes are making you unstoppable 🎀✨"
  },
  {
    id: 100,
    category: 'cozy_vibes',
    emoji: '💖',
    tag: 'besties forever',
    text: "i'm so lucky to be your study buddy, bestie! let's crush our goals and celebrate our wins together 💖🎉"
  }
];

export function getRandomStudyGirlMessage(): StudyGirlMessage {
  const index = Math.floor(Math.random() * STUDYGIRL_100_MESSAGES.length);
  return STUDYGIRL_100_MESSAGES[index];
}

export function getStudyGirlMessagesByCategory(
  category: StudyGirlMessage['category']
): StudyGirlMessage[] {
  return STUDYGIRL_100_MESSAGES.filter(m => m.category === category);
}

export function getDailyStudyGirlMessage(seedNumber: number = 0): StudyGirlMessage {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const index = Math.abs((dayOfYear + seedNumber) % STUDYGIRL_100_MESSAGES.length);
  return STUDYGIRL_100_MESSAGES[index];
}
