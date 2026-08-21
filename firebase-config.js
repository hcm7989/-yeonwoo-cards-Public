// ────────────────────────────────────────────────────────────────
//  이 파일 하나만 고치면 됩니다.
//
//  아무것도 안 고쳐도 앱은 잘 돌아갑니다. 다만 카드가 이 기기에만
//  저장되고 배우자 폰과 공유되지 않습니다. (= 로컬 전용 모드)
//
//  둘이 같이 쓰려면 Firebase 콘솔에서 받은 설정값을 아래 중괄호 안에
//  통째로 붙여넣으세요. 자세한 순서는 README.md 를 보세요.
//
//  붙여넣은 모습은 이렇습니다:
//
//  export const FIREBASE_CONFIG = {
//    apiKey: "AIzaSy...",
//    authDomain: "yeonwoo-cards.firebaseapp.com",
//    projectId: "yeonwoo-cards",
//    storageBucket: "yeonwoo-cards.firebasestorage.app",
//    messagingSenderId: "123456789012",
//    appId: "1:123456789012:web:abc123"
//  };
//
//  ※ 여기 있는 apiKey 는 비밀번호가 아닙니다. 웹에 공개돼도 되는 값이고,
//    실제 접근 제어는 Firebase 쪽 보안 규칙이 합니다 (README 5단계).
// ────────────────────────────────────────────────────────────────

export const FIREBASE_CONFIG = {export const FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",
  authDomain: "yeonwoo-cards.firebaseapp.com",
  projectId: "yeonwoo-cards",
  storageBucket: "yeonwoo-cards.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123"
};};

// Firebase JS SDK 버전. 특별한 이유가 없으면 그대로 두세요.
export const FIREBASE_VERSION = "12.18.0";
