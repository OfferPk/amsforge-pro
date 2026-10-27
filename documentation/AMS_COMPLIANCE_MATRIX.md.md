\# CCSDS 735.1-B-1 Normative Compliance Matrix

\| Rule ID \| Normative Requirement \| Standard Reference \| Implementation Verification \| Status \|  
\| :--- \| :--- \| :--- \| :--- \| :--- \|  
\| \*\*AMS-001\*\* \| Header Structure & Addressing \| Section 3.2 \| Verifies 18-octet header with Continuum, Zone, Unit IDs \| \*\*PASS\*\* \|  
\| \*\*AMS-002\*\* \| Subject Number Range Conformity \| Section 3.3.1 \| Enforces valid subject numbers \$1 \\le S \\le 65535\$ \| \*\*PASS\*\* \|  
\| \*\*AMS-003\*\* \| Delivery Mode & Priority Segregation \| Section 3.3.2 \| Enforces Best-Effort vs Assured modes & Priority 0..3 \| \*\*PASS\*\* \|  
\| \*\*AMS-004\*\* \| Monotonic Sequence Number Integrity \| Section 3.2.4 \| Enforces monotonic sequence counter per source unit \| \*\*PASS\*\* \|  
\| \*\*AMS-005\*\* \| Query/Reply Context Correlation \| Section 3.4.3 \| Validates Context identifier matching for transactions \| \*\*PASS\*\* \|  
\| \*\*AMS-006\*\* \| Pub/Sub Topic Multicast Routing \| Section 4.2 \| Validates subject topic distribution to registered units \| \*\*PASS\*\* \|  
\| \*\*AMS-007\*\* \| MAMS Registration & Role Binding \| Section 5.2 \| Validates unit configuration and role metadata binding \| \*\*PASS\*\* \|  
\| \*\*AMS-008\*\* \| Heartbeat Liveness & Fault Detection \| Section 5.4 \| Verifies keepalive monitoring and liveness tracking \| \*\*PASS\*\* \|  
\| \*\*AMS-009\*\* \| Message Serialization & CRC Check \| Section 3.2.6 \| Verifies wire framing and CRC-16 X.25 trailer checks \| \*\*PASS\*\* \|  
\| \*\*AMS-010\*\* \| Flight Subsystem (cFS) Interoperability \| Section 1.2 \| Compatible with NASA Core Flight System (cFS) message bus \| \*\*PASS\*\* \|

\#\#\# Compliance Score: 10 / 10 Normative Rules Compliant (100% PASS)  
