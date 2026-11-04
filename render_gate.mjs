import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill, ensureBrowser } from "@remotion/renderer";
import path from "path";
import fs from "fs";

await ensureBrowser();
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.tsx") });
console.log("bundled:", serveUrl);
const chromiumOptions = { gl: "swangle", enableMultiProcessOnLinux: true };
const comp = await selectComposition({ serveUrl, id: "Gate3D", chromiumOptions });
console.log("comp ok:", comp.id, comp.durationInFrames, comp.width, comp.height);
fs.mkdirSync("output", { recursive: true });
await renderStill({
  serveUrl,
  composition: comp,
  frame: 45,
  output: "output/gate.jpg",
  imageFormat: "jpeg",
  jpegQuality: 72,
  chromiumOptions,
});
fs.writeFileSync(
  "output/gate_report.json",
  JSON.stringify({ ok: true, frame: 45, comp: comp.id, w: comp.width, h: comp.height, ts: new Date().toISOString() }, null, 2)
);
console.log("GATE STILL DONE");
