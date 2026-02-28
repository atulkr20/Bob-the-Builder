import { readdir, rm } from "node:fs/promises";
import path from "node:path";

const GENERATED_DIR = path.join(process.cwd(), "generated");
const keepCountRaw = process.argv[2];
const keepCount = Number.isFinite(Number(keepCountRaw)) ? Number(keepCountRaw) : 3;

if (keepCount < 0) {
  console.error("Keep count must be >= 0");
  process.exit(1);
}

const main = async () => {
  let entries;
  try {
    entries = await readdir(GENERATED_DIR, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      console.log("No generated directory found. Nothing to prune.");
      return;
    }
    throw error;
  }

  const folders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => {
      const tsA = Number(a.split("-").at(-1)) || 0;
      const tsB = Number(b.split("-").at(-1)) || 0;
      return tsB - tsA;
    });

  const toDelete = folders.slice(keepCount);
  if (toDelete.length === 0) {
    console.log(`Nothing to prune. Folder count: ${folders.length}, keep: ${keepCount}`);
    return;
  }

  for (const folder of toDelete) {
    const target = path.join(GENERATED_DIR, folder);
    await rm(target, { recursive: true, force: true });
    console.log(`Deleted: generated/${folder}`);
  }

  console.log(`Pruned ${toDelete.length} generated folder(s). Kept latest ${keepCount}.`);
};

main().catch((error) => {
  console.error("Failed to prune generated folders:", error);
  process.exit(1);
});
