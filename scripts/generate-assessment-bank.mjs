import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("data/assessment-bank");
const REVIEW_STATUS = "Perlu Review Guru";
const DIFFICULTIES = ["Mudah", "Mudah", "Mudah", "Sedang", "Sedang", "Sedang", "Sedang", "Sedang", "Sulit", "Sulit"];
const COGNITIVE = ["C2", "C2", "C3", "C3", "C3", "C3", "C3", "C4", "C4", "C4"];
const LETTERS = ["A", "B", "C", "D"];

const utsTargets = [
  ["SD 4", "Matematika"], ["SD 4", "Bahasa Inggris"],
  ["SD 5", "Matematika"], ["SD 5", "Bahasa Inggris"],
  ["SMP 7", "Matematika"], ["SMP 7", "Bahasa Indonesia"], ["SMP 7", "Bahasa Inggris"], ["SMP 7", "IPA"],
  ["SMP 8", "Bahasa Indonesia"], ["SMP 8", "Bahasa Inggris"], ["SMP 8", "IPA"],
  ["SMA 10", "Matematika"], ["SMA 10", "Bahasa Indonesia"], ["SMA 10", "Bahasa Inggris"], ["SMA 10", "IPA"],
  ["SMA 11", "Matematika"], ["SMA 11", "IPA"],
];

const tryoutTargets = [
  ["SD 6", "Matematika"], ["SD 6", "Bahasa Inggris"],
  ["SMP 9", "Matematika"], ["SMP 9", "Bahasa Indonesia"], ["SMP 9", "Bahasa Inggris"], ["SMP 9", "IPA"],
  ["SMA 12", "Matematika"], ["SMA 12", "Bahasa Inggris"], ["SMA 12", "IPA"],
];

const gradeNumber = (className) => Number(className.match(/\d+/)?.[0] ?? 0);
const slug = (value) => value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
const phaseForGrade = (grade) => grade <= 4 ? "Fase B" : grade <= 6 ? "Fase C" : grade <= 9 ? "Fase D" : grade === 10 ? "Fase E" : "Fase F";
const levelForGrade = (grade) => grade <= 6 ? "SD" : grade <= 9 ? "SMP" : "SMA";

function question(topic, indicator, stem, options, answer, explanation, competency = topic) {
  if (options.length !== 4 || !LETTERS.includes(answer)) throw new Error(`Soal tidak valid: ${stem}`);
  return { competency, topic, indicator, stem, options, answer, explanation };
}

const formatNumber = (value) => new Intl.NumberFormat("id-ID").format(value);
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

