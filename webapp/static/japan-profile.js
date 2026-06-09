(function initJapanProfileData(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.JapanProfileData = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createJapanProfileData() {
  const API_PATH = "/api/japan-profile";

  function text(value) {
    const normalized = String(value ?? "").trim();
    return normalized || "—";
  }

  function buildProfileUrl(keyword = "") {
    const normalized = String(keyword || "").trim();
    if (!normalized) {
      return API_PATH;
    }
    return `${API_PATH}?keyword=${encodeURIComponent(normalized)}`;
  }

  function normalizeJapanProfile(source) {
    const data = source && typeof source === "object" ? source : {};
    const address = data.address && typeof data.address === "object" ? data.address : {};

    return {
      name: text(data.name),
      nameHiragana: text(data.name_hiragana),
      nameKatakana: text(data.name_katakana),
      gender: text(data.gender),
      birth: text(data.birth),
      email: text(data.email),
      phone: text(data.phone_number),
      mobilePhone: text(data.mobile_phone_number),
      address: {
        country: text(address.country),
        prefecture: text(address.prefecture),
        city: text(address.city),
        postalCode: text(address.postal_code),
        fullAddress: text(address.full_address),
      },
      company: text(data.company),
      salary: text(data.salary),
      os: text(data.os),
      userAgent: text(data.user_agent),
      homepage: text(data.homepage),
    };
  }

  function profileToText(profile) {
    const data = normalizeJapanProfile({
      name: profile?.name,
      name_hiragana: profile?.nameHiragana,
      name_katakana: profile?.nameKatakana,
      gender: profile?.gender,
      birth: profile?.birth,
      email: profile?.email,
      phone_number: profile?.phone,
      mobile_phone_number: profile?.mobilePhone,
      address: {
        country: profile?.address?.country,
        prefecture: profile?.address?.prefecture,
        city: profile?.address?.city,
        postal_code: profile?.address?.postalCode,
        full_address: profile?.address?.fullAddress,
      },
      company: profile?.company,
      salary: profile?.salary,
      os: profile?.os,
      user_agent: profile?.userAgent,
      homepage: profile?.homepage,
    });

    return [
      `姓名：${data.name}`,
      `平假名：${data.nameHiragana}`,
      `片假名：${data.nameKatakana}`,
      `性别：${data.gender}`,
      `生日：${data.birth}`,
      `邮箱：${data.email}`,
      `固定电话：${data.phone}`,
      `手机号码：${data.mobilePhone}`,
      `国家：${data.address.country}`,
      `都道府县：${data.address.prefecture}`,
      `市区町村：${data.address.city}`,
      `邮政编码：${data.address.postalCode}`,
      `完整地址：${data.address.fullAddress}`,
      `公司：${data.company}`,
      `薪资：${data.salary}`,
      `操作系统：${data.os}`,
      `User-Agent：${data.userAgent}`,
      `主页：${data.homepage}`,
    ].join("\n");
  }

  return {
    API_PATH,
    buildProfileUrl,
    normalizeJapanProfile,
    profileToText,
  };
});
