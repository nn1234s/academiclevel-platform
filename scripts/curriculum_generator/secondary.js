import { makeQ, NAMES, ITEMS, CITIES, pickRandom } from './common.js';

export function getSecondaryQuestion(grade, board, node, counter, qId) {
  const name1 = pickRandom(NAMES, counter * 13 + 1);
  const name2 = pickRandom(NAMES, counter * 19 + 5);
  const item = pickRandom(ITEMS, counter * 17 + 3);
  const city = pickRandom(CITIES, counter * 7 + 2);

  // GRADE 9
  if (grade === 9) {
    const variant = counter % 20;
    switch (variant) {
      case 0: {
        const u = (counter % 15) + 5; // 5 to 20 m/s
        const a = (counter % 4) + 2;  // 2 to 5 m/s²
        const t = (counter % 6) + 2;  // 2 to 7 s
        const v = u + a * t;
        return makeQ({
          id: qId, board, grade, subjectId: 'physics', levelNode: node,
          text: `A racing sports car in ${city} accelerates uniformly from an initial velocity u = ${u} m/s at a = ${a} m/s² for t = ${t} seconds. What is its FINAL VELOCITY v using v = u + at?`,
          correctOpt: `${v} m/s`,
          wrongOpts: [`${v + 5} m/s`, `${v - 5} m/s`, `${u * t} m/s`],
          explanation: `Using the first equation of motion: v = u + at = ${u} + (${a} × ${t}) = ${v} m/s.`,
          hint: 'Apply the first kinematic equation: v = u + at.',
          topicTag: 'Kinematics: Equations of Motion'
        });
      }
      case 1: {
        const m = ((counter % 40) + 10) * 10; // 100 to 500 kg
        const acc = (counter % 6) + 2; // 2 to 7 m/s²
        const F = m * acc;
        return makeQ({
          id: qId, board, grade, subjectId: 'physics', levelNode: node,
          text: `Calculate the net resultant FORCE required to accelerate a loaded cart of mass ${m} kg at ${acc} m/s² across a level floor in ${city}.`,
          correctOpt: `${F} N`,
          wrongOpts: [`${F + 50} N`, `${F - 50} N`, `${(m / acc).toFixed(0)} N`],
          explanation: `According to Newton's Second Law of Motion: Force F = m × a = ${m} kg × ${acc} m/s² = ${F} Newtons.`,
          hint: 'Formula: F = ma.',
          topicTag: 'Newton\'s Second Law'
        });
      }
      case 2: {
        const mass = (counter % 20) + 5; // 5 to 25 kg
        const h = (counter % 8) + 4; // 4 to 12 m
        const g = 10;
        const PE = mass * g * h;
        return makeQ({
          id: qId, board, grade, subjectId: 'physics', levelNode: node,
          text: `In a physics lab in ${city}, ${name1} lifts an object of mass ${mass} kg vertically to a shelf of height ${h} meters. What is its GRAVITATIONAL POTENTIAL ENERGY (take g = 10 m/s²)?`,
          correctOpt: `${PE} Joules`,
          wrongOpts: [`${PE + 100} Joules`, `${PE - 100} Joules`, `${mass * h} Joules`],
          explanation: `Potential Energy = m × g × h = ${mass} × 10 × ${h} = ${PE} Joules.`,
          hint: 'Formula: Ep = mgh.',
          topicTag: 'Work and Energy: Potential Energy'
        });
      }
      case 3: {
        const massSolute = (counter % 15) + 10; // 10 to 25 g
        const massWater = ((counter % 8) + 8) * 10; // 80 to 150 g
        const massSolution = massSolute + massWater;
        const massPct = ((massSolute / massSolution) * 100).toFixed(1);
        return makeQ({
          id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
          text: `In a solution chemistry practical in ${city}, ${name2} dissolves ${massSolute} g of common salt in ${massWater} g of water. What is the MASS PERCENTAGE concentration of the solution?`,
          correctOpt: `${massPct}%`,
          wrongOpts: [`${(parseFloat(massPct) + 3).toFixed(1)}%`, `${(parseFloat(massPct) - 3).toFixed(1)}%`, `${((massSolute / massWater) * 100).toFixed(1)}%`],
          explanation: `Mass % = (Mass of Solute / Total Mass of Solution) × 100 = (${massSolute} / ${massSolution}) × 100 = ${massPct}%.`,
          hint: 'Mass of solution = mass of solute + mass of solvent.',
          topicTag: 'Solution Concentration'
        });
      }
      case 4: {
        const subParticles = [
          { name: 'Electron', disc: 'J.J. Thomson in 1897 via cathode ray discharge experiments', charge: 'negative charge (-1.6 × 10⁻¹⁹ C)', w: ['Proton', 'Neutron', 'Alpha particle'] },
          { name: 'Proton', disc: 'E. Goldstein via canal rays and identified by Rutherford', charge: 'positive charge (+1.6 × 10⁻¹⁹ C)', w: ['Electron', 'Neutron', 'Neutrino'] },
          { name: 'Neutron', disc: 'James Chadwick in 1932 by bombarding beryllium with alpha particles', charge: 'electrically neutral with zero charge', w: ['Electron', 'Proton', 'Positron'] }
        ];
        const sp = subParticles[counter % subParticles.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
          text: `In atomic physics, which subatomic particle was discovered by ${sp.disc} and carries a ${sp.charge}?`,
          correctOpt: sp.name,
          wrongOpts: sp.w,
          explanation: `The ${sp.name} was discovered by ${sp.disc} and has ${sp.charge}.`,
          hint: 'Thomson discovered electron; Chadwick discovered neutron.',
          topicTag: 'Structure of the Atom'
        });
      }
      case 5: {
        const cellBiology = [
          { organelle: 'Lysosomes', alias: 'Suicide Bags of the Cell', desc: 'contain powerful digestive hydrolytic enzymes capable of digesting the cell itself when damaged', w: ['Ribosomes', 'Mitochondria', 'Centrosomes'] },
          { organelle: 'Ribosomes', alias: 'Protein Factories of the Cell', desc: 'sites where amino acids are assembled into polypeptides and proteins', w: ['Lysosomes', 'Vacuoles', 'Peroxisomes'] },
          { organelle: 'Golgi Apparatus', alias: 'Cellular Packaging & Secretory Unit', desc: 'modifies, sorts, and packages biochemicals synthesized in the endoplasmic reticulum', w: ['Chloroplast', 'Mitochondria', 'Centriole'] }
        ];
        const cb = cellBiology[counter % cellBiology.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'biology', levelNode: node,
          text: `In cytological cell biology observed by ${name1}, which organelle is designated as the "${cb.alias}" because they ${cb.desc}?`,
          correctOpt: cb.organelle,
          wrongOpts: cb.w,
          explanation: `${cb.organelle} are known as ${cb.alias} because they ${cb.desc}.`,
          hint: 'Recall organelle nicknames based on functional specialization.',
          topicTag: 'Cell Organelles'
        });
      }
      case 6: {
        const plantTissues = [
          { tissue: 'Apical Meristem', loc: 'growing tips of roots and stems', role: 'increases the linear vertical length of the plant body', w: ['Lateral Meristem (Cambium)', 'Intercalary Meristem', 'Sclerenchyma'] },
          { tissue: 'Lateral Meristem (Cambium)', loc: 'radial sides of stems and roots', role: 'increases the secondary girth/diameter of woody stems', w: ['Apical Meristem', 'Parenchyma', 'Collenchyma'] },
          { tissue: 'Sclerenchyma', loc: 'hard coconut husk and walnut shells', role: 'composed of dead, thick lignified cells providing mechanical rigidity', w: ['Parenchyma', 'Chlorenchyma', 'Aerenchyma'] },
          { tissue: 'Collenchyma', loc: 'leaf stalks and green stems below epidermis', role: 'provides flexible mechanical support allowing bending without tearing', w: ['Sclerenchyma', 'Xylem vessels', 'Phloem fibers'] }
        ];
        const pt = plantTissues[counter % plantTissues.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'biology', levelNode: node,
          text: `In plant histology examined by ${name2}, which specialized tissue is located at the ${pt.loc} and functions to ${pt.role}?`,
          correctOpt: pt.tissue,
          wrongOpts: pt.w,
          explanation: `${pt.tissue} is located at ${pt.loc} and ${pt.role}.`,
          hint: 'Apical = length growth; Lateral = girth growth.',
          topicTag: 'Plant Tissues'
        });
      }
      case 7: {
        const aSide = (counter % 12) + 5;
        const bSide = (counter % 10) + 6;
        const cSide = (counter % 8) + 7;
        const s = (aSide + bSide + cSide) / 2;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In Heron's formula for a triangle with side lengths a = ${aSide} cm, b = ${bSide} cm, and c = ${cSide} cm in ${city}, what is the exact SEMI-PERIMETER s?`,
          correctOpt: `${s} cm`,
          wrongOpts: [`${2 * s} cm`, `${s + 2} cm`, `${s - 2} cm`],
          explanation: `Semi-perimeter s = (a + b + c) / 2 = (${aSide} + ${bSide} + ${cSide}) / 2 = ${s} cm.`,
          hint: 'Semi-perimeter is half of the total perimeter.',
          topicTag: 'Heron\'s Formula'
        });
      }
      case 8: {
        const rSphere = (counter % 6) + 3;
        const sa = (4 * (22 / 7) * rSphere * rSphere).toFixed(0);
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `Calculate the SURFACE AREA of a solid spherical cannonball of radius r = ${rSphere} cm in ${city} (taking π = 22/7).`,
          correctOpt: `${sa} cm²`,
          wrongOpts: [`${parseInt(sa) + 20} cm²`, `${parseInt(sa) - 20} cm²`, `${(2 * 22 / 7 * rSphere * rSphere).toFixed(0)} cm²`],
          explanation: `Surface Area of Sphere = 4πr² = 4 × (22/7) × ${rSphere}² ≈ ${sa} cm².`,
          hint: 'Formula: A = 4πr².',
          topicTag: 'Surface Area of Sphere'
        });
      }
      case 9: {
        const revolutions = [
          { rev: 'French Revolution (July 14, 1789)', event: 'Storming of the Bastille fortress prison symbolizing the fall of royal despotism', w: ['Tennis Court Oath only', 'Battle of Waterloo', 'Congress of Vienna'] },
          { rev: 'Russian October Revolution (1917)', event: 'Bolshevik uprising led by Vladimir Lenin overthrowing the Russian Provisional Government', w: ['Decembrist Revolt', 'Bloody Sunday 1905', 'Treaty of Versailles'] }
        ];
        const rv = revolutions[counter % revolutions.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'social', levelNode: node,
          text: `In world revolutionary history, what milestone event marked the start of the ${rv.rev}?`,
          correctOpt: rv.event,
          wrongOpts: rv.w,
          explanation: `The ${rv.rev} was marked by: ${rv.event}.`,
          hint: 'Recall epochal dates of modern European revolutions.',
          topicTag: 'French and Russian Revolutions'
        });
      }
      case 10: {
        const xCoord = ((counter % 12) + 2) * (counter % 2 === 0 ? 1 : -1);
        const yCoord = ((counter % 12) + 2) * (counter % 3 === 0 ? 1 : -1);
        let quad = 'Quadrant I';
        if (xCoord < 0 && yCoord > 0) quad = 'Quadrant II';
        else if (xCoord < 0 && yCoord < 0) quad = 'Quadrant III';
        else if (xCoord > 0 && yCoord < 0) quad = 'Quadrant IV';
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In Cartesian coordinate geometry, in which quadrant does the coordinate point P(${xCoord}, ${yCoord}) lie?`,
          correctOpt: quad,
          wrongOpts: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'].filter(q => q !== quad).slice(0, 3),
          explanation: `Signs of coordinates (${xCoord > 0 ? '+' : '-'}, ${yCoord > 0 ? '+' : '-'}) place the point in ${quad}.`,
          hint: 'Quadrant I (+,+), II (-,+), III (-,-), IV (+,-).',
          topicTag: 'Coordinate Geometry: Quadrants'
        });
      }
      case 11: {
        const chemLaws = [
          { law: 'Law of Conservation of Mass (Antoine Lavoisier)', state: 'mass can neither be created nor destroyed in a chemical reaction; total reactant mass equals product mass', w: ['Law of Definite Proportions', 'Law of Multiple Proportions', 'Avogadro\'s Hypothesis'] },
          { law: 'Law of Constant / Definite Proportions (Joseph Proust)', state: 'in a pure chemical compound, constituent elements are always combined in a fixed proportion by mass (e.g. H₂O has H:O mass ratio 1:8)', w: ['Law of Conservation of Mass', 'Boyle\'s Law', 'Gay-Lussac\'s Law'] }
        ];
        const cl = chemLaws[counter % chemLaws.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
          text: `In stoichiometry, which fundamental law of chemical combination states that: "${cl.state}"?`,
          correctOpt: cl.law,
          wrongOpts: cl.w,
          explanation: `The ${cl.law} formulated that: ${cl.state}.`,
          hint: 'Lavoisier formulated mass conservation; Proust formulated definite proportions.',
          topicTag: 'Laws of Chemical Combination'
        });
      }
      case 12: {
        const tissuesAnimal = [
          { tissue: 'Ligament', func: 'dense fibrous connective tissue that joins bone to another bone at joints', w: ['Tendon', 'Cartilage', 'Adipose tissue'] },
          { tissue: 'Tendon', func: 'tough non-elastic fibrous tissue that connects skeletal muscle to bone', w: ['Ligament', 'Areolar tissue', 'Epithelium'] },
          { tissue: 'Cartilage', func: 'flexible specialized connective tissue with widely spaced cells found in nose tip, ear pinna, and trachea', w: ['Bone', 'Blood', 'Smooth muscle'] }
        ];
        const ta = tissuesAnimal[counter % tissuesAnimal.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'biology', levelNode: node,
          text: `In animal histological anatomy studied by ${name1}, which connective tissue is defined as ${ta.func}?`,
          correctOpt: ta.tissue,
          wrongOpts: ta.w,
          explanation: `${ta.tissue} is the connective tissue that functions to: ${ta.func}.`,
          hint: 'Ligament = bone-to-bone; Tendon = muscle-to-bone.',
          topicTag: 'Animal Connective Tissues'
        });
      }
      case 13: {
        const vSound = (counter % 30) + 330; // 330-360 m/s
        const freq = ((counter % 10) + 2) * 100; // 200-1100 Hz
        const wavelength = (vSound / freq).toFixed(2);
        return makeQ({
          id: qId, board, grade, subjectId: 'physics', levelNode: node,
          text: `A tuning fork vibrating in ${city} emits an acoustic sound wave of frequency ${freq} Hz. If sound speed in air is ${vSound} m/s, what is its WAVELENGTH?`,
          correctOpt: `${wavelength} m`,
          wrongOpts: [`${(parseFloat(wavelength) + 0.2).toFixed(2)} m`, `${(parseFloat(wavelength) - 0.2).toFixed(2)} m`, `${(vSound * freq).toFixed(0)} m`],
          explanation: `Wave relationship: v = f × λ => λ = v / f = ${vSound} / ${freq} = ${wavelength} m.`,
          hint: 'Formula: λ = v / f.',
          topicTag: 'Wave Mechanics and Sound'
        });
      }
      case 14: {
        const valX = (counter % 12) + 2;
        const valY = (counter % 10) + 3;
        const polyExp = valX * valX + 2 * valX * valY + valY * valY;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `If x = ${valX} and y = ${valY}, evaluate the algebraic expression x² + 2xy + y² in ${city}.`,
          correctOpt: `${polyExp}`,
          wrongOpts: [`${polyExp + 8}`, `${polyExp - 8}`, `${valX * valX + valY * valY}`],
          explanation: `x² + 2xy + y² = (x + y)² = (${valX} + ${valY})² = ${valX + valY}² = ${polyExp}.`,
          hint: 'Recognize the identity (x + y)².',
          topicTag: 'Polynomial Evaluations'
        });
      }
      case 15: {
        const drainageRivers = [
          { river: 'Ganga', origin: 'Gangotri Glacier (Bhagirathi) in Uttarakhand', sea: 'empties into the Bay of Bengal forming the Sundarban delta', w: ['Arabian Sea', 'Indian Ocean south of Sri Lanka', 'Rann of Kutch'] },
          { river: 'Narmada', origin: 'Amarkantak plateau in Madhya Pradesh', sea: 'flows westward through a rift valley into the Arabian Sea', w: ['Bay of Bengal', 'Chilika Lake', 'Gulf of Mannar'] },
          { river: 'Indus', origin: 'near Lake Mansarovar in Tibet', sea: 'flows through Ladakh and Pakistan into the Arabian Sea', w: ['Bay of Bengal', 'Red Sea', 'Persian Gulf'] }
        ];
        const dr = drainageRivers[counter % drainageRivers.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'social', levelNode: node,
          text: `In Indian river drainage systems, the river ${dr.river} originates at ${dr.origin} and ${dr.sea}.`,
          correctOpt: dr.sea,
          wrongOpts: dr.w,
          explanation: `The river ${dr.river} originates at ${dr.origin} and ${dr.sea}.`,
          hint: 'Recall east-flowing vs west-flowing rivers of India.',
          topicTag: 'Drainage Systems of India'
        });
      }
      case 16: {
        const massMole = (counter % 5) + 2; // 2 to 6 moles
        const molarMassCO2 = 44; // g/mol
        const totalMass = massMole * molarMassCO2;
        return makeQ({
          id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
          text: `In stoichiometry calculations performed by ${name2}, what is the exact mass in grams of ${massMole} moles of Carbon Dioxide gas (CO₂, molar mass = 44 g/mol)?`,
          correctOpt: `${totalMass} g`,
          wrongOpts: [`${totalMass + 20} g`, `${totalMass - 20} g`, `${massMole * 22} g`],
          explanation: `Mass = moles × molar mass = ${massMole} mol × 44 g/mol = ${totalMass} g.`,
          hint: 'Formula: Mass = n × Molar Mass.',
          topicTag: 'The Mole Concept'
        });
      }
      case 17: {
        const bioCycles = [
          { cycle: 'Nitrogen Cycle', agent: 'Rhizobium bacteria in root nodules and blue-green algae (Cyanobacteria)', role: 'fixing atmospheric N₂ into assimilable nitrates and ammonium ions', w: ['Phosphorus Cycle', 'Carbon Cycle', 'Sulfur Cycle'] },
          { cycle: 'Carbon Cycle', agent: 'photosynthesizing plants and respiration / fossil combustion', role: 'cycling carbon between carbon dioxide gas and organic biomass', w: ['Nitrogen Cycle', 'Water Cycle', 'Calcium Cycle'] }
        ];
        const bc = bioCycles[counter % bioCycles.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'biology', levelNode: node,
          text: `In biogeochemical ecology, which elemental nutrient cycle involves ${bc.agent} for ${bc.role}?`,
          correctOpt: bc.cycle,
          wrongOpts: bc.w,
          explanation: `The ${bc.cycle} relies on ${bc.agent} for ${bc.role}.`,
          hint: 'Think of nitrogen fixers vs carbon fixers.',
          topicTag: 'Biogeochemical Cycles'
        });
      }
      case 18: {
        const rCone = (counter % 5) + 3;
        const hCone = (counter % 6) + 4;
        const lCone = Math.sqrt(rCone * rCone + hCone * hCone).toFixed(2);
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In a right circular cone with base radius r = ${rCone} cm and vertical height h = ${hCone} cm in ${city}, calculate its SLANT HEIGHT l (l = √(r² + h²)).`,
          correctOpt: `${lCone} cm`,
          wrongOpts: [`${(parseFloat(lCone) + 1.5).toFixed(2)} cm`, `${(parseFloat(lCone) - 1.5).toFixed(2)} cm`, `${rCone + hCone} cm`],
          explanation: `Slant height l = √(r² + h²) = √(${rCone}² + ${hCone}²) = √(${rCone * rCone + hCone * hCone}) ≈ ${lCone} cm.`,
          hint: 'Formula: l = √(r² + h²).',
          topicTag: 'Surface Area and Volume: Cone'
        });
      }
      default: {
        const statesChange = [
          { proc: 'Sublimation', desc: 'the direct physical transition of a solid into vapor gas without passing through liquid state upon heating', ex: 'Camphor, Dry Ice (solid CO₂), and Ammonium Chloride', w: ['Evaporation', 'Condensation', 'Melting'] },
          { proc: 'Latent Heat of Vaporization', desc: 'the heat energy absorbed to change 1 kg of liquid into gas at its boiling point without any temperature rise', ex: 'Steam causing severe burns compared to boiling water at 100°C', w: ['Latent Heat of Fusion', 'Specific Heat Capacity', 'Thermal Expansion'] }
        ];
        const sc = statesChange[counter % statesChange.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
          text: `In states of matter thermodynamics, what is the thermodynamic phenomenon of ${sc.desc} (${sc.ex})?`,
          correctOpt: sc.proc,
          wrongOpts: sc.w,
          explanation: `${sc.proc} is defined as ${sc.desc}.`,
          hint: 'Solid to gas directly without liquid phase is sublimation.',
          topicTag: 'Matter in Our Surroundings: Phase Transitions'
        });
      }
    }
  }

  // GRADE 10
  const variant = counter % 20;
  switch (variant) {
    case 0: {
      const uDist = -((counter % 20) + 15); // -15 to -35 cm
      const fDist = -((counter % 10) + 10); // -10 to -20 cm (concave mirror)
      // 1/v = 1/f - 1/u
      const invV = (1 / fDist) - (1 / uDist);
      const vDist = (1 / invV).toFixed(1);
      return makeQ({
        id: qId, board, grade, subjectId: 'physics', levelNode: node,
        text: `An object is placed at distance u = ${uDist} cm in front of a concave mirror of focal length f = ${fDist} cm in ${city}. Using mirror formula 1/f = 1/v + 1/u, find IMAGE DISTANCE v.`,
        correctOpt: `${vDist} cm`,
        wrongOpts: [`${(parseFloat(vDist) + 5).toFixed(1)} cm`, `${(parseFloat(vDist) - 5).toFixed(1)} cm`, `${(uDist - fDist).toFixed(1)} cm`],
        explanation: `1/v = 1/f - 1/u = 1/(${fDist}) - 1/(${uDist}) => v ≈ ${vDist} cm.`,
        hint: 'Apply mirror formula with sign conventions (concave mirror f is negative).',
        topicTag: 'Optics: Mirror Formula'
      });
    }
    case 1: {
      const V = ((counter % 12) + 2) * 10; // 20 to 130 V
      const R = (counter % 15) + 5; // 5 to 20 ohms
      const I = (V / R).toFixed(2);
      return makeQ({
        id: qId, board, grade, subjectId: 'physics', levelNode: node,
        text: `In an electrical circuit practical in ${city}, a potential difference of ${V} Volts is maintained across a resistor of ${R} Ohms. What CURRENT I flows according to Ohm's Law (V = IR)?`,
        correctOpt: `${I} Amperes`,
        wrongOpts: [`${(parseFloat(I) + 0.5).toFixed(2)} A`, `${(parseFloat(I) - 0.5).toFixed(2)} A`, `${(V * R).toFixed(0)} A`],
        explanation: `Ohm's Law: I = V / R = ${V} V / ${R} Ω = ${I} A.`,
        hint: 'Formula: I = V / R.',
        topicTag: 'Current Electricity: Ohm\'s Law'
      });
    }
    case 2: {
      const bCoeff = -((counter % 8) + 4);
      const cCoeff = (counter % 12) + 3;
      const D = bCoeff * bCoeff - 4 * 1 * cCoeff;
      const nature = D > 0 ? 'Two distinct real roots' : (D === 0 ? 'Two equal real roots' : 'No real roots (complex roots)');
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `For the quadratic equation x² + (${bCoeff})x + ${cCoeff} = 0 in ${city}, compute the DISCRIMINANT D = b² - 4ac and state the nature of its roots.`,
        correctOpt: `D = ${D} (${nature})`,
        wrongOpts: [
          `D = ${D + 10} (${nature})`,
          `D = ${D - 10} (Imaginary roots)`,
          `D = ${bCoeff * bCoeff} (Single root)`
        ],
        explanation: `Discriminant D = b² - 4ac = (${bCoeff})² - 4(1)(${cCoeff}) = ${D}. Since D ${D > 0 ? '> 0' : (D === 0 ? '= 0' : '< 0')}, roots are ${nature}.`,
        hint: 'Evaluate D = b² - 4ac.',
        topicTag: 'Quadratic Equations: Discriminant'
      });
    }
    case 3: {
      const a1 = (counter % 10) + 2;
      const d = (counter % 6) + 3;
      const nTerm = 10;
      const a10 = a1 + (nTerm - 1) * d;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `In an Arithmetic Progression (AP) with first term a = ${a1} and common difference d = ${d}, find the 10th term a₁₀ using aₙ = a + (n - 1)d.`,
        correctOpt: `${a10}`,
        wrongOpts: [`${a10 + d}`, `${a10 - d}`, `${a1 + 10 * d}`],
        explanation: `a₁₀ = a + (10 - 1)d = ${a1} + 9(${d}) = ${a10}.`,
        hint: 'Formula: an = a + (n-1)d.',
        topicTag: 'Arithmetic Progressions'
      });
    }
    case 4: {
      const carbonReactions = [
        { name: 'Esterification Reaction', eq: 'Ethanoic acid reacts with ethanol in presence of concentrated H₂SO₄ catalyst yielding sweet-smelling Ethyl Ethanoate ester and water', w: ['Saponification Reaction', 'Hydrogenation', 'Fermentation'] },
        { name: 'Saponification Reaction', eq: 'Ester heated with sodium hydroxide alkali yielding soap (sodium carboxylate salt) and alcohol (glycerol)', w: ['Esterification', 'Dehydration', 'Combustion'] },
        { name: 'Addition (Hydrogenation) Reaction', eq: 'Unsaturated vegetable oils converted to saturated vegetable ghee using nickel (Ni) catalyst and hydrogen gas', w: ['Substitution reaction', 'Esterification', 'Corrosion'] }
      ];
      const cr = carbonReactions[counter % carbonReactions.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
        text: `In carbon organic chemistry studied by ${name1}, which organic reaction is described as: "${cr.eq}"?`,
        correctOpt: cr.name,
        wrongOpts: cr.w,
        explanation: `This describes the ${cr.name}: ${cr.eq}.`,
        hint: 'Acid + Alcohol = Ester; Ester + Base = Soap.',
        topicTag: 'Carbon and its Compounds'
      });
    }
    case 5: {
      const eyeDefects = [
        { defect: 'Myopia (Short-sightedness)', cause: 'elongation of eyeball or excessive curvature of eye lens; corrected using a CONCAVE lens of suitable power', w: ['Hypermetropia', 'Presbyopia', 'Astigmatism'] },
        { defect: 'Hypermetropia (Long-sightedness)', cause: 'shortening of eyeball or eye lens focal length too long; corrected using a CONVEX lens', w: ['Myopia', 'Cataract', 'Glaucoma'] },
        { defect: 'Presbyopia (Old-age vision defect)', cause: 'gradual weakening of ciliary muscles and diminishing lens flexibility; corrected with bifocal lenses', w: ['Astigmatism', 'Color Blindness', 'Myopia'] }
      ];
      const ed = eyeDefects[counter % eyeDefects.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'physics', levelNode: node,
        text: `In human optical defects of vision, which ocular refractive defect involves: "${ed.cause}"?`,
        correctOpt: ed.defect,
        wrongOpts: ed.w,
        explanation: `${ed.defect} is characterized by: ${ed.cause}.`,
        hint: 'Myopia requires diverging concave lens; hypermetropia requires converging convex lens.',
        topicTag: 'Human Eye and Defects of Vision'
      });
    }
    case 6: {
      const salts = [
        { name: 'Bleaching Powder (CaOCl₂)', prep: 'produced by passing dry chlorine gas over slaked lime Ca(OH)₂', use: 'disinfectant in drinking water and bleaching in textile mills', w: ['Baking Soda', 'Washing Soda', 'Plaster of Paris'] },
        { name: 'Baking Soda (Sodium Hydrogen Carbonate NaHCO₃)', prep: 'produced via Solvay process using brine, ammonia, and CO₂', use: 'baking cakes as it releases CO₂ gas making dough soft and spongy', w: ['Bleaching Powder', 'Caustic Soda', 'Gypsum'] },
        { name: 'Plaster of Paris (CaSO₄·½H₂O)', prep: 'obtained by carefully heating gypsum (CaSO₄·2H₂O) to 373 K (100°C)', use: 'setting fractured bones and making decorative statues', w: ['Slaked Lime', 'Quicklime', 'Washing Soda'] }
      ];
      const sl = salts[counter % salts.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
        text: `In inorganic industrial salts studied by ${name2} in ${city}, which chemical compound is ${sl.prep} (${sl.use})?`,
        correctOpt: sl.name,
        wrongOpts: sl.w,
        explanation: `${sl.name} is ${sl.prep}.`,
        hint: 'Recall industrial chemical formulas and preparation of salts.',
        topicTag: 'Acids, Bases, and Salts: Important Salts'
      });
    }
    case 7: {
      const mendelLaws = [
        { law: 'Law of Segregation (Mendel\'s First Law)', desc: 'during gamete formation, the two alleles of a gene pair separate so that each gamete carries only one allele with equal probability', w: ['Law of Independent Assortment', 'Law of Incomplete Dominance', 'Chromosome Theory'] },
        { law: 'Law of Independent Assortment (Mendel\'s Second Law)', desc: 'alleles of two different genes assort independently of one another during gamete formation in a dihybrid cross (9:3:3:1 ratio)', w: ['Law of Segregation', 'Law of Dominance', 'Linkage Theory'] }
      ];
      const ml = mendelLaws[counter % mendelLaws.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'biology', levelNode: node,
        text: `In classical genetics formulated by Gregor Mendel on pea plants, which genetic principle states that: "${ml.desc}"?`,
        correctOpt: ml.law,
        wrongOpts: ml.w,
        explanation: `The ${ml.law} states that: ${ml.desc}.`,
        hint: 'Segregation applies to single gene pair; Independent assortment applies to two gene pairs.',
        topicTag: 'Heredity and Mendel\'s Laws'
      });
    }
    case 8: {
      const R1 = (counter % 10) + 2;
      const R2 = (counter % 12) + 3;
      const Rs = R1 + R2;
      return makeQ({
        id: qId, board, grade, subjectId: 'physics', levelNode: node,
        text: `Two resistors of resistance R₁ = ${R1} Ω and R₂ = ${R2} Ω are connected in SERIES in an electric circuit in ${city}. What is their EQUIVALENT RESISTANCE Rs?`,
        correctOpt: `${Rs} Ω`,
        wrongOpts: [`${(R1 * R2 / (R1 + R2)).toFixed(1)} Ω`, `${Rs + 2} Ω`, `${Math.abs(R1 - R2)} Ω`],
        explanation: `In series combination, equivalent resistance Rs = R₁ + R₂ = ${R1} + ${R2} = ${Rs} Ω.`,
        hint: 'In series, resistances add directly: Rs = R1 + R2.',
        topicTag: 'Resistors in Series'
      });
    }
    case 9: {
      const trigIdentities = [
        { id: 'sin²θ + cos²θ', val: '1', w: ['0', 'tan²θ', 'sec²θ'] },
        { id: '1 + tan²θ', val: 'sec²θ', w: ['csc²θ', 'sin²θ', 'cot²θ'] },
        { id: '1 + cot²θ', val: 'csc²θ', w: ['sec²θ', 'tan²θ', 'cos²θ'] }
      ];
      const ti = trigIdentities[counter % trigIdentities.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `In trigonometry studied by ${name1} in ${city}, evaluate the fundamental Pythagorean identity: ${ti.id} = ?`,
        correctOpt: ti.val,
        wrongOpts: ti.w,
        explanation: `By fundamental trigonometric identities: ${ti.id} = ${ti.val}.`,
        hint: 'Standard Pythagorean trigonometric identities.',
        topicTag: 'Trigonometric Identities'
      });
    }
    case 10: {
      const magneticEffects = [
        { rule: 'Fleming\'s Left-Hand Rule', use: 'determines the direction of mechanical FORCE acting on a current-carrying conductor placed in a magnetic field (Electric Motor principle)', w: ['Fleming\'s Right-Hand Rule', 'Right-Hand Thumb Rule', 'Ampere\'s Circuital Rule'] },
        { rule: 'Fleming\'s Right-Hand Rule', use: 'determines the direction of INDUCED CURRENT in a conductor moving through a magnetic field (Electric Generator principle)', w: ['Fleming\'s Left-Hand Rule', 'Right-Hand Thumb Rule', 'Lenz\'s Rule'] },
        { rule: 'Right-Hand Thumb Rule', use: 'determines the direction of circular magnetic field lines encircling a straight current-carrying wire', w: ['Left-Hand Rule', 'Faraday\'s Law', 'Ohm\'s Rule'] }
      ];
      const me = magneticEffects[counter % magneticEffects.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'physics', levelNode: node,
        text: `In electromagnetism, which hand rule ${me.use}?`,
        correctOpt: me.rule,
        wrongOpts: me.w,
        explanation: `${me.rule} ${me.use}.`,
        hint: 'Left-hand for Motor (Force); Right-hand for Generator (Induced current).',
        topicTag: 'Magnetic Effects of Electric Current'
      });
    }
    case 11: {
      const excretoryNephron = [
        { part: 'Glomerulus and Bowman\'s Capsule', func: 'ultrafiltration of blood plasma under high hydrostatic pressure', w: ['Loop of Henle', 'Collecting Duct', 'Urinary Bladder'] },
        { part: 'Tubular reabsorption in Nephron', func: 'selective reabsorption of useful glucose, amino acids, salts, and major water back into blood', w: ['Urethra', 'Renal pelvis', 'Glomerulus'] },
        { part: 'Nephron', func: 'the structural and functional microscopic filtration unit of the human kidney', w: ['Neuron', 'Alveolus', 'Hepatocyte'] }
      ];
      const en = excretoryNephron[counter % excretoryNephron.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'biology', levelNode: node,
        text: `In human excretory renal physiology studied by ${name2}, which anatomical structure is responsible for ${en.func}?`,
        correctOpt: en.part,
        wrongOpts: en.w,
        explanation: `The ${en.part} is responsible for: ${en.func}.`,
        hint: 'Identify nephron functional regions.',
        topicTag: 'Excretory System and Nephron'
      });
    }
    case 12: {
      const redDispl = [
        { rxn: 'Thermite process: Fe₂O₃ + 2Al → 2Fe + Al₂O₃ + Heat', use: 'used to weld broken railway tracks and cracked heavy machinery frames in situ', w: ['Water purification', 'Manufacture of soap', 'Electrolysis of brine'] },
        { rxn: 'Roasting of sulfide ores (2ZnS + 3O₂ → 2ZnO + 2SO₂)', use: 'heating ore strongly in excess presence of air to convert sulfide ore into oxide', w: ['Calcination in absence of air', 'Reduction with carbon', 'Electrolytic refining'] }
      ];
      const rd = redDispl[counter % redDispl.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
        text: `In metallurgy and industrial chemical extraction, what is the practical purpose of ${rd.rxn}?`,
        correctOpt: rd.use,
        wrongOpts: rd.w,
        explanation: `${rd.rxn} is utilized as: ${rd.use}.`,
        hint: 'Thermite reaction produces molten iron for joining railway tracks.',
        topicTag: 'Metallurgy and Extraction of Metals'
      });
    }
    case 13: {
      const x1 = (counter % 8) + 1;
      const y1 = (counter % 6) + 2;
      const x2 = x1 + 3;
      const y2 = y1 + 4;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `In coordinate geometry, calculate the DISTANCE between point A(${x1}, ${y1}) and point B(${x2}, ${y2}) using distance formula d = √[(x₂ - x₁)² + (y₂ - y₁)²].`,
        correctOpt: '5 units',
        wrongOpts: ['7 units', '4 units', '6 units'],
        explanation: `Distance d = √[(x₂ - x₁)² + (y₂ - y₁)²] = √[(3)² + (4)²] = √(9 + 16) = √25 = 5 units.`,
        hint: 'Recognize the 3-4-5 right triangle coordinate difference.',
        topicTag: 'Coordinate Geometry: Distance Formula'
      });
    }
    case 14: {
      const plantHormones = [
        { hormone: 'Auxin', role: 'synthesized at shoot tips, promotes cell elongation and causes phototropic bending towards light', w: ['Gibberellin', 'Abscisic Acid', 'Ethylene'] },
        { hormone: 'Abscisic Acid (ABA)', role: 'growth inhibitor that promotes wilting, falling of leaves, and stomatal closure during drought', w: ['Auxin', 'Cytokinin', 'Gibberellin'] },
        { hormone: 'Cytokinin', role: 'promotes rapid cell division, predominantly found in areas of active cell division like seeds and fruits', w: ['Auxin', 'Abscisic Acid', 'Florigen'] }
      ];
      const ph = plantHormones[counter % plantHormones.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'biology', levelNode: node,
        text: `In plant phytohormone physiology studied by ${name1}, which plant hormone ${ph.role}?`,
        correctOpt: ph.hormone,
        wrongOpts: ph.w,
        explanation: `${ph.hormone} is the plant hormone that ${ph.role}.`,
        hint: 'Auxin = phototropism; ABA = stress inhibitor.',
        topicTag: 'Control and Coordination: Plant Hormones'
      });
    }
    case 15: {
      const IVal = (counter % 5) + 2; // 2 to 6 A
      const RVal = (counter % 6) + 4; // 4 to 9 Ω
      const PVal = IVal * IVal * RVal;
      return makeQ({
        id: qId, board, grade, subjectId: 'physics', levelNode: node,
        text: `An electric room heater carries current I = ${IVal} A through a heating coil of resistance R = ${RVal} Ω in ${city}. What is the rate of ELECTRICAL POWER consumption (P = I²R)?`,
        correctOpt: `${PVal} Watts`,
        wrongOpts: [`${PVal + 25} Watts`, `${PVal - 25} Watts`, `${IVal * RVal} Watts`],
        explanation: `Electric Power P = I²R = (${IVal})² × ${RVal} = ${IVal * IVal} × ${RVal} = ${PVal} W.`,
        hint: 'Formula: P = I²R.',
        topicTag: 'Electric Power and Joule Heating'
      });
    }
    case 16: {
      const totalOutcomes = (counter % 15) + 25; // 25 to 40
      const favorable = (counter % 8) + 4; // 4 to 12
      const probVal = (favorable / totalOutcomes).toFixed(2);
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `A sealed lottery box in ${city} contains ${totalOutcomes} tickets numbered sequentially. What is the PROBABILITY of drawing one of ${favorable} winning tickets at random?`,
        correctOpt: `${favorable}/${totalOutcomes}`,
        wrongOpts: [`${favorable + 1}/${totalOutcomes}`, `${favorable}/${totalOutcomes + 2}`, `1/${favorable}`],
        explanation: `Probability P(E) = Number of favorable outcomes / Total possible outcomes = ${favorable} / ${totalOutcomes}.`,
        hint: 'Formula: P(E) = n(E) / n(S).',
        topicTag: 'Probability'
      });
    }
    case 17: {
      const powerSharing = [
        { type: 'Federalism in India', feature: 'division of governance into Union List, State List, and Concurrent List in Seventh Schedule', w: ['Unitary centralization', 'Military junta rule', 'Dictatorial mandate'] },
        { type: 'Coalition Government', feature: 'alliance formed by two or more political parties when no single party secures a clear parliamentary majority', w: ['One-party autocracy', 'Monarchical rule', 'Direct democracy'] }
      ];
      const ps = powerSharing[counter % powerSharing.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'social', levelNode: node,
        text: `In democratic political science studied by ${name2}, which constitutional mechanism represents: "${ps.feature}"?`,
        correctOpt: ps.type,
        wrongOpts: ps.w,
        explanation: `${ps.type} is characterized by: ${ps.feature}.`,
        hint: 'Recall federal power sharing principles.',
        topicTag: 'Federalism and Power Sharing'
      });
    }
    case 18: {
      const circleTangents = [
        { th: 'Tangents drawn from an external point to a circle', prop: 'are strictly EQUAL in length', w: ['are perpendicular to each other', 'are unequal', 'intersect inside the circle'] },
        { th: 'Tangent at any point of a circle', prop: 'is strictly PERPENDICULAR to the radius drawn to the point of contact', w: ['is parallel to the radius', 'forms a 45° angle with radius', 'bisects the circle'] }
      ];
      const ct = circleTangents[counter % circleTangents.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `In circle geometry theorems, ${ct.th} ${ct.prop}.`,
        correctOpt: `They ${ct.prop}`,
        wrongOpts: ct.w.map(w => `They ${w}`),
        explanation: `By circle geometry theorem: ${ct.th} ${ct.prop}.`,
        hint: 'Recall standard circle tangent theorems.',
        topicTag: 'Circles: Tangent Theorems'
      });
    }
    default: {
      const redox = [
        { term: 'Oxidation', def: 'gain of oxygen or loss of electrons in a chemical reaction', w: ['loss of oxygen', 'gain of electrons', 'reduction of valency'] },
        { term: 'Reduction', def: 'loss of oxygen or gain of electrons in a chemical reaction', w: ['gain of oxygen', 'loss of electrons', 'corrosion of metal'] }
      ];
      const rx = redox[counter % redox.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
        text: `In chemical oxidation-reduction (redox) reactions in ${city}, ${rx.term} is chemically defined as the ${rx.def}.`,
        correctOpt: rx.def,
        wrongOpts: rx.w,
        explanation: `${rx.term} is defined as the ${rx.def}.`,
        hint: 'OIL RIG: Oxidation Is Loss of electrons; Reduction Is Gain of electrons.',
        topicTag: 'Chemical Reactions: Redox'
      });
    }
  }
}
