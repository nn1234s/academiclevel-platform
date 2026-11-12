import { makeQ, NAMES, ITEMS, CITIES, pickRandom } from './common.js';

export function getPrimaryQuestion(grade, board, node, counter, qId) {
  const name1 = pickRandom(NAMES, counter * 7 + 1);
  const name2 = pickRandom(NAMES, counter * 13 + 3);
  const item = pickRandom(ITEMS, counter * 11 + 5);
  const city = pickRandom(CITIES, counter * 3 + 2);

  if (grade === 1) {
    const variant = counter % 20;
    switch (variant) {
      case 0: {
        const a = (counter % 35) + 2;
        const b = ((counter * 7) % 25) + 1;
        const sum = a + b;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In a classroom activity in ${city}, ${name1} has ${a} ${item} and ${name2} brings ${b} more ${item}. How many ${item} are there altogether?`,
          correctOpt: `${sum} ${item}`,
          wrongOpts: [`${sum + 1} ${item}`, `${sum - 1} ${item}`, `${sum + 2} ${item}`],
          explanation: `Add the two amounts together: ${a} + ${b} = ${sum} ${item}.`,
          hint: 'Sum the two quantities.',
          topicTag: 'Addition Word Problems'
        });
      }
      case 1: {
        const total = (counter % 45) + 15;
        const taken = ((counter * 3) % 12) + 1;
        const rem = total - taken;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `${name1} had ${total} ${item} in ${city}. ${name1} gifted ${taken} ${item} to ${name2}. How many ${item} remain with ${name1}?`,
          correctOpt: `${rem} ${item}`,
          wrongOpts: [`${rem + 1} ${item}`, `${rem - 1} ${item}`, `${total} ${item}`],
          explanation: `Subtract the given items: ${total} - ${taken} = ${rem} ${item}.`,
          hint: 'Take away the smaller number from the starting total.',
          topicTag: 'Subtraction Word Problems'
        });
      }
      case 2: {
        const n = (counter % 95) + 1;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `While writing numbers on a chart in ${city}, ${name1} asks: Which number comes immediately AFTER ${n}?`,
          correctOpt: `${n + 1}`,
          wrongOpts: [`${n - 1}`, `${n + 2}`, `${n + 10}`],
          explanation: `The successor of ${n} is ${n + 1}.`,
          hint: 'Add 1 to the given number.',
          topicTag: 'Number Sequences'
        });
      }
      case 3: {
        const n = (counter % 95) + 2;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `During math puzzle hour, ${name2} asks: Which number comes immediately BEFORE ${n}?`,
          correctOpt: `${n - 1}`,
          wrongOpts: [`${n + 1}`, `${n - 2}`, `${n + 5}`],
          explanation: `The predecessor of ${n} is ${n - 1}.`,
          hint: 'Subtract 1 from the number.',
          topicTag: 'Predecessor'
        });
      }
      case 4: {
        const a = (counter % 45) + 2;
        const b = a + (counter % 12) + 1;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `${name1} has ${a} points and ${name2} has ${b} points. Which score is GREATER?`,
          correctOpt: `${b}`,
          wrongOpts: [`${a}`, 'Both scores are equal', 'Zero'],
          explanation: `Comparing ${a} and ${b}: ${b} is larger than ${a} (${b} > ${a}).`,
          hint: 'Identify the bigger number.',
          topicTag: 'Number Comparison'
        });
      }
      case 5: {
        const animals = [
          { a: 'dog', b: 'puppy', h: 'kennel' },
          { a: 'cat', b: 'kitten', h: 'cattery' },
          { a: 'cow', b: 'calf', h: 'shed' },
          { a: 'sheep', b: 'lamb', h: 'pen' },
          { a: 'horse', b: 'foal', h: 'stable' },
          { a: 'duck', b: 'duckling', h: 'pond' },
          { a: 'hen', b: 'chick', h: 'coop' },
          { a: 'lion', b: 'cub', h: 'den' }
        ];
        const an = animals[counter % animals.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In a nature study book read by ${name1} in ${city}, what is the young offspring of a ${an.a} called?`,
          correctOpt: an.b,
          wrongOpts: animals.filter(x => x.b !== an.b).map(x => x.b),
          explanation: `The baby of a ${an.a} is called a ${an.b}.`,
          hint: `Think of a baby ${an.a}.`,
          topicTag: 'Animal Offspring'
        });
      }
      case 6: {
        const senses = [
          { organ: 'Eyes', act: 'look at distant stars and colorful pictures', w: ['Ears', 'Nose', 'Tongue'] },
          { organ: 'Ears', act: 'hear the school bell ring and listen to music', w: ['Eyes', 'Skin', 'Tongue'] },
          { organ: 'Nose', act: 'smell fresh baking cookies and flowers', w: ['Ears', 'Eyes', 'Skin'] },
          { organ: 'Tongue', act: 'taste sour lemons and sweet strawberries', w: ['Nose', 'Eyes', 'Ears'] },
          { organ: 'Skin', act: 'feel cold ice cubes and rough tree bark', w: ['Nose', 'Tongue', 'Eyes'] }
        ];
        const s = senses[counter % senses.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `Which primary human sensory organ enables ${name2} to ${s.act}?`,
          correctOpt: s.organ,
          wrongOpts: s.w,
          explanation: `Our ${s.organ.toLowerCase()} are used to ${s.act}.`,
          hint: 'Select the body part responsible for this sensation.',
          topicTag: 'Sense Organs'
        });
      }
      case 7: {
        const plants = [
          { part: 'Roots', func: 'anchor the plant firmly in soil and absorb moisture', w: ['Leaves', 'Flowers', 'Stem'] },
          { part: 'Leaves', func: 'produce nourishing food using sunlight and air', w: ['Roots', 'Bark', 'Seeds'] },
          { part: 'Stem', func: 'support the plant branches and transport water upward', w: ['Roots', 'Petals', 'Leaves'] },
          { part: 'Flowers', func: 'attract colorful butterflies and develop into fruits', w: ['Roots', 'Bark', 'Thorns'] }
        ];
        const p = plants[counter % plants.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `While examining a garden plant with ${name1}, which plant organ functions to ${p.func}?`,
          correctOpt: p.part,
          wrongOpts: p.w,
          explanation: `The ${p.part.toLowerCase()} of a plant ${p.func}.`,
          hint: 'Identify the plant structure described.',
          topicTag: 'Plant Anatomy'
        });
      }
      case 8: {
        const shapes = [
          { s: 'Circle', d: 'is perfectly round with no straight edges and zero corners', w: ['Square', 'Triangle', 'Rectangle'] },
          { s: 'Triangle', d: 'has exactly three straight sides and three corners', w: ['Circle', 'Oval', 'Square'] },
          { s: 'Square', d: 'has four straight equal sides and four right corners', w: ['Circle', 'Triangle', 'Pentagon'] },
          { s: 'Rectangle', d: 'has four sides with equal opposite sides like a picture frame', w: ['Circle', 'Triangle', 'Oval'] }
        ];
        const sh = shapes[counter % shapes.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In art and geometry craft, ${name2} cuts out a shape that ${sh.d}. Which geometric shape is it?`,
          correctOpt: sh.s,
          wrongOpts: sh.w,
          explanation: `A ${sh.s.toLowerCase()} ${sh.d}.`,
          hint: 'Count the sides and corners.',
          topicTag: '2D Shapes'
        });
      }
      case 9: {
        const helpers = [
          { job: 'Doctor', act: 'diagnoses illnesses and cares for sick children', w: ['Teacher', 'Firefighter', 'Carpenter'] },
          { job: 'Teacher', act: 'guides students to learn reading, writing, and arithmetic', w: ['Police Officer', 'Plumber', 'Doctor'] },
          { job: 'Firefighter', act: 'puts out hazardous fires with water hoses', w: ['Baker', 'Doctor', 'Tailor'] },
          { job: 'Postman', act: 'carries letters and packages to households', w: ['Electrician', 'Teacher', 'Farmer'] }
        ];
        const h = helpers[counter % helpers.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'social', levelNode: node,
          text: `In our neighborhood in ${city}, which vital community helper ${h.act}?`,
          correctOpt: h.job,
          wrongOpts: h.w,
          explanation: `A ${h.job} is the person who ${h.act}.`,
          hint: 'Match the helper to their role.',
          topicTag: 'Community Helpers'
        });
      }
      case 10: {
        const rhymes = [
          { w: 'CAT', r: 'MAT', wrong: ['DOG', 'CUP', 'SUN'] },
          { w: 'PEN', r: 'HEN', wrong: ['POT', 'PAN', 'PIN'] },
          { w: 'SUN', r: 'FUN', wrong: ['SIT', 'MAN', 'TOP'] },
          { w: 'BED', r: 'FED', wrong: ['BOX', 'BAG', 'BUS'] },
          { w: 'CAR', r: 'STAR', wrong: ['FOX', 'FIG', 'FIT'] },
          { w: 'HOP', r: 'TOP', wrong: ['HAT', 'HEN', 'HUT'] }
        ];
        const r = rhymes[counter % rhymes.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'english', levelNode: node,
          text: `During phonics time with ${name1}, which word sounds the same at the end as "${r.w}"?`,
          correctOpt: r.r,
          wrongOpts: r.wrong,
          explanation: `"${r.w}" and "${r.r}" rhyme because they share the same ending sound.`,
          hint: 'Listen to the rhyme sound.',
          topicTag: 'Rhyming Phonics'
        });
      }
      case 11: {
        const opposites = [
          { a: 'TALL', b: 'SHORT', w: ['BIG', 'WIDE', 'HEAVY'] },
          { a: 'FAST', b: 'SLOW', w: ['QUICK', 'HARD', 'LOUD'] },
          { a: 'BRIGHT', b: 'DARK', w: ['SHINY', 'CLEAR', 'WARM'] },
          { a: 'HEAVY', b: 'LIGHT', w: ['SOFT', 'THIN', 'COLD'] },
          { a: 'CLEAN', b: 'DIRTY', w: ['NEAT', 'WET', 'FRESH'] },
          { a: 'SWEET', b: 'BITTER', w: ['SOUR', 'SALTY', 'WARM'] }
        ];
        const op = opposites[counter % opposites.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'english', levelNode: node,
          text: `${name2} describes an object as "${op.a}". What is the direct opposite (antonym) of "${op.a}"?`,
          correctOpt: op.b,
          wrongOpts: op.w,
          explanation: `The opposite of "${op.a}" is "${op.b}".`,
          hint: 'Think of the contrary property.',
          topicTag: 'Antonyms'
        });
      }
      case 12: {
        const tens = (counter % 8) + 2;
        const ones = (counter % 9) + 1;
        const num = tens * 10 + ones;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In the number ${num} written by ${name1}, what is the place value of the digit ${tens} in the tens column?`,
          correctOpt: `${tens * 10}`,
          wrongOpts: [`${tens}`, `${ones}`, `${tens * 100}`],
          explanation: `The digit ${tens} in the tens position represents ${tens} groups of ten, which equals ${tens * 10}.`,
          hint: 'Multiply the tens digit by 10.',
          topicTag: 'Place Value'
        });
      }
      case 13: {
        const h = (counter % 11) + 1;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `When the minute hand points straight up at 12 and the hour hand points at ${h}, what time is it on ${name2}'s classroom clock?`,
          correctOpt: `${h}:00 o'clock`,
          wrongOpts: [`${(h % 12) + 1}:00 o'clock`, `${h}:30`, `12:${String(h).padStart(2, '0')}`],
          explanation: `When the minute hand is at 12 and the hour hand is at ${h}, the clock shows ${h}:00.`,
          hint: 'The minute hand at 12 indicates an exact hour.',
          topicTag: 'Time & Clocks'
        });
      }
      case 14: {
        const a = (counter % 8) + 2;
        const b = (counter % 8) + 2;
        const prod = a * b;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `If ${name1} places ${item} into ${a} small boxes with ${b} ${item} in each box, how many ${item} are boxed in total?`,
          correctOpt: `${prod} ${item}`,
          wrongOpts: [`${prod + a} ${item}`, `${prod - 1} ${item}`, `${prod + b} ${item}`],
          explanation: `Multiply the number of boxes by the count in each box: ${a} × ${b} = ${prod} ${item}.`,
          hint: 'Use repeated addition or multiplication.',
          topicTag: 'Basic Multiplication'
        });
      }
      case 15: {
        const coins = [
          { val: 10, itemCost: 6, change: 4 },
          { val: 20, itemCost: 14, change: 6 },
          { val: 50, itemCost: 35, change: 15 },
          { val: 20, itemCost: 12, change: 8 },
          { val: 10, itemCost: 7, change: 3 }
        ];
        const c = coins[counter % coins.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `${name1} pays ₹${c.val} for a stationery ${item} costing ₹${c.itemCost}. What is the correct change to receive back?`,
          correctOpt: `₹${c.change}`,
          wrongOpts: [`₹${c.change + 2}`, `₹${c.change - 1}`, `₹${c.val}`],
          explanation: `Change = Amount given - Item cost = ₹${c.val} - ₹${c.itemCost} = ₹${c.change}.`,
          hint: 'Subtract cost from payment.',
          topicTag: 'Money Math'
        });
      }
      case 16: {
        const vowels = ['A', 'E', 'I', 'O', 'U'];
        const v = vowels[counter % vowels.length];
        const consonants = ['B', 'D', 'G', 'K', 'M', 'P', 'R', 'T'];
        const c1 = consonants[(counter * 2) % consonants.length];
        const c2 = consonants[(counter * 3 + 1) % consonants.length];
        const c3 = consonants[(counter * 5 + 3) % consonants.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'english', levelNode: node,
          text: `In an English spelling warm-up led by ${name2}, which of these letters is an English VOWEL?`,
          correctOpt: v,
          wrongOpts: [c1, c2, c3],
          explanation: `A, E, I, O, U are vowels. Therefore, ${v} is a vowel.`,
          hint: 'Recall the 5 English vowel sounds.',
          topicTag: 'Vowels'
        });
      }
      case 17: {
        const seasons = [
          { s: 'Summer', f: 'wearing thin cotton clothes and enjoying cold watermelon', w: ['Winter', 'Monsoon', 'Autumn'] },
          { s: 'Winter', f: 'wearing warm woolen caps and drinking warm milk by the fireplace', w: ['Summer', 'Spring', 'Monsoon'] },
          { s: 'Monsoon', f: 'watching rainwater puddles and using bright raincoats', w: ['Summer', 'Winter', 'Autumn'] }
        ];
        const sea = seasons[counter % seasons.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In which weather season do ${name1} and friends enjoy ${sea.f}?`,
          correctOpt: sea.s,
          wrongOpts: sea.w,
          explanation: `${sea.s} is the season associated with ${sea.f}.`,
          hint: 'Identify the season.',
          topicTag: 'Seasons'
        });
      }
      case 18: {
        const countVal = (counter % 12) + 3;
        const isEven = countVal % 2 === 0;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `Can ${name1} pair up ${countVal} ${item} into exact pairs with no single ${item} left over?`,
          correctOpt: isEven ? 'Yes, because it is an EVEN number' : 'No, because it is an ODD number',
          wrongOpts: [
            isEven ? 'No, because it is an ODD number' : 'Yes, because it is an EVEN number',
            'Only if one is discarded',
            'Always impossible'
          ],
          explanation: `${countVal} is ${isEven ? 'even' : 'odd'}. ${isEven ? 'Even numbers pair completely.' : 'Odd numbers leave one unpaired.'}`,
          hint: 'Check if divisible by 2.',
          topicTag: 'Even and Odd'
        });
      }
      default: {
        const national = [
          { t: 'National Bird of India', a: 'Peacock', w: ['Parrot', 'Eagle', 'Crow'] },
          { t: 'National Animal of India', a: 'Royal Bengal Tiger', w: ['Lion', 'Elephant', 'Cheetah'] },
          { t: 'National Flower of India', a: 'Lotus', w: ['Rose', 'Sunflower', 'Jasmine'] },
          { t: 'National Tree of India', a: 'Banyan Tree', w: ['Neem Tree', 'Mango Tree', 'Peepal Tree'] }
        ];
        const nat = national[counter % national.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'social', levelNode: node,
          text: `During school celebration in ${city}, ${name2} asks: What is the official ${nat.t}?`,
          correctOpt: nat.a,
          wrongOpts: nat.w,
          explanation: `The official ${nat.t} is the ${nat.a}.`,
          hint: 'Recall Indian national symbols.',
          topicTag: 'National Symbols'
        });
      }
    }
  }

  // Grade 2: 2-digit arithmetic, multiplication tables 2-5 & 10, measurement, living/non-living, nutrition
  if (grade === 2) {
    const variant = counter % 20;
    switch (variant) {
      case 0: {
        const a = (counter % 80) + 15;
        const b = ((counter * 7) % 70) + 10;
        const sum = a + b;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In a collection drive in ${city}, ${name1} collected ${a} ${item} and ${name2} collected ${b} ${item}. How many ${item} did they collect altogether?`,
          correctOpt: `${sum} ${item}`,
          wrongOpts: [`${sum + 2} ${item}`, `${sum - 2} ${item}`, `${sum + 10} ${item}`],
          explanation: `Add the two-digit numbers: ${a} + ${b} = ${sum} ${item}.`,
          hint: 'Sum the numbers column by column.',
          topicTag: '2-Digit Addition'
        });
      }
      case 1: {
        const a = (counter % 90) + 45;
        const b = ((counter * 5) % 35) + 5;
        const diff = a - b;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `A storage box in ${city} contained ${a} ${item}. ${name1} took out ${b} ${item} for an art workshop with ${name2}. How many ${item} are still inside the box?`,
          correctOpt: `${diff} ${item}`,
          wrongOpts: [`${diff + 2} ${item}`, `${diff - 2} ${item}`, `${diff + 10} ${item}`],
          explanation: `Subtract: ${a} - ${b} = ${diff} ${item}.`,
          hint: 'Subtract the smaller number from the larger.',
          topicTag: '2-Digit Subtraction'
        });
      }
      case 2: {
        const factor = (counter % 4) + 2; // 2, 3, 4, 5
        const countM = (counter % 9) + 2;
        const prod = factor * countM;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `If ${name1} arranges ${factor} rows of desks with ${countM} chairs in each row, how many chairs are there in total?`,
          correctOpt: `${prod} chairs`,
          wrongOpts: [`${prod + factor} chairs`, `${prod - factor} chairs`, `${prod + 1} chairs`],
          explanation: `Multiplication is repeated addition: ${factor} × ${countM} = ${prod} chairs.`,
          hint: 'Multiply rows by count per row.',
          topicTag: 'Multiplication Tables'
        });
      }
      case 3: {
        const hundreds = (counter % 7) + 2;
        const tens = (counter % 9) + 1;
        const ones = (counter % 9) + 1;
        const val = hundreds * 100 + tens * 10 + ones;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In the three-digit number ${val} shown to ${name2}, what is the place value of the digit ${hundreds} in the hundreds place?`,
          correctOpt: `${hundreds * 100}`,
          wrongOpts: [`${hundreds}`, `${hundreds * 10}`, `${ones}`],
          explanation: `The digit ${hundreds} is in the hundreds position, so its value is ${hundreds} × 100 = ${hundreds * 100}.`,
          hint: 'Hundreds place represents groups of one hundred.',
          topicTag: '3-Digit Place Value'
        });
      }
      case 4: {
        const lenMeters = (counter % 12) + 2;
        const cm = lenMeters * 100;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `When measuring a sports banner of length ${lenMeters} meters, how many centimeters is that equivalent to?`,
          correctOpt: `${cm} cm`,
          wrongOpts: [`${lenMeters * 10} cm`, `${lenMeters * 1000} cm`, `${cm + 50} cm`],
          explanation: `1 meter equals 100 centimeters. Therefore, ${lenMeters} m = ${lenMeters} × 100 = ${cm} cm.`,
          hint: 'Recall that 1 m = 100 cm.',
          topicTag: 'Length Measurement'
        });
      }
      case 5: {
        const kg = (counter % 8) + 1;
        const grams = kg * 1000;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `${name1} purchases a bag of rice weighing ${kg} kilogram(s) at the market in ${city}. How many grams is this?`,
          correctOpt: `${grams} grams`,
          wrongOpts: [`${kg * 100} grams`, `${kg * 10} grams`, `${grams + 500} grams`],
          explanation: `1 kilogram equals 1,000 grams. So ${kg} kg = ${kg} × 1000 = ${grams} grams.`,
          hint: 'Recall that 1 kg = 1,000 g.',
          topicTag: 'Weight Measurement'
        });
      }
      case 6: {
        const plantTypes = [
          { type: 'Tree', ex: 'Banyan and Neem', desc: 'has a thick, tall woody trunk', w: ['Herb', 'Shrub', 'Climber'] },
          { type: 'Shrub', ex: 'Rose and Hibiscus', desc: 'has medium-height woody bushy branches near the ground', w: ['Tree', 'Herb', 'Creeper'] },
          { type: 'Herb', ex: 'Mint and Coriander', desc: 'has soft, delicate green stems', w: ['Tree', 'Shrub', 'Climber'] },
          { type: 'Climber', ex: 'Money plant and Grapevine', desc: 'needs external support of a stick or wall to climb upward', w: ['Tree', 'Shrub', 'Herb'] },
          { type: 'Creeper', ex: 'Watermelon and Pumpkin', desc: 'creeps along the ground because of heavy fruits', w: ['Tree', 'Shrub', 'Herb'] }
        ];
        const pt = plantTypes[counter % plantTypes.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In botany class attended by ${name1}, which category of plant includes ${pt.ex} and ${pt.desc}?`,
          correctOpt: pt.type,
          wrongOpts: pt.w,
          explanation: `${pt.type}s are defined as plants that ${pt.desc} (e.g. ${pt.ex}).`,
          hint: 'Observe the stem thickness and height.',
          topicTag: 'Types of Plants'
        });
      }
      case 7: {
        const habitats = [
          { hab: 'Aquatic animals', ex: 'Fishes, whales, and dolphins', desc: 'live and breathe underwater', w: ['Terrestrial animals', 'Aerial animals', 'Arboreal animals'] },
          { hab: 'Terrestrial animals', ex: 'Lions, deer, and cows', desc: 'live predominantly on land surfaces', w: ['Aquatic animals', 'Amphibians', 'Aerial animals'] },
          { hab: 'Amphibians', ex: 'Frogs and toads', desc: 'can live both on land and in water', w: ['Aquatic animals', 'Reptiles', 'Insects'] },
          { hab: 'Arboreal animals', ex: 'Monkeys and squirrels', desc: 'spend most of their active life on trees', w: ['Aquatic animals', 'Terrestrial animals', 'Burrowing animals'] }
        ];
        const hab = habitats[counter % habitats.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `What is the scientific term for animals like ${hab.ex} that ${hab.desc}?`,
          correctOpt: hab.hab,
          wrongOpts: hab.w,
          explanation: `${hab.hab} are animals that ${hab.desc}.`,
          hint: 'Think of the environment where they dwell.',
          topicTag: 'Animal Habitats'
        });
      }
      case 8: {
        const nutrition = [
          { group: 'Carbohydrates', func: 'provide immediate energy for playing and studying', ex: 'Rice, potatoes, and bread', w: ['Proteins', 'Vitamins', 'Fibers'] },
          { group: 'Proteins', func: 'help the body grow tall and repair tissues', ex: 'Pulses, milk, eggs, and paneer', w: ['Carbohydrates', 'Fats', 'Minerals'] },
          { group: 'Vitamins & Minerals', func: 'protect the body from illnesses and infections', ex: 'Fresh green vegetables and fruits', w: ['Fats', 'Carbohydrates', 'Sugars'] },
          { group: 'Fats', func: 'store extra energy and keep the body warm', ex: 'Butter, ghee, and nuts', w: ['Proteins', 'Vitamins', 'Water'] }
        ];
        const nut = nutrition[counter % nutrition.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In a balanced meal prepared by ${name2}'s family, which nutrient group ${nut.func} (found in ${nut.ex})?`,
          correctOpt: nut.group,
          wrongOpts: nut.w,
          explanation: `${nut.group} are essential nutrients that ${nut.func}.`,
          hint: 'Recall the major food groups and their functions.',
          topicTag: 'Nutrition & Balanced Diet'
        });
      }
      case 9: {
        const waterCycle = [
          { proc: 'Evaporation', desc: 'liquid water heating up in the sun and turning into invisible water vapor', w: ['Condensation', 'Precipitation', 'Freezing'] },
          { proc: 'Condensation', desc: 'warm water vapor cooling down high in the sky to form clouds and droplets', w: ['Evaporation', 'Collection', 'Melting'] },
          { proc: 'Precipitation', desc: 'water droplets in heavy clouds falling down as rain or snow', w: ['Evaporation', 'Condensation', 'Filtration'] }
        ];
        const wc = waterCycle[counter % waterCycle.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In the water cycle studied by ${name1}, what is the process of ${wc.desc} called?`,
          correctOpt: wc.proc,
          wrongOpts: wc.w,
          explanation: `${wc.proc} is the physical process where ${wc.desc}.`,
          hint: 'Think of the three stages of the water cycle.',
          topicTag: 'Water Cycle'
        });
      }
      case 10: {
        const partsOfSpeech = [
          { word: 'Elephant', type: 'Noun', desc: 'naming a large land animal', w: ['Verb', 'Adjective', 'Pronoun'] },
          { word: 'Playful', type: 'Adjective', desc: 'describing a friendly kitten', w: ['Noun', 'Verb', 'Preposition'] },
          { word: 'Jumped', type: 'Verb', desc: 'showing an action performed by an athlete', w: ['Noun', 'Adjective', 'Conjunction'] },
          { word: 'Quickly', type: 'Adverb', desc: 'explaining how a runner sprinted', w: ['Noun', 'Pronoun', 'Adjective'] }
        ];
        const pos = partsOfSpeech[counter % partsOfSpeech.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'english', levelNode: node,
          text: `In the sentence spoken by ${name2}, what part of speech is the word "${pos.word}" (${pos.desc})?`,
          correctOpt: pos.type,
          wrongOpts: pos.w,
          explanation: `"${pos.word}" functions as a ${pos.type.toLowerCase()} because it is ${pos.desc}.`,
          hint: 'Determine whether it names, describes, or shows action.',
          topicTag: 'Parts of Speech'
        });
      }
      case 11: {
        const pronouns = [
          { sent: `${name1} loves reading. ___ reads a chapter every night.`, ans: 'He/She', opts: ['He/She', 'They', 'It', 'Us'] },
          { sent: `The book was on the shelf. ___ had a blue cover.`, ans: 'It', opts: ['It', 'He', 'They', 'We'] },
          { sent: `${name1} and ${name2} are best friends. ___ study together.`, ans: 'They', opts: ['They', 'He', 'She', 'It'] }
        ];
        const pr = pronouns[counter % pronouns.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'english', levelNode: node,
          text: `Choose the correct PRONOUN to fill in the blank: "${pr.sent}"`,
          correctOpt: pr.ans,
          wrongOpts: pr.opts.filter(x => x !== pr.ans),
          explanation: `"${pr.ans}" is the appropriate personal pronoun matching the subject.`,
          hint: 'Match pronoun to gender and quantity.',
          topicTag: 'Pronouns'
        });
      }
      case 12: {
        const fractions = [
          { name: 'One-half (1/2)', desc: 'divided into 2 equal parts and 1 part is taken' },
          { name: 'One-third (1/3)', desc: 'divided into 3 equal parts and 1 part is taken' },
          { name: 'One-fourth / Quarter (1/4)', desc: 'divided into 4 equal parts and 1 part is taken' },
          { name: 'Three-fourths (3/4)', desc: 'divided into 4 equal parts and 3 parts are taken' }
        ];
        const fr = fractions[counter % fractions.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `When ${name1} cuts a birthday cake into equal slices, what fraction represents a portion that is ${fr.desc}?`,
          correctOpt: fr.name,
          wrongOpts: fractions.filter(x => x.name !== fr.name).map(x => x.name),
          explanation: `${fr.name} represents the fractional share where an object is ${fr.desc}.`,
          hint: 'Fraction = parts taken / total equal parts.',
          topicTag: 'Fractions Introduction'
        });
      }
      case 13: {
        const transport = [
          { mode: 'Land Transport', ex: 'Trains, buses, and metro rail', w: ['Air Transport', 'Water Transport', 'Spacecraft'] },
          { mode: 'Water Transport', ex: 'Cargo ships, boats, and ferries', w: ['Land Transport', 'Air Transport', 'Cable cars'] },
          { mode: 'Air Transport', ex: 'Airplanes and helicopters', w: ['Land Transport', 'Water Transport', 'Submarines'] }
        ];
        const tr = transport[counter % transport.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'social', levelNode: node,
          text: `In a transport study project conducted by ${name2} in ${city}, which category includes ${tr.ex}?`,
          correctOpt: tr.mode,
          wrongOpts: tr.w,
          explanation: `${tr.ex} belong to the category of ${tr.mode}.`,
          hint: 'Consider the medium on which these vehicles travel.',
          topicTag: 'Means of Transport'
        });
      }
      case 14: {
        const timeMin = (counter % 11) + 1;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `When the hour hand on ${name1}'s clock is halfway between ${timeMin} and ${timeMin + 1}, and the minute hand points at 6, what time is it?`,
          correctOpt: `Half past ${timeMin} (${timeMin}:30)`,
          wrongOpts: [`${timeMin}:00`, `${timeMin + 1}:00`, `${timeMin}:15`],
          explanation: `The minute hand at 6 indicates 30 minutes past the hour, so the time is ${timeMin}:30.`,
          hint: 'Minute hand at 6 means 30 minutes.',
          topicTag: 'Telling Time to Half-Hour'
        });
      }
      case 15: {
        const side = (counter % 12) + 3;
        const perim = 4 * side;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `What is the total PERIMETER of a square chessboard where each side measures ${side} cm?`,
          correctOpt: `${perim} cm`,
          wrongOpts: [`${perim + 4} cm`, `${perim - 4} cm`, `${side * side} cm`],
          explanation: `Perimeter of a square = 4 × side length = 4 × ${side} cm = ${perim} cm.`,
          hint: 'Add up the lengths of all 4 equal sides.',
          topicTag: 'Square Perimeter'
        });
      }
      case 16: {
        const bodyParts = [
          { organ: 'Heart', func: 'pumps oxygen-rich blood throughout the entire body continuously', w: ['Lungs', 'Stomach', 'Kidneys'] },
          { organ: 'Lungs', func: 'take in oxygen from fresh air and release carbon dioxide', w: ['Heart', 'Liver', 'Brain'] },
          { organ: 'Stomach', func: 'digests and breaks down swallowed food with digestive juices', w: ['Lungs', 'Heart', 'Bones'] },
          { organ: 'Brain', func: 'controls all thoughts, memory, balance, and body movements', w: ['Heart', 'Stomach', 'Kidneys'] }
        ];
        const bp = bodyParts[counter % bodyParts.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `Which internal vital organ in our human body ${bp.func}?`,
          correctOpt: bp.organ,
          wrongOpts: bp.w,
          explanation: `The ${bp.organ.toLowerCase()} is the internal organ responsible for: ${bp.func}.`,
          hint: 'Identify the organ by its physiological function.',
          topicTag: 'Internal Organs'
        });
      }
      case 17: {
        const tenses = [
          { pres: 'She walks to school daily', past: 'She walked to school yesterday', w: ['She is walk', 'She will walk yesterday', 'She walks yesterday'] },
          { pres: 'He paints a lovely landscape', past: 'He painted a lovely landscape', w: ['He painting', 'He paints yesterday', 'He paint'] },
          { pres: 'They play football together', past: 'They played football together', w: ['They playing', 'They plays', 'They will played'] }
        ];
        const ten = tenses[counter % tenses.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'english', levelNode: node,
          text: `Convert this present sentence to SIMPLE PAST TENSE: "${ten.pres}"`,
          correctOpt: ten.past,
          wrongOpts: ten.w,
          explanation: `In simple past tense, regular verbs typically add '-ed', giving "${ten.past}".`,
          hint: 'Use the past tense form of the verb.',
          topicTag: 'Simple Past Tense'
        });
      }
      case 18: {
        const governance = [
          { body: 'Gram Panchayat', area: 'villages and rural settlements', w: ['Municipal Corporation', 'Supreme Court', 'Parliament'] },
          { body: 'Municipal Corporation', area: 'large metropolitan cities', w: ['Gram Panchayat', 'Block Samiti', 'Zila Parishad'] },
          { body: 'Police Department', area: 'maintaining law and public safety', w: ['Post Office', 'Fire Station', 'Railway Board'] }
        ];
        const gov = governance[counter % governance.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'social', levelNode: node,
          text: `In civics lessons studied by ${name1}, which local governance institution manages civic facilities in ${gov.area}?`,
          correctOpt: gov.body,
          wrongOpts: gov.w,
          explanation: `The ${gov.body} is tasked with governing and maintaining ${gov.area}.`,
          hint: 'Identify local self-government institutions.',
          topicTag: 'Local Governance'
        });
      }
      default: {
        const money = (counter % 40) + 10;
        const countNotes = 5;
        const totalPaid = money * countNotes;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `If ${name1} gives the cashier ${countNotes} currency notes of ₹${money} each for buying ${item}, what is the total amount paid?`,
          correctOpt: `₹${totalPaid}`,
          wrongOpts: [`₹${totalPaid + 10}`, `₹${totalPaid - 10}`, `₹${totalPaid + 50}`],
          explanation: `Total amount = ${countNotes} × ₹${money} = ₹${totalPaid}.`,
          hint: 'Multiply the number of notes by the denomination.',
          topicTag: 'Currency Operations'
        });
      }
    }
  }

  // Grades 3, 4, 5
  if (grade === 3) {
    const variant = counter % 15;
    if (variant === 0) {
      const a = (counter % 300) + 120;
      const b = (counter % 200) + 80;
      const sum = a + b;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `In a regional library in ${city}, ${name1} counts ${a} science books on one rack and ${b} history books on another rack. How many books are there in total?`,
        correctOpt: `${sum} books`,
        wrongOpts: [`${sum + 10} books`, `${sum - 10} books`, `${sum + 20} books`],
        explanation: `Sum the three-digit numbers: ${a} + ${b} = ${sum} books.`,
        hint: 'Add the numbers with carry-over where necessary.',
        topicTag: '3-Digit Addition'
      });
    } else if (variant === 1) {
      const a = (counter % 400) + 300;
      const b = (counter % 150) + 50;
      const diff = a - b;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `A warehouse in ${city} stored ${a} sacks of grain. ${name2} dispatched ${b} sacks to grocery retailers. How many sacks remain in stock?`,
        correctOpt: `${diff} sacks`,
        wrongOpts: [`${diff + 10} sacks`, `${diff - 10} sacks`, `${diff + 20} sacks`],
        explanation: `Subtract: ${a} - ${b} = ${diff} sacks.`,
        hint: 'Subtract with borrowing where needed.',
        topicTag: '3-Digit Subtraction'
      });
    } else if (variant === 2) {
      const num = (counter % 12) + 2;
      const mult = (counter % 9) + 2;
      const prod = num * mult;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `${name1} packs ${item} into ${num} cartons containing ${mult} items each. What is the total count of ${item} packed?`,
        correctOpt: `${prod} ${item}`,
        wrongOpts: [`${prod + num} ${item}`, `${prod - mult} ${item}`, `${prod + 10} ${item}`],
        explanation: `Multiply: ${num} × ${mult} = ${prod} ${item}.`,
        hint: 'Apply basic multiplication facts.',
        topicTag: 'Multiplication Tables'
      });
    } else if (variant === 3) {
      const divisor = (counter % 7) + 2;
      const quotient = (counter % 15) + 5;
      const dividend = divisor * quotient;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `If ${dividend} ${item} are shared equally among ${divisor} students including ${name2}, how many ${item} does each student receive?`,
        correctOpt: `${quotient} ${item}`,
        wrongOpts: [`${quotient + 1} ${item}`, `${quotient - 1} ${item}`, `${quotient + 2} ${item}`],
        explanation: `Divide total by groups: ${dividend} ÷ ${divisor} = ${quotient} ${item}.`,
        hint: 'Divide the total items by the number of students.',
        topicTag: 'Division Concepts'
      });
    } else if (variant === 4) {
      const l = (counter % 20) + 5;
      const w = (counter % 12) + 3;
      const perim = 2 * (l + w);
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `What is the perimeter of a rectangular playground in ${city} with length ${l} m and width ${w} m?`,
        correctOpt: `${perim} m`,
        wrongOpts: [`${perim + 4} m`, `${perim - 4} m`, `${l * w} m`],
        explanation: `Perimeter of rectangle = 2 × (length + width) = 2 × (${l} + ${w}) = ${perim} m.`,
        hint: 'Formula: 2 × (L + W).',
        topicTag: 'Perimeter of Rectangle'
      });
    } else if (variant === 5) {
      const statesOfMatter = [
        { state: 'Solid', desc: 'has a definite shape and fixed volume with closely packed particles', ex: 'Ice cubes and wooden blocks', w: ['Liquid', 'Gas', 'Plasma'] },
        { state: 'Liquid', desc: 'has a definite volume but takes the shape of its container', ex: 'Water, milk, and oil', w: ['Solid', 'Gas', 'Vapor'] },
        { state: 'Gas', desc: 'has neither a definite shape nor a fixed volume, expanding to fill any space', ex: 'Oxygen, carbon dioxide, and helium', w: ['Solid', 'Liquid', 'Ice'] }
      ];
      const som = statesOfMatter[counter % statesOfMatter.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'science', levelNode: node,
        text: `Which physical state of matter ${som.desc} (for example, ${som.ex})?`,
        correctOpt: som.state,
        wrongOpts: som.w,
        explanation: `A ${som.state.toLowerCase()} is the state of matter characterized by: ${som.desc}.`,
        hint: 'Check particle packing and shape flexibility.',
        topicTag: 'States of Matter'
      });
    } else if (variant === 6) {
      const soilTypes = [
        { type: 'Sandy Soil', desc: 'has large particles with high drainage and low water retention', w: ['Clayey Soil', 'Loamy Soil', 'Silty Soil'] },
        { type: 'Clayey Soil', desc: 'has very fine compact particles with very high water-holding capacity', w: ['Sandy Soil', 'Gravel', 'Loamy Soil'] },
        { type: 'Loamy Soil', desc: 'is the best balanced fertile mixture of sand, clay, and humus for cultivating crops', w: ['Sandy Soil', 'Clayey Soil', 'Chalky Soil'] }
      ];
      const st = soilTypes[counter % soilTypes.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'science', levelNode: node,
        text: `In an agricultural survey near ${city}, which soil type is defined as having ${st.desc}?`,
        correctOpt: st.type,
        wrongOpts: st.w,
        explanation: `${st.type} is characterized by: ${st.desc}.`,
        hint: 'Consider particle size and agricultural suitability.',
        topicTag: 'Types of Soil'
      });
    } else if (variant === 7) {
      const planets = [
        { planet: 'Mercury', fact: 'the closest planet to the Sun and smallest in our solar system', w: ['Venus', 'Mars', 'Jupiter'] },
        { planet: 'Venus', fact: 'the hottest planet with thick clouds, often called the morning star', w: ['Mercury', 'Mars', 'Saturn'] },
        { planet: 'Mars', fact: 'known as the Red Planet due to iron oxide soil on its surface', w: ['Jupiter', 'Venus', 'Mercury'] },
        { planet: 'Jupiter', fact: 'the largest planet in the solar system, with a giant red spot storm', w: ['Saturn', 'Neptune', 'Uranus'] },
        { planet: 'Saturn', fact: 'famous for its spectacular, wide system of icy rings', w: ['Jupiter', 'Uranus', 'Mars'] }
      ];
      const pl = planets[counter % planets.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'science', levelNode: node,
        text: `In an astronomy presentation watched by ${name1}, which celestial planet is recognized as ${pl.fact}?`,
        correctOpt: pl.planet,
        wrongOpts: pl.w,
        explanation: `${pl.planet} is ${pl.fact}.`,
        hint: 'Recall planetary features and positions from the Sun.',
        topicTag: 'Solar System'
      });
    } else if (variant === 8) {
      const prepositions = [
        { sent: `The book was placed ___ the study table.`, ans: 'on', w: ['in', 'at', 'into'] },
        { sent: `The kitten jumped playfully ___ the box.`, ans: 'into', w: ['on', 'with', 'above'] },
        { sent: `The birds flew high ___ the mountain peak.`, ans: 'above', w: ['under', 'in', 'between'] },
        { sent: `${name1} stood quietly ___ the two tall pillars.`, ans: 'between', w: ['among', 'into', 'with'] }
      ];
      const prep = prepositions[counter % prepositions.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'english', levelNode: node,
        text: `Choose the correct PREPOSITION to complete the sentence: "${prep.sent}"`,
        correctOpt: prep.ans,
        wrongOpts: prep.w,
        explanation: `"${prep.ans}" correctly indicates spatial position in this sentence context.`,
        hint: 'Select the preposition showing accurate placement.',
        topicTag: 'Prepositions'
      });
    } else if (variant === 9) {
      const capitals = [
        { state: 'Maharashtra', cap: 'Mumbai', w: ['Pune', 'Nagpur', 'Nashik'] },
        { state: 'Karnataka', cap: 'Bengaluru', w: ['Mysuru', 'Hubballi', 'Mangaluru'] },
        { state: 'Tamil Nadu', cap: 'Chennai', w: ['Madurai', 'Coimbatore', 'Salem'] },
        { state: 'West Bengal', cap: 'Kolkata', w: ['Darjeeling', 'Siliguri', 'Asansol'] },
        { state: 'Rajasthan', cap: 'Jaipur', w: ['Jodhpur', 'Udaipur', 'Kota'] },
        { state: 'Gujarat', cap: 'Gandhinagar', w: ['Ahmedabad', 'Surat', 'Vadodara'] }
      ];
      const cap = capitals[counter % capitals.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'social', levelNode: node,
        text: `In a geography quiz taken by ${name2}, what is the official capital city of the Indian state of ${cap.state}?`,
        correctOpt: cap.cap,
        wrongOpts: cap.w,
        explanation: `The capital city of ${cap.state} is ${cap.cap}.`,
        hint: 'Identify the administrative capital of this state.',
        topicTag: 'States and Capitals of India'
      });
    } else if (variant === 10) {
      const numF = (counter % 5) + 1;
      const denF = numF + (counter % 4) + 1;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `In the fraction ${numF}/${denF} written on the blackboard by ${name1}, which number represents the DENOMINATOR?`,
        correctOpt: `${denF}`,
        wrongOpts: [`${numF}`, `${numF + denF}`, `${denF - numF}`],
        explanation: `In any fraction a/b, the top number is the numerator and the bottom number is the denominator (${denF}).`,
        hint: 'The denominator is the bottom number.',
        topicTag: 'Numerator and Denominator'
      });
    } else if (variant === 11) {
      const animals = [
        { animal: 'Frog', resp: 'breathes through moist skin when in water and lungs on land', w: ['Gills only', 'Trachea only', 'Book lungs'] },
        { animal: 'Fish', resp: 'extracts dissolved oxygen from water using gills', w: ['Lungs', 'Skin', 'Spiracles'] },
        { animal: 'Earthworm', resp: 'absorbs atmospheric oxygen directly through moist outer cuticle skin', w: ['Lungs', 'Gills', 'Trachea'] }
      ];
      const an = animals[counter % animals.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'science', levelNode: node,
        text: `How does a ${an.animal} carry out respiratory gas exchange in its natural habitat?`,
        correctOpt: an.resp,
        wrongOpts: an.w,
        explanation: `A ${an.animal} ${an.resp}.`,
        hint: 'Recall respiratory adaptations of this organism.',
        topicTag: 'Animal Respiration'
      });
    } else if (variant === 12) {
      const conjunctions = [
        { sent: `${name1} wanted to play outside, ___ it started pouring heavily with rain.`, ans: 'but', w: ['and', 'so', 'or'] },
        { sent: `Would you like chocolate ice cream ___ strawberry milkshake?`, ans: 'or', w: ['and', 'because', 'so'] },
        { sent: `${name2} wore a thick woolen coat ___ the morning air was chilly.`, ans: 'because', w: ['but', 'or', 'so'] }
      ];
      const conj = conjunctions[counter % conjunctions.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'english', levelNode: node,
        text: `Choose the most appropriate CONJUNCTION to join the clauses: "${conj.sent}"`,
        correctOpt: conj.ans,
        wrongOpts: conj.w,
        explanation: `"${conj.ans}" correctly establishes the logical relation between both parts of the sentence.`,
        hint: 'Pick the connecting word showing contrast, choice, or reason.',
        topicTag: 'Conjunctions'
      });
    } else if (variant === 13) {
      const monuments = [
        { mon: 'Taj Mahal', city: 'Agra', state: 'Uttar Pradesh', w: ['Jaipur', 'Delhi', 'Lucknow'] },
        { mon: 'Qutub Minar', city: 'New Delhi', state: 'Delhi NCR', w: ['Agra', 'Mumbai', 'Hyderabad'] },
        { mon: 'Gateway of India', city: 'Mumbai', state: 'Maharashtra', w: ['Kolkata', 'Chennai', 'Goa'] },
        { mon: 'Charminar', city: 'Hyderabad', state: 'Telangana', w: ['Bengaluru', 'Mysuru', 'Bhopal'] }
      ];
      const mon = monuments[counter % monuments.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'social', levelNode: node,
        text: `In which historic Indian city is the famous architectural monument "${mon.mon}" located?`,
        correctOpt: mon.city,
        wrongOpts: mon.w,
        explanation: `The ${mon.mon} is situated in ${mon.city}, ${mon.state}.`,
        hint: 'Recall major heritage landmarks of India.',
        topicTag: 'Indian Monuments'
      });
    } else {
      const ml = (counter % 8) + 2;
      const totalMl = ml * 1000;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `A water jug used by ${name1} in ${city} holds ${ml} liters of drinking water. How many milliliters is this capacity equal to?`,
        correctOpt: `${totalMl} mL`,
        wrongOpts: [`${ml * 100} mL`, `${ml * 10} mL`, `${totalMl + 500} mL`],
        explanation: `1 liter = 1,000 milliliters. Therefore, ${ml} L = ${ml} × 1000 = ${totalMl} mL.`,
        hint: 'Multiply the liters by 1,000.',
        topicTag: 'Volume Conversion'
      });
    }
  }

  // Grade 4 & Grade 5: Decimals, Fractions arithmetic, Angles, Simple Machines, Freedom Struggle, Civics
  const isG4 = grade === 4;
  const variant = counter % 20;

  if (variant === 0) {
    const a = (counter % 5000) + 1200;
    const b = (counter % 4000) + 800;
    const sum = a + b;
    return makeQ({
      id: qId, board, grade, subjectId: 'math', levelNode: node,
      text: `In an annual city carnival held in ${city}, ${a} tickets were sold on Saturday and ${b} tickets were sold on Sunday. How many tickets were sold over the weekend?`,
      correctOpt: `${sum} tickets`,
      wrongOpts: [`${sum + 100} tickets`, `${sum - 100} tickets`, `${sum + 50} tickets`],
      explanation: `Add the attendance numbers: ${a} + ${b} = ${sum} tickets.`,
      hint: 'Add the multi-digit numbers carefully.',
      topicTag: 'Multi-Digit Addition'
    });
  } else if (variant === 1) {
    const total = (counter % 8000) + 5000;
    const spent = (counter % 3000) + 1200;
    const rem = total - spent;
    return makeQ({
      id: qId, board, grade, subjectId: 'math', levelNode: node,
      text: `${name1}'s school charity fund collected ₹${total}. They donated ₹${spent} towards school supplies. How much money remains in the charity fund?`,
      correctOpt: `₹${rem}`,
      wrongOpts: [`₹${rem + 100}`, `₹${rem - 100}`, `₹${rem + 250}`],
      explanation: `Subtract donation from total: ₹${total} - ₹${spent} = ₹${rem}.`,
      hint: 'Subtract with place value borrowing.',
      topicTag: 'Multi-Digit Subtraction'
    });
  } else if (variant === 2) {
    const a = (counter % 45) + 12;
    const b = (counter % 25) + 10;
    const prod = a * b;
    return makeQ({
      id: qId, board, grade, subjectId: 'math', levelNode: node,
      text: `A wholesale vendor in ${city} supplies ${a} boxes of ${item}, each containing ${b} pieces. What is the total count of ${item} supplied?`,
      correctOpt: `${prod} pieces`,
      wrongOpts: [`${prod + a} pieces`, `${prod - b} pieces`, `${prod + 50} pieces`],
      explanation: `Multiply: ${a} × ${b} = ${prod} pieces.`,
      hint: 'Multiply the 2-digit numbers.',
      topicTag: 'Multi-Digit Multiplication'
    });
  } else if (variant === 3) {
    const divisor = (counter % 12) + 4;
    const quotient = (counter % 40) + 15;
    const dividend = divisor * quotient;
    return makeQ({
      id: qId, board, grade, subjectId: 'math', levelNode: node,
      text: `If ${dividend} educational booklets are shared equally among ${divisor} study circles in ${city}, how many booklets does each circle receive?`,
      correctOpt: `${quotient} booklets`,
      wrongOpts: [`${quotient + 2} booklets`, `${quotient - 2} booklets`, `${quotient + 5} booklets`],
      explanation: `Divide: ${dividend} ÷ ${divisor} = ${quotient} booklets.`,
      hint: 'Long division without remainder.',
      topicTag: 'Long Division'
    });
  } else if (variant === 4) {
    const angles = [
      { type: 'Acute Angle', range: 'greater than 0° and strictly less than 90°', ex: '45° and 60°', w: ['Right Angle', 'Obtuse Angle', 'Straight Angle'] },
      { type: 'Right Angle', range: 'measures exactly 90° forming a square corner', ex: '90°', w: ['Acute Angle', 'Obtuse Angle', 'Reflex Angle'] },
      { type: 'Obtuse Angle', range: 'greater than 90° and strictly less than 180°', ex: '120° and 135°', w: ['Acute Angle', 'Right Angle', 'Straight Angle'] },
      { type: 'Straight Angle', range: 'measures exactly 180° forming a straight line', ex: '180°', w: ['Right Angle', 'Obtuse Angle', 'Reflex Angle'] }
    ];
    const ang = angles[counter % angles.length];
    return makeQ({
      id: qId, board, grade, subjectId: 'math', levelNode: node,
      text: `In geometry class with ${name1}, which type of angle is defined as ${ang.range} (such as ${ang.ex})?`,
      correctOpt: ang.type,
      wrongOpts: ang.w,
      explanation: `An ${ang.type.toLowerCase()} is an angle that ${ang.range}.`,
      hint: 'Compare the angle measure with 90° and 180°.',
      topicTag: 'Classification of Angles'
    });
  } else if (variant === 5) {
    const machines = [
      { mach: 'Lever', ex: 'Scissors, seesaw, and crowbar', desc: 'rigid bar pivoting around a fixed fulcrum point', w: ['Pulley', 'Inclined Plane', 'Wedge'] },
      { mach: 'Pulley', ex: 'Flagpole cord and water well wheel', desc: 'grooved wheel with a rope used to lift heavy loads upward', w: ['Lever', 'Screw', 'Wheel and Axle'] },
      { mach: 'Inclined Plane', ex: 'Wheelchair ramp and slide', desc: 'slanted flat surface that reduces effort to lift objects to higher elevation', w: ['Wedge', 'Lever', 'Pulley'] },
      { mach: 'Wedge', ex: 'Knife blade, axe, and needle', desc: 'two inclined planes placed back to back used to cut or split objects', w: ['Screw', 'Lever', 'Wheel and Axle'] }
    ];
    const sm = machines[counter % machines.length];
    return makeQ({
      id: qId, board, grade, subjectId: 'science', levelNode: node,
      text: `Which classical simple machine consists of a ${sm.desc} (common examples: ${sm.ex})?`,
      correctOpt: sm.mach,
      wrongOpts: sm.w,
      explanation: `A ${sm.mach.toLowerCase()} is a simple machine with a ${sm.desc}.`,
      hint: 'Identify the machine based on its physical mechanism.',
      topicTag: 'Simple Machines'
    });
  } else if (variant === 6) {
    const deficiencyDiseases = [
      { disease: 'Night Blindness', nutrient: 'Vitamin A', food: 'Carrots, spinach, and papaya', w: ['Vitamin C', 'Iron', 'Calcium'] },
      { disease: 'Scurvy (bleeding gums)', nutrient: 'Vitamin C', food: 'Oranges, lemons, and amla', w: ['Vitamin D', 'Protein', 'Vitamin B1'] },
      { disease: 'Rickets (soft weak bones)', nutrient: 'Vitamin D', food: 'Morning sunlight, milk, and eggs', w: ['Vitamin A', 'Iron', 'Iodine'] },
      { disease: 'Goitre (swollen neck gland)', nutrient: 'Iodine', food: 'Iodized salt and sea fish', w: ['Iron', 'Vitamin C', 'Calcium'] },
      { disease: 'Anaemia (fatigue & pale skin)', nutrient: 'Iron', food: 'Spinach, jaggery, and green leafy vegetables', w: ['Vitamin D', 'Calcium', 'Iodine'] }
    ];
    const dd = deficiencyDiseases[counter % deficiencyDiseases.length];
    return makeQ({
      id: qId, board, grade, subjectId: 'science', levelNode: node,
      text: `In public health studies, deficiency of which essential nutrient causes ${dd.disease}?`,
      correctOpt: dd.nutrient,
      wrongOpts: dd.w,
      explanation: `Lack of ${dd.nutrient} leads to ${dd.disease}. Eating ${dd.food} prevents it.`,
      hint: 'Recall specific vitamins and mineral deficiency disorders.',
      topicTag: 'Deficiency Diseases'
    });
  } else if (variant === 7) {
    const ecosystems = [
      { role: 'Producers (Autotrophs)', desc: 'green plants that manufacture their own food through photosynthesis using sunlight', w: ['Herbivores', 'Decomposers', 'Carnivores'] },
      { role: 'Primary Consumers (Herbivores)', desc: 'animals that feed directly on green plants and grasses', w: ['Producers', 'Carnivores', 'Scavengers'] },
      { role: 'Secondary Consumers (Carnivores)', desc: 'predators that hunt and eat other animals for sustenance', w: ['Producers', 'Herbivores', 'Decomposers'] },
      { role: 'Decomposers', desc: 'microorganisms and fungi that break down dead organic matter into soil nutrients', w: ['Producers', 'Herbivores', 'Apex Predators'] }
    ];
    const eco = ecosystems[counter % ecosystems.length];
    return makeQ({
      id: qId, board, grade, subjectId: 'science', levelNode: node,
      text: `In an environmental food chain examined by ${name2}, which ecological role is fulfilled by organisms that ${eco.desc}?`,
      correctOpt: eco.role,
      wrongOpts: eco.w,
      explanation: `${eco.role} are the group in a food chain that ${eco.desc}.`,
      hint: 'Think of trophic levels and energy flow.',
      topicTag: 'Food Chains and Ecosystems'
    });
  } else if (variant === 8) {
    const length = (counter % 15) + 5;
    const width = (counter % 10) + 3;
    const area = length * width;
    return makeQ({
      id: qId, board, grade, subjectId: 'math', levelNode: node,
      text: `What is the total surface AREA of a rectangular classroom floor measuring ${length} meters long and ${width} meters wide?`,
      correctOpt: `${area} sq meters`,
      wrongOpts: [`${area + 10} sq meters`, `${2 * (length + width)} sq meters`, `${area - 5} sq meters`],
      explanation: `Area of rectangle = length × width = ${length} m × ${width} m = ${area} sq m.`,
      hint: 'Multiply length by width.',
      topicTag: 'Area of Rectangle'
    });
  } else if (variant === 9) {
    const historyEvents = [
      { leader: 'Mahatma Gandhi', event: 'Dandi Salt March in 1930', purpose: 'protest against the unfair British colonial tax on salt', w: ['Bhagat Singh', 'Subhash Chandra Bose', 'Bal Gangadhar Tilak'] },
      { leader: 'Subhash Chandra Bose', event: 'formation of the Indian National Army (Azad Hind Fauj)', purpose: 'liberate India from British colonial rule through armed struggle', w: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Gopal Krishna Gokhale'] },
      { leader: 'Dr. B. R. Ambedkar', event: 'chairing the Drafting Committee of the Indian Constitution', purpose: 'establish equal rights, social justice, and democracy for all citizens', w: ['Sardar Patel', 'Lal Bahadur Shastri', 'Rabindranath Tagore'] },
      { leader: 'Rani Lakshmibai of Jhansi', event: 'heroic defense of Jhansi during the Revolt of 1857', purpose: 'resist British annexation under the Doctrine of Lapse', w: ['Sarojini Naidu', 'Begum Hazrat Mahal', 'Annie Besant'] }
    ];
    const he = historyEvents[counter % historyEvents.length];
    return makeQ({
      id: qId, board, grade, subjectId: 'social', levelNode: node,
      text: `In Indian national history, which prominent leader led the historic ${he.event} in order to ${he.purpose}?`,
      correctOpt: he.leader,
      wrongOpts: he.w,
      explanation: `${he.leader} is celebrated for leading the ${he.event}.`,
      hint: 'Recall key figures of the Indian freedom movement.',
      topicTag: 'Indian Freedom Movement'
    });
  } else if (variant === 10) {
    const grammarRules = [
      { sent: `Neither of the two students ___ present in the auditorium today.`, ans: 'is', w: ['are', 'were', 'have'] },
      { sent: `The captain along with his team members ___ celebrating the victory.`, ans: 'was', w: ['were', 'are', 'have'] },
      { sent: `Each of the participants ___ awarded a certificate of merit.`, ans: 'was', w: ['were', 'are', 'have'] }
    ];
    const gr = grammarRules[counter % grammarRules.length];
    return makeQ({
      id: qId, board, grade, subjectId: 'english', levelNode: node,
      text: `Choose the grammatically correct auxiliary verb to satisfy SUBJECT-VERB AGREEMENT: "${gr.sent}"`,
      correctOpt: gr.ans,
      wrongOpts: gr.w,
      explanation: `Subject phrases like 'Neither of', 'Each of', or singular subject followed by 'along with' require singular verbs ('${gr.ans}').`,
      hint: 'Identify the true singular grammatical subject.',
      topicTag: 'Subject-Verb Agreement'
    });
  } else if (variant === 11) {
    const unOrgans = [
      { organ: 'General Assembly', role: 'the main deliberative policymaking body where all 193 member nations have equal votes', w: ['Security Council', 'Secretariat', 'Trusteeship Council'] },
      { organ: 'Security Council', role: 'responsible for maintaining international peace and security with 5 permanent veto members', w: ['General Assembly', 'International Court of Justice', 'UNESCO'] },
      { organ: 'International Court of Justice (ICJ)', role: 'the principal judicial organ situated at The Hague settling legal disputes', w: ['Security Council', 'WHO', 'UNICEF'] },
      { organ: 'World Health Organization (WHO)', role: 'directing global public health responses, disease control, and vaccination initiatives', w: ['UN Security Council', 'UNESCO', 'ILO'] }
    ];
    const un = unOrgans[counter % unOrgans.length];
    return makeQ({
      id: qId, board, grade, subjectId: 'social', levelNode: node,
      text: `In international civic studies, which organ of the United Nations (UN) is ${un.role}?`,
      correctOpt: un.organ,
      wrongOpts: un.w,
      explanation: `The ${un.organ} is the UN entity that functions as: ${un.role}.`,
      hint: 'Match the UN body to its core global mandate.',
      topicTag: 'United Nations Organization'
    });
  } else if (variant === 12) {
    const pct = ((counter % 8) + 1) * 10; // 10%, 20% .. 80%
    const totalV = ((counter % 5) + 1) * 100; // 100, 200 .. 500
    const val = (pct / 100) * totalV;
    return makeQ({
      id: qId, board, grade, subjectId: 'math', levelNode: node,
      text: `What is ${pct}% of ₹${totalV} calculated during a shopping discount calculation by ${name1}?`,
      correctOpt: `₹${val}`,
      wrongOpts: [`₹${val + 10}`, `₹${val - 10}`, `₹${pct}`],
      explanation: `${pct}% of ${totalV} = (${pct} / 100) × ${totalV} = ₹${val}.`,
      hint: 'Multiply the total by percentage divided by 100.',
      topicTag: 'Percentages'
    });
  } else if (variant === 13) {
    const circuits = [
      { comp: 'Switch / Key', role: 'opens or closes the electric circuit to stop or allow current flow', w: ['Battery', 'Connecting Wire', 'Bulb Filament'] },
      { comp: 'Battery / Cell', role: 'serves as the source of electrical energy (potential difference)', w: ['Resistor', 'Switch', 'Ammeter'] },
      { comp: 'Conducting Wire (Copper)', role: 'provides an unbroken conducting path of low resistance for electric current', w: ['Plastic Insulator', 'Switch', 'Voltmeter'] },
      { comp: 'Bulb Filament (Tungsten)', role: 'glows white-hot and radiates light when electric current flows through it', w: ['Battery Terminal', 'Plastic Switch', 'Insulator'] }
    ];
    const circ = circuits[counter % circuits.length];
    return makeQ({
      id: qId, board, grade, subjectId: 'science', levelNode: node,
      text: `In an electrical circuit experiment set up by ${name2} in the school laboratory, which component ${circ.role}?`,
      correctOpt: circ.comp,
      wrongOpts: circ.w,
      explanation: `A ${circ.comp.toLowerCase()} is designed to: ${circ.role}.`,
      hint: 'Identify the circuit component by its physical job.',
      topicTag: 'Electric Circuits'
    });
  } else if (variant === 14) {
    const eclipses = [
      { type: 'Solar Eclipse', align: 'the Moon passes directly between the Sun and Earth, casting a shadow on Earth', time: 'occurs only on a New Moon day', w: ['Lunar Eclipse', 'Equinox', 'Solstice'] },
      { type: 'Lunar Eclipse', align: 'the Earth passes directly between the Sun and Moon, casting Earth\'s shadow on the Moon', time: 'occurs only on a Full Moon night', w: ['Solar Eclipse', 'Comet passage', 'Meteor shower'] }
    ];
    const ecl = eclipses[counter % eclipses.length];
    return makeQ({
      id: qId, board, grade, subjectId: 'science', levelNode: node,
      text: `In celestial astronomy, what astronomical phenomenon occurs when ${ecl.align} (${ecl.time})?`,
      correctOpt: ecl.type,
      wrongOpts: ecl.w,
      explanation: `A ${ecl.type} occurs when ${ecl.align}.`,
      hint: 'Look at which body is in the middle.',
      topicTag: 'Eclipses'
    });
  } else if (variant === 15) {
    const l = (counter % 10) + 4;
    const w = (counter % 8) + 2;
    const h = (counter % 6) + 2;
    const vol = l * w * h;
    return makeQ({
      id: qId, board, grade, subjectId: 'math', levelNode: node,
      text: `What is the total VOLUME of a rectangular wooden crate with length ${l} cm, width ${w} cm, and height ${h} cm?`,
      correctOpt: `${vol} cubic cm`,
      wrongOpts: [`${vol + 10} cubic cm`, `${2 * (l * w + w * h + l * h)} cubic cm`, `${vol - 10} cubic cm`],
      explanation: `Volume of cuboid = length × width × height = ${l} × ${w} × ${h} = ${vol} cm³.`,
      hint: 'Multiply length × width × height.',
      topicTag: 'Volume of Cuboid'
    });
  } else if (variant === 16) {
    const voiceSentences = [
      { act: 'Aarav wrote an inspiring essay.', pass: 'An inspiring essay was written by Aarav.', w: ['An inspiring essay is written by Aarav.', 'An inspiring essay has written by Aarav.', 'Aarav was written by an essay.'] },
      { act: 'The teacher praised the honest student.', pass: 'The honest student was praised by the teacher.', w: ['The honest student is praised by the teacher.', 'The honest student had praise by teacher.', 'Teacher was praised by the student.'] },
      { act: 'Diya painted a scenic mountain view.', pass: 'A scenic mountain view was painted by Diya.', w: ['A scenic mountain view is painted by Diya.', 'A scenic mountain view was paint by Diya.', 'Diya was painted by a mountain view.'] }
    ];
    const vs = voiceSentences[counter % voiceSentences.length];
    return makeQ({
      id: qId, board, grade, subjectId: 'english', levelNode: node,
      text: `Convert the following active sentence into grammatically correct PASSIVE VOICE: "${vs.act}"`,
      correctOpt: vs.pass,
      wrongOpts: vs.w,
      explanation: `In passive voice, the object becomes the subject: '${vs.pass}'.`,
      hint: 'Object + was/were + past participle (V3) + by + Subject.',
      topicTag: 'Active and Passive Voice'
    });
  } else if (variant === 17) {
    const physicalFeatures = [
      { feat: 'The Himalayas', desc: 'the young fold mountain range forming the northern protective barrier of India', w: ['The Western Ghats', 'The Aravalli Range', 'The Vindhyas'] },
      { feat: 'The Northern Plains', desc: 'the vast, fertile alluvial agricultural basin formed by the Indus, Ganga, and Brahmaputra rivers', w: ['The Thar Desert', 'The Deccan Plateau', 'The Coastal Plains'] },
      { feat: 'The Deccan Plateau', desc: 'the ancient triangular peninsular landmass rich in black cotton soil and minerals', w: ['The Northern Plains', 'The Thar Desert', 'The Sunderbans'] },
      { feat: 'The Thar Desert', desc: 'the arid, sandy desert region with low rainfall located in western Rajasthan', w: ['The Deccan Plateau', 'The Western Ghats', 'The Himalayas'] }
    ];
    const pf = physicalFeatures[counter % physicalFeatures.length];
    return makeQ({
      id: qId, board, grade, subjectId: 'social', levelNode: node,
      text: `In Indian physical geography, which major physiographic division is characterized as ${pf.desc}?`,
      correctOpt: pf.feat,
      wrongOpts: pf.w,
      explanation: `${pf.feat} is the geographical feature described as: ${pf.desc}.`,
      hint: 'Recall the 6 physiographic divisions of India.',
      topicTag: 'Physical Geography of India'
    });
  } else if (variant === 18) {
    const n1 = (counter % 12) + 2;
    const d1 = (counter % 5) + 3;
    const decVal = (n1 / d1).toFixed(2);
    return makeQ({
      id: qId, board, grade, subjectId: 'math', levelNode: node,
      text: `Express the fraction ${n1}/${d1} as a decimal rounded to two decimal places.`,
      correctOpt: `${decVal}`,
      wrongOpts: [`${(parseFloat(decVal) + 0.1).toFixed(2)}`, `${(parseFloat(decVal) - 0.1).toFixed(2)}`, `${(n1 / (d1 + 1)).toFixed(2)}`],
      explanation: `Divide numerator by denominator: ${n1} ÷ ${d1} = ${decVal}.`,
      hint: 'Perform long division with decimal point.',
      topicTag: 'Fractions to Decimals'
    });
  } else {
    const digestion = [
      { organ: 'Small Intestine', role: 'where complete chemical digestion of food and absorption of nutrients into bloodstream occurs', w: ['Stomach', 'Large Intestine', 'Esophagus'] },
      { organ: 'Large Intestine', role: 'where unabsorbed water and minerals are reabsorbed from undigested food residue', w: ['Small Intestine', 'Stomach', 'Gallbladder'] },
      { organ: 'Liver', role: 'the largest gland producing bile juice to emulsify fats in digestion', w: ['Pancreas', 'Stomach', 'Kidney'] },
      { organ: 'Pancreas', role: 'secretes pancreatic juice containing trypsin, amylase, and lipase enzymes', w: ['Liver', 'Gallbladder', 'Salivary Gland'] }
    ];
    const dig = digestion[counter % digestion.length];
    return makeQ({
      id: qId, board, grade, subjectId: 'science', levelNode: node,
      text: `In the human digestive system studied by ${name1}, which digestive organ is ${dig.role}?`,
      correctOpt: dig.organ,
      wrongOpts: dig.w,
      explanation: `The ${dig.organ} is the digestive organ that: ${dig.role}.`,
      hint: 'Identify the gastrointestinal organ by its specialized digestive function.',
      topicTag: 'Human Digestive System'
    });
  }
}
