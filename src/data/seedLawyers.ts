/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Mockup Seed Data for Bursa Lawyer / Kontak Pengacara
 * Dedicated to Public Interest, Constitutional Litigation (MK) & Judicial Review (MA)
 */

import { LawyerProfile } from '../types';

export const SEED_LAWYERS: LawyerProfile[] = [
  {
    id: 'lawyer-001',
    nama: 'Dr. Budi Santoso, S.H., M.H.',
    gelar: 'Advokat Spesialis Hukum Tata Negara & Peradilan Konstitusi',
    no_izin_advokat: 'PERADI No. 12.09481/DKI/2014',
    organisasi_advokat: 'PERADI (Perhimpunan Advokat Indonesia)',
    pendidikan_terakhir: 'Doktor Ilmu Hukum (S3) - Universitas Indonesia (Peminatan Hukum Tata Negara)',
    pendidikan_detail: [
      'S3 Doktor Ilmu Hukum (Tata Negara) - Universitas Indonesia (2020)',
      'S2 Magister Hukum (Hukum Konstitusi) - Universitas Gadjah Mada (2014)',
      'S1 Sarjana Hukum - Universitas Padjadjaran (2010)'
    ],
    area_keahlian: ['Pengujian UU di Mahkamah Konstitusi', 'Uji Materiil Regulasi di MA', 'Hukum Perburuhan & Ketenagakerjaan'],
    sertifikasi: [
      {
        id: 'cert-1',
        judul: 'Sertifikasi Hukum Acara Mahkamah Konstitusi (Puslitka MK)',
        penerbit: 'Pusat Penelitian dan Pengkajian Perkara MK-RI',
        tahun: '2019',
        nomor_registrasi: 'MK-RI/CERT/2019/084',
        status: 'Aktif'
      },
      {
        id: 'cert-2',
        judul: 'Lisensi Advokat Berita Acara Sumpah Pengadilan Tinggi Jakarta',
        penerbit: 'Pengadilan Tinggi DKI Jakarta',
        tahun: '2014',
        nomor_registrasi: 'BAS-PT.DKI/2014/1102',
        status: 'Aktif'
      },
      {
        id: 'cert-3',
        judul: 'Certified Legal Auditor (CLA)',
        penerbit: 'Asosiasi Auditor Hukum Indonesia (ASAHI)',
        tahun: '2021',
        nomor_registrasi: 'ASAHI-CLA/2021/0491',
        status: 'Aktif'
      }
    ],
    portfolio_kasus: [
      {
        id: 'port-1',
        judul_perkara: 'Uji Materiil Pasal Pesangon PHK dalam UU Ketenagakerjaan',
        nomor_putusan: 'Putusan MK No. 91/PUU-XVIII/2020',
        mahkamah: 'MK',
        objek_uji: 'Pasal 156 ayat (2) UU Ketenagakerjaan terhadap Pasal 28D ayat (1) & (2) UUD 1945',
        tahun: '2020 - 2021',
        hasil_amar: 'Dikabulkan Sebagian (Inkonstitusional Bersyarat)',
        ringkasan_peran: 'Kuasa hukum perwakilan serikat buruh independen, menyusun posita kerugian hak konstitusional pekerja kontrak atas formula pesangon.'
      },
      {
        id: 'port-2',
        judul_perkara: 'Uji Materiil Peraturan Menteri Perhubungan tentang Tarif Ojek Online',
        nomor_putusan: 'Putusan MA No. 28 P/HUM/2022',
        mahkamah: 'MA',
        objek_uji: 'Permenhub No. KP 667/2022 terhadap UU No. 22/2009 tentang LLAJ',
        tahun: '2022',
        hasil_amar: 'Dikabulkan Seluruhnya',
        ringkasan_peran: 'Mendampingi koalisi pengemudi daring dalam pembatalan norma batas biaya sewa aplikasi yang melebihi wewenang delegasi.'
      },
      {
        id: 'port-3',
        judul_perkara: 'Uji Formil Undang-Undang Minerba',
        nomor_putusan: 'Putusan MK No. 37/PUU-XIX/2021',
        mahkamah: 'MK',
        objek_uji: 'UU No. 3 Tahun 2020 tentang Perubahan atas UU No. 4/2009',
        tahun: '2021',
        hasil_amar: 'Ditolak (Dissenting Opinion 3 Hakim)',
        ringkasan_peran: 'Mewakili koalisi masyarakat sipil terkait hak veto warga terdampak tambang.'
      }
    ],
    ketersediaan_pro_bono: true,
    model_kerjasama: 'pro_bono',
    status_verifikasi: 'terverifikasi',
    kota: 'Jakarta Pusat, DKI Jakarta',
    email: 'budi.santoso@advokat-konstitusi.id',
    telepon: '+62 812-8890-4411',
    ringkasan_bio: 'Berpengalaman lebih dari 12 tahun dalam advokasi permohonan pengujian undang-undang di Mahkamah Konstitusi. Memiliki komitmen tinggi pada bantuan hukum pro bono bagi serikat pekerja dan kelompok rentan.',
    foto_avatar_placeholder: {
      initials: 'BS',
      bg_color: '#881337',
      text_color: '#FDE68A'
    },
    total_advokasi_selesai: 28,
    created_at: '2026-01-10T00:00:00Z'
  },
  {
    id: 'lawyer-002',
    nama: 'Nurul Hidayati, S.H., LL.M.',
    gelar: 'Spesialis Hak Asasi Manusia, Masyarakat Adat & Hukum Lingkungan',
    no_izin_advokat: 'PERADI No. 17.03921/JATENG/2016',
    organisasi_advokat: 'PERADI & Anggota Koalisi Pembela HAM',
    pendidikan_terakhir: 'Master of Laws (LL.M.) in International Human Rights Law - Leiden University, Belanda',
    pendidikan_detail: [
      'LL.M. in International Human Rights & Constitutional Law - Leiden University (2018)',
      'S1 Sarjana Hukum - Universitas Diponegoro (2014)'
    ],
    area_keahlian: ['Hak Masyarakat Adat & Ulayat', 'Hukum Lingkungan Hidup (Pasal 28H UUD 1945)', 'Uji Materiil Regulasi Perizinan Konsesi di MA'],
    sertifikasi: [
      {
        id: 'cert-4',
        judul: 'Sertifikasi Keahlian Litigasi Lingkungan & Masyarakat Adat (CELA)',
        penerbit: 'Indonesian Center for Environmental Law (ICEL)',
        tahun: '2020',
        nomor_registrasi: 'ICEL-CELA/2020/017',
        status: 'Aktif'
      },
      {
        id: 'cert-5',
        judul: 'Sertifikasi Mediator Terakreditasi Mahkamah Agung',
        penerbit: 'Pusat Mediasi Nasional (PMN) & Mahkamah Agung RI',
        tahun: '2021',
        nomor_registrasi: 'PMN-MA/MED/2021/892',
        status: 'Aktif'
      }
    ],
    portfolio_kasus: [
      {
        id: 'port-4',
        judul_perkara: 'Uji Materiil UU Pengelolaan Pesisir dan Pulau-Pulau Kecil',
        nomor_putusan: 'Putusan MK No. 3/PUU-VIII/2010 (Tinjauan Norma Lanjutan)',
        mahkamah: 'MK',
        objek_uji: 'Norma Hak Pengusahaan Perairan Pesisir terhadap Pasal 33 ayat (3) UUD 1945',
        tahun: '2022',
        hasil_amar: 'Inkonstitusional Bersyarat',
        ringkasan_peran: 'Kuasa hukum nelayan tradisional dan komunitas kepulauan atas akses perairan bebas konsesi swasta.'
      },
      {
        id: 'port-5',
        judul_perkara: 'Uji Materiil Peraturan Daerah tentang Rencana Zonasi Wilayah Pesisir',
        nomor_putusan: 'Putusan MA No. 12 P/HUM/2023',
        mahkamah: 'MA',
        objek_uji: 'Perda RZWP3K terhadap UU Lingkungan Hidup No. 32/2009',
        tahun: '2023',
        hasil_amar: 'Dikabulkan Sebagian',
        ringkasan_peran: 'Membatalkan alokasi tambang pasir laut yang melanggar wilayah tangkap nelayan adat.'
      }
    ],
    ketersediaan_pro_bono: true,
    model_kerjasama: 'pro_bono',
    status_verifikasi: 'terverifikasi',
    kota: 'Semarang & Yogyakarta',
    email: 'nurul.hidayati@advokasi-adat.org',
    telepon: '+62 813-9021-3388',
    ringkasan_bio: 'Fokus pada pembelaan hak-hak konstitusional masyarakat adat, petani gurem, dan nelayan tradisional dalam sengketa kebijakan agraria dan sumber daya alam.',
    foto_avatar_placeholder: {
      initials: 'NH',
      bg_color: '#064E3B',
      text_color: '#A7F3D0'
    },
    total_advokasi_selesai: 19,
    created_at: '2026-02-01T00:00:00Z'
  },
  {
    id: 'lawyer-003',
    nama: 'I Made Wira Dharma, S.H., M.Kn.',
    gelar: 'Advokat & Praktisi Uji Peraturan Perundang-undangan Daerah & Pusat',
    no_izin_advokat: 'KAI No. 08.19283/BALI/2015',
    organisasi_advokat: 'KAI (Kongres Advokat Indonesia)',
    pendidikan_terakhir: 'Magister Kenotariatan & Hukum Bisnis (S2) - Universitas Airlangga',
    pendidikan_detail: [
      'S2 Magister Kenotariatan - Universitas Airlangga (2016)',
      'S1 Sarjana Hukum - Universitas Udayana (2012)'
    ],
    area_keahlian: ['Uji Materiil di Mahkamah Agung (Hak Uji Materiil)', 'Hukum Tata Usaha Negara & Kebijakan Fiskal Daerah', 'Hak Kebebasan Berusaha & Pajak Daerah'],
    sertifikasi: [
      {
        id: 'cert-6',
        judul: 'Pendidikan Khusus Profesi Advokat (PKPA) & Lisensi Berita Acara Sumpah PT',
        penerbit: 'Dewan Pimpinan Pusat Kongres Advokat Indonesia',
        tahun: '2015',
        nomor_registrasi: 'KAI-BAS/2015/0981',
        status: 'Aktif'
      },
      {
        id: 'cert-7',
        judul: 'Sertifikasi Konsultan Hukum Pajak & Retribusi Daerah',
        penerbit: 'Badan Nasional Sertifikasi Profesi (BNSP)',
        tahun: '2022',
        nomor_registrasi: 'BNSP/TAX-LAW/2022/411',
        status: 'Aktif'
      }
    ],
    portfolio_kasus: [
      {
        id: 'port-6',
        judul_perkara: 'Uji Materiil Peraturan Daerah Pajak Hiburan & Usaha Pariwisata',
        nomor_putusan: 'Putusan MA No. 19 P/HUM/2024',
        mahkamah: 'MA',
        objek_uji: 'Perda No. 1/2024 terhadap UU Hubungan Keuangan Pusat dan Daerah (HKPD)',
        tahun: '2024',
        hasil_amar: 'Dikabulkan',
        ringkasan_peran: 'Mewakili asosiasi UMKM kreatif dan pelaku usaha lokal dalam membatalkan tarif pungutan yang tidak proporsional.'
      },
      {
        id: 'port-7',
        judul_perkara: 'Uji Materiil PP tentang Retribusi Perizinan Bangunan Gedung (PBG)',
        nomor_putusan: 'Putusan MA No. 04 P/HUM/2023',
        mahkamah: 'MA',
        objek_uji: 'PP No. 16/2021 terhadap UU No. 28/2002 tentang Bangunan Gedung',
        tahun: '2023',
        hasil_amar: 'Ditolak',
        ringkasan_peran: 'Kuasa hukum koalisi arsitek muda dan pemohon perorangan.'
      }
    ],
    ketersediaan_pro_bono: false,
    model_kerjasama: 'subsidi_silang',
    status_verifikasi: 'terverifikasi',
    kota: 'Denpasar & Surabaya',
    email: 'wira.dharma@legalsolution.co.id',
    telepon: '+62 811-3701-889',
    ringkasan_bio: 'Menangani puluhan perkara pengujian peraturan di bawah undang-undang (Perpres, Permen, Perda) di Mahkamah Agung dengan penekanan pada kepastian hukum berusaha dan keadilan pajak.',
    foto_avatar_placeholder: {
      initials: 'MW',
      bg_color: '#1E3A8A',
      text_color: '#BFDBFE'
    },
    total_advokasi_selesai: 22,
    created_at: '2026-01-20T00:00:00Z'
  },
  {
    id: 'lawyer-004',
    nama: 'Prof. Siti Rahmawati, S.H., M.Hum.',
    gelar: 'Pakar Hukum Konstitusi, Kebebasan Berpendapat & Hak Digital',
    no_izin_advokat: 'PERADI No. 03.11892/JABAR/2009',
    organisasi_advokat: 'PERADI & Asosiasi Pengajar Hukum Tata Negara-Hukum Administrasi Negara (APHTN-HAN)',
    pendidikan_terakhir: 'Doktor Ilmu Hukum (S3) - Universitas Padjadjaran',
    pendidikan_detail: [
      'S3 Doktor Ilmu Hukum - Universitas Padjadjaran (2012)',
      'S2 Magister Humaniora (Hukum dan Masyarakat) - Universitas Indonesia (2006)',
      'S1 Sarjana Hukum - Universitas Padjadjaran (2002)'
    ],
    area_keahlian: ['Pasal Karet UU ITE & Kebebasan Berekspresi', 'Pengujian Konstitusional Hak Privasi (UU PDP)', 'Hukum Tata Negara & Pemilu'],
    sertifikasi: [
      {
        id: 'cert-8',
        judul: 'Sertifikasi Ahli Hukum Acara Pengujian Konstitusional MK',
        penerbit: 'Mahkamah Konstitusi Republik Indonesia',
        tahun: '2016',
        nomor_registrasi: 'MK-EXPERT/2016/003',
        status: 'Aktif'
      },
      {
        id: 'cert-9',
        judul: 'Certified Data Protection & Privacy Legal Specialist',
        penerbit: 'Asosiasi Praktisi Pelindungan Data Indonesia (APPDI)',
        tahun: '2023',
        nomor_registrasi: 'APPDI-CDP/2023/102',
        status: 'Aktif'
      }
    ],
    portfolio_kasus: [
      {
        id: 'port-8',
        judul_perkara: 'Uji Materiil Pasal Pencemaran Nama Baik dan Berita Bohong dalam UU ITE',
        nomor_putusan: 'Putusan MK No. 78/PUU-XXI/2023',
        mahkamah: 'MK',
        objek_uji: 'Pasal 27 ayat (3) & Pasal 28 ayat (2) UU ITE terhadap Pasal 28F UUD 1945',
        tahun: '2023',
        hasil_amar: 'Inkonstitusional Bersyarat (Menegaskan Batasan Restorative Justice)',
        ringkasan_peran: 'Kuasa hukum koalisi jurnalis dan aktivis hak digital masyarakat.'
      },
      {
        id: 'port-9',
        judul_perkara: 'Uji Materiil Ketentuan Syarat Ambang Batas Pencalonan (Presidential Threshold)',
        nomor_putusan: 'Putusan MK No. 53/PUU-XX/2022',
        mahkamah: 'MK',
        objek_uji: 'Pasal 222 UU Pemilu terhadap Pasal 6A ayat (2) UUD 1945',
        tahun: '2022',
        hasil_amar: 'Ditolak (Concurring Opinion 2 Hakim)',
        ringkasan_peran: 'Mewakili pemohon warga negara perseorangan dan organisasi masyarakat sipil.'
      }
    ],
    ketersediaan_pro_bono: true,
    model_kerjasama: 'pro_bono',
    status_verifikasi: 'terverifikasi',
    kota: 'Bandung & Jakarta',
    email: 'siti.rahmawati@pembelahak.id',
    telepon: '+62 811-2299-105',
    ringkasan_bio: 'Guru besar dan praktisi yang kerap bertindak sebagai ahli maupun kuasa pemohon dalam pengujian undang-undang strategis di Mahkamah Konstitusi terkait hak-hak sipil dan politik.',
    foto_avatar_placeholder: {
      initials: 'SR',
      bg_color: '#581C87',
      text_color: '#E9D5FF'
    },
    total_advokasi_selesai: 35,
    created_at: '2026-01-05T00:00:00Z'
  },
  {
    id: 'lawyer-005',
    nama: 'Andreas Siregar, S.H.',
    gelar: 'Advokat Publik LBH & Pembela Hak Kaum Marginal',
    no_izin_advokat: 'PERADI No. 21.05432/SUMUT/2019',
    organisasi_advokat: 'PERADI & Yayasan Lembaga Bantuan Hukum',
    pendidikan_terakhir: 'Sarjana Hukum (S.H.) - Universitas Sumatera Utara (Peminatan Hukum Acara & Pidana/Tata Negara)',
    pendidikan_detail: [
      'S1 Sarjana Hukum - Universitas Sumatera Utara (2018)',
      'Program Pelatihan Bantuan Hukum Advokasi Struktural (KALABAHU) YLBHI (2019)'
    ],
    area_keahlian: ['Bantuan Hukum Pro Bono Warga Miskin', 'Uji Materiil Regulasi Penggusuran & Tata Ruang', 'Pendampingan Berkas Perkara Pengadilan'],
    sertifikasi: [
      {
        id: 'cert-10',
        judul: 'Pendidikan Bantuan Hukum & Advokasi Struktural Kalabahu',
        penerbit: 'Yayasan Lembaga Bantuan Hukum Indonesia (YLBHI)',
        tahun: '2019',
        nomor_registrasi: 'YLBHI-KLB/2019/042',
        status: 'Aktif'
      },
      {
        id: 'cert-11',
        judul: 'Pelatihan Teknik Penyusunan Permohonan Uji Materiil MK',
        penerbit: 'Pusat Studi Konstitusi (PUSaKO) Univ. Andalas',
        tahun: '2021',
        nomor_registrasi: 'PUSAKO/TRAIN/2021/88',
        status: 'Aktif'
      }
    ],
    portfolio_kasus: [
      {
        id: 'port-10',
        judul_perkara: 'Uji Materiil Peraturan Daerah tentang Ketertiban Umum & PKL',
        nomor_putusan: 'Putusan MA No. 09 P/HUM/2023',
        mahkamah: 'MA',
        objek_uji: 'Perda Tibum terhadap UU Hak Asasi Manusia No. 39/1999',
        tahun: '2023',
        hasil_amar: 'Dikabulkan Sebagian',
        ringkasan_peran: 'Kuasa hukum serikat pedagang kaki lima korban penyitaan sepihak tanpa ganti rugi.'
      },
      {
        id: 'port-11',
        judul_perkara: 'Pendampingan Pengujian Hak Bantuan Hukum Cuma-Cuma',
        nomor_putusan: 'Putusan MK No. 88/PUU-XX/2022',
        mahkamah: 'MK',
        objek_uji: 'Pasal 56 ayat (1) KUHAP terhadap Pasal 28D ayat (1) UUD 1945',
        tahun: '2022',
        hasil_amar: 'Inkonstitusional Bersyarat',
        ringkasan_peran: 'Tim kuasa hukum gabungan organisasi bantuan hukum masyarakat miskin.'
      }
    ],
    ketersediaan_pro_bono: true,
    model_kerjasama: 'pro_bono',
    status_verifikasi: 'terverifikasi',
    kota: 'Medan & Jakarta',
    email: 'andreas.siregar@lbh-rakyat.org',
    telepon: '+62 821-6543-9900',
    ringkasan_bio: 'Advokat publik muda yang berdedikasi 100% pada perkara-perkara pro bono masyarakat tertindas, buruh harian, dan korban kekerasan struktural kebijakan.',
    foto_avatar_placeholder: {
      initials: 'AS',
      bg_color: '#7C2D12',
      text_color: '#FED7AA'
    },
    total_advokasi_selesai: 16,
    created_at: '2026-02-12T00:00:00Z'
  },
  {
    id: 'lawyer-006',
    nama: 'Farhan Alkatiri, S.H., M.H.',
    gelar: 'Advokat Spesialis Hukum Kesehatan, Jaminan Sosial & Regulasi Pelayanan Publik',
    no_izin_advokat: 'PERADI No. 14.88712/SULSEL/2015',
    organisasi_advokat: 'PERADI & Koalisi Advokasi Jaminan Sosial Nasional',
    pendidikan_terakhir: 'Magister Ilmu Hukum (S2) - Universitas Hasanuddin (Hukum Kesehatan & Kebijakan Publik)',
    pendidikan_detail: [
      'S2 Magister Ilmu Hukum - Universitas Hasanuddin (2017)',
      'S1 Sarjana Hukum - Universitas Hasanuddin (2013)'
    ],
    area_keahlian: ['Hak Atas Jaminan Sosial & Kesehatan (BPJS)', 'Uji Materiil Perpres/Permenkes di MA', 'Pengujian UU Pelayanan Publik di MK'],
    sertifikasi: [
      {
        id: 'cert-12',
        judul: 'Sertifikasi Konsultan Hukum Kesehatan & Bioetika',
        penerbit: 'Masyarakat Hukum Kesehatan Indonesia (MHKI)',
        tahun: '2020',
        nomor_registrasi: 'MHKI-CERT/2020/091',
        status: 'Aktif'
      },
      {
        id: 'cert-13',
        judul: 'Certified Constitutional Court Litigator',
        penerbit: 'Lembaga Pendidikan Advokasi Konstitusi Indonesia',
        tahun: '2018',
        nomor_registrasi: 'LPAKI/LIT/2018/231',
        status: 'Aktif'
      }
    ],
    portfolio_kasus: [
      {
        id: 'port-12',
        judul_perkara: 'Uji Materiil Peraturan Presiden tentang Kenaikan Iuran BPJS Kesehatan',
        nomor_putusan: 'Putusan MA No. 07 P/HUM/2020',
        mahkamah: 'MA',
        objek_uji: 'Pasal 34 Perpres No. 75/2019 terhadap UU No. 40/2004 tentang SJSN',
        tahun: '2020',
        hasil_amar: 'Dikabulkan Seluruhnya (Membatalkan Kenaikan Iuran)',
        ringkasan_peran: 'Kuasa hukum komunitas pasien cuci darah dan serikat buruh mandiri.'
      },
      {
        id: 'port-13',
        judul_perkara: 'Uji Materiil UU Rumah Sakit dan Standar Pelayanan Gawat Darurat',
        nomor_putusan: 'Putusan MK No. 14/PUU-XVII/2019',
        mahkamah: 'MK',
        objek_uji: 'Pasal 29 ayat (1) UU Rumah Sakit terhadap Pasal 28H ayat (1) UUD 1945',
        tahun: '2019',
        hasil_amar: 'Inkonstitusional Bersyarat',
        ringkasan_peran: 'Mewakili keluarga korban penolakan fasilitas gawat darurat rumah sakit swasta.'
      }
    ],
    ketersediaan_pro_bono: true,
    model_kerjasama: 'pro_bono',
    status_verifikasi: 'terverifikasi',
    kota: 'Makassar & Jakarta',
    email: 'farhan.alkatiri@advokasikesehatan.id',
    telepon: '+62 811-4190-223',
    ringkasan_bio: 'Telah memenangkan sejumlah permohonan uji materiil peraturan presiden di Mahkamah Agung, khususnya yang berdampak langsung pada biaya pengobatan dan jaminan sosial masyarakat berpenghasilan rendah.',
    foto_avatar_placeholder: {
      initials: 'FA',
      bg_color: '#134E4A',
      text_color: '#99F6E4'
    },
    total_advokasi_selesai: 24,
    created_at: '2026-01-18T00:00:00Z'
  }
];
