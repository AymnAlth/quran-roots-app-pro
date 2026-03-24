import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const SQLITE_HEADER = 'SQLite format 3';
const dbPath = path.resolve('backend/database/quran_roots_dual_v2.sqlite');
const gzipPath = `${dbPath}.gz`;

function assertRealSqlite(filePath) {
  const handle = fs.openSync(filePath, 'r');

  try {
    const buffer = Buffer.alloc(16);
    const bytesRead = fs.readSync(handle, buffer, 0, buffer.length, 0);

    if (bytesRead < 16 || buffer.toString('utf8', 0, SQLITE_HEADER.length) !== SQLITE_HEADER) {
      throw new Error(
        `Refusing to pack "${filePath}" because it is not a real SQLite file.`
      );
    }
  } finally {
    fs.closeSync(handle);
  }
}

assertRealSqlite(dbPath);

const sqliteBuffer = fs.readFileSync(dbPath);
const gzipBuffer = zlib.gzipSync(sqliteBuffer, {
  level: zlib.constants.Z_BEST_COMPRESSION,
});

fs.writeFileSync(gzipPath, gzipBuffer);

console.log(
  JSON.stringify({
    dbPath,
    gzipPath,
    sqliteBytes: sqliteBuffer.length,
    gzipBytes: gzipBuffer.length,
  })
);