function mathQuestions(grade, variant) {
  const v = variant + grade;
  if (grade <= 6) {
    const a = 120 + 15 * v;
    const b = 48 + 4 * variant;
    const denominator = grade === 4 ? 8 : 12;
    const numerator = grade === 4 ? 3 : 5;
    const price = 12000 + 1000 * variant;
    const discount = grade === 4 ? 10 : 20;
    const length = 10 + variant;
    const width = 6 + variant;
    const scores = [70 + variant, 75 + variant, 80 + variant, 85 + variant, 90 + variant];
    const mean = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    const g = gcd(24 + variant * 2, 36 + variant * 3);
    const k = lcm(4 + variant, 6 + variant);
    return [
      question("Operasi bilangan", "Menghitung operasi campuran bilangan cacah", `Hasil dari ${formatNumber(a)} + ${formatNumber(b)} x 3 adalah ...`, [formatNumber((a + b) * 3), formatNumber(a + b * 3), formatNumber(a * 3 + b), formatNumber(a + b + 3)], "B", `Perkalian dikerjakan lebih dahulu: ${b} x 3 = ${b * 3}, lalu ditambah ${a}, sehingga hasilnya ${a + b * 3}.`),
      question("Pecahan", "Menentukan bagian dari suatu jumlah", `${numerator}/${denominator} dari ${denominator * (10 + variant)} buku adalah ... buku.`, [String(numerator * (8 + variant)), String(numerator * (9 + variant)), String(numerator * (10 + variant)), String(numerator * (11 + variant))], "C", `${numerator}/${denominator} x ${denominator * (10 + variant)} = ${numerator * (10 + variant)}.`),
      question("Persen", "Menghitung harga setelah diskon", `Harga sebuah tas Rp${formatNumber(price)} mendapat diskon ${discount}%. Harga yang harus dibayar adalah ...`, [`Rp${formatNumber(price * (100 - discount) / 100)}`, `Rp${formatNumber(price * discount / 100)}`, `Rp${formatNumber(price - discount)}`, `Rp${formatNumber(price + discount / 100)}`], "A", `Potongan = ${discount}% x Rp${formatNumber(price)}, sehingga harga akhir Rp${formatNumber(price * (100 - discount) / 100)}.`),
      question("FPB", "Menentukan FPB untuk pembagian kelompok", `${24 + variant * 2} pensil dan ${36 + variant * 3} penghapus akan dimasukkan ke paket dengan isi sama banyak tanpa sisa. Paket terbanyak yang dapat dibuat adalah ...`, [String(g - 2), String(g), String(g + 2), String(g * 2)], "B", `Jumlah paket terbanyak adalah FPB dari ${24 + variant * 2} dan ${36 + variant * 3}, yaitu ${g}.`),
      question("KPK", "Menentukan waktu kejadian berulang", `Bel A berbunyi setiap ${4 + variant} menit dan bel B setiap ${6 + variant} menit. Jika berbunyi bersama sekarang, keduanya akan berbunyi bersama lagi setelah ... menit.`, [String(Math.max(4 + variant, 6 + variant)), String(Math.min(4 + variant, 6 + variant)), String(k), String(k * 2)], "C", `Waktu bersamaan berikutnya adalah KPK dari ${4 + variant} dan ${6 + variant}, yaitu ${k} menit.`),
      question("Geometri", "Menghitung luas persegi panjang", `Sebuah taman berbentuk persegi panjang berukuran ${length} m x ${width} m. Luas taman adalah ...`, [`${2 * (length + width)} m2`, `${length * width} m2`, `${length + width} m2`, `${length * width * 2} m2`], "B", `Luas persegi panjang = panjang x lebar = ${length} x ${width} = ${length * width} m2.`),
      question("Pengukuran", "Mengonversi satuan panjang", `${2 + variant} km ${300 + variant * 50} m sama dengan ... m.`, [String((2 + variant) * 1000 + 300 + variant * 50), String((2 + variant) * 100 + 300 + variant * 50), String((2 + variant) * 1000 + 30 + variant * 5), String((2 + variant) * 10000 + 300 + variant * 50)], "A", `1 km = 1.000 m, jadi hasilnya ${(2 + variant) * 1000 + 300 + variant * 50} m.`),
      question("Data", "Menghitung rata-rata data tunggal", `Nilai lima siswa adalah ${scores.join(", ")}. Rata-ratanya adalah ...`, [String(mean - 5), String(mean), String(mean + 5), String(scores.reduce((s, x) => s + x, 0))], "B", `Jumlah nilai ${scores.reduce((s, x) => s + x, 0)} dibagi 5 = ${mean}.`),
      question("Pola bilangan", "Menganalisis pola bertambah teratur", `Perhatikan pola ${2 + variant}, ${5 + variant}, ${8 + variant}, ${11 + variant}, .... Bilangan ke-8 adalah ...`, [String(20 + variant), String(21 + variant), String(22 + variant), String(23 + variant)], "D", `Pola bertambah 3. Suku ke-8 = ${2 + variant} + 7 x 3 = ${23 + variant}.`),
      question("Pemecahan masalah", "Menyelesaikan masalah multilangkah", `Ibu membeli ${4 + variant} kotak kue. Setiap kotak berisi ${12 + variant} kue. Setelah dibagikan ${15 + variant} kue, sisanya adalah ...`, [String((4 + variant) * (12 + variant) - (15 + variant)), String((4 + variant) + (12 + variant) - (15 + variant)), String((4 + variant) * (12 + variant) + (15 + variant)), String((12 + variant) * (15 + variant) - (4 + variant))], "A", `Jumlah awal ${(4 + variant) * (12 + variant)}, lalu dikurangi ${15 + variant}; sisanya ${(4 + variant) * (12 + variant) - (15 + variant)}.`),
    ];
  }

  if (grade <= 9) {
    const x = 3 + variant;
    const p = 4 + variant;
    const qv = 7 + variant;
    const data = [4 + variant, 6 + variant, 7 + variant, 8 + variant, 11 + variant];
    return [
      question("Bilangan", "Menerapkan operasi bilangan bulat", `Hasil dari -${8 + variant} + ${3 * (5 + variant)} - ${4 + variant} adalah ...`, [String(-8 - variant + 3 * (5 + variant) - (4 + variant)), String(-8 - variant + 3 * ((5 + variant) - (4 + variant))), String(8 + variant + 3 * (5 + variant) - (4 + variant)), String(-8 - variant - 3 * (5 + variant) - (4 + variant))], "A", `Kerjakan perkalian terlebih dahulu, lalu operasi dari kiri ke kanan. Hasilnya ${-8 - variant + 3 * (5 + variant) - (4 + variant)}.`),
      question("Aljabar", "Menyederhanakan bentuk aljabar", `Bentuk sederhana dari ${p}x + ${qv} - ${p - 1}x + ${variant + 2} adalah ...`, [`x + ${qv + variant + 2}`, `${2 * p - 1}x + ${qv + variant + 2}`, `x + ${qv - variant - 2}`, `${p}x + ${qv + variant + 2}`], "A", `Koefisien x: ${p} - ${p - 1} = 1; konstanta: ${qv} + ${variant + 2} = ${qv + variant + 2}.`),
      question("Persamaan linear", "Menentukan penyelesaian persamaan satu variabel", `Jika ${p}x + ${qv} = ${p * x + qv}, nilai x adalah ...`, [String(x - 1), String(x), String(x + 1), String(p * x)], "B", `${p}x = ${p * x}, sehingga x = ${x}.`),
      question("Perbandingan", "Menggunakan perbandingan senilai", `Untuk membuat ${4 + variant} porsi diperlukan ${300 + 50 * variant} gram tepung. Tepung untuk ${8 + 2 * variant} porsi adalah ... gram.`, [String(300 + 50 * variant), String(450 + 75 * variant), String(600 + 100 * variant), String(900 + 150 * variant)], "C", `Jumlah porsi menjadi dua kali, sehingga tepung juga dua kali: ${600 + 100 * variant} gram.`),
      question("Himpunan", "Menentukan irisan dua himpunan", `A = {1, 2, 3, ${4 + variant}} dan B = {2, 3, ${5 + variant}}. A irisan B adalah ...`, ["{1, 2, 3}", "{2, 3}", `{${4 + variant}, ${5 + variant}}`, "{1}"], "B", `Anggota yang terdapat pada kedua himpunan adalah 2 dan 3.`),
      question("Geometri", "Menggunakan Teorema Pythagoras", `Segitiga siku-siku memiliki sisi tegak ${6 + 3 * variant} cm dan ${8 + 4 * variant} cm. Panjang sisi miringnya adalah ...`, [`${10 + 5 * variant} cm`, `${12 + 5 * variant} cm`, `${14 + 5 * variant} cm`, `${16 + 5 * variant} cm`], "A", `Sisinya merupakan kelipatan pola 6-8-10, sehingga sisi miring ${10 + 5 * variant} cm.`),
      question("Statistika", "Menentukan median data ganjil", `Median dari data ${data.join(", ")} adalah ...`, [String(data[1]), String(data[2]), String(data[3]), String(data.reduce((s, n) => s + n, 0) / data.length)], "B", `Data sudah urut dan banyaknya 5, sehingga median adalah data ke-3, yaitu ${data[2]}.`),
      question("Peluang", "Menentukan peluang kejadian sederhana", `Sebuah kantong berisi ${3 + variant} bola merah dan ${5 + variant} bola biru. Peluang mengambil bola merah adalah ...`, [`${3 + variant}/${8 + 2 * variant}`, `${5 + variant}/${8 + 2 * variant}`, `${3 + variant}/${5 + variant}`, `${8 + 2 * variant}/${3 + variant}`], "A", `Peluang = banyak bola merah dibagi seluruh bola = ${3 + variant}/${8 + 2 * variant}.`),
      question("Fungsi", "Menganalisis nilai fungsi", `Diketahui f(x) = ${2 + variant}x - ${3 + variant}. Nilai f(${4 + variant}) adalah ...`, [String((2 + variant) * (4 + variant) - (3 + variant)), String((2 + variant) + (4 + variant) - (3 + variant)), String((2 + variant) * ((4 + variant) - (3 + variant))), String((2 + variant) * (4 + variant) + (3 + variant))], "A", `Substitusi x = ${4 + variant}: f(x) = ${(2 + variant) * (4 + variant) - (3 + variant)}.`),
      question("Pemodelan", "Menyusun model persamaan dari masalah", `Harga ${2 + variant} buku sama adalah Rp${formatNumber((2 + variant) * (7000 + 500 * variant))}. Jika harga satu buku dinyatakan x, model yang tepat adalah ...`, [`x + ${2 + variant} = ${(2 + variant) * (7000 + 500 * variant)}`, `${2 + variant}x = ${(2 + variant) * (7000 + 500 * variant)}`, `x/${2 + variant} = ${(2 + variant) * (7000 + 500 * variant)}`, `${2 + variant}/x = ${(2 + variant) * (7000 + 500 * variant)}`], "B", `Total harga adalah banyak buku dikali harga satuan, sehingga modelnya ${2 + variant}x = ${(2 + variant) * (7000 + 500 * variant)}.`),
    ];
  }

  const n = variant + grade - 8;
  return [
    question("Eksponen", "Menerapkan sifat perpangkatan", `Nilai dari 2^${3 + variant} x 2^${2 + variant} adalah ...`, [`2^${5 + 2 * variant}`, `4^${5 + 2 * variant}`, `2^${6 + 2 * variant}`, `2^${7 + 2 * variant}`], "A", `Untuk basis sama, pangkat dijumlahkan: ${3 + variant} + ${2 + variant} = ${5 + 2 * variant}.`),
    question("Persamaan kuadrat", "Menentukan akar persamaan kuadrat", `Akar-akar persamaan x2 - ${2 * n + 1}x + ${n * (n + 1)} = 0 adalah ...`, [`${n} dan ${n + 1}`, `${-n} dan ${-(n + 1)}`, `${n - 1} dan ${n + 2}`, `1 dan ${n * (n + 1)}`], "A", `Persamaan dapat difaktorkan menjadi (x - ${n})(x - ${n + 1}) = 0.`),
    question("Sistem persamaan", "Menyelesaikan SPLDV", `Diketahui x + y = ${9 + variant} dan x - y = ${3 + variant}. Nilai x adalah ...`, [String(3), String(5 + variant), String(6 + variant), String(9 + variant)], "C", `Jumlahkan kedua persamaan: 2x = ${12 + 2 * variant}, sehingga x = ${6 + variant}.`),
    question("Fungsi", "Menentukan komposisi nilai fungsi", `Jika f(x) = ${2 + variant}x + 1 dan g(x) = x - ${variant + 1}, nilai f(g(${5 + variant})) adalah ...`, [String((2 + variant) * 4 + 1), String((2 + variant) * (5 + variant) + 1 - (variant + 1)), String(4 + (2 + variant) + 1), String((2 + variant) * (5 + variant) + 1)], "A", `g(${5 + variant}) = 4, lalu f(4) = ${(2 + variant) * 4 + 1}.`),
    question("Barisan", "Menentukan suku barisan aritmetika", `Barisan aritmetika memiliki suku pertama ${3 + variant} dan beda ${2 + variant}. Suku ke-10 adalah ...`, [String(3 + variant + 9 * (2 + variant)), String(3 + variant + 10 * (2 + variant)), String((3 + variant) * 10 + (2 + variant)), String(9 * (2 + variant))], "A", `U10 = a + 9b = ${3 + variant} + 9(${2 + variant}) = ${3 + variant + 9 * (2 + variant)}.`),
    question("Trigonometri", "Menggunakan rasio sinus", `Pada segitiga siku-siku, sisi di depan sudut A adalah ${6 + variant} cm dan sisi miring ${10 + variant} cm. Nilai sin A adalah ...`, [`${6 + variant}/${10 + variant}`, `${10 + variant}/${6 + variant}`, `${8 + variant}/${10 + variant}`, `${6 + variant}/${8 + variant}`], "A", `sin A = sisi depan/sisi miring = ${6 + variant}/${10 + variant}.`),
    question("Statistika", "Menghitung rata-rata gabungan", `Rata-rata ${10 + variant} siswa adalah ${70 + variant}. Setelah satu siswa dengan nilai ${81 + 2 * variant} bergabung, rata-rata baru adalah ...`, [String(71 + variant), String(75 + variant), String(70 + variant), String(81 + 2 * variant)], "A", `Jumlah nilai lama ${(10 + variant) * (70 + variant)}, ditambah ${81 + 2 * variant}, lalu dibagi ${11 + variant}; hasilnya ${71 + variant}.`),
    question("Peluang", "Menganalisis peluang dua kejadian independen", `Sebuah koin dan sebuah dadu dilempar bersamaan. Peluang muncul gambar dan bilangan genap adalah ...`, ["1/12", "1/6", "1/4", "1/2"], "C", `P(gambar) = 1/2 dan P(genap) = 3/6 = 1/2, sehingga peluang bersama = 1/4.`),
    question("Optimasi", "Menilai model maksimum sederhana", `Sebuah persegi panjang memiliki keliling ${40 + 4 * variant} m. Dari pasangan ukuran berikut, yang memberi luas terbesar adalah ...`, [`${5 + variant} m x ${15 + variant} m`, `${8 + variant} m x ${12 + variant} m`, `${10 + variant} m x ${10 + variant} m`, `${6 + variant} m x ${14 + variant} m`], "C", `Dengan keliling tetap, luas maksimum terjadi saat bentuknya persegi, yaitu ${10 + variant} m x ${10 + variant} m.`),
    question("Pemodelan", "Menganalisis pertumbuhan eksponensial", `Sebuah koloni berjumlah ${100 * (variant + 1)} dan berlipat dua setiap jam. Jumlah setelah 3 jam adalah ...`, [formatNumber(300 * (variant + 1)), formatNumber(600 * (variant + 1)), formatNumber(800 * (variant + 1)), formatNumber(1000 * (variant + 1))], "C", `Setelah 3 jam jumlahnya ${100 * (variant + 1)} x 2^3 = ${800 * (variant + 1)}.`),
  ];
}

