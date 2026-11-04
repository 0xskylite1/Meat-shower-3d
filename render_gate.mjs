import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill, renderMedia, ensureBrowser } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

await ensureBrowser();
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.tsx") });
console.log("bundled:", serveUrl);
const chromiumOptions = { gl: "swangle", enableMultiProcessOnLinux: true };
fs.mkdirSync("output", { recursive: true });

// ---- gate still (kept as the fast smoke test) ----
const gate = await selectComposition({ serveUrl, id: "Gate3D", chromiumOptions });
await renderStill({
  serveUrl, composition: gate, frame: 45, output: "output/gate.jpg",
  imageFormat: "jpeg", jpegQuality: 72, chromiumOptions,
});
fs.writeFileSync("output/gate_report.json",
  JSON.stringify({ ok: true, frame: 45, comp: gate.id, w: gate.width, h: gate.height, ts: new Date().toISOString() }, null, 2));
console.log("GATE STILL DONE");

// ---- meat proof video (330 frames, 1080x1920) ----
const proof = await selectComposition({ serveUrl, id: "MeatProof", chromiumOptions });
console.log("proof comp:", proof.id, proof.durationInFrames, proof.width, proof.height);
await renderMedia({
  serveUrl, composition: proof, codec: "h264", crf: 26, concurrency: 2,
  outputLocation: "output/meat_proof.mp4", chromiumOptions,
  onProgress: ({ progress }) => { if (Math.round(progress * 100) % 20 === 0) console.log("proof progress", Math.round(progress * 100)); },
});
const buf = fs.readFileSync("output/meat_proof.mp4");
const sha = crypto.createHash("sha256").update(buf).digest("hex");
fs.rmSync("output/meat_proof.mp4"); // transported as chunks instead (Contents API 1MB/file limit)
const CH = 900000;
const dir = "output/proof_chunks";
fs.mkdirSync(dir, { recursive: true });
let n = 0;
for (let off = 0; off < buf.length; off += CH, n++) {
  fs.writeFileSync(path.join(dir, `part${String(n).padStart(2, "0")}`), buf.subarray(off, off + CH));
}
fs.writeFileSync("output/proof_report.json",
  JSON.stringify({ ok: true, comp: proof.id, frames: proof.durationInFrames, size: buf.length, chunks: n, sha256: sha, ts: new Date().toISOString() }, null, 2));
console.log("PROOF DONE", buf.length, "bytes in", n, "chunks, sha", sha);
