import type { MedicineResult } from '@/services/doctor.service';

export const MOCK_MEDICINES: MedicineResult[] = [
  // ── Antibiotics ────────────────────────────────────────────────────────────
  {
    id: 'mock-001',
    medicine_name: 'Amoxicillin',
    composition: 'Amoxicillin 500mg',
    therapeutic_class: 'Antibiotic',
    uses: 'Bacterial infections, pneumonia, bronchitis, ear infections, UTI',
    side_effects: 'Nausea, diarrhea, rash, allergic reaction',
  },
  {
    id: 'mock-002',
    medicine_name: 'Azithromycin',
    composition: 'Azithromycin 250mg',
    therapeutic_class: 'Antibiotic',
    uses: 'Respiratory infections, skin infections, STIs, typhoid',
    side_effects: 'Nausea, abdominal pain, diarrhea, headache',
  },
  {
    id: 'mock-003',
    medicine_name: 'Ciprofloxacin',
    composition: 'Ciprofloxacin 500mg',
    therapeutic_class: 'Antibiotic',
    uses: 'UTI, respiratory infections, bone infections, typhoid fever',
    side_effects: 'Nausea, diarrhea, tendon rupture risk, photosensitivity',
  },
  {
    id: 'mock-004',
    medicine_name: 'Doxycycline',
    composition: 'Doxycycline 100mg',
    therapeutic_class: 'Antibiotic',
    uses: 'Acne, malaria prophylaxis, Lyme disease, chlamydia, pneumonia',
    side_effects: 'Photosensitivity, esophageal irritation, nausea',
  },
  {
    id: 'mock-005',
    medicine_name: 'Metronidazole',
    composition: 'Metronidazole 400mg',
    therapeutic_class: 'Antibiotic / Antiprotozoal',
    uses: 'Bacterial vaginosis, amoebic dysentery, giardiasis, dental infections',
    side_effects: 'Metallic taste, nausea, headache, dark urine',
  },
  {
    id: 'mock-006',
    medicine_name: 'Cephalexin',
    composition: 'Cephalexin 500mg',
    therapeutic_class: 'Antibiotic',
    uses: 'Skin infections, bone infections, UTI, otitis media',
    side_effects: 'Diarrhea, nausea, abdominal pain',
  },
  {
    id: 'mock-007',
    medicine_name: 'Clindamycin',
    composition: 'Clindamycin 300mg',
    therapeutic_class: 'Antibiotic',
    uses: 'Skin and soft tissue infections, pneumonia, bone infections, acne',
    side_effects: 'Diarrhea, colitis, rash, nausea',
  },
  {
    id: 'mock-008',
    medicine_name: 'Trimethoprim-Sulfamethoxazole',
    composition: 'Trimethoprim 160mg + Sulfamethoxazole 800mg',
    therapeutic_class: 'Antibiotic',
    uses: 'UTI, respiratory infections, traveler\'s diarrhea, MRSA skin infections',
    side_effects: 'Rash, photosensitivity, nausea, Stevens-Johnson syndrome (rare)',
  },

  // ── Analgesics / NSAIDs ────────────────────────────────────────────────────
  {
    id: 'mock-009',
    medicine_name: 'Paracetamol',
    composition: 'Paracetamol 500mg',
    therapeutic_class: 'Analgesic / Antipyretic',
    uses: 'Fever, mild to moderate pain, headache, body ache',
    side_effects: 'Rare at normal doses; overdose causes liver damage',
  },
  {
    id: 'mock-010',
    medicine_name: 'Ibuprofen',
    composition: 'Ibuprofen 400mg',
    therapeutic_class: 'NSAID',
    uses: 'Pain, fever, inflammation, arthritis, menstrual cramps, headache',
    side_effects: 'GI upset, peptic ulcer, kidney damage with long use',
  },
  {
    id: 'mock-011',
    medicine_name: 'Diclofenac',
    composition: 'Diclofenac Sodium 50mg',
    therapeutic_class: 'NSAID',
    uses: 'Arthritis, musculoskeletal pain, dysmenorrhea, dental pain',
    side_effects: 'GI irritation, fluid retention, elevated liver enzymes',
  },
  {
    id: 'mock-012',
    medicine_name: 'Naproxen',
    composition: 'Naproxen 500mg',
    therapeutic_class: 'NSAID',
    uses: 'Arthritis, gout, bursitis, tendinitis, menstrual pain',
    side_effects: 'GI upset, headache, dizziness, fluid retention',
  },
  {
    id: 'mock-013',
    medicine_name: 'Tramadol',
    composition: 'Tramadol HCl 50mg',
    therapeutic_class: 'Opioid Analgesic',
    uses: 'Moderate to severe pain, post-operative pain',
    side_effects: 'Nausea, dizziness, constipation, drowsiness, dependence risk',
  },
  {
    id: 'mock-014',
    medicine_name: 'Aspirin',
    composition: 'Aspirin 75mg / 325mg',
    therapeutic_class: 'NSAID / Antiplatelet',
    uses: 'Pain, fever, antiplatelet therapy in cardiac patients, stroke prevention',
    side_effects: 'GI bleeding, tinnitus, Reye\'s syndrome in children',
  },
  {
    id: 'mock-015',
    medicine_name: 'Celecoxib',
    composition: 'Celecoxib 200mg',
    therapeutic_class: 'COX-2 Inhibitor / NSAID',
    uses: 'Osteoarthritis, rheumatoid arthritis, acute pain, ankylosing spondylitis',
    side_effects: 'Cardiovascular risk, GI upset, hypertension',
  },

  // ── Antihypertensives ──────────────────────────────────────────────────────
  {
    id: 'mock-016',
    medicine_name: 'Amlodipine',
    composition: 'Amlodipine 5mg',
    therapeutic_class: 'Calcium Channel Blocker',
    uses: 'Hypertension, angina, coronary artery disease',
    side_effects: 'Peripheral edema, flushing, headache, dizziness',
  },
  {
    id: 'mock-017',
    medicine_name: 'Atenolol',
    composition: 'Atenolol 50mg',
    therapeutic_class: 'Beta Blocker',
    uses: 'Hypertension, angina, post-MI, arrhythmia, heart failure',
    side_effects: 'Bradycardia, fatigue, cold extremities, depression',
  },
  {
    id: 'mock-018',
    medicine_name: 'Losartan',
    composition: 'Losartan Potassium 50mg',
    therapeutic_class: 'ARB (Angiotensin II Receptor Blocker)',
    uses: 'Hypertension, diabetic nephropathy, heart failure, stroke prevention',
    side_effects: 'Dizziness, hyperkalemia, elevated creatinine',
  },
  {
    id: 'mock-019',
    medicine_name: 'Enalapril',
    composition: 'Enalapril 10mg',
    therapeutic_class: 'ACE Inhibitor',
    uses: 'Hypertension, heart failure, post-MI, diabetic nephropathy',
    side_effects: 'Dry cough, hyperkalemia, angioedema, dizziness',
  },
  {
    id: 'mock-020',
    medicine_name: 'Hydrochlorothiazide',
    composition: 'Hydrochlorothiazide 25mg',
    therapeutic_class: 'Thiazide Diuretic',
    uses: 'Hypertension, edema, heart failure',
    side_effects: 'Hypokalemia, hyperuricemia, photosensitivity, hyperglycemia',
  },
  {
    id: 'mock-021',
    medicine_name: 'Telmisartan',
    composition: 'Telmisartan 40mg',
    therapeutic_class: 'ARB',
    uses: 'Hypertension, cardiovascular risk reduction, renal protection in diabetes',
    side_effects: 'Dizziness, hyperkalemia, back pain',
  },
  {
    id: 'mock-022',
    medicine_name: 'Metoprolol',
    composition: 'Metoprolol Succinate 50mg',
    therapeutic_class: 'Beta Blocker',
    uses: 'Hypertension, heart failure, angina, arrhythmia, post-MI',
    side_effects: 'Fatigue, bradycardia, depression, cold hands/feet',
  },

  // ── Antidiabetics ──────────────────────────────────────────────────────────
  {
    id: 'mock-023',
    medicine_name: 'Metformin',
    composition: 'Metformin HCl 500mg',
    therapeutic_class: 'Biguanide / Antidiabetic',
    uses: 'Type 2 diabetes, insulin resistance, PCOS, pre-diabetes',
    side_effects: 'Nausea, diarrhea, metallic taste, lactic acidosis (rare)',
  },
  {
    id: 'mock-024',
    medicine_name: 'Glibenclamide',
    composition: 'Glibenclamide 5mg',
    therapeutic_class: 'Sulfonylurea / Antidiabetic',
    uses: 'Type 2 diabetes mellitus when diet control insufficient',
    side_effects: 'Hypoglycemia, weight gain, nausea',
  },
  {
    id: 'mock-025',
    medicine_name: 'Sitagliptin',
    composition: 'Sitagliptin 100mg',
    therapeutic_class: 'DPP-4 Inhibitor / Antidiabetic',
    uses: 'Type 2 diabetes, used alone or in combination',
    side_effects: 'Nasopharyngitis, headache, pancreatitis (rare)',
  },
  {
    id: 'mock-026',
    medicine_name: 'Empagliflozin',
    composition: 'Empagliflozin 10mg',
    therapeutic_class: 'SGLT2 Inhibitor / Antidiabetic',
    uses: 'Type 2 diabetes, heart failure, diabetic kidney disease',
    side_effects: 'UTI, genital yeast infections, DKA (rare)',
  },
  {
    id: 'mock-027',
    medicine_name: 'Insulin Glargine',
    composition: 'Insulin Glargine 100 U/mL',
    therapeutic_class: 'Long-acting Insulin',
    uses: 'Type 1 and Type 2 diabetes requiring insulin therapy',
    side_effects: 'Hypoglycemia, weight gain, injection site reactions',
  },

  // ── Lipid-lowering ─────────────────────────────────────────────────────────
  {
    id: 'mock-028',
    medicine_name: 'Atorvastatin',
    composition: 'Atorvastatin 20mg',
    therapeutic_class: 'Statin / Lipid-lowering',
    uses: 'Hypercholesterolemia, cardiovascular risk reduction, dyslipidemia',
    side_effects: 'Myopathy, elevated liver enzymes, rhabdomyolysis (rare)',
  },
  {
    id: 'mock-029',
    medicine_name: 'Rosuvastatin',
    composition: 'Rosuvastatin 10mg',
    therapeutic_class: 'Statin / Lipid-lowering',
    uses: 'High cholesterol, mixed dyslipidemia, cardiovascular prevention',
    side_effects: 'Muscle pain, headache, proteinuria',
  },
  {
    id: 'mock-030',
    medicine_name: 'Fenofibrate',
    composition: 'Fenofibrate 145mg',
    therapeutic_class: 'Fibrate / Lipid-lowering',
    uses: 'High triglycerides, mixed dyslipidemia',
    side_effects: 'Elevated creatinine, myopathy, GI upset',
  },

  // ── Respiratory ────────────────────────────────────────────────────────────
  {
    id: 'mock-031',
    medicine_name: 'Salbutamol',
    composition: 'Salbutamol 2mg / 100mcg inhaler',
    therapeutic_class: 'Beta-2 Agonist / Bronchodilator',
    uses: 'Asthma, COPD, bronchospasm, exercise-induced bronchoconstriction',
    side_effects: 'Tremor, tachycardia, palpitations, hypokalemia',
  },
  {
    id: 'mock-032',
    medicine_name: 'Montelukast',
    composition: 'Montelukast 10mg',
    therapeutic_class: 'Leukotriene Antagonist',
    uses: 'Asthma prevention, allergic rhinitis, exercise-induced asthma',
    side_effects: 'Headache, abdominal pain, mood changes (rare)',
  },
  {
    id: 'mock-033',
    medicine_name: 'Budesonide',
    composition: 'Budesonide 200mcg/dose',
    therapeutic_class: 'Inhaled Corticosteroid',
    uses: 'Asthma maintenance, COPD, allergic rhinitis',
    side_effects: 'Oral thrush, hoarseness, adrenal suppression with high doses',
  },
  {
    id: 'mock-034',
    medicine_name: 'Tiotropium',
    composition: 'Tiotropium 18mcg/capsule',
    therapeutic_class: 'Long-acting Anticholinergic',
    uses: 'COPD maintenance therapy, chronic bronchitis, emphysema',
    side_effects: 'Dry mouth, urinary retention, constipation',
  },
  {
    id: 'mock-035',
    medicine_name: 'Levocetrizine',
    composition: 'Levocetirizine 5mg',
    therapeutic_class: 'Antihistamine',
    uses: 'Allergic rhinitis, urticaria, hay fever, skin allergies',
    side_effects: 'Drowsiness, dry mouth, fatigue',
  },
  {
    id: 'mock-036',
    medicine_name: 'Cetirizine',
    composition: 'Cetirizine HCl 10mg',
    therapeutic_class: 'Antihistamine',
    uses: 'Allergic rhinitis, urticaria, seasonal allergies, sneezing, runny nose',
    side_effects: 'Drowsiness, dry mouth, headache',
  },
  {
    id: 'mock-037',
    medicine_name: 'Fexofenadine',
    composition: 'Fexofenadine 120mg',
    therapeutic_class: 'Non-sedating Antihistamine',
    uses: 'Seasonal allergic rhinitis, chronic urticaria',
    side_effects: 'Headache, nausea, dizziness (minimal sedation)',
  },
  {
    id: 'mock-038',
    medicine_name: 'Dextromethorphan',
    composition: 'Dextromethorphan 15mg',
    therapeutic_class: 'Antitussive / Cough Suppressant',
    uses: 'Dry cough, cough suppression',
    side_effects: 'Drowsiness, dizziness, nausea',
  },
  {
    id: 'mock-039',
    medicine_name: 'Guaifenesin',
    composition: 'Guaifenesin 200mg',
    therapeutic_class: 'Expectorant',
    uses: 'Productive cough, chest congestion, mucus clearance',
    side_effects: 'Nausea, vomiting, dizziness',
  },
  {
    id: 'mock-040',
    medicine_name: 'Prednisolone',
    composition: 'Prednisolone 5mg',
    therapeutic_class: 'Corticosteroid',
    uses: 'Asthma exacerbation, allergic reactions, inflammatory conditions, autoimmune diseases',
    side_effects: 'Weight gain, hyperglycemia, immunosuppression, osteoporosis',
  },

  // ── GI ─────────────────────────────────────────────────────────────────────
  {
    id: 'mock-041',
    medicine_name: 'Omeprazole',
    composition: 'Omeprazole 20mg',
    therapeutic_class: 'Proton Pump Inhibitor',
    uses: 'GERD, peptic ulcer, H. pylori eradication, Zollinger-Ellison syndrome',
    side_effects: 'Headache, diarrhea, hypomagnesemia with long use',
  },
  {
    id: 'mock-042',
    medicine_name: 'Pantoprazole',
    composition: 'Pantoprazole 40mg',
    therapeutic_class: 'Proton Pump Inhibitor',
    uses: 'GERD, gastric ulcer, duodenal ulcer, acid reflux, Barrett\'s esophagus',
    side_effects: 'Headache, nausea, diarrhea, hypomagnesemia',
  },
  {
    id: 'mock-043',
    medicine_name: 'Ranitidine',
    composition: 'Ranitidine 150mg',
    therapeutic_class: 'H2 Receptor Antagonist',
    uses: 'Peptic ulcer, GERD, dyspepsia, heartburn',
    side_effects: 'Headache, dizziness, constipation',
  },
  {
    id: 'mock-044',
    medicine_name: 'Domperidone',
    composition: 'Domperidone 10mg',
    therapeutic_class: 'Prokinetic / Antiemetic',
    uses: 'Nausea, vomiting, gastroparesis, bloating, dyspepsia',
    side_effects: 'Prolonged QT, galactorrhea, extrapyramidal effects (rare)',
  },
  {
    id: 'mock-045',
    medicine_name: 'Ondansetron',
    composition: 'Ondansetron 4mg',
    therapeutic_class: '5-HT3 Antagonist / Antiemetic',
    uses: 'Nausea and vomiting due to chemotherapy, surgery, pregnancy',
    side_effects: 'Headache, constipation, QT prolongation (rare)',
  },
  {
    id: 'mock-046',
    medicine_name: 'Metoclopramide',
    composition: 'Metoclopramide 10mg',
    therapeutic_class: 'Prokinetic / Antiemetic',
    uses: 'Nausea, vomiting, gastroparesis, GERD, migraine-associated nausea',
    side_effects: 'Drowsiness, extrapyramidal effects, tardive dyskinesia',
  },
  {
    id: 'mock-047',
    medicine_name: 'Loperamide',
    composition: 'Loperamide 2mg',
    therapeutic_class: 'Antidiarrheal',
    uses: 'Acute and chronic diarrhea, traveler\'s diarrhea, IBS-D',
    side_effects: 'Constipation, abdominal cramps, dizziness',
  },
  {
    id: 'mock-048',
    medicine_name: 'Lactulose',
    composition: 'Lactulose 3.35g/5mL',
    therapeutic_class: 'Osmotic Laxative',
    uses: 'Constipation, hepatic encephalopathy',
    side_effects: 'Bloating, flatulence, diarrhea, abdominal cramps',
  },
  {
    id: 'mock-049',
    medicine_name: 'Sucralfate',
    composition: 'Sucralfate 1g',
    therapeutic_class: 'Mucosal Protectant',
    uses: 'Peptic ulcer, stress ulcer prophylaxis, GERD',
    side_effects: 'Constipation, dry mouth, indigestion',
  },
  {
    id: 'mock-050',
    medicine_name: 'Mesalazine',
    composition: 'Mesalazine 400mg',
    therapeutic_class: '5-ASA / Anti-inflammatory (GI)',
    uses: 'Ulcerative colitis, Crohn\'s disease, inflammatory bowel disease',
    side_effects: 'Headache, nausea, abdominal pain, interstitial nephritis (rare)',
  },

  // ── Neurology / Psychiatry ─────────────────────────────────────────────────
  {
    id: 'mock-051',
    medicine_name: 'Sertraline',
    composition: 'Sertraline 50mg',
    therapeutic_class: 'SSRI / Antidepressant',
    uses: 'Depression, anxiety, OCD, PTSD, panic disorder, social anxiety',
    side_effects: 'Nausea, insomnia, sexual dysfunction, serotonin syndrome (rare)',
  },
  {
    id: 'mock-052',
    medicine_name: 'Fluoxetine',
    composition: 'Fluoxetine 20mg',
    therapeutic_class: 'SSRI / Antidepressant',
    uses: 'Depression, OCD, bulimia nervosa, panic disorder',
    side_effects: 'Insomnia, anxiety, nausea, sexual dysfunction',
  },
  {
    id: 'mock-053',
    medicine_name: 'Escitalopram',
    composition: 'Escitalopram 10mg',
    therapeutic_class: 'SSRI / Antidepressant',
    uses: 'Major depressive disorder, generalised anxiety disorder',
    side_effects: 'Nausea, insomnia, drowsiness, QT prolongation',
  },
  {
    id: 'mock-054',
    medicine_name: 'Alprazolam',
    composition: 'Alprazolam 0.25mg',
    therapeutic_class: 'Benzodiazepine / Anxiolytic',
    uses: 'Anxiety disorder, panic disorder, short-term anxiety relief',
    side_effects: 'Drowsiness, dependence, cognitive impairment',
  },
  {
    id: 'mock-055',
    medicine_name: 'Clonazepam',
    composition: 'Clonazepam 0.5mg',
    therapeutic_class: 'Benzodiazepine / Anticonvulsant',
    uses: 'Epilepsy, panic disorder, restless leg syndrome, anxiety',
    side_effects: 'Sedation, ataxia, dependence, cognitive effects',
  },
  {
    id: 'mock-056',
    medicine_name: 'Gabapentin',
    composition: 'Gabapentin 300mg',
    therapeutic_class: 'Anticonvulsant / Neuropathic pain',
    uses: 'Neuropathic pain, epilepsy, postherpetic neuralgia, restless legs',
    side_effects: 'Dizziness, sedation, ataxia, peripheral edema',
  },
  {
    id: 'mock-057',
    medicine_name: 'Pregabalin',
    composition: 'Pregabalin 75mg',
    therapeutic_class: 'Anticonvulsant / Neuropathic pain',
    uses: 'Neuropathic pain, fibromyalgia, partial seizures, anxiety',
    side_effects: 'Dizziness, weight gain, edema, somnolence',
  },
  {
    id: 'mock-058',
    medicine_name: 'Carbamazepine',
    composition: 'Carbamazepine 200mg',
    therapeutic_class: 'Anticonvulsant / Mood stabiliser',
    uses: 'Epilepsy, trigeminal neuralgia, bipolar disorder',
    side_effects: 'Dizziness, ataxia, hyponatremia, bone marrow suppression',
  },
  {
    id: 'mock-059',
    medicine_name: 'Levetiracetam',
    composition: 'Levetiracetam 500mg',
    therapeutic_class: 'Anticonvulsant',
    uses: 'Partial onset seizures, myoclonic seizures, tonic-clonic seizures',
    side_effects: 'Somnolence, dizziness, behavioral changes, asthenia',
  },
  {
    id: 'mock-060',
    medicine_name: 'Sumatriptan',
    composition: 'Sumatriptan 50mg',
    therapeutic_class: 'Triptan / Antimigraine',
    uses: 'Acute migraine with or without aura, cluster headache',
    side_effects: 'Flushing, tingling, chest tightness, dizziness',
  },

  // ── Cardiovascular (additional) ────────────────────────────────────────────
  {
    id: 'mock-061',
    medicine_name: 'Clopidogrel',
    composition: 'Clopidogrel 75mg',
    therapeutic_class: 'Antiplatelet',
    uses: 'ACS, stent placement, stroke prevention, peripheral artery disease',
    side_effects: 'Bleeding, bruising, rash, diarrhea',
  },
  {
    id: 'mock-062',
    medicine_name: 'Warfarin',
    composition: 'Warfarin 5mg',
    therapeutic_class: 'Anticoagulant',
    uses: 'DVT, PE, AF, valve replacement, stroke prevention',
    side_effects: 'Bleeding, teratogenicity, skin necrosis (rare)',
  },
  {
    id: 'mock-063',
    medicine_name: 'Digoxin',
    composition: 'Digoxin 0.25mg',
    therapeutic_class: 'Cardiac Glycoside',
    uses: 'Heart failure, atrial fibrillation, atrial flutter',
    side_effects: 'Digitalis toxicity, nausea, arrhythmias, visual disturbances',
  },
  {
    id: 'mock-064',
    medicine_name: 'Furosemide',
    composition: 'Furosemide 40mg',
    therapeutic_class: 'Loop Diuretic',
    uses: 'Edema, heart failure, hypertension, pulmonary edema, nephrotic syndrome',
    side_effects: 'Hypokalemia, hyponatremia, dehydration, ototoxicity',
  },
  {
    id: 'mock-065',
    medicine_name: 'Spironolactone',
    composition: 'Spironolactone 25mg',
    therapeutic_class: 'Potassium-sparing Diuretic',
    uses: 'Heart failure, hypertension, hyperaldosteronism, edema, PCOS',
    side_effects: 'Hyperkalemia, gynecomastia, menstrual irregularity',
  },
  {
    id: 'mock-066',
    medicine_name: 'Nitroglycerin',
    composition: 'Nitroglycerin 0.5mg sublingual',
    therapeutic_class: 'Nitrate / Antianginal',
    uses: 'Acute angina attack, chest pain relief, acute heart failure',
    side_effects: 'Headache, hypotension, flushing, dizziness',
  },

  // ── Thyroid / Endocrine ────────────────────────────────────────────────────
  {
    id: 'mock-067',
    medicine_name: 'Levothyroxine',
    composition: 'Levothyroxine 50mcg',
    therapeutic_class: 'Thyroid Hormone',
    uses: 'Hypothyroidism, goiter, thyroid cancer suppression',
    side_effects: 'Palpitations, weight loss, insomnia if overdosed',
  },
  {
    id: 'mock-068',
    medicine_name: 'Carbimazole',
    composition: 'Carbimazole 5mg',
    therapeutic_class: 'Antithyroid',
    uses: 'Hyperthyroidism, Graves\' disease, thyrotoxicosis',
    side_effects: 'Agranulocytosis, rash, nausea, hypothyroidism',
  },

  // ── Vitamins / Supplements ─────────────────────────────────────────────────
  {
    id: 'mock-069',
    medicine_name: 'Ferrous Sulfate',
    composition: 'Ferrous Sulfate 200mg (65mg elemental iron)',
    therapeutic_class: 'Iron Supplement',
    uses: 'Iron deficiency anaemia, pregnancy supplementation',
    side_effects: 'Constipation, dark stools, nausea, GI cramps',
  },
  {
    id: 'mock-070',
    medicine_name: 'Vitamin D3',
    composition: 'Cholecalciferol 60,000 IU',
    therapeutic_class: 'Vitamin Supplement',
    uses: 'Vitamin D deficiency, rickets, osteoporosis, bone health',
    side_effects: 'Hypercalcemia with overdose, nausea, weakness',
  },
  {
    id: 'mock-071',
    medicine_name: 'Calcium Carbonate',
    composition: 'Calcium Carbonate 500mg',
    therapeutic_class: 'Calcium Supplement / Antacid',
    uses: 'Calcium deficiency, osteoporosis, antacid for heartburn',
    side_effects: 'Constipation, hypercalcemia, flatulence',
  },
  {
    id: 'mock-072',
    medicine_name: 'Folic Acid',
    composition: 'Folic Acid 5mg',
    therapeutic_class: 'Vitamin B9 Supplement',
    uses: 'Folate deficiency, neural tube defect prevention, megaloblastic anaemia',
    side_effects: 'Rare; may mask B12 deficiency',
  },
  {
    id: 'mock-073',
    medicine_name: 'Mecobalamin',
    composition: 'Methylcobalamin 500mcg',
    therapeutic_class: 'Vitamin B12 Supplement',
    uses: 'Vitamin B12 deficiency, peripheral neuropathy, megaloblastic anaemia',
    side_effects: 'Generally well tolerated; rare allergic reaction',
  },

  // ── Dermatology ────────────────────────────────────────────────────────────
  {
    id: 'mock-074',
    medicine_name: 'Hydrocortisone Cream',
    composition: 'Hydrocortisone 1%',
    therapeutic_class: 'Topical Corticosteroid',
    uses: 'Eczema, contact dermatitis, psoriasis, insect bites, itching',
    side_effects: 'Skin thinning, telangiectasia with prolonged use',
  },
  {
    id: 'mock-075',
    medicine_name: 'Betamethasone Cream',
    composition: 'Betamethasone Valerate 0.1%',
    therapeutic_class: 'Topical Corticosteroid (Potent)',
    uses: 'Severe eczema, psoriasis, lichenification, inflammatory dermatoses',
    side_effects: 'Skin atrophy, striae, secondary infection risk',
  },
  {
    id: 'mock-076',
    medicine_name: 'Clotrimazole',
    composition: 'Clotrimazole 1%',
    therapeutic_class: 'Antifungal',
    uses: 'Ringworm, athlete\'s foot, candidiasis, tinea infections',
    side_effects: 'Burning, stinging, local irritation',
  },
  {
    id: 'mock-077',
    medicine_name: 'Terbinafine',
    composition: 'Terbinafine 250mg oral / 1% topical',
    therapeutic_class: 'Antifungal',
    uses: 'Fungal nail infections, tinea pedis, tinea corporis, ringworm',
    side_effects: 'Headache, GI upset, liver toxicity (rare)',
  },
  {
    id: 'mock-078',
    medicine_name: 'Tretinoin',
    composition: 'Tretinoin 0.025% cream',
    therapeutic_class: 'Retinoid / Keratolytic',
    uses: 'Acne vulgaris, fine wrinkles, hyperpigmentation',
    side_effects: 'Skin irritation, peeling, photosensitivity, initial flare',
  },
  {
    id: 'mock-079',
    medicine_name: 'Benzoyl Peroxide',
    composition: 'Benzoyl Peroxide 5% gel',
    therapeutic_class: 'Keratolytic / Antibacterial',
    uses: 'Acne vulgaris, inflammatory and non-inflammatory lesions',
    side_effects: 'Dryness, peeling, bleaching of fabric',
  },

  // ── Antimalarials / Anti-infectives ───────────────────────────────────────
  {
    id: 'mock-080',
    medicine_name: 'Chloroquine',
    composition: 'Chloroquine Phosphate 250mg',
    therapeutic_class: 'Antimalarial',
    uses: 'Malaria treatment and prophylaxis, rheumatoid arthritis, lupus',
    side_effects: 'Retinopathy with long use, GI disturbance, pruritus',
  },
  {
    id: 'mock-081',
    medicine_name: 'Artemether-Lumefantrine',
    composition: 'Artemether 20mg + Lumefantrine 120mg',
    therapeutic_class: 'Antimalarial (ACT)',
    uses: 'Uncomplicated falciparum malaria',
    side_effects: 'Headache, dizziness, anorexia, palpitations',
  },
  {
    id: 'mock-082',
    medicine_name: 'Acyclovir',
    composition: 'Acyclovir 200mg',
    therapeutic_class: 'Antiviral',
    uses: 'Herpes simplex, varicella, herpes zoster, genital herpes',
    side_effects: 'Nausea, headache, renal impairment at high doses',
  },
  {
    id: 'mock-083',
    medicine_name: 'Fluconazole',
    composition: 'Fluconazole 150mg',
    therapeutic_class: 'Antifungal (Systemic)',
    uses: 'Vaginal candidiasis, oral thrush, systemic fungal infections',
    side_effects: 'Nausea, headache, hepatotoxicity, QT prolongation',
  },
  {
    id: 'mock-084',
    medicine_name: 'Ivermectin',
    composition: 'Ivermectin 12mg',
    therapeutic_class: 'Antiparasitic',
    uses: 'Scabies, head lice, strongyloidiasis, filariasis, river blindness',
    side_effects: 'Dizziness, nausea, pruritus, Mazzotti reaction',
  },
  {
    id: 'mock-085',
    medicine_name: 'Albendazole',
    composition: 'Albendazole 400mg',
    therapeutic_class: 'Anthelmintic',
    uses: 'Intestinal worm infections, giardiasis, neurocysticercosis',
    side_effects: 'Nausea, abdominal pain, elevated liver enzymes',
  },

  // ── Musculoskeletal ────────────────────────────────────────────────────────
  {
    id: 'mock-086',
    medicine_name: 'Methocarbamol',
    composition: 'Methocarbamol 750mg',
    therapeutic_class: 'Muscle Relaxant',
    uses: 'Muscle spasm, acute musculoskeletal pain, back pain, neck pain',
    side_effects: 'Drowsiness, dizziness, nausea',
  },
  {
    id: 'mock-087',
    medicine_name: 'Baclofen',
    composition: 'Baclofen 10mg',
    therapeutic_class: 'Muscle Relaxant / Antispastic',
    uses: 'Spasticity due to MS, spinal cord injury, cerebral palsy',
    side_effects: 'Drowsiness, weakness, dizziness, withdrawal seizures',
  },
  {
    id: 'mock-088',
    medicine_name: 'Allopurinol',
    composition: 'Allopurinol 100mg',
    therapeutic_class: 'Xanthine Oxidase Inhibitor',
    uses: 'Gout prevention, hyperuricemia, uric acid kidney stones',
    side_effects: 'Rash, GI upset, Stevens-Johnson syndrome (rare)',
  },
  {
    id: 'mock-089',
    medicine_name: 'Colchicine',
    composition: 'Colchicine 0.5mg',
    therapeutic_class: 'Antigout',
    uses: 'Acute gout attack, gout prophylaxis, familial Mediterranean fever',
    side_effects: 'Diarrhea, nausea, abdominal cramps, myopathy',
  },

  // ── Ophthalmology ──────────────────────────────────────────────────────────
  {
    id: 'mock-090',
    medicine_name: 'Timolol Eye Drops',
    composition: 'Timolol 0.5% ophthalmic solution',
    therapeutic_class: 'Beta Blocker / Antiglaucoma',
    uses: 'Glaucoma, ocular hypertension',
    side_effects: 'Bradycardia, bronchospasm, systemic absorption effects',
  },
  {
    id: 'mock-091',
    medicine_name: 'Latanoprost Eye Drops',
    composition: 'Latanoprost 0.005% ophthalmic solution',
    therapeutic_class: 'Prostaglandin Analogue / Antiglaucoma',
    uses: 'Open-angle glaucoma, ocular hypertension',
    side_effects: 'Iris pigmentation, eyelash growth, conjunctival hyperemia',
  },
  {
    id: 'mock-092',
    medicine_name: 'Moxifloxacin Eye Drops',
    composition: 'Moxifloxacin 0.5% ophthalmic solution',
    therapeutic_class: 'Fluoroquinolone Antibiotic (Ophthalmic)',
    uses: 'Bacterial conjunctivitis, corneal ulcer, eye infections',
    side_effects: 'Burning, stinging on instillation, local irritation',
  },

  // ── Women's Health / Hormonal ──────────────────────────────────────────────
  {
    id: 'mock-093',
    medicine_name: 'Progesterone',
    composition: 'Micronized Progesterone 200mg',
    therapeutic_class: 'Progestogen / Hormone',
    uses: 'Luteal phase support, threatened abortion, HRT, PCOS',
    side_effects: 'Drowsiness, breast tenderness, mood changes',
  },
  {
    id: 'mock-094',
    medicine_name: 'Clomiphene',
    composition: 'Clomiphene Citrate 50mg',
    therapeutic_class: 'Selective Estrogen Receptor Modulator',
    uses: 'Infertility due to anovulation, PCOS ovulation induction',
    side_effects: 'Hot flashes, ovarian enlargement, multiple pregnancy risk',
  },
  {
    id: 'mock-095',
    medicine_name: 'Tranexamic Acid',
    composition: 'Tranexamic Acid 500mg',
    therapeutic_class: 'Antifibrinolytic',
    uses: 'Heavy menstrual bleeding, bleeding disorders, post-surgical bleeding',
    side_effects: 'Nausea, diarrhea, thromboembolism risk',
  },

  // ── Urology ────────────────────────────────────────────────────────────────
  {
    id: 'mock-096',
    medicine_name: 'Tamsulosin',
    composition: 'Tamsulosin 0.4mg',
    therapeutic_class: 'Alpha Blocker',
    uses: 'Benign prostatic hyperplasia, ureteric colic, urinary retention',
    side_effects: 'Orthostatic hypotension, retrograde ejaculation, dizziness',
  },
  {
    id: 'mock-097',
    medicine_name: 'Finasteride',
    composition: 'Finasteride 5mg',
    therapeutic_class: '5-alpha Reductase Inhibitor',
    uses: 'BPH, male pattern baldness (1mg), prostate cancer prevention',
    side_effects: 'Sexual dysfunction, gynaecomastia, teratogenicity',
  },

  // ── Psychiatry (additional) ────────────────────────────────────────────────
  {
    id: 'mock-098',
    medicine_name: 'Quetiapine',
    composition: 'Quetiapine 25mg',
    therapeutic_class: 'Atypical Antipsychotic',
    uses: 'Schizophrenia, bipolar disorder, major depression (adjunct), insomnia',
    side_effects: 'Sedation, weight gain, metabolic syndrome, tardive dyskinesia',
  },
  {
    id: 'mock-099',
    medicine_name: 'Risperidone',
    composition: 'Risperidone 2mg',
    therapeutic_class: 'Atypical Antipsychotic',
    uses: 'Schizophrenia, bipolar mania, autism-related irritability',
    side_effects: 'Extrapyramidal effects, hyperprolactinaemia, weight gain',
  },
  {
    id: 'mock-100',
    medicine_name: 'Lithium Carbonate',
    composition: 'Lithium Carbonate 300mg',
    therapeutic_class: 'Mood Stabiliser',
    uses: 'Bipolar disorder, manic episodes, depression augmentation, cluster headache',
    side_effects: 'Tremor, polyuria, hypothyroidism, narrow therapeutic index',
  },
  {
    id: 'mock-101',
    medicine_name: 'Zolpidem',
    composition: 'Zolpidem 10mg',
    therapeutic_class: 'Non-benzodiazepine Hypnotic',
    uses: 'Insomnia (short-term), sleep onset difficulty',
    side_effects: 'Daytime drowsiness, dependence, parasomnias, amnesia',
  },
  {
    id: 'mock-102',
    medicine_name: 'Melatonin',
    composition: 'Melatonin 3mg',
    therapeutic_class: 'Chronobiotic / Sleep Supplement',
    uses: 'Insomnia, jet lag, circadian rhythm disorders, sleep-wake cycle regulation',
    side_effects: 'Drowsiness, headache, dizziness (minimal)',
  },
];

// ─── Local fuzzy search ────────────────────────────────────────────────────

/**
 * Searches MOCK_MEDICINES client-side.
 * Matches medicine_name, therapeutic_class, composition, uses — case-insensitive.
 * Returns up to `limit` results sorted by relevance (name matches first).
 */
export function searchMockMedicines(query: string, limit = 20): MedicineResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const tokens = q.split(/\s+/);

  const scored = MOCK_MEDICINES.map((med) => {
    const name = (med.medicine_name ?? '').toLowerCase();
    const cls = (med.therapeutic_class ?? '').toLowerCase();
    const comp = (med.composition ?? '').toLowerCase();
    const uses = (med.uses ?? '').toLowerCase();

    let score = 0;
    for (const token of tokens) {
      if (name.startsWith(token)) score += 10;
      else if (name.includes(token)) score += 6;
      if (cls.includes(token)) score += 4;
      if (uses.includes(token)) score += 3;
      if (comp.includes(token)) score += 2;
    }
    return { med, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.med);
}