const englishContexts = {
  SD: [
    { title: "School Library", text: "Rina visits the school library every Tuesday. She borrows one storybook and returns it the following week. She likes animal stories because they are funny and easy to understand.", person: "Rina", day: "Tuesday", object: "a storybook", reason: "they are funny and easy to understand", word: "borrows", meaning: "takes something to use and return later", main: "Rina's weekly library activity" },
    { title: "Morning Routine", text: "Bimo wakes up at five thirty. He makes his bed, takes a bath, and eats breakfast with his family. At six thirty, he rides his bicycle to school.", person: "Bimo", day: "at six thirty", object: "his bicycle", reason: "to go to school", word: "routine", meaning: "activities done regularly", main: "Bimo's activities before school" },
    { title: "Class Garden", text: "The students water their class garden every morning. They grow spinach, tomatoes, and chilies. The garden looks fresh because everyone takes turns caring for it.", person: "the students", day: "every morning", object: "the class garden", reason: "everyone takes turns caring for it", word: "fresh", meaning: "healthy and full of life", main: "Students caring for their class garden" },
    { title: "Healthy Lunch", text: "Sari brings rice, vegetables, an egg, and water for lunch. She avoids too many sweet drinks. Her lunch gives her energy for the afternoon lesson.", person: "Sari", day: "at lunch", object: "rice, vegetables, an egg, and water", reason: "it gives her energy", word: "avoids", meaning: "keeps away from", main: "Sari chooses a healthy lunch" },
  ],
  SMP: [
    { title: "Recycling Project", text: "Our class started a recycling project last month. Students separate paper, plastic, and metal into different bins. The collected materials are sent to a recycling center every Friday, reducing waste around the school.", person: "the students", day: "every Friday", object: "paper, plastic, and metal", reason: "to reduce waste around the school", word: "separate", meaning: "put into different groups", main: "A class recycling project reduces school waste" },
    { title: "Digital Reading", text: "Nadia uses the city library application to borrow digital books. Before downloading a book, she reads its summary and checks the age recommendation. This habit helps her choose reliable and suitable reading material.", person: "Nadia", day: "before downloading a book", object: "digital books", reason: "to choose reliable and suitable material", word: "reliable", meaning: "able to be trusted", main: "Nadia selects digital books carefully" },
    { title: "Mangrove Visit", text: "Last Saturday, the science club visited a mangrove area. A guide explained that mangrove roots reduce coastal erosion and provide shelter for young fish. The students recorded their observations without disturbing the habitat.", person: "the science club", day: "last Saturday", object: "a mangrove area", reason: "to observe the habitat responsibly", word: "shelter", meaning: "a safe place for protection", main: "Students learn the value of mangroves" },
    { title: "Public Transport", text: "Arman began taking the bus to school three weeks ago. He checks the schedule before leaving home and arrives at the stop ten minutes early. The trip takes longer than riding a motorcycle, but it reduces fuel use.", person: "Arman", day: "before leaving home", object: "the bus", reason: "to reduce fuel use", word: "schedule", meaning: "a plan showing times of events", main: "Arman uses the bus in a planned way" },
  ],
  SMA: [
    { title: "Media Literacy", text: "Before sharing an online article, Maya checks the author, publication date, and supporting evidence. She also compares the claim with reports from credible institutions. These steps take time, but they prevent misleading information from spreading.", person: "Maya", day: "before sharing an article", object: "the author, date, and evidence", reason: "to prevent misleading information", word: "credible", meaning: "worthy of trust", main: "Verifying sources helps prevent misinformation" },
    { title: "Energy Audit", text: "The student council conducted an energy audit in the school building. Their data showed that lights and air conditioners were often left on in empty rooms. They proposed reminder labels and a weekly monitoring team to lower electricity consumption.", person: "the student council", day: "during an energy audit", object: "electricity use in the school", reason: "to lower electricity consumption", word: "consumption", meaning: "the amount of something used", main: "An audit leads to practical energy-saving actions" },
    { title: "Urban Farming", text: "A youth group transformed an unused rooftop into a small vegetable garden. Because the space was limited, they used vertical racks and collected rainwater. The harvest is sold locally, and part of the income funds free gardening workshops.", person: "a youth group", day: "after transforming a rooftop", object: "a vegetable garden", reason: "to produce food and fund workshops", word: "transformed", meaning: "changed completely in form or use", main: "A rooftop garden creates environmental and social benefits" },
    { title: "Responsible AI", text: "Dimas uses an artificial intelligence tool to generate study questions, but he does not accept every output immediately. He compares the answers with textbooks and rewrites unclear items. His approach treats the tool as an assistant rather than an unquestioned authority.", person: "Dimas", day: "when using an AI tool", object: "generated study questions", reason: "to ensure the questions are accurate and clear", word: "authority", meaning: "a source accepted as having reliable knowledge", main: "AI output should be checked critically" },
  ],
};

function englishQuestions(grade, variant) {
  const level = levelForGrade(grade);
  const context = englishContexts[level][(grade + variant) % englishContexts[level].length];
  const presentVerb = ["reviews", "review", "reviewed", "reviewing"];
  const correctPresent = "A";
  const pastVerb = level === "SD" ? ["visited", "visits", "visit", "visiting"] : ["conducted", "conducts", "conduct", "conducting"];
  return [
    question("Reading comprehension", "Identifying the main idea of a short text", `Read the text "${context.title}". ${context.text}\nWhat is the main idea of the text?`, [context.main, `A list of objects owned by ${context.person}`, "A problem that has no solution", "An invitation to cancel an activity"], "A", `The entire paragraph focuses on ${context.main.toLowerCase()}.`, "Comprehending written texts"),
    question("Explicit information", "Locating stated information", `According to the text, when does the activity happen?`, [context.day, "only at midnight", "once every ten years", "after the activity is cancelled"], "A", `The text explicitly states: ${context.day}.`, "Comprehending written texts"),
    question("Vocabulary", "Inferring word meaning from context", `The word "${context.word}" is closest in meaning to ...`, [context.meaning, "something that is never used", "a place that cannot be entered", "an action done without a reason"], "A", `In the paragraph, "${context.word}" means ${context.meaning}.`, "Language features"),
    question("Reference", "Identifying a pronoun reference", `In the sentence "${context.person === "the students" ? "They" : "The activity"} helps achieve the goal," the reference is most closely related to ...`, [context.person === "the students" ? "the students" : context.object, "an unrelated visitor", "the reader's family", "a cancelled plan"], "A", `The reference points back to ${context.person === "the students" ? "the students" : context.object}.`, "Language features"),
    question("Simple present", "Using the correct verb form for a habitual action", `${context.person === "the students" ? "Each student" : context.person} ... the plan carefully every week.`, presentVerb, correctPresent, `A singular subject in a habitual action takes the simple-present form "${presentVerb[0]}".`, "Grammar in context"),
    question("Simple past", "Using the correct verb for a completed event", `Last week, the group ... a similar activity.`, pastVerb, "A", `"Last week" signals the simple past, so the correct verb is "${pastVerb[0]}".`, "Grammar in context"),
    question("Functional text", "Interpreting a notice", `Notice: "Please complete the activity log before leaving." What should participants do?`, ["Fill in the log before they leave", "Leave without recording anything", "Take the log home permanently", "Wait until next month to read it"], "A", `The notice asks participants to complete the log before leaving.`, "Interpreting functional texts"),
    question("Inference", "Drawing a logical inference from a text", `Why is the action in the text useful?`, [context.reason, "because it removes every rule", "because it prevents anyone from learning", "because it makes the activity impossible"], "A", `The benefit can be inferred from the stated purpose: ${context.reason}.`, "Comprehending written texts"),
    question("Text purpose", "Identifying communicative purpose", `The writer's main purpose is to ...`, ["inform readers about an activity and its benefit", "sell an unrelated luxury product", "describe a fictional monster", "forbid all school activities"], "A", `The paragraph informs readers about the activity and explains its benefit.`, "Comprehending written texts"),
    question("Response", "Selecting an appropriate response in a discussion", `A friend says, "We will present our findings tomorrow." What is the best response?`, ["Great. Let's check the evidence once more.", "I never listen to any findings.", "Tomorrow happened last year.", "The evidence should be hidden."], "A", `"Great. Let's check the evidence once more" is relevant, polite, and supports preparation.`, "Interpersonal communication"),
  ];
}

