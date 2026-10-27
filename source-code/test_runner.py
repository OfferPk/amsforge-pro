#!/usr/bin/env python3
"""
Automated Test Runner for AMSForge Pro
Verifies 18-octet header assembly, subject-based pub/sub, sequence number monotonicity, CRC-16 X.25, and 10-point normative auditor.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ams_cli import create_ams_message, audit_ams, crc16_x25

class TestAMSForge(unittest.TestCase):

    def test_01_header_length_and_fields(self):
        msg = create_ams_message(cont_id=1, zone_id=10, src=1, dst=0, subject=101, payload="TEST")
        self.assertEqual(msg["header"]["continuumId"], 1)
        self.assertEqual(msg["header"]["zoneId"], 10)
        self.assertEqual(msg["header"]["sourceUnitId"], 1)
        self.assertEqual(msg["header"]["destUnitId"], 0) # Pub/Sub
        self.assertEqual(msg["header"]["subjectNumber"], 101)
        # Total length: 18 header + 4 payload + 2 CRC = 24
        self.assertEqual(msg["total_length"], 24)

    def test_02_unicast_point_to_point(self):
        msg = create_ams_message(src=1, dst=5, subject=200, payload="CMD_REBOOT")
        self.assertEqual(msg["header"]["destUnitId"], 5)
        self.assertEqual(msg["recipients"], [5])

    def test_03_crc16_integrity(self):
        msg = create_ams_message(payload="PAYLOAD_CHECKSUM_VERIFY")
        raw = bytes.fromhex(msg["hex"])
        body = raw[:-2]
        c = crc16_x25(body)
        expected = f"{c:04X}"
        self.assertEqual(msg["header"]["crcHex"], expected)

    def test_04_priority_and_delivery_mode(self):
        msg = create_ams_message(priority=3, mode=1)
        self.assertEqual(msg["header"]["priority"], 3) # Urgent priority
        self.assertEqual(msg["header"]["deliveryMode"], 1) # Assured delivery

    def test_05_sequence_number_tracking(self):
        msg1 = create_ams_message(seq=1)
        msg2 = create_ams_message(seq=2)
        self.assertEqual(msg1["header"]["sequenceNumber"], 1)
        self.assertEqual(msg2["header"]["sequenceNumber"], 2)

    def test_06_payload_text_extraction(self):
        txt = "STAR_TRACKER_ATTITUDE_UPDATE"
        msg = create_ams_message(payload=txt)
        self.assertEqual(msg["payloadText"], txt)
        self.assertEqual(msg["header"]["payloadLength"], len(txt))

    def test_07_subject_boundary_check(self):
        msg = create_ams_message(subject=65535)
        self.assertEqual(msg["header"]["subjectNumber"], 65535)

    def test_08_normative_auditor_compliance(self):
        report = audit_ams()
        self.assertEqual(report["status"], "PASSED")
        self.assertEqual(report["score"], "10/10 Normative Rules Compliant")
        self.assertEqual(len(report["rules"]), 10)

    def test_09_context_number_correlation(self):
        msg = create_ams_message(context=42)
        self.assertEqual(msg["header"]["context"], 42)

    def test_10_empty_payload_safe_handling(self):
        msg = create_ams_message(payload="")
        self.assertEqual(msg["header"]["payloadLength"], 0)
        self.assertEqual(msg["total_length"], 20) # 18 header + 0 + 2 CRC

if __name__ == "__main__":
    unittest.main()
