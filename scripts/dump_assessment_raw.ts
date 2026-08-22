/**
 * Dump Raw Assessment JSON from /api/assess-dual-agent
 */
import 'dotenv/config';

async function dumpRawAssessment() {
  const citizenGrievance = `Saya adalah pekerja kontrak selama 6 tahun di pabrik garmen di Majalaya. Setelah undang-undang baru berlaku, perusahaan mengalihkan kontrak saya menjadi outsourcing tanpa batas waktu dan menghapus hak pesangon saat masa kerja berakhir. Hal ini membuat saya kehilangan jaminan kerja yang adil dan kepastian hidup layak.`;

  const res = await fetch('http://localhost:3000/api/assess-dual-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      caseId: 'case-dump-001',
      caseFacts: citizenGrievance,
      userLanguage: 'id'
    })
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

dumpRawAssessment();