const indonesianContexts = {
  SMP: [
    { title: "Bank Sampah Sekolah", text: "OSIS membuka bank sampah untuk mengurangi sampah anorganik di sekolah. Setiap Jumat, siswa membawa botol plastik dan kertas yang telah dipilah. Petugas menimbang lalu mencatat nilainya sebagai tabungan kelas. Dalam dua bulan, volume sampah di tempat pembuangan sekolah berkurang hampir sepertiga.", main: "Bank sampah mengurangi sampah melalui kegiatan pemilahan dan penimbangan.", fact: "Sampah dibawa setiap Jumat.", inference: "Kebiasaan memilah sampah mulai terbentuk.", word: "volume", meaning: "jumlah atau banyaknya", purpose: "menjelaskan pelaksanaan dan dampak bank sampah sekolah" },
    { title: "Literasi Digital", text: "Sebelum meneruskan pesan di media sosial, Raka memeriksa sumber dan tanggal penerbitannya. Ia mencari laporan pembanding dari lembaga yang dapat dipercaya. Jika informasi hanya berisi judul mengejutkan tanpa bukti, Raka memilih tidak membagikannya. Kebiasaan tersebut membantu teman-temannya terhindar dari kabar menyesatkan.", main: "Pemeriksaan sumber mencegah penyebaran informasi menyesatkan.", fact: "Raka mencari laporan pembanding.", inference: "Raka bersikap kritis terhadap informasi digital.", word: "menyesatkan", meaning: "mengarahkan pada pemahaman yang keliru", purpose: "memberi contoh perilaku bijak saat menerima informasi digital" },
    { title: "Mangrove Pesisir", text: "Warga menanam mangrove di tepi desa yang sering terkena abrasi. Akar mangrove memperlambat gelombang dan menahan sedimen. Kawasan itu kemudian menjadi tempat hidup kepiting serta ikan muda. Setelah tiga tahun, garis pantai di bagian yang ditanami tampak lebih stabil.", main: "Penanaman mangrove membantu melindungi pesisir dan habitat.", fact: "Penanaman dilakukan di tepi desa yang terkena abrasi.", inference: "Mangrove memberi manfaat ekologis sekaligus perlindungan pantai.", word: "sedimen", meaning: "material yang mengendap", purpose: "menjelaskan manfaat mangrove bagi wilayah pesisir" },
    { title: "Transportasi Umum", text: "Pemerintah kota menambah jadwal bus pada jam berangkat sekolah. Perubahan itu membuat waktu tunggu pelajar lebih singkat. Namun, halte di beberapa wilayah belum memiliki atap yang memadai. Pemerintah perlu memperbaiki fasilitas halte agar penggunaan bus semakin nyaman.", main: "Peningkatan layanan bus perlu disertai perbaikan fasilitas halte.", fact: "Jadwal bus ditambah pada jam berangkat sekolah.", inference: "Kenyamanan dapat memengaruhi minat menggunakan bus.", word: "memadai", meaning: "cukup dan sesuai kebutuhan", purpose: "menilai layanan bus dan mengusulkan perbaikannya" },
  ],
  SMA: [
    { title: "Kecerdasan Artifisial dalam Belajar", text: "Perangkat kecerdasan artifisial dapat membantu siswa menyusun pertanyaan latihan secara cepat. Akan tetapi, keluaran perangkat tersebut tidak selalu akurat atau sesuai konteks. Siswa tetap perlu membandingkan jawaban dengan buku, mendiskusikannya bersama guru, dan memperbaiki pertanyaan yang ambigu. Dengan cara itu, teknologi berfungsi sebagai alat bantu berpikir, bukan pengganti penilaian manusia.", main: "Pemanfaatan kecerdasan artifisial harus disertai pemeriksaan kritis.", fact: "Keluaran perangkat tidak selalu akurat.", inference: "Literasi teknologi mencakup kemampuan memverifikasi hasil.", word: "ambigu", meaning: "bermakna lebih dari satu atau tidak jelas", purpose: "mengemukakan pandangan tentang penggunaan AI yang bertanggung jawab" },
    { title: "Energi Surya Sekolah", text: "Sekolah memasang panel surya untuk memenuhi sebagian kebutuhan listrik laboratorium. Data enam bulan menunjukkan penurunan pembelian listrik pada siang hari. Meskipun biaya awal pemasangan cukup besar, penghematan jangka panjang dan penurunan emisi menjadi pertimbangan penting. Evaluasi berkala diperlukan untuk memastikan kinerja panel tetap optimal.", main: "Panel surya memberi manfaat energi, tetapi perlu evaluasi dan investasi awal.", fact: "Pembelian listrik siang hari menurun.", inference: "Keputusan energi perlu mempertimbangkan biaya dan manfaat jangka panjang.", word: "optimal", meaning: "paling baik atau paling menguntungkan", purpose: "memaparkan manfaat dan pertimbangan penggunaan panel surya" },
    { title: "Ruang Terbuka Kota", text: "Ruang terbuka hijau bukan sekadar unsur keindahan kota. Pepohonan menurunkan suhu permukaan, membantu penyerapan air, dan menyediakan ruang interaksi warga. Sayangnya, pembangunan sering mengurangi lahan hijau tanpa pengganti yang setara. Karena itu, kebijakan tata ruang perlu menetapkan perlindungan kawasan hijau secara terukur.", main: "Perlindungan ruang terbuka hijau penting bagi lingkungan dan warga kota.", fact: "Pepohonan membantu penyerapan air.", inference: "Pembangunan kota perlu menyeimbangkan kebutuhan fisik dan ekologis.", word: "terukur", meaning: "memiliki ukuran atau sasaran yang jelas", purpose: "meyakinkan pembaca tentang pentingnya perlindungan ruang hijau" },
    { title: "Budaya Membaca Data", text: "Sebuah grafik dapat tampak meyakinkan meskipun menggunakan skala yang memotong sebagian sumbu. Pemotongan itu membuat perbedaan kecil terlihat sangat besar. Pembaca perlu memeriksa judul, satuan, sumber, dan rentang skala sebelum menarik kesimpulan. Kemampuan tersebut penting agar keputusan tidak didasarkan pada visualisasi yang menipu.", main: "Grafik harus dibaca secara kritis sebelum dijadikan dasar kesimpulan.", fact: "Pemotongan sumbu dapat membesar-besarkan perbedaan.", inference: "Tampilan visual tidak selalu mencerminkan besarnya perbedaan secara adil.", word: "rentang", meaning: "jarak antara batas terendah dan tertinggi", purpose: "mengajak pembaca memeriksa unsur grafik secara kritis" },
  ],
};

function indonesianQuestions(grade, variant) {
  const level = grade <= 9 ? "SMP" : "SMA";
  const context = indonesianContexts[level][(grade + variant) % indonesianContexts[level].length];
  return [
    question("Gagasan utama", "Menentukan gagasan utama teks informatif", `Bacalah teks "${context.title}" berikut.\n${context.text}\nGagasan utama teks tersebut adalah ...`, [context.main, "Seluruh kegiatan harus dihentikan.", "Teks hanya berisi daftar nama orang.", "Masalah dalam teks tidak memiliki hubungan dengan pembaca."], "A", `Gagasan tersebut merangkum seluruh uraian, yaitu ${context.main.toLowerCase()}`),
    question("Informasi tersurat", "Menemukan informasi yang dinyatakan langsung", `Pernyataan yang sesuai dengan isi teks adalah ...`, [context.fact, "Kegiatan dalam teks tidak pernah dilakukan.", "Seluruh data dalam teks berasal dari perkiraan tanpa pengamatan.", "Teks menyatakan bahwa tidak ada manfaat yang diperoleh."], "A", `Pernyataan itu disebutkan secara langsung dalam teks.`),
    question("Inferensi", "Menyimpulkan informasi tersirat secara logis", `Simpulan tersirat yang paling logis adalah ...`, [context.inference, "Penulis menolak semua bentuk perubahan.", "Masalah akan selesai tanpa tindakan apa pun.", "Tokoh dalam teks tidak mempertimbangkan bukti."], "A", `Simpulan tersebut didukung oleh hubungan sebab-akibat dalam teks.`),
    question("Makna kata", "Menentukan makna kata berdasarkan konteks", `Makna kata "${context.word}" pada teks adalah ...`, [context.meaning, "kegiatan yang tidak memiliki tujuan", "nama tempat yang tidak dikenal", "tindakan yang selalu merugikan"], "A", `Dalam konteks kalimat, "${context.word}" berarti ${context.meaning}.`),
    question("Tujuan teks", "Mengidentifikasi tujuan komunikatif penulis", `Tujuan penulis menyajikan teks tersebut adalah ...`, [context.purpose, "menghibur pembaca dengan cerita fantasi", "mengiklankan barang tanpa menjelaskan manfaat", "memberikan petunjuk memasak"], "A", `Isi dan cara penyajian teks menunjukkan tujuan untuk ${context.purpose}.`),
    question("Kalimat efektif", "Memilih kalimat yang hemat dan logis", `Kalimat yang paling efektif adalah ...`, ["Siswa memeriksa sumber informasi sebelum membagikannya.", "Para siswa-siswa memeriksa sumber informasi terlebih dahulu sebelumnya.", "Sumber informasi diperiksa oleh siswa agar supaya dapat dibagikan.", "Siswa mereka memeriksa daripada sumber informasi."], "A", `Kalimat "Siswa memeriksa sumber informasi sebelum membagikannya" hemat, memiliki subjek-predikat jelas, dan tidak mengandung kata mubazir.`),
    question("Konjungsi", "Memilih konjungsi yang sesuai hubungan makna", `Kegiatan itu memerlukan biaya awal yang besar, ... manfaat jangka panjangnya tetap perlu dipertimbangkan.`, ["tetapi", "karena", "sehingga", "setelah"], "A", `Konjungsi "tetapi" menyatakan pertentangan antara biaya awal dan manfaat jangka panjang.`),
    question("Ejaan", "Menerapkan huruf kapital dan tanda baca", `Penulisan kalimat yang sesuai kaidah adalah ...`, ["Pada Jumat, siswa mengunjungi Perpustakaan Daerah Tegal.", "pada Jumat siswa mengunjungi perpustakaan daerah Tegal", "Pada jum'at, Siswa mengunjungi perpustakaan daerah tegal.", "Pada Jumat siswa, mengunjungi Perpustakaan daerah Tegal."], "A", `Kalimat "Pada Jumat, siswa mengunjungi Perpustakaan Daerah Tegal" menggunakan huruf kapital dan tanda baca secara tepat.`),
    question("Ringkasan", "Menilai ringkasan yang mewakili isi teks", `Ringkasan yang paling tepat untuk teks tersebut adalah ...`, [context.main, context.fact, `Kata "${context.word}" memiliki arti tertentu.`, "Teks membahas hal yang sama sekali berbeda dari judul."], "A", `Ringkasan harus memuat inti teks, bukan hanya satu rincian.`),
    question("Evaluasi argumen", "Menentukan bukti yang paling relevan untuk memperkuat gagasan", `Bukti yang paling tepat untuk memperkuat gagasan utama teks adalah ...`, ["data hasil pengamatan sebelum dan sesudah tindakan", "pendapat anonim tanpa alasan", "gambar yang tidak berkaitan dengan topik", "dugaan yang tidak dapat diperiksa"], "A", `Data perbandingan sebelum dan sesudah tindakan paling relevan untuk menunjukkan dampak.`),
  ];
}

