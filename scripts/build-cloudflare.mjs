
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

// 독립 Worker에서 제공하는 보고서는 서비스 배포 파일에서 제외합니다.
// 보고서 원본은 관련 QA 이전·검증이 끝날 때까지 Git 저장소에 보존합니다.
rmSync(`${output}/src/case-study`, {
  recursive: true,
  force: true
});

console.log("Cloudflare assets prepared");