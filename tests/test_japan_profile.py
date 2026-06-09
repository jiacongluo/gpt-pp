from __future__ import annotations

import unittest
from unittest.mock import patch

from webapp.server import fetch_japan_profile, load_japan_postal_areas, sanitize_japan_profile


class JapanProfileTests(unittest.TestCase):
    def test_sanitize_japan_profile_keeps_only_approved_fields(self):
        raw = {
            "name": "佐藤 花子",
            "name_hiragana": "さとう はなこ",
            "name_katakana": "サトウ ハナコ",
            "gender": "女",
            "birth": "1994-04-18",
            "nationalid": 123456789012,
            "email": "hanako@example.jp",
            "phone_number": "03-1234-5678",
            "mobile_phone_number": "090-1234-5678",
            "company": "合同会社テスト",
            "salary": "350000 JPY",
            "os": "Mac OS X",
            "user_agent": "Mozilla/5.0",
            "homepage": "example.jp",
            "password": "secret",
            "security_question": {"question": "secret", "answer": "secret"},
            "credit_card_info": {
                "card_number": "4111111111111111",
                "security_code": "123",
            },
            "address": {
                "country": "日本",
                "prefecture": "東京都",
                "city": "港区",
                "postal_code": "106-0044",
                "full_address": "東京都港区東麻布1-8-1",
            },
        }

        result = sanitize_japan_profile(raw)

        self.assertEqual(result["name"], "佐藤 花子")
        self.assertEqual(result["address"]["prefecture"], "東京都")
        self.assertNotIn("nationalid", result)
        self.assertNotIn("credit_card_info", result)
        self.assertNotIn("password", result)
        self.assertNotIn("security_question", result)

    def test_fetch_japan_profile_generates_locally_without_network(self):
        with patch("curl_cffi.requests.get", side_effect=AssertionError("network must not be used")) as get:
            result = fetch_japan_profile("東京都")

        self.assertEqual(result["address"]["prefecture"], "東京都")
        self.assertRegex(result["address"]["postal_code"], r"^\d{3}-\d{4}$")
        self.assertRegex(result["email"], r"@example\.(?:com|jp|co\.jp)$")
        self.assertFalse(get.called)
        self.assertNotIn("nationalid", result)
        self.assertNotIn("credit_card_info", result)

    def test_fetch_japan_profile_keyword_can_match_city_or_postal_prefix(self):
        by_city = fetch_japan_profile("那覇市")
        by_postal = fetch_japan_profile("900")

        self.assertEqual(by_city["address"]["prefecture"], "沖縄県")
        self.assertEqual(by_city["address"]["city"], "那覇市")
        self.assertEqual(by_postal["address"]["postal_code"][:3], "900")

    def test_japan_profile_uses_full_offline_postal_dataset(self):
        areas = load_japan_postal_areas()
        prefectures = {area["prefecture"] for area in areas}

        self.assertGreater(len(areas), 100000)
        self.assertEqual(len(prefectures), 47)
        self.assertIn("沖縄県", prefectures)
        self.assertIn("東京都", prefectures)


if __name__ == "__main__":
    unittest.main()