function scienceQuestions(grade, variant) {
  if (grade <= 9) {
    const mass = 200 + 20 * variant;
    const volume = 100 + 10 * variant;
    const density = mass / volume;
    const force = 20 + 5 * variant;
    const distance = 4 + variant;
    return [
      question("Pengukuran", "Menentukan besaran dan satuan SI", `Pasangan besaran dan satuan SI yang tepat adalah ...`, ["panjang - meter", "massa - liter", "waktu - kilogram", "suhu - sekon"], "A", `Satuan SI untuk panjang adalah meter.`),
      question("Zat dan perubahannya", "Membedakan perubahan fisika dan kimia", `Peristiwa yang termasuk perubahan kimia adalah ...`, ["es mencair", "gula larut dalam air", "besi berkarat", "kertas dipotong"], "C", `Besi berkarat menghasilkan zat baru berupa oksida besi.`),
      question("Organisasi kehidupan", "Menghubungkan organel dengan fungsinya", `Organel sel yang berperan utama dalam menghasilkan energi melalui respirasi adalah ...`, ["ribosom", "mitokondria", "vakuola", "dinding sel"], "B", `Mitokondria merupakan tempat utama respirasi seluler penghasil energi.`),
      question("Ekosistem", "Menganalisis dampak perubahan populasi", `Dalam rantai makanan padi -> belalang -> katak -> ular, populasi katak menurun tajam. Dampak paling langsung adalah ...`, ["belalang cenderung meningkat", "padi langsung meningkat", "ular langsung meningkat", "seluruh organisme tetap"], "A", `Berkurangnya pemangsa belalang membuat populasi belalang cenderung meningkat.`),
      question("Massa jenis", "Menghitung massa jenis benda", `Benda bermassa ${mass} gram memiliki volume ${volume} cm3. Massa jenisnya adalah ...`, [`${density} g/cm3`, `${mass + volume} g/cm3`, `${volume / mass} g/cm3`, `${mass * volume} g/cm3`], "A", `Massa jenis = massa/volume = ${mass}/${volume} = ${density} g/cm3.`),
      question("Gaya dan usaha", "Menghitung usaha oleh gaya searah perpindahan", `Gaya ${force} N mendorong benda sejauh ${distance} m searah gaya. Usaha yang dilakukan adalah ...`, [`${force + distance} J`, `${force * distance} J`, `${force / distance} J`, `${distance / force} J`], "B", `Usaha W = F x s = ${force} x ${distance} = ${force * distance} J.`),
      question("Kalor", "Menjelaskan perpindahan kalor", `Gagang sendok logam ikut panas ketika ujungnya dicelupkan ke air panas. Peristiwa ini disebut ...`, ["konduksi", "konveksi", "radiasi", "evaporasi"], "A", `Kalor merambat melalui zat padat tanpa perpindahan partikel secara keseluruhan, yaitu konduksi.`),
      question("Listrik", "Menganalisis rangkaian listrik sederhana", `Dua lampu identik disusun seri. Jika salah satu lampu putus, yang terjadi adalah ...`, ["lampu lain tetap menyala lebih terang", "lampu lain ikut padam", "arus menjadi dua kali lipat", "baterai menghasilkan tegangan tak terbatas"], "B", `Rangkaian seri hanya memiliki satu jalur; ketika jalur terputus, arus berhenti di seluruh rangkaian.`),
      question("Pewarisan sifat", "Memprediksi hasil persilangan monohibrid sederhana", `Tanaman tinggi heterozigot (Tt) disilangkan dengan tanaman pendek (tt). Peluang keturunan berfenotipe pendek adalah ...`, ["0%", "25%", "50%", "100%"], "C", `Persilangan Tt x tt menghasilkan 1/2 Tt (tinggi) dan 1/2 tt (pendek).`),
      question("Metode ilmiah", "Menilai rancangan percobaan yang adil", `Untuk menguji pengaruh cahaya terhadap pertumbuhan kecambah, rancangan terbaik adalah ...`, ["mengubah cahaya dan jenis biji sekaligus", "menggunakan jenis biji, air, dan media sama; hanya cahaya yang dibedakan", "memberi jumlah air berbeda pada setiap kelompok", "mengamati satu kecambah tanpa kelompok pembanding"], "B", `Percobaan yang adil hanya mengubah variabel cahaya dan mengendalikan faktor lain.`),
    ];
  }

  const speed = 10 + 2 * variant;
  const time = 5 + variant;
  const current = 2 + variant;
  const voltage = 12 + 6 * variant;
  const dynamicsMass = 5 + variant;
  const dynamicsAcceleration = 6 + variant;
  const dynamicsForce = dynamicsMass * dynamicsAcceleration;
  return [
    question("Kinematika", "Menghitung jarak pada gerak lurus beraturan", `Sebuah benda bergerak dengan kecepatan tetap ${speed} m/s selama ${time} s. Jarak yang ditempuh adalah ...`, [`${speed + time} m`, `${speed * time} m`, `${speed / time} m`, `${time / speed} m`], "B", `Jarak s = v x t = ${speed} x ${time} = ${speed * time} m.`),
    question("Dinamika", "Menerapkan Hukum II Newton", `Gaya resultan ${dynamicsForce} N bekerja pada benda bermassa ${dynamicsMass} kg. Percepatannya adalah ...`, [`${dynamicsAcceleration} m/s2`, `${dynamicsForce * dynamicsMass} m/s2`, `${dynamicsForce + dynamicsMass} m/s2`, `${dynamicsMass / dynamicsForce} m/s2`], "A", `a = F/m = ${dynamicsForce}/${dynamicsMass} = ${dynamicsAcceleration} m/s2.`),
    question("Energi", "Menganalisis perubahan energi mekanik", `Sebuah bola jatuh bebas tanpa hambatan udara. Selama jatuh, ...`, ["energi potensial bertambah dan kinetik berkurang", "energi potensial berkurang dan kinetik bertambah", "keduanya selalu nol", "energi mekanik terus hilang"], "B", `Energi potensial berubah menjadi energi kinetik, sedangkan energi mekanik tetap.`),
    question("Listrik dinamis", "Menggunakan Hukum Ohm", `Sebuah hambatan diberi tegangan ${voltage} V dan dialiri arus ${current} A. Nilai hambatannya adalah ...`, [`${voltage * current} ohm`, `${voltage / current} ohm`, `${current / voltage} ohm`, `${voltage + current} ohm`], "B", `R = V/I = ${voltage}/${current} = ${voltage / current} ohm.`),
    question("Stoikiometri", "Menentukan jumlah partikel dari mol", `Sebanyak 2 mol zat mengandung jumlah partikel sebesar ...`, ["1,204 x 10^24", "6,02 x 10^23", "3,01 x 10^23", "2 x 10^23"], "A", `Jumlah partikel = 2 x 6,02 x 10^23 = 1,204 x 10^24.`),
    question("Asam basa", "Menginterpretasi nilai pH", `Larutan dengan pH 3 dibandingkan larutan pH 5 memiliki konsentrasi ion H+ ...`, ["2 kali lebih besar", "10 kali lebih besar", "100 kali lebih besar", "1000 kali lebih kecil"], "C", `Selisih dua satuan pH berarti konsentrasi H+ berbeda 10^2 = 100 kali.`),
    question("Genetika", "Menganalisis ekspresi gen", `Urutan proses ekspresi gen yang tepat adalah ...`, ["protein -> DNA -> RNA", "DNA -> RNA -> protein", "RNA -> protein -> DNA", "DNA -> protein -> RNA"], "B", `Informasi genetik ditranskripsi dari DNA menjadi RNA, lalu ditranslasi menjadi protein.`),
    question("Ekologi", "Menganalisis aliran energi ekosistem", `Jika produsen menyimpan 10.000 kJ dan efisiensi perpindahan energi sekitar 10%, energi yang tersedia bagi konsumen tingkat II kira-kira ...`, ["10.000 kJ", "1.000 kJ", "100 kJ", "10 kJ"], "C", `Konsumen I menerima sekitar 1.000 kJ dan konsumen II sekitar 100 kJ.`),
    question("Kesetimbangan", "Memprediksi pergeseran kesetimbangan", `Pada reaksi eksoterm A + B <-> C + kalor, kenaikan suhu akan menggeser kesetimbangan ke ...`, ["kanan untuk menghasilkan lebih banyak kalor", "kiri untuk menyerap kalor tambahan", "tidak berubah dalam kondisi apa pun", "arah yang selalu menghasilkan C"], "B", `Menurut asas Le Chatelier, penambahan kalor menggeser sistem ke arah yang menyerap kalor, yaitu ke kiri.`),
    question("Eksperimen", "Mengevaluasi validitas kesimpulan ilmiah", `Sebuah penelitian menyimpulkan pupuk X meningkatkan pertumbuhan hanya dari satu tanaman tanpa kontrol. Perbaikan terpenting adalah ...`, ["mengganti satuan tinggi", "menambah kelompok kontrol dan ulangan", "mengurangi lama pengamatan menjadi satu hari", "mengubah semua variabel sekaligus"], "B", `Kelompok kontrol dan ulangan diperlukan agar pengaruh pupuk dapat dibandingkan dan hasil lebih andal.`),
  ];
}

