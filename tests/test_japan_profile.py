from __future__ import annotations

import unittest
from unittest.mock import patch

from webapp.server import fetch_japan_profile, sanitize_japan_profile


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

    def test_fetch_japan_profile_uses_keyword_endpoint_and_sanitizes_response(self):
        class FakeResponse:
            status_code = 200

            def json(self):
                return {
                    "name": "鈴木 一郎",
                    "nationalid": 987654321098,
                    "credit_card_info": {"security_code": "999"},
                    "address": {"prefecture": "東京都", "city": "新宿区"},
                }

        with patch("curl_cffi.requests.get", return_value=FakeResponse()) as get:
            result = fetch_japan_profile("東京都 新宿区")

        self.assertEqual(
            get.call_args.args[0],
            "https://hant.ratenn.com/jp-address/generate-by-keywords/%E6%9D%B1%E4%BA%AC%E9%83%BD%20%E6%96%B0%E5%AE%BF%E5%8C%BA",
        )
        self.assertEqual(result["name"], "鈴木 一郎")
        self.assertNotIn("nationalid", result)
        self.assertNotIn("credit_card_info", result)


if __name__ == "__main__":
    unittest.main()
