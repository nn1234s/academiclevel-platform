export const BOARDS = ['CBSE', 'ICSE', 'IGCSE'];
export const NODES = ['FOUNDATION', 'CONCEPT', 'EXAM_READY', 'OLYMPIAD'];

export const seenTexts = new Set();

export function normalizeText(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[?!.,;:'"“”‘’]/g, '')
    .replace(/\s+/g, ' ');
}

export const NAMES = [
  'Aarav', 'Diya', 'Rohan', 'Ananya', 'Kabir', 'Meera', 'Ishan', 'Priya', 'Arjun', 'Sanya',
  'Vihaan', 'Tara', 'Aditya', 'Riya', 'Dev', 'Pooja', 'Vivaan', 'Kavya', 'Reyansh', 'Ishita',
  'Dhruv', 'Avani', 'Shaurya', 'Aanya', 'Atharv', 'Tanvi', 'Neil', 'Myra', 'Karan', 'Isha',
  'Yash', 'Siya', 'Aryan', 'Zara', 'Samar', 'Navya', 'Manav', 'Sara', 'Pranav', 'Nisha',
  'Ayaan', 'Gauri', 'Harsh', 'Trisha', 'Laksh', 'Anika', 'Varun', 'Sneha', 'Ritvik', 'Kriti',
  'Ayush', 'Roshni', 'Om', 'Bhavya', 'Darsh', 'Simran', 'Armaan', 'Nandini', 'Tejas', 'Jiya',
  'Chirag', 'Mallika', 'Kunal', 'Shruti', 'Nikhil', 'Deepa', 'Siddharth', 'Bhavna', 'Gaurav', 'Juhi'
];

export const ITEMS = [
  'apples', 'colour pencils', 'storybooks', 'origami sheets', 'marbles', 'mangoes', 'cupcakes',
  'cricket balls', 'stickers', 'crayons', 'stamps', 'balloons', 'ribbons', 'badges', 'notebooks',
  'chocolates', 'erasers', 'pencils', 'toy cars', 'seashells', 'postcards', 'flowers', 'wooden blocks',
  'candies', 'plant saplings', 'paintbrushes', 'paper clips', 'badges', 'bookmarks', 'glass beads'
];

export const CITIES = [
  'New Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi', 'Bhopal', 'Varanasi', 'Patna', 'Guwahati', 'Indore'
];

export function pickRandom(arr, seed = 0) {
  return arr[Math.abs(seed) % arr.length];
}

export function makeQ({
  id,
  board,
  grade,
  subjectId,
  levelNode,
  text,
  correctOpt,
  wrongOpts,
  explanation,
  hint,
  topicTag
}) {
  const norm = normalizeText(text);
  if (seenTexts.has(norm)) {
    return null; // Reject duplicate text!
  }

  const cleanCorrect = String(correctOpt).trim();
  const seenChoices = new Set([cleanCorrect.toLowerCase()]);
  const validWrong = [];

  for (const w of wrongOpts) {
    const cleanW = String(w).trim();
    const lowerW = cleanW.toLowerCase();
    if (!seenChoices.has(lowerW) && cleanW !== '') {
      seenChoices.add(lowerW);
      validWrong.push(cleanW);
    }
  }

  // Ensure exactly 3 distinct wrong options
  let fallbackCounter = 1;
  while (validWrong.length < 3) {
    let fallback = '';
    const numMatch = cleanCorrect.match(/^[-+]?\d+(\.\d+)?(\s*[a-zA-Z°%µ/]+)?$/);
    if (numMatch) {
      const valStr = cleanCorrect.replace(/[^0-9.-]/g, '');
      const unitStr = cleanCorrect.replace(/[0-9.-]/g, '');
      const val = parseFloat(valStr) || 0;
      const delta = fallbackCounter * (Math.abs(val) > 10 ? 5 : 1);
      const candidateVal = val + (fallbackCounter % 2 === 0 ? delta : -delta);
      const candidate = `${candidateVal}${unitStr}`;
      if (!seenChoices.has(candidate.toLowerCase())) {
        fallback = candidate;
      }
    } else {
      fallback = `Alternative ${fallbackCounter}`;
    }

    if (fallback && !seenChoices.has(fallback.toLowerCase())) {
      seenChoices.add(fallback.toLowerCase());
      validWrong.push(fallback);
    }
    fallbackCounter++;
  }

  const finalWrong = validWrong.slice(0, 3);
  const correctIdx = Math.floor(Math.random() * 4);
  const options = [];
  let wrongPtr = 0;
  for (let i = 0; i < 4; i++) {
    if (i === correctIdx) {
      options.push(cleanCorrect);
    } else {
      options.push(finalWrong[wrongPtr++]);
    }
  }

  seenTexts.add(norm);

  return {
    id,
    board,
    grade,
    subjectId,
    levelNode,
    text: text.trim(),
    options,
    correctIndex: correctIdx,
    explanation: `[${board} Class ${grade} Syllabus] ${explanation}`,
    hint,
    difficulty: levelNode === 'OLYMPIAD' ? 'HARD' : levelNode === 'EXAM_READY' ? 'MEDIUM' : 'EASY',
    topicTag
  };
}