function uasMathQuestions(grade) {
  const questions = mathQuestions(grade, 5);
  if (grade >= 10) {
    const red = 4 + (grade % 3);
    const white = 6 + (grade % 2);
    const favorable = red * (red - 1);
    const outcomes = (red + white) * (red + white - 1);
    const divisor = gcd(favorable, outcomes);
    const simplifiedProbability = `${favorable / divisor}/${outcomes / divisor}`;
    questions[7] = question(
      "Peluang",
      "Menganalisis peluang kejadian tanpa pengembalian",
      `Sebuah kotak berisi ${red} bola merah dan ${white} bola putih. Dua bola diambil berurutan tanpa pengembalian. Peluang keduanya merah adalah ...`,
      [simplifiedProbability, `${red * red}/${(red + white) * (red + white)}`, `${red}/${red + white}`, `${2 * red}/${red + white}`],
      "A",
      `Peluangnya adalah ${red}/${red + white} x ${red - 1}/${red + white - 1} = ${favorable}/${outcomes} = ${simplifiedProbability}.`,
    );
  }
  return questions;
}

function uasEnglishQuestions(grade) {
  const questions = englishQuestions(grade, 5);
  const level = levelForGrade(grade);
  const context = englishContexts[level][(grade + 5) % englishContexts[level].length];
  questions[1] = question("Explicit information", "Locating stated information", `In the text "${context.title}", what object or activity is discussed?`, [context.object, "an unrelated sports match", "a cancelled flight", "a secret competition"], "A", `The text explicitly discusses ${context.object}.`, "Comprehending written texts");
  questions[3] = question("Reference", "Identifying a reference in context", `In a summary of "${context.title}", the phrase "this careful action" refers to ...`, [context.object, "an unrelated event outside the text", "a plan that was never mentioned", "the title without its content"], "A", `The phrase points to the main object or action discussed, namely ${context.object}.`, "Language features");
  questions[5] = level === "SD"
    ? question("Present continuous", "Using a verb for an action happening now", `Look! The students ... their assignment now.`, ["are checking", "checks", "checked", "will checked"], "A", `"Now" and a plural subject require "are checking".`, "Grammar in context")
    : question("Present perfect", "Using a verb for an action connected to the present", `The team ... three sources before publishing the report.`, ["has checked", "check", "was check", "checking"], "A", `The singular collective subject takes "has checked" for a completed action relevant to the present.`, "Grammar in context");
  questions[6] = question("Functional text", "Interpreting an announcement", `Announcement: "The final review session starts at 2 p.m. in Room 3. Bring your draft and source list." What must students bring?`, ["Their draft and source list", "Sports equipment", "A meal for the teacher", "Only an empty folder"], "A", `The announcement explicitly asks students to bring their draft and source list.`, "Interpreting functional texts");
  const attitudeQuestion = context.person === "the students"
    ? `Based on "${context.title}", what attitude do the students show?`
    : `Based on "${context.title}", what attitude does ${context.person} show?`;
  questions[7] = question("Inference", "Drawing a logical inference from a text", attitudeQuestion, ["Responsible and thoughtful", "Careless and unwilling to learn", "Hostile toward every activity", "Unaware of the stated goal"], "A", `The actions described show a responsible and thoughtful attitude.`, "Comprehending written texts");
  questions[8] = question("Text purpose", "Identifying communicative purpose", `Why does the writer present the text "${context.title}"?`, ["To explain an activity and the reason it matters", "To provide an unrelated recipe", "To advertise an imaginary product", "To prohibit readers from studying"], "A", `The paragraph explains the activity and its benefit or purpose.`, "Comprehending written texts");
  questions[9] = question("Response", "Selecting an appropriate response in an academic discussion", `A classmate says, "I found two sources with different conclusions." What is the best response?`, ["Let's compare their evidence and publication context.", "Choose the shorter source without reading it.", "Delete both sources immediately.", "Assume every conclusion is equally accurate."], "A", `Comparing evidence and context is a relevant critical response.`, "Interpersonal communication");
  return questions;
}

function uasIndonesianQuestions(grade) {
  const questions = indonesianQuestions(grade, 5);
  const level = grade <= 9 ? "SMP" : "SMA";
  const context = indonesianContexts[level][(grade + 5) % indonesianContexts[level].length];
  questions[1] = question("Informasi tersurat", "Menemukan bukti yang dinyatakan langsung", `Berdasarkan teks "${context.title}", informasi yang dinyatakan secara langsung adalah ...`, [context.fact, "Penulis menolak seluruh tindakan yang dibahas.", "Kegiatan tersebut tidak pernah menghasilkan perubahan.", "Semua tokoh mengabaikan bukti."], "A", `Informasi tersebut tertulis secara langsung dalam teks "${context.title}".`);
  questions[2] = question("Inferensi", "Menarik simpulan dari hubungan antargagasan", `Simpulan tersirat yang didukung oleh teks "${context.title}" adalah ...`, [context.inference, "Masalah akan selesai tanpa tindakan.", "Data tidak diperlukan dalam pengambilan keputusan.", "Setiap perubahan selalu merugikan."], "A", `Simpulan tersebut konsisten dengan fakta dan hubungan sebab-akibat pada teks.`);
  questions[3] = question("Makna kata", "Menafsirkan istilah dalam teks", `Dalam teks "${context.title}", kata "${context.word}" bermakna ...`, [context.meaning, "kegiatan tanpa tujuan", "tempat yang tidak dapat dijelaskan", "pendapat yang pasti salah"], "A", `Makna yang sesuai konteks adalah ${context.meaning}.`);
  questions[4] = question("Sudut pandang penulis", "Menilai sikap penulis terhadap topik", `Sikap penulis dalam teks "${context.title}" paling tepat digambarkan sebagai ...`, ["kritis dan berbasis alasan", "menolak topik tanpa penjelasan", "acuh terhadap dampak", "hanya menceritakan khayalan"], "A", `Penulis menyajikan fakta, dampak, dan alasan secara kritis.`);
  questions[5] = question("Kalimat efektif", "Memperbaiki kalimat tidak efektif", `Perbaikan paling tepat untuk kalimat "Para siswa-siswa melakukan pemeriksaan ulang kembali" adalah ...`, ["Para siswa melakukan pemeriksaan ulang.", "Para siswa-siswa melakukan pemeriksaan kembali lagi.", "Siswa para melakukan ulang pemeriksaan kembali.", "Pemeriksaan para siswa-siswa lakukan ulang kembali."], "A", `Kata "para" sudah menyatakan jamak dan "ulang" tidak perlu disertai "kembali".`);
  questions[6] = question("Konjungsi", "Menggunakan konjungsi sebab-akibat", `Data telah diperiksa dari beberapa sumber, ... kesimpulan laporan menjadi lebih dapat dipercaya.`, ["sehingga", "meskipun", "sebelum", "atau"], "A", `Konjungsi "sehingga" menyatakan akibat dari pemeriksaan data.`);
  questions[7] = question("Ejaan", "Menerapkan tanda baca pada kalimat majemuk", `Kalimat dengan tanda baca yang tepat adalah ...`, ["Laporan itu ringkas, tetapi bukti pendukungnya lengkap.", "Laporan itu, ringkas tetapi bukti pendukungnya lengkap.", "Laporan itu ringkas tetapi, bukti pendukungnya lengkap.", "Laporan itu ringkas tetapi bukti, pendukungnya lengkap."], "A", `Koma diletakkan sebelum konjungsi "tetapi" yang menghubungkan dua klausa setara.`);
  questions[8] = question("Sintesis", "Menyusun ringkasan dari gagasan utama dan bukti", `Ringkasan paling lengkap untuk teks "${context.title}" adalah ...`, [`${context.main} Bukti pentingnya adalah: ${context.fact.toLowerCase()}`, context.fact, `Teks hanya menjelaskan arti kata "${context.word}".`, "Teks tidak menyampaikan gagasan yang dapat diringkas."], "A", `Pilihan tersebut menggabungkan gagasan utama dengan bukti penting secara ringkas.`);
  questions[9] = question("Evaluasi informasi", "Memilih sumber penguat yang kredibel", `Sumber tambahan paling tepat untuk memeriksa isi teks "${context.title}" adalah ...`, ["laporan lembaga terkait yang memuat metode dan data", "unggahan anonim tanpa tanggal", "iklan yang tidak mencantumkan sumber", "komentar singkat tanpa bukti"], "A", `Laporan yang menjelaskan metode dan data lebih dapat diuji serta dipertanggungjawabkan.`);
  return questions;
}

