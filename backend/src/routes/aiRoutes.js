const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const aiService = require('../ai/aiService');

function parseInteger(value) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : NaN;
}

async function getRootsInAyah(ayahId) {
  const rows = await executeQuery(
    `
      SELECT root, MIN(pos) AS first_pos
      FROM token
      WHERE ayah_id = ?
        AND root IS NOT NULL
        AND TRIM(root) <> ''
      GROUP BY root
      ORDER BY first_pos ASC
    `,
    [ayahId]
  );

  return rows.map((row) => String(row.root).trim()).filter(Boolean);
}

async function getOperationalRoots(roots) {
  if (!roots || roots.length === 0) return [];

  const placeholders = roots.map(() => '?').join(',');
  const rows = await executeQuery(
    `
      SELECT root, MAX(operational_function) AS operational_function
      FROM token
      WHERE root IN (${placeholders})
        AND operational_function IS NOT NULL
        AND TRIM(operational_function) <> ''
      GROUP BY root
    `,
    roots
  );

  const byRoot = new Map(
    rows.map((row) => [
      String(row.root).trim(),
      String(row.operational_function).trim(),
    ])
  );

  return roots
    .filter((root) => byRoot.has(root))
    .map((root) => ({
      root,
      operationalFunction: byRoot.get(root),
    }));
}

router.post('/operational-insight', async (req, res, next) => {
  try {
    const surahNo = parseInteger(req.body?.surahNo);
    const ayahNo = parseInteger(req.body?.ayahNo);
    const ayahText = String(req.body?.ayahText || '').trim();

    if (!Number.isFinite(surahNo) || !Number.isFinite(ayahNo) || !ayahText) {
      return res.status(400).json({
        error: {
          message: 'Invalid payload. surahNo, ayahNo, and ayahText are required.',
        },
      });
    }

    const ayahId = `${surahNo}:${ayahNo}`;
    const rootsInAyah = await getRootsInAyah(ayahId);
    const operationalRoots = await getOperationalRoots(rootsInAyah);

    if (operationalRoots.length === 0) {
      return res.json({
        success: true,
        data: {
          ayah: {
            id: ayahId,
            surahNo,
            ayahNo,
            text: ayahText,
          },
          rootsInAyah,
          operationalRoots: [],
          analysis: null,
          message: 'No operational definitions were found for this ayah roots.',
        },
      });
    }

    const analysis = await aiService.analyzeAyahOperationalContext({
      ayahText,
      surahNo,
      ayahNo,
      operationalRoots,
    });

    return res.json({
      success: true,
      data: {
        ayah: {
          id: ayahId,
          surahNo,
          ayahNo,
          text: ayahText,
        },
        rootsInAyah,
        operationalRoots,
        analysis,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

