import builtins from "builtin-modules";
import dotenv from 'dotenv';
import esbuild from "esbuild";
import fs from "node:fs";
import path, { dirname } from "path";
import process from "process";
import { fileURLToPath } from 'url';

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const isDevelopment = process.argv.includes("dev");
const isLocal = process.argv.includes("local");
const isProd = process.argv.includes("production");

// CSS를 하나로 합치기 위한 rename 플러그인
const renamePlugin = {
  name: 'rename-styles',
  setup(build) {
    build.onEnd(() => {
      const { outfile } = build.initialOptions;
      const outcss = outfile.replace(/\.js$/, '.css');  // main.js -> main.css
      const fixcss = outfile.replace(/main\.js$/, 'styles.css');  // main.css -> styles.css

      if(fs.existsSync(outcss)) {
        console.log('Start renaming', outcss, 'to', fixcss);
        fs.renameSync(outcss, fixcss);  // main.css -> styles.css
        console.log('End renaming', outcss, 'to', fixcss);
      } else {
        console.log('CSS file not found:', outcss);  // 문제 발생 시 경로 확인용
      }
    });
  },
};

const context = await esbuild.context({
  banner: {
    js: banner,
  },
  entryPoints: ["src/main.ts"],  // 엔트리 포인트
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
    ...builtins,
  ],
  define: {
    'process.env.NODE_ENV': isDevelopment ? '"development"' : '"production"',
  },
  format: "cjs",  // CommonJS 포맷
  target: "es2018",
  logLevel: "warning",
  sourcemap: isProd ? false : "inline",
  treeShaking: true,
  outfile: "main.js",  // JavaScript 번들 파일
  plugins: [
    renamePlugin,  // CSS 파일 이름 변경 플러그인
  ],
  minify: isProd,
  loader: {
    ".tsx": "tsx",  // TypeScript와 TSX 파일을 처리
    ".ts": "ts",
    ".css": "css",  // CSS 파일을 로드
  },
  // CSS 파일을 추출하여 하나로 합침
  write: true,
});


if(isProd) {
  await context.rebuild();
  process.exit(0);
} else if(isLocal) {
  await context.rebuild();
  console.log("\n === 클라우드로 플러그인 복사 시작 ===");
  await copyPluginFilesTo_iCloud();
  console.log("=== 완료 ===");
  process.exit(0);
} else {
  await context.watch();
}





async function copyPluginFilesTo_iCloud() {
  const filesToCopy = [
    'main.js',
    'manifest.json',
    'styles.css',
  ];

  dotenv.config();
  const destinationDir = process.env.ICLOUD_DIRECTORY;

  // 현재 파일의 URL을 파일 경로로 변환
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // 복사 작업
  for(const file of filesToCopy) {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(destinationDir, file);
    try {
      await fs.promises.copyFile(sourcePath, destPath);
      console.log(`DONE: ${file}`);
    } catch (error) {
      console.error(`Failed to copy ${file}:`, error);
    }
  }
}