function uasScienceQuestions(grade) {
  const questions = scienceQuestions(grade, 5);
  if (grade <= 9) {
    questions[0] = question("Pengukuran", "Memilih alat ukur sesuai objek", `Alat yang paling tepat untuk mengukur volume ${40 + grade} mL air adalah ...`, ["gelas ukur", "neraca", "termometer", "mistar"], "A", `Gelas ukur dirancang untuk mengukur volume cairan.`);
    questions[1] = question("Pemisahan campuran", "Menentukan urutan pemisahan campuran", `Campuran garam dan pasir paling tepat dipisahkan dengan urutan ...`, ["melarutkan garam, menyaring pasir, lalu menguapkan air", "menyaring campuran kering lalu membekukannya", "memanaskan pasir hingga mencair", "menggunakan magnet untuk menarik garam"], "A", `Garam larut dalam air, pasir tertahan saat penyaringan, dan garam diperoleh kembali melalui penguapan.`);
    questions[2] = question("Sistem organ", "Menghubungkan struktur dengan fungsi", `Alveolus pada paru-paru memiliki dinding tipis dan banyak kapiler agar ...`, ["pertukaran oksigen dan karbon dioksida berlangsung efisien", "makanan dapat dicerna", "darah membeku lebih cepat", "tulang menghasilkan gerak"], "A", `Dinding tipis dan jaringan kapiler memperpendek jarak difusi gas.`);
    questions[3] = question("Ekosistem", "Menganalisis pencemaran perairan", `Limpasan pupuk berlebih masuk ke danau dan memicu ledakan alga. Dampak lanjutan yang paling mungkin adalah ...`, ["oksigen terlarut menurun ketika alga membusuk", "air selalu menjadi lebih jernih", "semua ikan mendapat lebih banyak oksigen", "jumlah pengurai langsung menjadi nol"], "A", `Penguraian biomassa alga menggunakan oksigen sehingga kadar oksigen terlarut dapat turun.`);
    questions[6] = question("Kalor", "Menganalisis konveksi pada kehidupan sehari-hari", `Udara panas di atas api bergerak naik terutama karena ...`, ["massa jenisnya menurun sehingga terjadi konveksi", "udara panas berubah menjadi padat", "kalor hanya dapat merambat melalui logam", "gravitasi berhenti bekerja"], "A", `Pemanasan membuat udara memuai dan massa jenisnya menurun sehingga bergerak naik.`);
    questions[7] = question("Listrik", "Membandingkan rangkaian seri dan paralel", `Keunggulan pemasangan lampu rumah secara paralel adalah ...`, ["lampu lain tetap menyala ketika satu lampu putus", "semua lampu pasti lebih redup", "rangkaian hanya memiliki satu jalur", "tegangan sumber menjadi nol"], "A", `Setiap cabang paralel memiliki jalur arus sendiri.`);
    questions[8] = question("Sistem reproduksi", "Menjelaskan fungsi hormon", `Pada siklus menstruasi, peningkatan hormon FSH terutama merangsang ...`, ["pematangan folikel di ovarium", "pembekuan darah", "pertukaran gas di alveolus", "pencernaan protein di lambung"], "A", `FSH berperan merangsang pertumbuhan dan pematangan folikel.`);
    questions[9] = question("Metode ilmiah", "Mengidentifikasi variabel terikat", `Dalam percobaan pengaruh suhu air terhadap waktu larut gula, variabel terikatnya adalah ...`, ["waktu yang diperlukan gula untuk larut", "suhu air", "jenis gula yang dibuat berbeda", "ukuran wadah yang diubah-ubah"], "A", `Variabel terikat adalah hasil yang diukur, yaitu waktu pelarutan.`);
    return questions;
  }

  const mass = 2 + (grade % 3);
  const velocity = 4 + (grade % 4);
  questions[2] = question("Momentum", "Menghitung momentum benda", `Benda bermassa ${mass} kg bergerak dengan kecepatan ${velocity} m/s. Momentumnya adalah ...`, [`${mass * velocity} kg m/s`, `${mass + velocity} kg m/s`, `${mass / velocity} kg m/s`, `${velocity / mass} kg m/s`], "A", `Momentum p = m x v = ${mass} x ${velocity} = ${mass * velocity} kg m/s.`);
  questions[4] = question("Ikatan kimia", "Menganalisis pembentukan ikatan ion", `Ikatan ion pada NaCl terbentuk karena ...`, ["serah terima elektron dari Na kepada Cl", "pemakaian bersama elektron secara seimbang", "penggabungan dua inti atom", "perpindahan neutron dari Cl ke Na"], "A", `Natrium melepaskan satu elektron dan klorin menerimanya sehingga terbentuk ion berlawanan muatan.`);
  questions[5] = question("Redoks", "Menentukan spesies yang mengalami oksidasi", `Pada reaksi Zn + Cu2+ -> Zn2+ + Cu, spesies yang mengalami oksidasi adalah ...`, ["Zn", "Cu2+", "Zn2+", "Cu"], "A", `Zn melepas elektron dan bilangan oksidasinya naik dari 0 menjadi +2.`);
  questions[6] = question("Enzim", "Menganalisis pengaruh suhu terhadap kerja enzim", `Aktivitas enzim menurun tajam pada suhu yang terlalu tinggi karena ...`, ["struktur aktif enzim dapat terdenaturasi", "jumlah substrat selalu menjadi nol", "enzim berubah menjadi unsur logam", "reaksi tidak memerlukan energi aktivasi"], "A", `Suhu terlalu tinggi dapat mengubah struktur tiga dimensi dan sisi aktif enzim.`);
  questions[7] = question("Fotosintesis", "Menganalisis faktor pembatas", `Intensitas cahaya terus dinaikkan, tetapi laju fotosintesis tidak lagi bertambah. Penjelasan paling tepat adalah ...`, ["faktor lain seperti CO2 atau suhu menjadi pembatas", "cahaya tidak pernah diperlukan", "klorofil berubah menjadi oksigen", "seluruh stomata pasti hilang"], "A", `Saat cahaya tidak lagi membatasi, faktor lain dapat menentukan laju maksimum fotosintesis.`);
  questions[8] = question("Gas ideal", "Menerapkan hubungan tekanan dan volume", `Gas dalam wadah tertutup bersuhu tetap memiliki volume 4 L pada tekanan 2 atm. Jika volumenya menjadi 2 L, tekanannya adalah ...`, ["4 atm", "2 atm", "1 atm", "8 atm"], "A", `Pada suhu tetap, P1V1 = P2V2; 2 x 4 = P2 x 2 sehingga P2 = 4 atm.`);
  questions[9] = question("Eksperimen", "Menilai kebutuhan replikasi", `Pengulangan dalam eksperimen terutama diperlukan untuk ...`, ["menilai konsistensi hasil dan mengurangi pengaruh kesalahan acak", "memastikan hipotesis selalu benar", "menghilangkan kebutuhan kelompok kontrol", "mengubah lebih banyak variabel sekaligus"], "A", `Replikasi membantu melihat konsistensi dan memperkirakan variasi acak.`);
  return questions;
}

function buildQuestions(subject, grade, variant) {
  if (variant === 5 && subject === "Matematika") return uasMathQuestions(grade);
  if (variant === 5 && subject === "Bahasa Indonesia") return uasIndonesianQuestions(grade);
  if (variant === 5 && subject === "Bahasa Inggris") return uasEnglishQuestions(grade);
  if (variant === 5 && subject === "IPA") return uasScienceQuestions(grade);
  if (subject === "Matematika") return mathQuestions(grade, variant);
  if (subject === "Bahasa Indonesia") return indonesianQuestions(grade, variant);
  if (subject === "Bahasa Inggris") return englishQuestions(grade, variant);
  if (subject === "IPA") return scienceQuestions(grade, variant);
  throw new Error(`Generator belum tersedia untuk ${subject}`);
}

const subjectCode = {
  Matematika: "MAT",
  "Bahasa Indonesia": "BIND",
  "Bahasa Inggris": "BING",
  IPA: "IPA",
};

function rotateOptions(raw, index, seed) {
  const shift = (index + seed) % 4;
  const oldAnswerIndex = LETTERS.indexOf(raw.answer);
  return {
    ...raw,
    options: [...raw.options.slice(shift), ...raw.options.slice(0, shift)],
    answer: LETTERS[(oldAnswerIndex - shift + 4) % 4],
  };
}

function makeSet(className, subject, type, stage = null) {
  const grade = gradeNumber(className);
  const classCode = className.replace(/\s+/g, "");
  const suffix = type === "UTS" ? "UTS" : type === "UAS" ? "UAS" : `TO${stage}`;
  const setId = `${suffix}-${classCode}-${subjectCode[subject]}`;
  const variant = type === "UAS" ? 5 : stage ?? 0;
  const rawQuestions = buildQuestions(subject, grade, variant);
  const questions = rawQuestions.map((raw, index) => {
    const rotated = rotateOptions(raw, index, grade + variant);
    return {
      questionId: `${setId}-${String(index + 1).padStart(3, "0")}`,
      number: index + 1,
      competency: rotated.competency,
      topic: rotated.topic,
      indicator: rotated.indicator,
      cognitiveLevel: COGNITIVE[index],
      difficulty: DIFFICULTIES[index],
      question: rotated.stem,
      options: Object.fromEntries(LETTERS.map((letter, optionIndex) => [letter, rotated.options[optionIndex]])),
      correctAnswer: rotated.answer,
      explanation: rotated.explanation,
      reviewStatus: REVIEW_STATUS,
      reviewerNotes: "",
    };
  });

  return {
    schemaVersion: "1.0.0",
    questionSetId: setId,
    assessmentType: type,
    stage,
    className,
    grade,
    phase: phaseForGrade(grade),
    subject,
    questionCount: questions.length,
    suggestedDurationMinutes: 60,
    reviewStatus: REVIEW_STATUS,
    curriculumNote: "Draft orisinal berbasis kompetensi umum Kurikulum Merdeka; cocokkan kembali dengan ATP dan materi yang telah diajarkan di cabang.",
    questions,
  };
}

const questionSets = [
  ...utsTargets.map(([className, subject]) => makeSet(className, subject, "UTS")),
  ...utsTargets.map(([className, subject]) => makeSet(className, subject, "UAS")),
  ...tryoutTargets.flatMap(([className, subject]) => [1, 2, 3].map((stage) => makeSet(className, subject, "Tryout", stage))),
];

const branches = [
  { code: "SLW", name: "Slawi" },
  { code: "ADW", name: "Adiwerna" },
];

