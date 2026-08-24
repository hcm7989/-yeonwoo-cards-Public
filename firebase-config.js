// ────────────────────────────────────────────────────────────
//  이 파일 하나만 고치면 됩니다.
//
//  ★ 중요 ★  아래 구조는 절대 건드리지 마세요.
//            Firebase 콘솔에서 복사한 값을 " " 안에만 채워 넣으세요.
//
//  콘솔 화면에는 이렇게 나옵니다:
//
//      const firebaseConfig = {
//        apiKey: "AIzaSyC...",
//        authDomain: "yeonwoo-cards.firebaseapp.com",
//        ...
//      };
//
//  이 블록을 통째로 복사해서 붙여넣지 마세요. 앱이 안 뜹니다.
//  값 하나하나만 옮겨 적으시면 됩니다.
//
//  값을 비워 두어도 앱은 잘 돌아갑니다. 카드가 이 기기에만 저장되고
//  배우자 폰과 공유되지 않을 뿐입니다. (= 로컬 전용 모드)
//  자세한 순서는 README.md 3단계를 보세요.
//
//  ※ apiKey 는 비밀번호가 아닙니다. 웹에 공개돼도 되는 값이고,
//    실제 접근 제어는 Firebase 보안 규칙이 합니다.
// ────────────────────────────────────────────────────────────

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAgP0Up3ou6coyySiHA7V0Yri8hTFwL1fw",
  authDomain: "yeonwoo-cards.firebaseapp.com",
  projectId: "yeonwoo-cards",
  storageBucket: "yeonwoo-cards.firebasestorage.app",
  messagingSenderId: "750583383208",
  appId: "1:750583383208:web:a54099900f47210575ee9d"
};

// Firebase JS SDK 버전. 특별한 이유가 없으면 그대로 두세요.
export const FIREBASE_VERSION = "12.18.0";
