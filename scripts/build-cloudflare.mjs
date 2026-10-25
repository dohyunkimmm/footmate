
import {
  cpSync,
  mkdirSync,
  rmSync
} from "node:fs";

// Cloudflare 배포용 폴더
const output = "dist";

// 기존 배포용 파일 정리
rmSync(output, {
  recursive: true,
  force: true
});

mkdirSync(output, {
  recursive: true
});

// FootMate 공개 웹페이지와 정적 파일
const publicFiles = [
  "index.html",
  "app.html",
  "beta.html",
  "beta-operator.html",
  "beta-data-notice.html",
  "beta-sw.js",
  "favicon.svg",
  "og-footmate.png",
  "src"
];

// 배포 폴더로 복사
for (const file of publicFiles) {
  cpSync(file, `${output}/${file}`, {
    recursive: true
  });
}

console.log("Cloudflare assets prepared");