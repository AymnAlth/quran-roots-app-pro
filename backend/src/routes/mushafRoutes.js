const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// Fetch ayahs by juz
router.get('/by-juz/:juz', async (req, res, next) => {
  try {
    const juz = parseInt(req.params.juz, 10);
    if (isNaN(juz)) return res.status(400).json({ error: 'Invalid juz' });

    const q = `
      SELECT global_ayah, surah_no, ayah_no, text_uthmani, page, juz
      FROM ayah
      WHERE juz = ?
      ORDER BY global_ayah
    `;
    const rows = await executeQuery(q, [juz]);
    res.set('Cache-Control', 'public, max-age=3600');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Fetch ayahs by page
router.get('/by-page/:page', async (req, res, next) => {
  try {
    const page = parseInt(req.params.page, 10);
    if (isNaN(page)) return res.status(400).json({ error: 'Invalid page' });

    const q = `
      SELECT global_ayah, surah_no, ayah_no, text_uthmani, page, juz
      FROM ayah
      WHERE page = ?
      ORDER BY global_ayah
    `;
    const rows = await executeQuery(q, [page]);
    res.set('Cache-Control', 'public, max-age=3600');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Simple full-text-like search on `text_plain` (no diacritics)
// query param: q, optional scope: "mushaf" | "surah" | "juz" | "page" with value
router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().trim();
    if (!q) return res.status(400).json({ error: 'Missing query q' });

    const scope = (req.query.scope || '').toString();
    const scopeVal = (req.query.value || '').toString();

    // Use parameterized LIKE with surrounding % for basic substring search
    let sql = `SELECT global_ayah, surah_no, ayah_no, text_uthmani, page, juz FROM ayah WHERE text_plain LIKE ? `;
    const params = [`%${q}%`];

    if (scope === 'surah') {
      sql += ' AND surah_no = ? ';
      params.push(parseInt(scopeVal, 10));
    } else if (scope === 'juz') {
      sql += ' AND juz = ? ';
      params.push(parseInt(scopeVal, 10));
    } else if (scope === 'page') {
      sql += ' AND page = ? ';
      params.push(parseInt(scopeVal, 10));
    }

    sql += ' ORDER BY global_ayah LIMIT 1000 ';

    const rows = await executeQuery(sql, params);
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ total: rows.length, results: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
