const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.resolve(__dirname, "..");
const profileModulePath = path.join(projectRoot, "webapp/static/japan-profile.js");

test("buildProfileUrl returns the same-origin random and keyword endpoints", () => {
  const { buildProfileUrl } = require(profileModulePath);

  assert.equal(
    buildProfileUrl(),
    "/api/japan-profile",
  );
  assert.equal(
    buildProfileUrl("東京都 港区"),
    "/api/japan-profile?keyword=%E6%9D%B1%E4%BA%AC%E9%83%BD%20%E6%B8%AF%E5%8C%BA",
  );
});

test("normalizeJapanProfile only returns approved profile fields", () => {
  const { normalizeJapanProfile } = require(profileModulePath);
  const source = {
    name: "佐藤 花子",
    name_hiragana: "さとう はなこ",
    name_katakana: "サトウ ハナコ",
    gender: "女",
    birth: "1994-04-18",
    nationalid: 123456789012,
    email: "hanako@example.jp",
    phone_number: "03-1234-5678",
    mobile_phone_number: "090-1234-5678",
    company: "合同会社テスト",
    salary: "350000 JPY",
    os: "Mac OS X",
    user_agent: "Mozilla/5.0",
    homepage: "example.jp",
    password: "secret-value",
    security_question: {
      question: "秘密の質問",
      answer: "秘密の回答",
    },
    credit_card_info: {
      card_number: "4111111111111111",
      expiry_date: "12/30",
      security_code: "123",
      card_type: "VISA",
    },
    address: {
      country: "日本",
      prefecture: "東京都",
      city: "港区",
      postal_code: "106-0044",
      full_address: "東京都港区東麻布1-8-1",
    },
  };

  const profile = normalizeJapanProfile(source);

  assert.deepEqual(profile, {
    name: "佐藤 花子",
    nameHiragana: "さとう はなこ",
    nameKatakana: "サトウ ハナコ",
    gender: "女",
    birth: "1994-04-18",
    email: "hanako@example.jp",
    phone: "03-1234-5678",
    mobilePhone: "090-1234-5678",
    address: {
      country: "日本",
      prefecture: "東京都",
      city: "港区",
      postalCode: "106-0044",
      fullAddress: "東京都港区東麻布1-8-1",
    },
    company: "合同会社テスト",
    salary: "350000 JPY",
    os: "Mac OS X",
    userAgent: "Mozilla/5.0",
    homepage: "example.jp",
  });
  assert.equal("nationalid" in profile, false);
  assert.equal("creditCardInfo" in profile, false);
  assert.equal("password" in profile, false);
  assert.equal("securityQuestion" in profile, false);
});

test("profileToText exports approved fields without sensitive source values", () => {
  const { normalizeJapanProfile, profileToText } = require(profileModulePath);
  const source = {
    name: "鈴木 一郎",
    nationalid: 987654321098,
    password: "do-not-export",
    credit_card_info: {
      card_number: "5555555555554444",
      security_code: "999",
    },
    security_question: {
      question: "do-not-export-question",
      answer: "do-not-export-answer",
    },
    address: {
      prefecture: "大阪府",
      city: "大阪市",
      postal_code: "530-0001",
      full_address: "大阪府大阪市北区梅田1-1",
    },
  };

  const text = profileToText(normalizeJapanProfile(source));

  assert.match(text, /姓名：鈴木 一郎/);
  assert.match(text, /都道府县：大阪府/);
  assert.match(text, /完整地址：大阪府大阪市北区梅田1-1/);
  assert.doesNotMatch(text, /987654321098/);
  assert.doesNotMatch(text, /5555555555554444/);
  assert.doesNotMatch(text, /999/);
  assert.doesNotMatch(text, /do-not-export/);
});

test("page structure exposes two tabs and no sensitive result fields", () => {
  const html = fs.readFileSync(
    path.join(projectRoot, "webapp/static/index.html"),
    "utf8",
  );

  assert.match(html, /id="paymentTab"/);
  assert.match(html, /id="japanProfileTab"/);
  assert.match(html, /id="paymentView"/);
  assert.match(html, /id="japanProfileView"/);
  assert.match(html, /src="\/japan-profile\.js/);
  assert.doesNotMatch(html, /id="jpNationalId"/);
  assert.doesNotMatch(html, /id="jpCreditCard"/);
  assert.doesNotMatch(html, /id="jpCvv"/);
  assert.doesNotMatch(html, /id="jpPassword"/);
});

test("app script uses the profile adapter and never reads sensitive fields", () => {
  const script = fs.readFileSync(
    path.join(projectRoot, "webapp/static/app.js"),
    "utf8",
  );

  assert.match(script, /JapanProfileData\.buildProfileUrl/);
  assert.match(script, /JapanProfileData\.normalizeJapanProfile/);
  assert.match(script, /JapanProfileData\.profileToText/);
  assert.doesNotMatch(script, /\.nationalid/);
  assert.doesNotMatch(script, /\.credit_card_info/);
  assert.doesNotMatch(script, /\.security_question/);
});

test("content security policy keeps browser requests same-origin", () => {
  const server = fs.readFileSync(
    path.join(projectRoot, "webapp/server.py"),
    "utf8",
  );

  assert.match(
    server,
    /connect-src 'self'/,
  );
  assert.doesNotMatch(server, /connect-src 'self' https:\/\/hant\.ratenn\.com/);
  assert.doesNotMatch(server, /hant\.ratenn\.com/);
  assert.doesNotMatch(server, /jp-address\/generate/);
});

test("stylesheet defines tab and responsive profile layouts", () => {
  const css = fs.readFileSync(
    path.join(projectRoot, "webapp/static/styles.css"),
    "utf8",
  );

  assert.match(css, /\.app-tabs/);
  assert.match(css, /\.app-tab/);
  assert.match(css, /\.japan-toolbar/);
  assert.match(css, /\.japan-profile-grid/);
  assert.match(css, /@media\s*\(max-width:\s*768px\)/);
});
