/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Foundational Indonesian Constitutional Law Knowledge Base for Server AI Agents
 * Conforms to PRD Section 12.4 (Traceability with versions) and Section 16 (Anti-Hallucination)
 */

export interface LegalKnowledgeItem {
  id: string;
  sumber: 'jdih_mk' | 'jdihn' | 'jdih_ma' | 'seed_manual' | 'pasal_id';
  jenis_dokumen: 'uud' | 'uu' | 'pp' | 'pmk' | 'perpres' | 'perda' | 'putusan_mk' | 'putusan_ma';
  nomor: string;
  tahun: string;
  judul: string;
  status_berlaku?: 'berlaku' | 'dicabut' | 'diubah';
  version_id: string;
  isi_teks: string;
  keywords?: string[];
  ringkasan_kaidah?: string;
  frbr_uri?: string;
  reader_url?: string;
}

export const LEGAL_KNOWLEDGE_BASE: LegalKnowledgeItem[] = [
  // ==========================================
  // 1. UUD 1945 (BATU UJI & KEWENANGAN PERADILAN)
  // ==========================================
  {
    id: 'uud-1945-pasal-1-3',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 1 ayat (3)',
    tahun: '1945',
    judul: 'UUD 1945: Prinsip Negara Hukum (Rechtsstaat)',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-1-3-v1',
    isi_teks: 'Negara Indonesia adalah negara hukum.',
    keywords: ['negara hukum', 'rechtsstaat', 'rule of law', 'kesewenang-wenangan', 'pasal 1 ayat 3', 'demokrasi konstitusional']
  },
  {
    id: 'uud-1945-pasal-24c',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 24C ayat (1)',
    tahun: '1945',
    judul: 'UUD 1945: Kewenangan Mahkamah Konstitusi Menguji Undang-Undang',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-1945-24c-1',
    isi_teks: 'Mahkamah Konstitusi berwenang mengadili pada tingkat pertama dan terakhir yang putusannya bersifat final untuk menguji undang-undang terhadap Undang-Undang Dasar, memutus sengketa kewenangan lembaga negara yang kewenangannya diberikan oleh Undang-Undang Dasar, memutus pembubaran partai politik, dan memutus perselisihan tentang hasil pemilihan umum.',
    keywords: ['kewenangan mk', 'uji uu', 'undang-undang', 'uud 1945', 'konstitusionalitas', 'pasal 24c', 'judicial review']
  },
  {
    id: 'uud-1945-pasal-24a',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 24A ayat (1)',
    tahun: '1945',
    judul: 'UUD 1945: Kewenangan Mahkamah Agung Menguji Peraturan di Bawah UU',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-1945-24a-1',
    isi_teks: 'Mahkamah Agung berwenang mengadili pada tingkat kasasi, menguji peraturan perundang-undangan di bawah undang-undang terhadap undang-undang, dan mempunyai wewenang lainnya yang diberikan oleh undang-undang.',
    keywords: ['kewenangan ma', 'uji materiil peraturan', 'peraturan pemerintah', 'perpres', 'permen', 'perda', 'di bawah undang-undang', 'pasal 24a']
  },
  {
    id: 'uud-1945-pasal-27-1',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 27 ayat (1)',
    tahun: '1945',
    judul: 'UUD 1945: Persamaan Kedudukan di Dalam Hukum dan Pemerintahan',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-27-1-v1',
    isi_teks: 'Segala warga negara bersamaan kedudukannya di dalam hukum dan pemerintahan dan wajib menjunjung hukum dan pemerintahan itu dengan tidak ada kecualinya.',
    keywords: ['persamaan di hadapan hukum', 'equality before the law', 'nondiskriminasi', 'perlakuan sama', 'pasal 27']
  },
  {
    id: 'uud-1945-pasal-27-2',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 27 ayat (2)',
    tahun: '1945',
    judul: 'UUD 1945: Hak atas Pekerjaan dan Penghidupan yang Layak',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-27-2-v1',
    isi_teks: 'Tiap-tiap warga negara berhak atas pekerjaan dan penghidupan yang layak bagi kemanusiaan.',
    keywords: ['pekerjaan layak', 'penghidupan layak', 'buruh', 'tenaga kerja', 'upah', 'phk', 'pasal 27 ayat 2']
  },
  {
    id: 'uud-1945-pasal-28a',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 28A',
    tahun: '1945',
    judul: 'UUD 1945: Hak Mempertahankan Hidup dan Kehidupan',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-28a-v1',
    isi_teks: 'Setiap orang berhak untuk hidup serta berhak mempertahankan hidup dan kehidupannya.',
    keywords: ['hak hidup', 'mempertahankan hidup', 'ancaman jiwa', 'keselamatan', 'pasal 28a']
  },
  {
    id: 'uud-1945-pasal-28c-1',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 28C ayat (1)',
    tahun: '1945',
    judul: 'UUD 1945: Hak Mengembangkan Diri dan Pendidikan',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-28c1-1',
    isi_teks: 'Setiap orang berhak mengembangkan diri melalui pemenuhan kebutuhan dasarnya, berhak mendapat pendidikan dan memperoleh manfaat dari ilmu pengetahuan dan teknologi, seni dan budaya, demi meningkatkan kualitas hidupnya dan demi kesejahteraan umat manusia.',
    keywords: ['pendidikan', 'pengembangan diri', 'ilmu pengetahuan', 'kualitas hidup', 'ukt', 'biaya kuliah', 'pasal 28c']
  },
  {
    id: 'uud-1945-pasal-28d-1',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 28D ayat (1)',
    tahun: '1945',
    judul: 'UUD 1945: Hak atas Kepastian Hukum yang Adil',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-28d1-1',
    isi_teks: 'Setiap orang berhak atas pengakuan, jaminan, perlindungan, dan kepastian hukum yang adil serta perlakuan yang sama dihadapan hukum.',
    keywords: ['kepastian hukum yang adil', 'perlakuan sama', 'pasal 28d', 'diskriminasi hukum', 'batu uji umum', 'norma multitafsir', 'kesewenang-wenangan']
  },
  {
    id: 'uud-1945-pasal-28d-2',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 28D ayat (2)',
    tahun: '1945',
    judul: 'UUD 1945: Hak Bekerja serta Mendapat Imbalan dan Perlakuan Adil',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-28d2-v1',
    isi_teks: 'Setiap orang berhak untuk bekerja serta mendapat imbalan dan perlakuan yang adil dan layak dalam hubungan kerja.',
    keywords: ['imbalan adil', 'hubungan kerja', 'ketenagakerjaan', 'pesangon', 'outsourcing', 'cipta kerja', 'upah minimum', 'pasal 28d ayat 2']
  },
  {
    id: 'uud-1945-pasal-28e-3',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 28E ayat (3)',
    tahun: '1945',
    judul: 'UUD 1945: Hak Kebebasan Berserikat, Berkumpul, dan Mengeluarkan Pendapat',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-28e3-1',
    isi_teks: 'Setiap orang berhak atas kebebasan berserikat, berkumpul, dan mengeluarkan pendapat.',
    keywords: ['kebebasan berpendapat', 'kebebasan berserikat', 'demonstrasi', 'ekspresi', 'pasal 28e', 'serikat buruh', 'pembungkaman', 'kritik']
  },
  {
    id: 'uud-1945-pasal-28f',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 28F',
    tahun: '1945',
    judul: 'UUD 1945: Hak Berkomunikasi dan Memperoleh Informasi',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-28f-v1',
    isi_teks: 'Setiap orang berhak untuk berkomunikasi dan memperoleh informasi untuk mengembangkan pribadi dan lingkungan sosialnya, serta berhak untuk mencari, memperoleh, memiliki, menyimpan, mengolah, dan menyampaikan informasi dengan menggunakan segala jenis saluran yang tersedia.',
    keywords: ['keterbukaan informasi', 'kebebasan pers', 'internet', 'sensor', 'ite', 'transparansi publik', 'pasal 28f']
  },
  {
    id: 'uud-1945-pasal-28g-1',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 28G ayat (1)',
    tahun: '1945',
    judul: 'UUD 1945: Hak Perlindungan Diri Pribadi, Kehormatan, dan Rasa Aman',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-28g-1-v1',
    isi_teks: 'Setiap orang berhak atas perlindungan diri pribadi, keluarga, kehormatan, martabat, dan harta benda yang dibawah kekuasaannya, serta berhak atas rasa aman dan perlindungan dari ancaman ketakutan untuk berbuat atau tidak berbuat sesuatu yang merupakan hak asasi.',
    keywords: ['perlindungan diri', 'data pribadi', 'rasa aman', 'intimidasi', 'martabat', 'harta benda', 'pasal 28g']
  },
  {
    id: 'uud-1945-pasal-28h-1',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 28H ayat (1)',
    tahun: '1945',
    judul: 'UUD 1945: Hak Hidup Sejahtera dan Lingkungan Hidup yang Baik dan Sehat',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-28h1-1',
    isi_teks: 'Setiap orang berhak hidup sejahtera lahir dan batin, bertempat tinggal, dan mendapatkan lingkungan hidup yang baik dan sehat serta berhak memperoleh pelayanan kesehatan.',
    keywords: ['lingkungan hidup', 'kesehatan', 'tempat tinggal', 'tambang', 'pencemaran', 'sejahtera lahir batin', 'amdal', 'iklim', 'pasal 28h']
  },
  {
    id: 'uud-1945-pasal-28i-2',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 28I ayat (2)',
    tahun: '1945',
    judul: 'UUD 1945: Hak Bebas dari Perlakuan Diskriminatif',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-28i-2-v1',
    isi_teks: 'Setiap orang berhak bebas dari perlakuan yang bersifat diskriminatif atas dasar apa pun dan berhak mendapatkan perlindungan terhadap perlakuan yang bersifat diskriminatif itu.',
    keywords: ['bebas diskriminasi', 'perlakuan diskriminatif', 'minoritas', 'kesetaraan gender', 'disabilitas', 'pasal 28i']
  },
  {
    id: 'uud-1945-pasal-33-3-4',
    sumber: 'seed_manual',
    jenis_dokumen: 'uud',
    nomor: 'Pasal 33 ayat (3) dan (4)',
    tahun: '1945',
    judul: 'UUD 1945: Penguasaan Sumber Daya Alam untuk Kemakmuran Rakyat dan Demokrasi Ekonomi',
    status_berlaku: 'berlaku',
    version_id: 'v-uud-33-34-v1',
    isi_teks: '(3) Bumi dan air dan kekayaan alam yang terkandung di dalamnya dikuasai oleh negara dan dipergunakan untuk sebesar-besar kemakmuran rakyat. (4) Perekonomian nasional diselenggarakan berdasar atas demokrasi ekonomi dengan prinsip kebersamaan, efisiensi berkeadilan, berkelanjutan, berwawasan lingkungan, kemandirian, serta dengan menjaga keseimbangan kemajuan dan kesatuan ekonomi nasional.',
    keywords: ['sumber daya alam', 'kemakmuran rakyat', 'demokrasi ekonomi', 'agraria', 'tanah', 'tambang', 'hutan', 'pasal 33']
  },

  // ==========================================
  // 2. UU NO. 24/2003 JO. UU NO. 7/2020 (UU MK)
  // ==========================================
  {
    id: 'uu-mk-pasal-10',
    sumber: 'jdih_mk',
    jenis_dokumen: 'uu',
    nomor: 'Pasal 10 ayat (1)',
    tahun: '2003',
    judul: 'UU Mahkamah Konstitusi: Yurisdiksi Pengujian Undang-Undang',
    status_berlaku: 'berlaku',
    version_id: 'v-uumk-10-v1',
    isi_teks: 'Mahkamah Konstitusi berwenang mengadili pada tingkat pertama dan terakhir yang putusannya bersifat final untuk: a. menguji undang-undang terhadap Undang-Undang Dasar Negara Republik Indonesia Tahun 1945; b. memutus sengketa kewenangan lembaga negara yang kewenangannya diberikan oleh Undang-Undang Dasar Negara Republik Indonesia Tahun 1945; c. memutus pembubaran partai politik; dan d. memutus perselisihan tentang hasil pemilihan umum.',
    keywords: ['pasal 10 uu mk', 'kewenangan mk', 'final and binding', 'tingkat pertama dan terakhir', 'pengujian uu']
  },
  {
    id: 'uu-mk-pasal-51',
    sumber: 'jdih_mk',
    jenis_dokumen: 'uu',
    nomor: 'Pasal 51 ayat (1)',
    tahun: '2003',
    judul: 'UU No. 24/2003 jo. UU No. 7/2020: Syarat Kedudukan Hukum (Legal Standing) Pemohon',
    status_berlaku: 'berlaku',
    version_id: 'v-uumk-51-1',
    isi_teks: 'Pemohon adalah pihak yang menganggap hak dan/atau kewenangan konstitusionalnya dirugikan oleh berlakunya undang-undang, yaitu: a. perorangan warga negara Indonesia; b. kesatuan masyarakat hukum adat sepanjang masih hidup dan sesuai dengan perkembangan masyarakat dan prinsip Negara Kesatuan Republik Indonesia yang diatur dalam undang-undang; c. badan hukum publik atau privat; atau d. lembaga negara.',
    keywords: ['legal standing', 'kedudukan hukum', 'perorangan wni', 'masyarakat adat', 'badan hukum', 'hak konstitusional', 'pasal 51']
  },
  {
    id: 'uu-mk-pasal-51-2-3',
    sumber: 'jdih_mk',
    jenis_dokumen: 'uu',
    nomor: 'Pasal 51 ayat (2) dan (3)',
    tahun: '2003',
    judul: 'UU Mahkamah Konstitusi: Muatan Kerugian Konstitusional dalam Permohonan',
    status_berlaku: 'berlaku',
    version_id: 'v-uumk-51-23-v1',
    isi_teks: '(2) Pemohon wajib menguraikan dengan jelas dalam permohonannya mengenai hak dan/atau kewenangan konstitusionalnya yang dirugikan oleh berlakunya undang-undang yang dimohonkan untuk diuji. (3) Permohonan pengujian undang-undang diajukan secara tertulis dalam bahasa Indonesia kepada Mahkamah Konstitusi.',
    keywords: ['uraian kerugian', 'permohonan tertulis', 'bahasa indonesia', 'syarat permohonan', 'pasal 51 ayat 2']
  },
  {
    id: 'uu-mk-pasal-60',
    sumber: 'jdih_mk',
    jenis_dokumen: 'uu',
    nomor: 'Pasal 60 UU No. 24/2003',
    tahun: '2003',
    judul: 'Asas Ne Bis In Idem dalam Pengujian Undang-Undang',
    status_berlaku: 'berlaku',
    version_id: 'v-uumk-60-1',
    isi_teks: 'Terhadap materi muatan ayat, pasal, dan/atau bagian dalam undang-undang yang telah diuji, tidak dapat dimohonkan pengujian kembali, kecuali apabila batu uji Undang-Undang Dasar Negara Republik Indonesia Tahun 1945 yang digunakan berbeda atau terdapat alasan konstitusional baru.',
    keywords: ['ne bis in idem', 'pasal 60', 'pengujian kembali', 'alasan konstitusional baru', 'batu uji berbeda', 'res judicata']
  },

  // ==========================================
  // 3. PERATURAN MAHKAMAH KONSTITUSI (PMK NO. 2/2021)
  // ==========================================
  {
    id: 'pmk-2-2021-format',
    sumber: 'jdih_mk',
    jenis_dokumen: 'pmk',
    nomor: 'PMK No. 2 Tahun 2021 (Pasal 5 & 8)',
    tahun: '2021',
    judul: 'Tata Beracara dalam Perkara Pengujian Undang-Undang di Mahkamah Konstitusi',
    status_berlaku: 'berlaku',
    version_id: 'v-pmk2-2021-1',
    isi_teks: 'Permohonan pengujian undang-undang harus memuat secara berurutan: I. Identitas Pemohon atau Kuasa Hukumnya; II. Kewenangan Mahkamah Konstitusi; III. Kedudukan Hukum (Legal Standing) Pemohon; IV. Alasan Permohonan (Posita) yang memuat uraian pengujian formil dan/atau materiil; V. Hal-hal yang dimohonkan untuk diputus (Petitum). Permohonan diajukan dalam bahasa Indonesia dan ditandatangani oleh Pemohon atau Kuasa Hukumnya.',
    keywords: ['pmk 2 2021', 'format permohonan', 'posita', 'petitum', 'identitas pemohon', 'kewenangan mk', 'sistematika']
  },
  {
    id: 'pmk-2-2021-pasal-13',
    sumber: 'jdih_mk',
    jenis_dokumen: 'pmk',
    nomor: 'PMK No. 2 Tahun 2021 (Pasal 13)',
    tahun: '2021',
    judul: 'Tenggang Waktu Permohonan Pengujian Formil (45 Hari)',
    status_berlaku: 'berlaku',
    version_id: 'v-pmk2-2021-13-v1',
    isi_teks: 'Permohonan pengujian formil diajukan dalam tenggang waktu paling lama 45 (empat puluh lima) hari kerja sejak undang-undang yang dimohonkan pengujian diundangkan dalam Lembaran Negara Republik Indonesia. Untuk pengujian materiil, permohonan dapat diajukan kapan saja sepanjang undang-undang tersebut masih berlaku.',
    keywords: ['pengujian formil', 'pengujian materiil', '45 hari', 'tenggang waktu', 'lembaran negara', 'pmk 2 2021 pasal 13']
  },

  // ==========================================
  // 4. PUTUSAN LANDMARK MAHKAMAH KONSTITUSI
  // ==========================================
  {
    id: 'putusan-mk-006-2005',
    sumber: 'jdih_mk',
    jenis_dokumen: 'putusan_mk',
    nomor: 'Putusan No. 006/PUU-III/2005',
    tahun: '2005',
    judul: 'Yurisprudensi MK: 5 Syarat Kumulatif Kerugian Hak Konstitusional (Legal Standing)',
    status_berlaku: 'berlaku',
    version_id: 'v-putusan-006-1',
    isi_teks: 'Mahkamah menetapkan 5 syarat kerugian konstitusional pemohon: (a) adanya hak konstitusional pemohon yang diberikan oleh UUD 1945; (b) hak tersebut dianggap dirugikan oleh berlakunya UU yang diuji; (c) kerugian bersifat spesifik dan aktual atau setidak-tidaknya potensial menurut penalaran wajar dapat dipastikan akan terjadi; (d) ada hubungan sebab-akibat (causal verband) antara kerugian dengan UU yang dimohonkan pengujian; (e) adanya kemungkinan bahwa dengan dikabulkannya permohonan, kerugian hak konstitusional tersebut tidak lagi terjadi.',
    keywords: ['5 syarat', 'kerugian konstitusional', 'causal verband', 'sebab akibat', 'spesifik', 'aktual', 'potensial', 'putusan 006/2005', 'doktrin standing']
  },
  {
    id: 'putusan-mk-91-2020',
    sumber: 'jdih_mk',
    jenis_dokumen: 'putusan_mk',
    nomor: 'Putusan No. 91/PUU-XVIII/2020',
    tahun: '2020',
    judul: 'Landmark Uji Formil: Doktrin Partisipasi Bermakna (Meaningful Participation)',
    status_berlaku: 'berlaku',
    version_id: 'v-putusan-91-2020-v1',
    isi_teks: 'Dalam pembentukan undang-undang, partisipasi masyarakat yang bermakna (meaningful participation) mencakup tiga prasyarat pokok: hak untuk didengarkan pendapatnya (right to be heard), hak untuk dipertimbangkan pendapatnya (right to be considered), dan hak untuk mendapatkan penjelasan atau jawaban atas pendapat yang diberikan (right to be explained). Pelanggaran atas asas keterbukaan dan partisipasi bermakna berakibat pada inkonstitusionalitas formil.',
    keywords: ['meaningful participation', 'partisipasi bermakna', 'uji formil', 'cipta kerja', 'putusan 91 2020', 'right to be heard', 'right to be considered', 'right to be explained', 'metode omnibus law']
  },
  {
    id: 'putusan-mk-138-2009',
    sumber: 'jdih_mk',
    jenis_dokumen: 'putusan_mk',
    nomor: 'Putusan No. 138/PUU-VII/2009',
    tahun: '2009',
    judul: 'Landmark Parameter Ihwal Kegentingan Memaksa dalam Pembentukan Perppu',
    status_berlaku: 'berlaku',
    version_id: 'v-putusan-138-2009-v1',
    isi_teks: 'Mahkamah merumuskan tiga parameter kumulatif keberadaan ihwal kegentingan yang memaksa bagi Presiden untuk menetapkan Perppu: 1. Adanya keadaan yaitu kebutuhan mendesak untuk menyelesaikan masalah hukum secara cepat berdasarkan undang-undang; 2. Undang-undang yang dibutuhkan tersebut belum ada sehingga terjadi kekosongan hukum atau ada undang-undang tetapi tidak memadai; 3. Kekosongan hukum tersebut tidak dapat diatasi dengan cara membuat undang-undang secara prosedur biasa karena memerlukan waktu yang cukup lama.',
    keywords: ['perppu', 'kegentingan memaksa', 'putusan 138 2009', 'presiden', 'kekosongan hukum', 'kebutuhan mendesak']
  },
  {
    id: 'putusan-mk-35-2012',
    sumber: 'jdih_mk',
    jenis_dokumen: 'putusan_mk',
    nomor: 'Putusan No. 35/PUU-X/2012',
    tahun: '2012',
    judul: 'Landmark Hak Masyarakat Adat: Hutan Adat Bukan Hutan Negara',
    status_berlaku: 'berlaku',
    version_id: 'v-putusan-35-2012-v1',
    isi_teks: 'Mahkamah menegaskan bahwa hutan adat berada dalam wilayah masyarakat hukum adat dan bukan merupakan hutan negara. Pasal 1 angka 6 UU No. 41 Tahun 1999 tentang Kehutanan dinyatakan inkonstitusional bersyarat sehingga hutan negara tidak lagi mencakup hutan adat.',
    keywords: ['hutan adat', 'masyarakat adat', 'uu kehutanan', 'putusan 35 2012', 'hak ulayat', 'wilayah adat']
  }
];

/**
 * Independent Retrieval Function for Legal Knowledge
 */
export function retrieveRelevantLegalKnowledge(queryText: string, topK: number = 6): LegalKnowledgeItem[] {
  const normalized = queryText.toLowerCase();
  const scored = LEGAL_KNOWLEDGE_BASE.map(item => {
    let score = 0;
    for (const kw of item.keywords) {
      if (normalized.includes(kw)) {
        score += 4;
      } else {
        const words = kw.split(' ');
        for (const w of words) {
          if (w.length > 3 && normalized.includes(w)) {
            score += 1;
          }
        }
      }
    }
    if (normalized.includes(item.nomor.toLowerCase())) score += 5;
    if (normalized.includes(item.judul.toLowerCase())) score += 3;

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => s.item);
}
