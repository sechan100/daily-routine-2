import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import { sassPlugin } from 'esbuild-sass-plugin';
import fs from "fs";

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = process.argv[2] === "production";

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
  format: "cjs",  // CommonJS 포맷
  target: "es2018",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",  // JavaScript 번들 파일
  plugins: [
    renamePlugin,  // CSS 파일 이름 변경 플러그인
    sassPlugin(),  // SASS 파일 로더
  ],
  loader: {
    ".tsx": "tsx",  // TypeScript와 TSX 파일을 처리
    ".ts": "ts",
    ".css": "css",  // CSS 파일을 로드
  },
  // CSS 파일을 추출하여 하나로 합침
  write: true,
});

if(prod) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
