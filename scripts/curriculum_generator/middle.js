import { makeQ, NAMES, ITEMS, CITIES, pickRandom } from './common.js';

export function getMiddleQuestion(grade, board, node, counter, qId) {
  const name1 = pickRandom(NAMES, counter * 11 + 2);
  const name2 = pickRandom(NAMES, counter * 17 + 4);
  const item = pickRandom(ITEMS, counter * 13 + 7);
  const city = pickRandom(CITIES, counter * 5 + 3);

  // GRADE 6
  if (grade === 6) {
    const variant = counter % 20;
    switch (variant) {
      case 0: {
        const x = (counter % 45) + 5;
        const c = ((counter * 3) % 35) + 3;
        const total = x + c;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In a math workshop in ${city}, ${name1} sets up the linear equation: x + ${c} = ${total}. What is the value of x?`,
          correctOpt: `x = ${x}`,
          wrongOpts: [`x = ${x + 2}`, `x = ${x - 2}`, `x = ${total + c}`],
          explanation: `Subtract ${c} from both sides: x = ${total} - ${c} = ${x}.`,
          hint: 'Isolate x by subtracting the constant from the right-hand side.',
          topicTag: 'Linear Equations in One Variable'
        });
      }
      case 1: {
        const a = (counter % 35) + 5;
        const b = ((counter * 7) % 45) + 10;
        const diff = a - b;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `During winter temperature monitoring in ${city}, ${name2} computes the integer difference: (${a}) - (${b}). What is the result?`,
          correctOpt: `${diff}`,
          wrongOpts: [`${Math.abs(diff)}`, `${diff - 2}`, `${a + b}`],
          explanation: `Subtracting ${b} from ${a}: ${a} - ${b} = ${diff}.`,
          hint: 'Subtracting a positive integer moves to the left on the number line.',
          topicTag: 'Integer Arithmetic'
        });
      }
      case 2: {
        const base = (counter % 12) + 2;
        const ratioA = base * 2;
        const ratioB = base * 3;
        const total = ratioA + ratioB;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `${name1} and ${name2} share ${total} ${item} in the ratio 2 : 3. How many ${item} does ${name2} receive?`,
          correctOpt: `${ratioB} ${item}`,
          wrongOpts: [`${ratioA} ${item}`, `${ratioB + 2} ${item}`, `${ratioA - 2} ${item}`],
          explanation: `Total ratio parts = 2 + 3 = 5. Value per part = ${total} ÷ 5 = ${base}. ${name2}'s share = 3 × ${base} = ${ratioB} ${item}.`,
          hint: 'Divide the total into 5 equal parts and multiply by 3.',
          topicTag: 'Ratio and Proportion'
        });
      }
      case 3: {
        const r = (counter % 20) + 3;
        const d = 2 * r;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `A circular playground boundary in ${city} has a measured radius of ${r} meters. What is its exact DIAMETER?`,
          correctOpt: `${d} meters`,
          wrongOpts: [`${d + 2} meters`, `${r} meters`, `${d - 2} meters`],
          explanation: `Diameter = 2 × radius = 2 × ${r} m = ${d} meters.`,
          hint: 'Diameter is twice the radius.',
          topicTag: 'Circles Geometry'
        });
      }
      case 4: {
        const sepMethods = [
          { method: 'Filtration', desc: 'separating an insoluble solid (like chalk powder) from a liquid using porous filter paper', w: ['Evaporation', 'Threshing', 'Winnowing'] },
          { method: 'Evaporation', desc: 'recovering dissolved soluble salt from a water solution by heating until dryness', w: ['Filtration', 'Sedimentation', 'Sieving'] },
          { method: 'Winnowing', desc: 'separating lighter husk particles from heavier grain seeds using blowing wind currents', w: ['Decantation', 'Filtration', 'Condensation'] },
          { method: 'Sedimentation and Decantation', desc: 'allowing heavy solid particles in muddy water to settle down and pouring off clear water', w: ['Distillation', 'Threshing', 'Evaporation'] }
        ];
        const sm = sepMethods[counter % sepMethods.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In a chemistry laboratory practical in ${city}, which separation technique is utilized for ${sm.desc}?`,
          correctOpt: sm.method,
          wrongOpts: sm.w,
          explanation: `${sm.method} is used for ${sm.desc}.`,
          hint: 'Match the separation technique to the physical difference.',
          topicTag: 'Separation of Substances'
        });
      }
      case 5: {
        const conductors = [
          { mat: 'Copper wire', cond: true, w: ['Rubber eraser', 'Dry wood', 'Plastic ruler'] },
          { mat: 'Iron nail', cond: true, w: ['Glass slide', 'Ceramic cup', 'Paper strip'] },
          { mat: 'Rubber balloon', cond: false, w: ['Aluminum foil', 'Silver coin', 'Steel spoon'] },
          { mat: 'Plastic comb', cond: false, w: ['Brass key', 'Copper strip', 'Graphite pencil lead'] }
        ];
        const c = conductors[counter % conductors.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `When testing materials in an electric circuit with ${name1}, which of the following is ${c.cond ? 'a good ELECTRICAL CONDUCTOR' : 'an ELECTRICAL INSULATOR'}?`,
          correctOpt: c.mat,
          wrongOpts: c.w,
          explanation: `${c.mat} is an electrical ${c.cond ? 'conductor allowing electric charge to pass' : 'insulator preventing electric charge flow'}.`,
          hint: 'Metals are typically good electrical conductors.',
          topicTag: 'Electricity: Conductors & Insulators'
        });
      }
      case 6: {
        const harappanSites = [
          { site: 'Mohenjo-daro', feat: 'the famous Great Bath, granary, and bronze dancing girl figurine', w: ['Lothal', 'Kalibangan', 'Rakhigarhi'] },
          { site: 'Lothal', feat: 'the ancient tidal dockyard connected to the Arabian Sea in Gujarat', w: ['Harappa', 'Ropar', 'Banawali'] },
          { site: 'Kalibangan', feat: 'evidence of ploughed agricultural fields and fire altars in Rajasthan', w: ['Dholavira', 'Mohenjo-daro', 'Chanhudaro'] },
          { site: 'Dholavira', feat: 'a sophisticated rainwater harvesting reservoir system with stone architecture', w: ['Harappa', 'Lothal', 'Alamgirpur'] }
        ];
        const hs = harappanSites[counter % harappanSites.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'social', levelNode: node,
          text: `In ancient Indus Valley archaeology, which Harappan urban settlement is renowned for ${hs.feat}?`,
          correctOpt: hs.site,
          wrongOpts: hs.w,
          explanation: `${hs.site} is historically famous for ${hs.feat}.`,
          hint: 'Recall distinctive features of major Harappan archaeological sites.',
          topicTag: 'Indus Valley Civilization'
        });
      }
      case 7: {
        const linesOfLat = [
          { line: 'Equator', deg: '0° latitude', desc: 'divides the Earth into Northern and Southern Hemispheres', w: ['Tropic of Cancer', 'Arctic Circle', 'Prime Meridian'] },
          { line: 'Tropic of Cancer', deg: '23.5° North latitude', desc: 'passes centrally through eight Indian states', w: ['Tropic of Capricorn', 'Equator', 'Antarctic Circle'] },
          { line: 'Tropic of Capricorn', deg: '23.5° South latitude', desc: 'runs across the Southern Hemisphere', w: ['Tropic of Cancer', 'Equator', 'North Pole'] },
          { line: 'Prime Meridian', deg: '0° longitude', desc: 'passes through Greenwich, London as the base for standard time', w: ['Equator', 'International Date Line', 'Tropic of Cancer'] }
        ];
        const lol = linesOfLat[counter % linesOfLat.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'social', levelNode: node,
          text: `In cartography and geography studied by ${name2}, which reference line of latitude/longitude is situated at ${lol.deg} (${lol.desc})?`,
          correctOpt: lol.line,
          wrongOpts: lol.w,
          explanation: `The ${lol.line} is located at ${lol.deg} and ${lol.desc}.`,
          hint: 'Identify the imaginary coordinate line.',
          topicTag: 'Latitudes and Longitudes'
        });
      }
      case 8: {
        const modals = [
          { sent: `You ___ wear a safety helmet when riding a bicycle on the main road in ${city}.`, ans: 'must', w: ['might', 'could', 'may'] },
          { sent: `___ I borrow your pencil for the drawing class, please?`, ans: 'May', w: ['Must', 'Should', 'Will'] },
          { sent: `We ___ respect our teachers, elders, and national monuments.`, ans: 'ought to', w: ['might', 'could', 'would'] }
        ];
        const m = modals[counter % modals.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'english', levelNode: node,
          text: `Choose the most appropriate MODAL AUXILIARY verb to fill in the blank: "${m.sent}"`,
          correctOpt: m.ans,
          wrongOpts: m.w,
          explanation: `"${m.ans}" is the modal verb that expresses the proper degree of obligation or permission.`,
          hint: 'Consider whether the sentence denotes necessity, polite request, or moral duty.',
          topicTag: 'Modal Verbs'
        });
      }
      case 9: {
        const a1 = (counter % 35) + 40;
        const a2 = (counter % 25) + 45;
        const a3 = 180 - (a1 + a2);
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In triangle ABC drawn by ${name1} in ${city}, angle A measures ${a1}° and angle B measures ${a2}°. What is the measure of angle C?`,
          correctOpt: `${a3}°`,
          wrongOpts: [`${a3 + 5}°`, `${a3 - 5}°`, `${180 - a1}°`],
          explanation: `The sum of interior angles in any triangle is 180°. Angle C = 180° - (${a1}° + ${a2}°) = ${a3}°.`,
          hint: 'Angle sum property of triangle = 180°.',
          topicTag: 'Triangle Angle Sum'
        });
      }
      case 10: {
        const joints = [
          { joint: 'Ball and Socket Joint', loc: 'Shoulder and Hip joints', move: 'allows circular movement in all 360° directions', w: ['Hinge Joint', 'Pivot Joint', 'Fixed Joint'] },
          { joint: 'Hinge Joint', loc: 'Elbow and Knee joints', move: 'allows back-and-forth movement in one plane only', w: ['Ball and Socket Joint', 'Gliding Joint', 'Pivot Joint'] },
          { joint: 'Pivot Joint', loc: 'Neck joining the head to the spine', move: 'allows rotation and turning side to side', w: ['Hinge Joint', 'Suture Joint', 'Ball and Socket Joint'] },
          { joint: 'Fixed (Immovable) Joint', loc: 'Cranium bones of the human skull', move: 'allows zero movement between fused bones', w: ['Gliding Joint', 'Hinge Joint', 'Pivot Joint'] }
        ];
        const j = joints[counter % joints.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In human skeletal anatomy, which type of synovial joint is found at the ${j.loc} and ${j.move}?`,
          correctOpt: j.joint,
          wrongOpts: j.w,
          explanation: `The ${j.joint} located at the ${j.loc} ${j.move}.`,
          hint: 'Examine the range of motion of the joint.',
          topicTag: 'Body Movements & Skeletal Joints'
        });
      }
      case 11: {
        const AshokaEdicts = [
          { topic: 'Dhamma policy of Emperor Ashoka', fact: 'promoted non-violence (ahimsa), compassion to animals, and religious tolerance', w: ['Military expansionism', 'Feudal taxation', 'Religious persecution'] },
          { topic: 'Kalinga War (circa 261 BCE)', fact: 'the horrific bloodshed caused deep remorse and prompted Ashoka to renounce war for Buddhism', w: ['Battle of Tarain', 'Alexander\'s invasion', 'First Battle of Panipat'] }
        ];
        const ae = AshokaEdicts[counter % AshokaEdicts.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'social', levelNode: node,
          text: `In ancient Indian imperial history, what was the historical significance of ${ae.topic}?`,
          correctOpt: ae.fact,
          wrongOpts: ae.w,
          explanation: `${ae.topic} is historically celebrated because it ${ae.fact}.`,
          hint: 'Recall the transformation of Emperor Ashoka.',
          topicTag: 'Mauryan Empire & Ashoka'
        });
      }
      case 12: {
        const basePrice = (counter % 35) + 15;
        const countB = (counter % 8) + 3;
        const totalCost = basePrice * countB;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `If ${countB} notebooks cost ₹${totalCost} in ${city}, what is the unit price of a single notebook using the UNITARY METHOD?`,
          correctOpt: `₹${basePrice}`,
          wrongOpts: [`₹${basePrice + 2}`, `₹${basePrice - 2}`, `₹${basePrice + 5}`],
          explanation: `Unit price = Total cost ÷ Number of items = ₹${totalCost} ÷ ${countB} = ₹${basePrice}.`,
          hint: 'Divide the total cost by the number of units.',
          topicTag: 'Unitary Method'
        });
      }
      case 13: {
        const changes = [
          { change: 'Rusting of an iron gate', type: 'Chemical and Irreversible Change', w: ['Physical and Reversible Change', 'Physical and Irreversible Change', 'Periodic Change'] },
          { change: 'Melting of ice cream on a warm day', type: 'Physical and Reversible Change', w: ['Chemical and Irreversible Change', 'Chemical and Reversible Change', 'Non-periodic Change'] },
          { change: 'Burning of cooking LPG gas', type: 'Chemical and Irreversible Change', w: ['Physical and Reversible Change', 'Physical and Irreversible Change', 'Fast Physical Change'] },
          { change: 'Dissolving sugar crystals in warm milk', type: 'Physical and Reversible Change', w: ['Chemical and Irreversible Change', 'Chemical and Reversible Change', 'Decomposition Change'] }
        ];
        const ch = changes[counter % changes.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `Classify the following transformation observed by ${name1} in ${city}: "${ch.change}".`,
          correctOpt: ch.type,
          wrongOpts: ch.w,
          explanation: `"${ch.change}" represents a ${ch.type} because no new substance is formed (if physical) or a chemically new substance is produced (if chemical).`,
          hint: 'Check if the change can be easily undone to retrieve the original substance.',
          topicTag: 'Changes Around Us'
        });
      }
      case 14: {
        const sides = (counter % 5) + 3; // 3 to 7
        const polygonNames = ['Triangle', 'Quadrilateral', 'Pentagon', 'Hexagon', 'Heptagon'];
        const nameP = polygonNames[sides - 3];
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In geometry exercises led by ${name2} in ${city}, what is the specific mathematical term for a closed two-dimensional polygon having exactly ${sides} straight line segments?`,
          correctOpt: nameP,
          wrongOpts: polygonNames.filter(p => p !== nameP).slice(0, 3),
          explanation: `A polygon with ${sides} sides is designated as a ${nameP}.`,
          hint: 'Recall Greek prefix roots for polygon sides.',
          topicTag: 'Polygons'
        });
      }
      case 15: {
        const magnets = [
          { rule: 'Like magnetic poles (North-North or South-South)', effect: 'strongly REPEL each other', w: ['attract each other', 'neutralize each other', 'produce sparks'] },
          { rule: 'Unlike magnetic poles (North-South)', effect: 'strongly ATTRACT each other', w: ['repel each other', 'demagnetize each other', 'remain inert'] },
          { rule: 'Freely suspended bar magnet', effect: 'always aligns itself in the geographic North-South direction', w: ['aligns in East-West direction', 'spins continuously', 'points to the Sun'] }
        ];
        const mag = magnets[counter % magnets.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In magnetism experiments conducted by ${name2} in ${city}, what happens when ${mag.rule}?`,
          correctOpt: mag.effect,
          wrongOpts: mag.w,
          explanation: `In magnetism principles, ${mag.rule} ${mag.effect}.`,
          hint: 'Remember: like poles repel, unlike poles attract.',
          topicTag: 'Magnetism Principles'
        });
      }
      case 16: {
        const numP = (counter % 35) + 12;
        const denP = numP * 2;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `Simplify the numerical fraction ${numP}/${denP} to its LOWEST irreducible fractional form in ${city}.`,
          correctOpt: '1/2',
          wrongOpts: ['1/3', '2/3', '1/4'],
          explanation: `Dividing both numerator and denominator by their greatest common divisor (${numP}) yields 1/2.`,
          hint: 'Divide top and bottom by their common factor.',
          topicTag: 'Simplifying Fractions'
        });
      }
      case 17: {
        const lightProp = [
          { prop: 'Rectilinear propagation of light', desc: 'light always travels along straight lines in a homogeneous transparent medium', w: ['Light bends around corners', 'Light travels in spiral paths', 'Light moves backwards'] },
          { prop: 'Formation of shadows', desc: 'formed when an opaque obstacle blocks the path of propagating light rays', w: ['formed by transparent glass', 'formed only in total darkness', 'formed by mirrors'] }
        ];
        const lp = lightProp[counter % lightProp.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In optical physics, which fundamental property of light explains why ${lp.desc}?`,
          correctOpt: lp.prop,
          wrongOpts: lp.w,
          explanation: `${lp.prop} states that ${lp.desc}.`,
          hint: 'Recall how light rays travel.',
          topicTag: 'Light and Shadows'
        });
      }
      case 18: {
        const speed = (counter % 35) + 40; // 40-75 km/h
        const timeH = (counter % 5) + 2;   // 2-6 hours
        const dist = speed * timeH;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `A long-distance bus departs ${city} and travels at an average uniform speed of ${speed} km/h for ${timeH} hours. What total distance does it cover?`,
          correctOpt: `${dist} km`,
          wrongOpts: [`${dist + 20} km`, `${dist - 20} km`, `${speed + timeH} km`],
          explanation: `Distance = Speed × Time = ${speed} km/h × ${timeH} h = ${dist} km.`,
          hint: 'Formula: Distance = Speed × Time.',
          topicTag: 'Speed, Distance, and Time'
        });
      }
      default: {
        const democracy = [
          { concept: 'Universal Adult Franchise', mean: 'every adult citizen possesses the equal right to vote regardless of caste, gender, or wealth', w: ['only property owners vote', 'only educated individuals vote', 'voting depends on taxes paid'] },
          { concept: 'Secularism in Indian Constitution', mean: 'the state has no official religion and treats all religious communities equally with respect', w: ['one official state religion', 'religious festivals are banned', 'citizens cannot practice faith'] }
        ];
        const dem = democracy[counter % democracy.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'social', levelNode: node,
          text: `In democratic civics lessons taught by ${name1}, what is the constitutional meaning of "${dem.concept}"?`,
          correctOpt: dem.mean,
          wrongOpts: dem.w,
          explanation: `"${dem.concept}" denotes that: ${dem.mean}.`,
          hint: 'Recall fundamental democratic rights.',
          topicTag: 'Democratic Governance'
        });
      }
    }
  }

  // GRADE 7
  if (grade === 7) {
    const variant = counter % 20;
    switch (variant) {
      case 0: {
        const P = ((counter % 50) + 10) * 1000; // 10,000 to 60,000
        const R = (counter % 6) + 4; // 4% to 9%
        const T = (counter % 4) + 2; // 2 to 5 years
        const SI = (P * R * T) / 100;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `${name1} opens a fixed savings account in ${city} depositing ₹${P} at ${R}% annual simple interest for ${T} years. What is the total SIMPLE INTEREST earned?`,
          correctOpt: `₹${SI}`,
          wrongOpts: [`₹${SI + 250}`, `₹${SI - 250}`, `₹${SI + 500}`],
          explanation: `Simple Interest = (P × R × T) / 100 = (${P} × ${R} × ${T}) / 100 = ₹${SI}.`,
          hint: 'Formula: SI = (P × R × T) / 100.',
          topicTag: 'Simple Interest'
        });
      }
      case 1: {
        const CP = ((counter % 40) + 20) * 50; // 1000 to 3000
        const profitPct = ((counter % 5) + 1) * 5; // 5%, 10%, 15%, 20%, 25%
        const profit = (CP * profitPct) / 100;
        const SP = CP + profit;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `A merchant in ${city} purchased ${item} at cost price ₹${CP} and sold them at a profit margin of ${profitPct}%. What was the final SELLING PRICE?`,
          correctOpt: `₹${SP}`,
          wrongOpts: [`₹${SP + 50}`, `₹${SP - 50}`, `₹${CP - profit}`],
          explanation: `Profit = ${profitPct}% of ${CP} = ₹${profit}. Selling Price = Cost Price + Profit = ₹${CP} + ₹${profit} = ₹${SP}.`,
          hint: 'SP = CP + (Profit% of CP).',
          topicTag: 'Profit and Loss'
        });
      }
      case 2: {
        const r = (counter % 14) + 7;
        const circ = (2 * (22 / 7) * r).toFixed(0);
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In a civil park design in ${city}, calculate the circumference of a circular fountain with radius r = ${r} m (take π = 22/7).`,
          correctOpt: `${circ} m`,
          wrongOpts: [`${parseInt(circ) + 4} m`, `${parseInt(circ) - 4} m`, `${(22 / 7 * r * r).toFixed(0)} m`],
          explanation: `Circumference = 2 × π × r = 2 × (22/7) × ${r} = ${circ} m.`,
          hint: 'Formula: C = 2πr.',
          topicTag: 'Circumference of Circle'
        });
      }
      case 3: {
        const base = (counter % 15) + 6;
        const height = (counter % 12) + 4;
        const area = 0.5 * base * height;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `What is the surface AREA of a right-angled triangular sail with base = ${base} m and height = ${height} m?`,
          correctOpt: `${area} sq m`,
          wrongOpts: [`${base * height} sq m`, `${area + 5} sq m`, `${area - 5} sq m`],
          explanation: `Area of triangle = 1/2 × base × height = 1/2 × ${base} × ${height} = ${area} m².`,
          hint: 'Formula: Area = 1/2 × b × h.',
          topicTag: 'Area of Triangle'
        });
      }
      case 4: {
        const nutritionTypes = [
          { type: 'Autotrophic Nutrition', desc: 'green plants synthesizing organic food from CO₂ and water using chlorophyll and solar energy', w: ['Heterotrophic Nutrition', 'Saprotrophic Nutrition', 'Parasitic Nutrition'] },
          { type: 'Saprotrophic Nutrition', desc: 'fungi like mushrooms taking in nutrients in solution form from dead and decaying matter', w: ['Autotrophic Nutrition', 'Holozoic Nutrition', 'Insectivorous Nutrition'] },
          { type: 'Parasitic Nutrition', desc: 'Cuscuta (Amarbel) deriving ready-made nutrients from the host plant without having chlorophyll', w: ['Symbiosis', 'Autotrophic Nutrition', 'Saprotrophic Nutrition'] },
          { type: 'Symbiotic Association', desc: 'lichens where algae provide synthesized food and fungi provide shelter, water, and minerals', w: ['Parasitism', 'Predation', 'Competition'] }
        ];
        const nt = nutritionTypes[counter % nutritionTypes.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In plant physiology studied by ${name2}, which mode of nutrition is defined as ${nt.desc}?`,
          correctOpt: nt.type,
          wrongOpts: nt.w,
          explanation: `${nt.type} is the biological feeding mode where ${nt.desc}.`,
          hint: 'Distinguish between autotrophs, parasites, saprotrophs, and symbionts.',
          topicTag: 'Nutrition in Plants'
        });
      }
      case 5: {
        const thermoModes = [
          { mode: 'Conduction', desc: 'transfer of heat from hotter to colder end through direct molecular collision in solids without gross movement', ex: 'Metal spoon heating in a hot soup bowl', w: ['Convection', 'Radiation', 'Evaporation'] },
          { mode: 'Convection', desc: 'transfer of heat through actual bulk movement of heated fluid molecules in liquids and gases', ex: 'Sea breeze and land breeze circulation', w: ['Conduction', 'Radiation', 'Absorption'] },
          { mode: 'Radiation', desc: 'heat transmission via electromagnetic waves requiring no material medium for propagation', ex: 'Solar thermal energy reaching the Earth across space', w: ['Conduction', 'Convection', 'Sublimation'] }
        ];
        const tm = thermoModes[counter % thermoModes.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In thermal physics investigated by ${name1}, which mode of heat transfer is defined as ${tm.desc} (${tm.ex})?`,
          correctOpt: tm.mode,
          wrongOpts: tm.w,
          explanation: `${tm.mode} is the heat transfer mechanism described by: ${tm.desc}.`,
          hint: 'Does it require a material medium or molecular movement?',
          topicTag: 'Heat Transfer Modes'
        });
      }
      case 6: {
        const medievalRulers = [
          { ruler: 'Qutb-ud-din Aibak', dynasty: 'Slave (Mamluk) Dynasty in 1206 CE', feat: 'founded the Delhi Sultanate and started constructing the Qutub Minar', w: ['Khilji Dynasty', 'Tughlaq Dynasty', 'Lodi Dynasty'] },
          { ruler: 'Alauddin Khilji', dynasty: 'Khilji Dynasty', feat: 'introduced strict market control regulations, price fixing, and military branding (Dagh)', w: ['Mughal Empire', 'Sayyid Dynasty', 'Suri Empire'] },
          { ruler: 'Akbar the Great', dynasty: 'Mughal Empire', feat: 'instituted Mansabdari administrative system and Sulh-i-Kul policy of universal peace', w: ['Delhi Sultanate', 'Maratha Empire', 'Vijayanagara Empire'] }
        ];
        const mr = medievalRulers[counter % medievalRulers.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'social', levelNode: node,
          text: `In medieval Indian imperial history, which historical dynasty is associated with ${mr.ruler} (${mr.feat})?`,
          correctOpt: mr.dynasty,
          wrongOpts: mr.w,
          explanation: `${mr.ruler} belonged to the ${mr.dynasty}.`,
          hint: 'Recall Delhi Sultanate and Mughal dynasties.',
          topicTag: 'Medieval Indian History'
        });
      }
      case 7: {
        const atmosphericLayers = [
          { layer: 'Troposphere', feat: 'the lowest atmospheric layer extending up to 13 km where all weather phenomena (rainfall, fog, storms) occur', w: ['Stratosphere', 'Mesosphere', 'Thermosphere'] },
          { layer: 'Stratosphere', feat: 'contains the protective ozone layer and is free from clouds, making it ideal for flying jet airplanes', w: ['Troposphere', 'Mesosphere', 'Exosphere'] },
          { layer: 'Mesosphere', feat: 'the middle layer extending up to 80 km where meteorites burn up upon entering from space', w: ['Stratosphere', 'Thermosphere', 'Troposphere'] }
        ];
        const al = atmosphericLayers[counter % atmosphericLayers.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'social', levelNode: node,
          text: `In atmospheric physical geography, which atmospheric layer is characterized as ${al.feat}?`,
          correctOpt: al.layer,
          wrongOpts: al.w,
          explanation: `The ${al.layer} is ${al.feat}.`,
          hint: 'Recall the 5 vertical layers of Earth\'s atmosphere.',
          topicTag: 'Layers of the Atmosphere'
        });
      }
      case 8: {
        const c1 = (counter % 35) + 15;
        const c2 = (counter % 25) + 10;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In parallel lines cut by a transversal in ${city}, if one interior alternate angle measures ${c1}°, what is the measure of its corresponding ALTERNATE INTERIOR ANGLE?`,
          correctOpt: `${c1}°`,
          wrongOpts: [`${180 - c1}°`, `${90 - c1}°`, `${c1 + 10}°`],
          explanation: `When two parallel lines are intersected by a transversal, alternate interior angles are equal in measure (${c1}°).`,
          hint: 'Alternate interior angles are equal.',
          topicTag: 'Lines and Angles: Transversals'
        });
      }
      case 9: {
        const vascular = [
          { tissue: 'Xylem', role: 'transports water and dissolved soil minerals upward from roots to leaves', w: ['Phloem', 'Stomata', 'Cortex'] },
          { tissue: 'Phloem', role: 'translocates synthesized food (sucrose) bidirectionally from leaves to all growing plant parts', w: ['Xylem', 'Pith', 'Epidermis'] }
        ];
        const vas = vascular[counter % vascular.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In plant vascular histology investigated by ${name1}, which specialized conducting tissue ${vas.role}?`,
          correctOpt: vas.tissue,
          wrongOpts: vas.w,
          explanation: `${vas.tissue} is the vascular plant tissue that ${vas.role}.`,
          hint: 'Xylem conducts water; Phloem conducts food.',
          topicTag: 'Transportation in Plants'
        });
      }
      case 10: {
        const sideA = (counter % 8) + 3;
        const sideB = 4;
        const hyp = 5;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In a right triangle with perpendicular legs measuring 3 cm and 4 cm, what is the length of the HYPOTENUSE using Pythagoras theorem?`,
          correctOpt: '5 cm',
          wrongOpts: ['6 cm', '7 cm', '4.5 cm'],
          explanation: `Pythagoras theorem: c² = a² + b² = 3² + 4² = 9 + 16 = 25. Therefore, c = √25 = 5 cm.`,
          hint: 'Pythagorean triplet (3, 4, 5).',
          topicTag: 'Pythagoras Theorem'
        });
      }
      case 11: {
        const mirrorTypes = [
          { mirror: 'Concave Mirror', use: 'Dentists to inspect magnified teeth and headlights of automobiles', w: ['Convex Mirror', 'Plane Mirror', 'Cylindrical Mirror'] },
          { mirror: 'Convex Mirror', use: 'Rear-view mirrors in vehicles because it provides an erect, diminished, wide field of view', w: ['Concave Mirror', 'Plane Mirror', 'Bifocal Mirror'] }
        ];
        const mt = mirrorTypes[counter % mirrorTypes.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In optical instrumentation, which spherical mirror is used by ${mt.use}?`,
          correctOpt: mt.mirror,
          wrongOpts: mt.w,
          explanation: `A ${mt.mirror.toLowerCase()} is utilized for: ${mt.use}.`,
          hint: 'Convex mirrors widen field of view; concave mirrors can magnify.',
          topicTag: 'Spherical Mirrors and Lenses'
        });
      }
      case 12: {
        const valX = (counter % 15) + 4;
        const eqStr = `3x - 5 = ${3 * valX - 5}`;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `Solve the linear equation: ${eqStr}. What is the numerical value of x?`,
          correctOpt: `x = ${valX}`,
          wrongOpts: [`x = ${valX + 1}`, `x = ${valX - 1}`, `x = ${valX + 3}`],
          explanation: `3x - 5 = ${3 * valX - 5} => 3x = ${3 * valX} => x = ${valX}.`,
          hint: 'Add 5 to both sides and divide by 3.',
          topicTag: 'Linear Equations'
        });
      }
      case 13: {
        const bloodComponents = [
          { comp: 'Red Blood Cells (RBCs / Erythrocytes)', func: 'contain iron-pigment hemoglobin to transport oxygen to cells', w: ['White Blood Cells', 'Platelets', 'Plasma'] },
          { comp: 'White Blood Cells (WBCs / Leukocytes)', func: 'act as bodily defense soldiers fighting foreign bacteria and pathogens', w: ['Red Blood Cells', 'Hemoglobin', 'Platelets'] },
          { comp: 'Blood Platelets (Thrombocytes)', func: 'form blood clots to arrest bleeding from cuts and injuries', w: ['RBCs', 'Plasma', 'Lymph'] }
        ];
        const bc = bloodComponents[counter % bloodComponents.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In human circulatory physiology studied by ${name2}, which cellular component of blood ${bc.func}?`,
          correctOpt: bc.comp,
          wrongOpts: bc.w,
          explanation: `${bc.comp} are blood elements that ${bc.func}.`,
          hint: 'Identify blood components by their physiological role.',
          topicTag: 'Human Circulatory System'
        });
      }
      case 14: {
        const sideSquare = (counter % 15) + 6;
        const areaSq = sideSquare * sideSquare;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `Calculate the area of a square solar panel in ${city} with side length s = ${sideSquare} m.`,
          correctOpt: `${areaSq} sq m`,
          wrongOpts: [`${4 * sideSquare} sq m`, `${areaSq + 15} sq m`, `${areaSq - 15} sq m`],
          explanation: `Area of square = side² = ${sideSquare}² = ${areaSq} m².`,
          hint: 'Formula: Area = s².',
          topicTag: 'Area of Square'
        });
      }
      case 15: {
        const electroCurrent = [
          { dev: 'Electric Fuse', prin: 'melts and breaks the circuit during electrical overloading or short circuit based on Joule heating', w: ['Electromagnet', 'Galvanometer', 'Rheostat'] },
          { dev: 'Electromagnet', prin: 'acts as a temporary magnet when electric current flows through its insulated wire coil', w: ['Bar Magnet', 'Electric Heater', 'Electric Iron'] }
        ];
        const ec = electroCurrent[counter % electroCurrent.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In electric current applications studied by ${name1} in ${city}, which device ${ec.prin}?`,
          correctOpt: ec.dev,
          wrongOpts: ec.w,
          explanation: `An ${ec.dev.toLowerCase()} ${ec.prin}.`,
          hint: 'Recall magnetic and heating effects of electric currents.',
          topicTag: 'Electric Current and Its Effects'
        });
      }
      case 16: {
        const valA = (counter % 12) + 3;
        const valB = (counter % 10) + 2;
        const diffSq = valA * valA - valB * valB;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `Using the algebraic identity a² - b² = (a + b)(a - b), compute the value of ${valA}² - ${valB}² in ${city}.`,
          correctOpt: `${diffSq}`,
          wrongOpts: [`${diffSq + 4}`, `${diffSq - 4}`, `${(valA - valB) * (valA - valB)}`],
          explanation: `${valA}² - ${valB}² = (${valA} + ${valB})(${valA} - ${valB}) = (${valA + valB})(${valA - valB}) = ${diffSq}.`,
          hint: 'Factor as (a+b)(a-b).',
          topicTag: 'Algebraic Identities'
        });
      }
      case 17: {
        const physicalGeography = [
          { type: 'Igneous Rocks', ex: 'Basalt and Granite', form: 'formed when molten magma or lava cools and solidifies', w: ['Sedimentary Rocks', 'Metamorphic Rocks', 'Fossil fuels'] },
          { type: 'Sedimentary Rocks', ex: 'Sandstone and Limestone', form: 'formed from compacted layers of sediments, often containing fossils', w: ['Igneous Rocks', 'Plutonic Rocks', 'Metamorphic Rocks'] },
          { type: 'Metamorphic Rocks', ex: 'Marble and Slate', form: 'formed when existing rocks undergo intense heat and pressure deep inside Earth', w: ['Igneous Rocks', 'Volcanic Rocks', 'Sedimentary Rocks'] }
        ];
        const pg = physicalGeography[counter % physicalGeography.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'social', levelNode: node,
          text: `In geological petrology, which primary rock group is ${pg.form} (such as ${pg.ex})?`,
          correctOpt: pg.type,
          wrongOpts: pg.w,
          explanation: `${pg.type} are rocks ${pg.form}.`,
          hint: 'Recall the rock cycle: Igneous -> Sedimentary -> Metamorphic.',
          topicTag: 'Rocks and Minerals'
        });
      }
      case 18: {
        const r1 = (counter % 8) + 2;
        const r2 = (counter % 6) + 3;
        const sumR = `(3x + ${r1}) + (2x + ${r2})`;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `Add the two algebraic expressions: ${sumR}. What is the simplified expression?`,
          correctOpt: `5x + ${r1 + r2}`,
          wrongOpts: [`5x + ${Math.abs(r1 - r2)}`, `6x + ${r1 + r2}`, `x + ${r1 + r2}`],
          explanation: `Combine like terms: (3x + 2x) + (${r1} + ${r2}) = 5x + ${r1 + r2}.`,
          hint: 'Add variable coefficients and constant terms separately.',
          topicTag: 'Algebraic Operations'
        });
      }
      default: {
        const reproductionPlants = [
          { mode: 'Vegetative Propagation', ex: 'Rose stem cuttings, potato tubers with eyes, and Bryophyllum leaf notches', desc: 'asexual reproduction from vegetative parts like stem, root, or leaf', w: ['Sexual Reproduction', 'Double Fertilization', 'Pollination'] },
          { mode: 'Spore Formation', ex: 'Bread mold (Rhizopus) and ferns', desc: 'asexual reproduction where spores are released from sporangia', w: ['Budding', 'Binary Fission', 'Cross-pollination'] }
        ];
        const rp = reproductionPlants[counter % reproductionPlants.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'science', levelNode: node,
          text: `In plant biology, which reproductive mechanism is described as ${rp.desc} (seen in ${rp.ex})?`,
          correctOpt: rp.mode,
          wrongOpts: rp.w,
          explanation: `${rp.mode} is ${rp.desc}.`,
          hint: 'Reproduction without seeds is asexual reproduction.',
          topicTag: 'Reproduction in Plants'
        });
      }
    }
  }

  // GRADE 8
  const variant = counter % 20;
  switch (variant) {
    case 0: {
      const P = ((counter % 60) + 10) * 1000; // 10,000 to 70,000
      const R = (counter % 5) + 6; // 6% to 10%
      const n = (counter % 3) + 2; // 2 to 4 years
      const factor = Math.pow(1 + R / 100, n);
      const A = P * factor;
      const CI = A - P;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `${name1} borrows ₹${P} from an investment agency in ${city} at ${R}% annual COMPOUND INTEREST compounded annually for ${n} years. What is the total compound interest payable?`,
        correctOpt: `₹${CI.toFixed(0)}`,
        wrongOpts: [`₹${(P * (R * n) / 100).toFixed(0)}`, `₹${(CI + 250).toFixed(0)}`, `₹${(CI - 250).toFixed(0)}`],
        explanation: `Amount A = P(1 + r/100)ⁿ = ${P} × (1 + ${R}/100)^${n} = ₹${A.toFixed(0)}. CI = A - P = ₹${CI.toFixed(0)}.`,
        hint: 'Formula: A = P(1 + r/100)ⁿ, CI = A - P.',
        topicTag: 'Compound Interest'
      });
    }
    case 1: {
      const edge = (counter % 35) + 3;
      const tsa = 6 * edge * edge;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `Find the TOTAL SURFACE AREA of a solid metal cube crafted in ${city} with edge length a = ${edge} cm.`,
        correctOpt: `${tsa} cm²`,
        wrongOpts: [`${tsa + 12} cm²`, `${4 * edge * edge} cm²`, `${edge * edge * edge} cm²`],
        explanation: `Total surface area of a cube = 6a² = 6 × ${edge}² = ${tsa} cm².`,
        hint: 'A cube has 6 identical square faces.',
        topicTag: 'Surface Area of Cube'
      });
    }
    case 2: {
      const sidesPoly = (counter % 12) + 5; // 5 to 16 sides
      const sumDeg = (sidesPoly - 2) * 180;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `In advanced polygon geometry investigated by ${name2} in ${city}, what is the sum of interior angles of an ${sidesPoly}-sided convex polygon?`,
        correctOpt: `${sumDeg}°`,
        wrongOpts: [`${sumDeg + 180}°`, `${sumDeg - 180}°`, `${sidesPoly * 180}°`],
        explanation: `Interior angle sum = (n - 2) × 180° = (${sidesPoly} - 2) × 180° = ${sumDeg}°.`,
        hint: 'Formula: (n - 2) × 180°.',
        topicTag: 'Polygon Interior Angle Sum'
      });
    }
    case 3: {
      const microbes = [
        { name: 'Alexander Fleming in 1928', disc: 'discovered the world\'s first life-saving antibiotic PENICILLIN from Penicillium notatum mold', w: ['Edward Jenner', 'Louis Pasteur', 'Robert Koch'] },
        { name: 'Louis Pasteur in 1857', disc: 'discovered the biochemical process of FERMENTATION by yeast converting sugar into alcohol', w: ['Alexander Fleming', 'Robert Hooke', 'Antony van Leeuwenhoek'] },
        { name: 'Edward Jenner in 1798', disc: 'developed the first successful VACCINE against deadly smallpox', w: ['Louis Pasteur', 'Joseph Lister', 'Ronald Ross'] }
      ];
      const mb = microbes[counter % microbes.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'science', levelNode: node,
        text: `In microbiological medical history, which famous scientist ${mb.disc}?`,
        correctOpt: mb.name,
        wrongOpts: mb.w,
        explanation: `${mb.name} is celebrated for discovering: ${mb.disc}.`,
        hint: 'Recall milestones in vaccination, fermentation, and antibiotics.',
        topicTag: 'Microorganisms: Friend and Foe'
      });
    }
    case 4: {
      const fuels = [
        { fuel: 'Hydrogen Gas', cal: '150,000 kJ/kg', note: 'highest calorific value among all known fuels', w: ['55,000 kJ/kg', '25,000 kJ/kg', '10,000 kJ/kg'] },
        { fuel: 'Methane (CNG / Biogas)', cal: '50,000 kJ/kg', note: 'clean gaseous fuel producing minimal smoke', w: ['150,000 kJ/kg', '10,000 kJ/kg', '30,000 kJ/kg'] },
        { fuel: 'LPG (Liquefied Petroleum Gas)', cal: '55,000 kJ/kg', note: 'standard clean cooking fuel cylinders', w: ['100,000 kJ/kg', '20,000 kJ/kg', '35,000 kJ/kg'] }
      ];
      const fl = fuels[counter % fuels.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'science', levelNode: node,
        text: `In combustion thermodynamics, what is the approximate CALORIFIC VALUE of ${fl.fuel} (${fl.note})?`,
        correctOpt: fl.cal,
        wrongOpts: fl.w,
        explanation: `The calorific value of ${fl.fuel} is approximately ${fl.cal}.`,
        hint: 'Hydrogen has the highest calorific value.',
        topicTag: 'Calorific Value of Fuels'
      });
    }
    case 5: {
      const F = ((counter % 60) + 10) * 10; // 100 to 700 N
      const A = (counter % 9) + 2; // 2 to 10 m²
      const P = F / A;
      return makeQ({
        id: qId, board, grade, subjectId: 'science', levelNode: node,
        text: `A mechanical piston in ${city} exerts a perpendicular thrust force of ${F} N across a surface area of ${A} m² in ${name1}'s experiment. What PRESSURE is generated?`,
        correctOpt: `${P.toFixed(0)} Pascals (N/m²)`,
        wrongOpts: [`${(P + 20).toFixed(0)} Pascals`, `${(P - 20).toFixed(0)} Pascals`, `${(F * A).toFixed(0)} Pascals`],
        explanation: `Pressure = Force / Area = ${F} N / ${A} m² = ${P.toFixed(0)} Pa.`,
        hint: 'Formula: P = F / A.',
        topicTag: 'Force and Pressure'
      });
    }
    case 6: {
      const constitution = [
        { term: 'Article 32 of Indian Constitution', desc: 'Right to Constitutional Remedies, revered by Dr. Ambedkar as the Heart and Soul of the Constitution', w: ['Right to Property', 'Right to Assemble', 'Right to Education'] },
        { term: 'Right to Equality (Articles 14-18)', desc: 'prohibits discrimination on grounds of religion, race, caste, sex, or place of birth', w: ['Right against Exploitation', 'Cultural Rights', 'Right to Freedom of Religion'] },
        { term: 'Separation of Powers', desc: 'division of sovereign authority into Legislature, Executive, and Judiciary to prevent abuse of power', w: ['Unitary Centralization', 'Presidential Autocracy', 'Martial Rule'] }
      ];
      const con = constitution[counter % constitution.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'social', levelNode: node,
        text: `In Indian constitutional governance studied by ${name1}, which provision represents: "${con.desc}"?`,
        correctOpt: con.term,
        wrongOpts: con.w,
        explanation: `${con.term} is defined as: ${con.desc}.`,
        hint: 'Recall fundamental constitutional principles.',
        topicTag: 'The Indian Constitution'
      });
    }
    case 7: {
      const voicePass = [
        { act: 'The heavy earthquake damaged several historic monuments.', pass: 'Several historic monuments were damaged by the heavy earthquake.', w: ['Historic monuments are damaged by earthquake.', 'Earthquake was damaged by monuments.', 'Monuments have damaged by earthquake.'] },
        { act: 'The agricultural scientist tested new hybrid wheat varieties.', pass: 'New hybrid wheat varieties were tested by the agricultural scientist.', w: ['Wheat varieties are tested by scientist.', 'Scientist was tested by wheat varieties.', 'Wheat varieties had test by scientist.'] }
      ];
      const vp = voicePass[counter % voicePass.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'english', levelNode: node,
        text: `Change this active sentence into accurate PASSIVE VOICE: "${vp.act}"`,
        correctOpt: vp.pass,
        wrongOpts: vp.w,
        explanation: `In passive voice: Object + were + V3 + by + Subject = '${vp.pass}'.`,
        hint: 'Object becomes subject.',
        topicTag: 'Passive Voice'
      });
    }
    case 8: {
      const mVal = (counter % 25) + 3;
      const trip1 = 2 * mVal;
      const trip2 = mVal * mVal - 1;
      const trip3 = mVal * mVal + 1;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `Using the Pythagorean triplet formula (2m, m² - 1, m² + 1) with m = ${mVal} in ${name2}'s calculation, find the HYPOTENUSE member of the triplet.`,
        correctOpt: `${trip3}`,
        wrongOpts: [`${trip2}`, `${trip1}`, `${trip3 + 2}`],
        explanation: `In Pythagorean triplet (2m, m² - 1, m² + 1), the largest hypotenuse member is m² + 1 = ${mVal}² + 1 = ${trip3}.`,
        hint: 'Hypotenuse is given by m² + 1.',
        topicTag: 'Pythagorean Triplets'
      });
    }
    case 9: {
      const electroplating = [
        { app: 'Chromium electroplating', reason: 'provides a bright corrosion-resistant scratch-proof surface on car bumpers and bicycle handles', w: ['Zinc coating on food cans', 'Copper wiring', 'Silver plating on utensils'] },
        { app: 'Tin plating on iron food cans', reason: 'tin is less reactive than iron and prevents acidic food from contacting toxic rusted iron', w: ['Lead coating', 'Mercury coating', 'Chromium plating'] },
        { app: 'Zinc galvanization on steel sheets', reason: 'sacrificial anode protection preventing oxygen and moisture from rusting steel', w: ['Gold plating', 'Nickel polishing', 'Silver coating'] }
      ];
      const ep = electroplating[counter % electroplating.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'science', levelNode: node,
        text: `In industrial electrolytic chemistry, why is ${ep.app} widely used?`,
        correctOpt: `Because it ${ep.reason}`,
        wrongOpts: ep.w.map(x => `Because of ${x}`),
        explanation: `${ep.app} is implemented because it ${ep.reason}.`,
        hint: 'Recall chemical effects of electric currents and corrosion prevention.',
        topicTag: 'Chemical Effects of Current: Electroplating'
      });
    }
    case 10: {
      const directProp = (counter % 35) + 4;
      const costPer = (counter % 20) + 5;
      const totalCost = directProp * costPer;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `If the cost of ${directProp} meters of cloth is ₹${totalCost} in ${city} for ${name1}, how much will 1 meter of the same fabric cost under DIRECT PROPORTION?`,
        correctOpt: `₹${costPer}`,
        wrongOpts: [`₹${costPer + 2}`, `₹${costPer - 2}`, `₹${costPer + 4}`],
        explanation: `Under direct variation, cost / quantity = constant: ₹${totalCost} / ${directProp} = ₹${costPer} per meter.`,
        hint: 'Direct variation means ratio remains constant.',
        topicTag: 'Direct and Inverse Proportion'
      });
    }
    case 11: {
      const eyeAnatomy = [
        { part: 'Retina', func: 'acts as the sensitive inner screen where inverted real images are focused and detected by rods and cones', w: ['Cornea', 'Iris', 'Pupil'] },
        { part: 'Iris', func: 'the colored muscular diaphragm that regulates the size of the pupil and controls light entry', w: ['Retina', 'Ciliary muscles', 'Optic nerve'] },
        { part: 'Cornea', func: 'the transparent front curved window of the eye that provides most of the refractive power', w: ['Sclera', 'Vitreous humor', 'Choroid'] }
      ];
      const ea = eyeAnatomy[counter % eyeAnatomy.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'science', levelNode: node,
        text: `In human optical biology, which anatomical part of the human eye ${ea.func}?`,
        correctOpt: ea.part,
        wrongOpts: ea.w,
        explanation: `The ${ea.part.toLowerCase()} is the eye structure that ${ea.func}.`,
        hint: 'Identify eye components by optical function.',
        topicTag: 'The Human Eye'
      });
    }
    case 12: {
      const modernMovements = [
        { mov: 'Non-Cooperation Movement (1920-1922)', cause: 'launched by Mahatma Gandhi protesting the Rowlatt Act and Jallianwala Bagh massacre', w: ['Quit India Movement', 'Civil Disobedience Movement', 'Swadeshi Movement'] },
        { mov: 'Civil Disobedience Movement (1930)', cause: 'commenced with the historic 240-mile Salt March from Sabarmati to Dandi', w: ['Non-Cooperation Movement', 'Khilafat Movement', 'Champaran Satyagraha'] },
        { mov: 'Quit India Movement (August 1942)', cause: 'historic "Do or Die" call demanding immediate withdrawal of British colonial rule from India', w: ['Rowlatt Satyagraha', 'Dandi March', 'Poona Pact'] }
      ];
      const mm = modernMovements[counter % modernMovements.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'social', levelNode: node,
        text: `In the Indian National Movement, which nationwide mass campaign was ${mm.cause}?`,
        correctOpt: mm.mov,
        wrongOpts: mm.w,
        explanation: `The ${mm.mov} was ${mm.cause}.`,
        hint: 'Chronology: Non-Cooperation (1920), Civil Disobedience (1930), Quit India (1942).',
        topicTag: 'Indian National Movement'
      });
    }
    case 13: {
      const indComp = [
        { type: 'Industrial Revolution', loc: 'Silicon Valley of India', name: 'Bengaluru', w: ['Mumbai', 'Kolkata', 'Chennai'] },
        { type: 'Steel City of India', loc: 'home to Tata Iron and Steel Company (TISCO)', name: 'Jamshedpur', w: ['Bengaluru', 'Surat', 'Pune'] },
        { type: 'Manchester of India', loc: 'historic cotton textile manufacturing hub in Gujarat', name: 'Ahmedabad', w: ['Kanpur', 'Coimbatore', 'Jaipur'] }
      ];
      const ic = indComp[counter % indComp.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'social', levelNode: node,
        text: `In industrial economic geography, which premier Indian city is acclaimed as the "${ic.type}" (${ic.loc})?`,
        correctOpt: ic.name,
        wrongOpts: ic.w,
        explanation: `${ic.name} is celebrated as the "${ic.type}" (${ic.loc}).`,
        hint: 'Recall major industrial centers of India.',
        topicTag: 'Industries and Economic Geography'
      });
    }
    case 14: {
      const expN = (counter % 4) + 2;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `Using exponent laws, what is the exact fractional value of 2^(-${expN})?`,
        correctOpt: `1/${Math.pow(2, expN)}`,
        wrongOpts: [`-${Math.pow(2, expN)}`, `${Math.pow(2, expN)}`, `1/${expN * 2}`],
        explanation: `a^(-n) = 1 / aⁿ. Therefore, 2^(-${expN}) = 1 / 2^${expN} = 1/${Math.pow(2, expN)}.`,
        hint: 'Negative exponent means reciprocal of positive power.',
        topicTag: 'Negative Exponents'
      });
    }
    case 15: {
      const syntheticFibres = [
        { fibre: 'Rayon (Artificial Silk)', origin: 'obtained from chemical treatment of natural wood cellulose pulp', w: ['Nylon', 'Polyester', 'Acrylic'] },
        { fibre: 'Nylon', origin: 'first fully synthetic fibre prepared without any natural raw plant or animal material in 1931', w: ['Rayon', 'Jute', 'Wool'] },
        { fibre: 'Bakelite', origin: 'thermosetting plastic that is a poor conductor of heat and electricity used for electrical switches', w: ['Polythene', 'PVC', 'Teflon'] }
      ];
      const sf = syntheticFibres[counter % syntheticFibres.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'science', levelNode: node,
        text: `In polymer materials science, which synthetic polymer is ${sf.origin}?`,
        correctOpt: sf.fibre,
        wrongOpts: sf.w,
        explanation: `${sf.fibre} is characterized as: ${sf.origin}.`,
        hint: 'Rayon comes from wood pulp; Nylon is the first fully synthetic fibre.',
        topicTag: 'Synthetic Fibres and Plastics'
      });
    }
    case 16: {
      const valA = (counter % 35) + 3;
      const valB = (counter % 25) + 2;
      const id2 = valA * valA - 2 * valA * valB + valB * valB;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `Using the algebraic expansion (a - b)² = a² - 2ab + b², compute (${valA} - ${valB})² in ${city} for ${name1}.`,
        correctOpt: `${id2}`,
        wrongOpts: [`${id2 + 10}`, `${id2 - 10}`, `${valA * valA - valB * valB}`],
        explanation: `(${valA} - ${valB})² = ${valA - valB}² = ${id2}. Expanding gives ${valA}² - 2(${valA})(${valB}) + ${valB}² = ${id2}.`,
        hint: 'Formula: (a - b)² = a² - 2ab + b².',
        topicTag: 'Algebraic Identities: (a-b)²'
      });
    }
    case 17: {
      const soundProps = [
        { concept: 'Ultrasound waves', freq: 'frequencies higher than 20,000 Hz, used in medical SONAR and echocardiography', w: ['Infrasound', 'Audible waves', 'Radio waves'] },
        { concept: 'Infrasound waves', freq: 'frequencies below 20 Hz, produced by earthquakes, volcanoes, and elephants', w: ['Ultrasound', 'Megasound', 'Microwaves'] }
      ];
      const sp2 = soundProps[counter % soundProps.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'science', levelNode: node,
        text: `In acoustics studied by ${name2}, which category describes sound vibrations with ${sp2.freq}?`,
        correctOpt: sp2.concept,
        wrongOpts: sp2.w,
        explanation: `${sp2.concept} are sounds characterized by ${sp2.freq}.`,
        hint: 'Ultra = above 20 kHz; Infra = below 20 Hz.',
        topicTag: 'Ultrasound and Infrasound'
      });
    }
    case 18: {
      const invWorkers = (counter % 12) + 2; // 2 to 13 workers
      const invDays = (counter % 18) + 4; // 4 to 21 days
      const totalWork = invWorkers * invDays;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `If ${invWorkers} construction workers can complete a masonry wall in ${invDays} days in ${city} for ${name1}, how many days will 1 worker take under INVERSE PROPORTION?`,
        correctOpt: `${totalWork} days`,
        wrongOpts: [`${totalWork + 2} days`, `${totalWork - 2} days`, `${invWorkers + invDays} days`],
        explanation: `Under inverse variation: Workers × Days = constant. Time for 1 worker = ${invWorkers} × ${invDays} = ${totalWork} days.`,
        hint: 'Inverse proportion product remains constant: x₁y₁ = x₂y₂.',
        topicTag: 'Inverse Proportion'
      });
    }
    default: {
      const displacement = [
        { rxn: 'Iron nail placed in blue copper sulfate (CuSO₄) solution', obs: 'solution turns light green (FeSO₄) and reddish-brown copper deposits on nail because Iron is more reactive than Copper', w: ['No reaction occurs', 'Solution turns bright yellow', 'Gas bubbles explode'] },
        { rxn: 'Copper wire placed in zinc sulfate (ZnSO₄) solution', obs: 'NO reaction occurs because Copper is less reactive than Zinc', w: ['Blue precipitate forms', 'Zinc melts', 'Hydrogen gas evolves'] }
      ];
      const dp = displacement[counter % displacement.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'science', levelNode: node,
        text: `In the chemical reactivity series of metals tested by ${name1} in the school laboratory, what occurs when ${dp.rxn}?`,
        correctOpt: dp.obs,
        wrongOpts: dp.w,
        explanation: `In chemical displacement rules, ${dp.obs}.`,
        hint: 'Check metal reactivity series: Fe is more reactive than Cu, but less than Zn.',
        topicTag: 'Metal Reactivity & Displacement'
      });
    }
  }
}
