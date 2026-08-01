// Shared helpers for the file-backed JSON stores (newsletter, reviews, admin).
//
// Two problems these solve, both reachable from the public endpoints:
//
//   1. Lost updates. Every writer does read → mutate → write. Two overlapping
//      requests both read the old array and the second write erases the first
//      one's entry. `withStoreLock` serialises writers per file within the
//      process.
//   2. Corruption. fs.writeFile truncates the target first, so a crash (or a
//      serverless freeze) mid-write leaves a truncated file that then fails to
//      parse — silently returning "no subscribers". `writeJsonAtomic` writes a
//      temp file and renames it, which is atomic on the same filesystem.
//
// Note this is per-process locking. It is correct for the single long-lived
// Node host these stores are designed for; it is not, and cannot be, correct
// across serverless instances — which is one more reason going live needs the
// real database in shared/schema.ts.

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const chains = new Map<string, Promise<unknown>>();

/** Run `fn` with exclusive access to `file` relative to other lock holders. */
export function withStoreLock<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const previous = chains.get(file) ?? Promise.resolve();
  // Run regardless of whether the previous task settled or threw, and keep a
  // never-rejecting handle as the chain tail so one failure can't poison it.
  const next = previous.then(fn, fn);
  const tail = next.catch(() => undefined);
  chains.set(file, tail);
  // Drop the entry once this is the last queued task, so the map stays small.
  void tail.then(() => {
    if (chains.get(file) === tail) chains.delete(file);
  });
  return next;
}

/** Read and parse a JSON file, returning `fallback` if missing or unparseable. */
export async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

/** Write JSON via temp-file + rename so readers never observe a partial file. */
export async function writeJsonAtomic(file: string, value: unknown): Promise<void> {
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  const tmp = path.join(dir, `.${path.basename(file)}.${randomUUID()}.tmp`);
  try {
    await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
    await fs.rename(tmp, file);
  } catch (err) {
    await fs.rm(tmp, { force: true }).catch(() => undefined);
    throw err;
  }
}
