const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');

const SQLITE_HEADER = 'SQLite format 3';
const LFS_POINTER_HEADER = 'version https://git-lfs.github.com/spec/v1';

function fileExists(filePath) {
  return Boolean(filePath) && fs.existsSync(filePath);
}

function readPrefix(filePath, bytes = 64) {
  if (!fileExists(filePath)) {
    return '';
  }

  const handle = fs.openSync(filePath, 'r');

  try {
    const buffer = Buffer.alloc(bytes);
    const bytesRead = fs.readSync(handle, buffer, 0, bytes, 0);
    return buffer.subarray(0, bytesRead).toString('utf8');
  } finally {
    fs.closeSync(handle);
  }
}

function isSqliteDb(filePath) {
  if (!fileExists(filePath)) {
    return false;
  }

  const handle = fs.openSync(filePath, 'r');

  try {
    const buffer = Buffer.alloc(16);
    const bytesRead = fs.readSync(handle, buffer, 0, buffer.length, 0);

    if (bytesRead < 16) {
      return false;
    }

    return buffer.toString('utf8', 0, SQLITE_HEADER.length) === SQLITE_HEADER;
  } finally {
    fs.closeSync(handle);
  }
}

function isLfsPointer(filePath) {
  return readPrefix(filePath).startsWith(LFS_POINTER_HEADER);
}

function extractCompressedDb(gzipPath, destinationPath) {
  const compressedBuffer = fs.readFileSync(gzipPath);
  const sqliteBuffer = zlib.gunzipSync(compressedBuffer);

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.writeFileSync(destinationPath, sqliteBuffer);
}

function resolveLocalDb({
  preferredPath,
  gzipPath,
  runtimeDir = os.tmpdir(),
  runtimeFileName = path.basename(preferredPath),
}) {
  if (isSqliteDb(preferredPath)) {
    return {
      path: preferredPath,
      source: 'direct-sqlite',
    };
  }

  const runtimePath = path.join(runtimeDir, runtimeFileName);

  if (isSqliteDb(runtimePath)) {
    return {
      path: runtimePath,
      source: 'runtime-cache',
    };
  }

  if (fileExists(gzipPath)) {
    extractCompressedDb(gzipPath, runtimePath);

    if (isSqliteDb(runtimePath)) {
      return {
        path: runtimePath,
        source: 'gzip-extract',
      };
    }
  }

  let reason = 'missing-local-db';

  if (isLfsPointer(preferredPath)) {
    reason = 'git-lfs-pointer';
  } else if (fileExists(preferredPath)) {
    reason = 'invalid-sqlite-file';
  }

  throw new Error(
    `Unable to prepare local SQLite database (${reason}). ` +
      `Expected a real SQLite file at "${preferredPath}" ` +
      `or a gzip archive at "${gzipPath}".`
  );
}

module.exports = {
  isLfsPointer,
  isSqliteDb,
  resolveLocalDb,
};