const packages = questionSets.flatMap((set) => branches.map((branch) => ({
  packageId: `${branch.code}-${set.questionSetId}`,
  branchCode: branch.code,
  branch: branch.name,
  className: set.className,
  subject: set.subject,
  assessmentType: set.assessmentType,
  stage: set.stage,
  questionSetId: set.questionSetId,
  questionCount: set.questionCount,
  suggestedDurationMinutes: set.suggestedDurationMinutes,
  status: REVIEW_STATUS,
})));

const blueprint = questionSets.flatMap((set) => set.questions.map((item) => ({
  questionSetId: set.questionSetId,
  questionId: item.questionId,
  assessmentType: set.assessmentType,
  stage: set.stage,
  className: set.className,
  phase: set.phase,
  subject: set.subject,
  number: item.number,
  competency: item.competency,
  topic: item.topic,
  indicator: item.indicator,
  cognitiveLevel: item.cognitiveLevel,
  difficulty: item.difficulty,
  reviewStatus: item.reviewStatus,
})));

function validate() {
  const errors = [];
  if (questionSets.length !== 61) errors.push(`Jumlah set ${questionSets.length}, seharusnya 61.`);
  if (packages.length !== 122) errors.push(`Jumlah paket ${packages.length}, seharusnya 122.`);
  if (blueprint.length !== 610) errors.push(`Jumlah soal ${blueprint.length}, seharusnya 610.`);

  const setIds = new Set();
  const questionIds = new Set();
  for (const set of questionSets) {
    if (setIds.has(set.questionSetId)) errors.push(`ID set duplikat: ${set.questionSetId}`);
    setIds.add(set.questionSetId);
    if (set.questions.length !== 10) errors.push(`${set.questionSetId} tidak berisi 10 soal.`);
    const stems = new Set();
    const difficultyCounts = { Mudah: 0, Sedang: 0, Sulit: 0 };
    for (const item of set.questions) {
      if (questionIds.has(item.questionId)) errors.push(`ID soal duplikat: ${item.questionId}`);
      questionIds.add(item.questionId);
      if (stems.has(item.question)) errors.push(`Teks soal duplikat dalam ${set.questionSetId}.`);
      stems.add(item.question);
      if (!LETTERS.includes(item.correctAnswer)) errors.push(`Kunci tidak valid: ${item.questionId}`);
      const optionValues = Object.values(item.options);
      if (optionValues.length !== 4 || new Set(optionValues).size !== 4) errors.push(`Opsi tidak unik: ${item.questionId}`);
      if (!item.options[item.correctAnswer]) errors.push(`Kunci tidak memiliki opsi: ${item.questionId}`);
      if (!item.explanation.trim()) errors.push(`Pembahasan kosong: ${item.questionId}`);
      difficultyCounts[item.difficulty] += 1;
    }
    if (difficultyCounts.Mudah !== 3 || difficultyCounts.Sedang !== 5 || difficultyCounts.Sulit !== 2) {
      errors.push(`Distribusi kesulitan salah: ${set.questionSetId}`);
    }
  }
  for (const uasSet of questionSets.filter((set) => set.assessmentType === "UAS")) {
    const utsSet = questionSets.find((set) => set.assessmentType === "UTS" && set.className === uasSet.className && set.subject === uasSet.subject);
    const utsStems = new Set(utsSet?.questions.map((item) => item.question) ?? []);
    const duplicateCount = uasSet.questions.filter((item) => utsStems.has(item.question)).length;
    if (duplicateCount > 0) errors.push(`${uasSet.questionSetId} memiliki ${duplicateCount} soal yang sama persis dengan UTS.`);
  }
  if (errors.length) throw new Error(errors.join("\n"));
}

const references = [
  {
    title: "Portal Kurikulum Kemendikbudristek",
    url: "https://kurikulum.kemdikbud.go.id/",
    use: "Acuan umum Kurikulum Merdeka dan Capaian Pembelajaran.",
  },
  {
    title: "Referensi Capaian Pembelajaran",
    url: "https://guru.kemdikbud.go.id/kurikulum/referensi-penerapan/capaian-pembelajaran/",
    use: "Rujukan pemetaan kompetensi berdasarkan fase dan mata pelajaran.",
  },
];

function readmeText() {
  return `# Bank Soal Review UTS, UAS, dan Tryout

Folder ini berisi **draft soal orisinal untuk direview guru**, bukan data yang sudah dimasukkan ke database.

## Cakupan

- 61 set soal unik: 17 UTS, 17 UAS, dan 27 Tryout.
- 610 soal pilihan ganda: 10 soal per set.
- 122 paket cabang: setiap set dipetakan untuk Slawi dan Adiwerna melalui \`manifest.json\`.
- UTS: kelas 4, 5, 7, 8, 10, dan 11 sesuai mata pelajaran aktif di sistem.
- UAS: kelas 4, 5, 7, 8, 10, dan 11 sesuai mata pelajaran aktif di sistem.
- Tryout 1-3: kelas 6, 9, dan 12 sesuai mata pelajaran aktif di sistem.
- Mata pelajaran: Matematika, Bahasa Indonesia, Bahasa Inggris, dan IPA sesuai kombinasi kelas yang tersedia.

## Struktur

- \`all-question-sets.json\`: seluruh set beserta soal, opsi, kunci, dan pembahasan.
- \`manifest.json\`: pemetaan paket ke cabang Slawi dan Adiwerna.
- \`blueprint.json\`: kisi-kisi per nomor soal.
- \`validation-report.json\`: hasil pemeriksaan struktur, jumlah, opsi, kunci, dan distribusi kesulitan.
- \`uts/\` dan \`tryout/\`: file terpisah agar mudah direview per kelas dan pelajaran.

## Standar Penyusunan

- Pemetaan fase: Fase B (kelas 3-4), Fase C (kelas 5-6), Fase D (kelas 7-9), Fase E (kelas 10), dan Fase F (kelas 11-12).
- Distribusi tiap set: 3 mudah, 5 sedang, dan 2 sulit.
- Level kognitif tiap set mencakup C2, C3, dan C4.
- Semua bacaan, konteks, angka, dan pertanyaan disusun orisinal untuk bank soal ini.
- Soal UAS dibedakan dari soal UTS pada kombinasi kelas dan mata pelajaran yang sama.
- Soal belum boleh dipublikasikan sebelum guru memeriksa kesesuaian dengan ATP, urutan materi, istilah, kunci, serta tingkat kesulitan siswa.

## Alur Review Guru

1. Buka file kelas dan mata pelajaran yang akan diperiksa.
2. Periksa indikator, pertanyaan, empat opsi, kunci, dan pembahasan.
3. Isi \`reviewerNotes\` bila perlu revisi dan ubah \`reviewStatus\` setelah disetujui.
4. Untuk Tryout, pastikan soal tahap 1-3 sesuai progres materi di cabang.
5. Impor ke sistem hanya setelah seluruh soal pada paket berstatus disetujui.

## Catatan Penting

Bank soal ini adalah titik awal yang terstruktur, bukan pengganti validasi akademik guru. Situs rujukan pemerintah tidak dapat diverifikasi otomatis saat pembuatan, sehingga tautan dan pemetaan kompetensi perlu dicek kembali ketika guru melakukan review.

## Referensi Umum

${references.map((item) => `- ${item.title}: ${item.url}`).join("\n")}
`;
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  validate();
  const answerDistribution = Object.fromEntries(LETTERS.map((letter) => [letter, questionSets.flatMap((set) => set.questions).filter((item) => item.correctAnswer === letter).length]));
  const difficultyDistribution = Object.fromEntries(["Mudah", "Sedang", "Sulit"].map((level) => [level, blueprint.filter((item) => item.difficulty === level).length]));
  const validationReport = {
    generatedAt: "2026-06-20",
    passed: true,
    checks: {
      uniqueQuestionSetIds: true,
      uniqueQuestionIds: true,
      tenQuestionsPerSet: true,
      fourUniqueOptionsPerQuestion: true,
      validCorrectAnswerReferences: true,
      nonEmptyExplanations: true,
      noExactUtsUasQuestionOverlap: true,
      difficultyDistributionPerSet: "3 Mudah, 5 Sedang, 2 Sulit",
    },
    totals: { questionSets: questionSets.length, questions: blueprint.length, branchPackages: packages.length },
    answerDistribution,
    difficultyDistribution,
  };
  await fs.mkdir(ROOT, { recursive: true });
  await writeJson(path.join(ROOT, "all-question-sets.json"), {
    schemaVersion: "1.0.0",
    generatedAt: "2026-06-20",
    reviewStatus: REVIEW_STATUS,
    references,
    questionSets,
  });
  await writeJson(path.join(ROOT, "manifest.json"), {
    schemaVersion: "1.0.0",
    generatedAt: "2026-06-20",
    packageCount: packages.length,
    packages,
  });
  await writeJson(path.join(ROOT, "blueprint.json"), {
    schemaVersion: "1.0.0",
    generatedAt: "2026-06-20",
    rowCount: blueprint.length,
    rows: blueprint,
  });
  await writeJson(path.join(ROOT, "validation-report.json"), validationReport);

  for (const set of questionSets) {
    const typeFolder = set.assessmentType.toLowerCase();
    const classFolder = slug(set.className);
    const fileSuffix = set.assessmentType === "Tryout" ? `tryout-${set.stage}` : set.assessmentType.toLowerCase();
    const fileName = `${slug(set.subject)}-${fileSuffix}.json`;
    await writeJson(path.join(ROOT, typeFolder, classFolder, fileName), set);
  }

  await fs.writeFile(path.join(ROOT, "README.md"), readmeText(), "utf8");
  console.log(JSON.stringify({ questionSets: questionSets.length, questions: blueprint.length, packages: packages.length }, null, 2));
}

await main();
