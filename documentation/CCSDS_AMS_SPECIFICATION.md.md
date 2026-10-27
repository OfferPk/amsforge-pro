\# CCSDS 735.1-B-1 & ISO 18459 Spacecraft Asynchronous Message Service Specification

\#\# 1\. Scope & Operational Role  
The \*\*Consultative Committee for Space Data Systems (CCSDS)\*\* Recommendation \*\*CCSDS 735.1-B-1\*\* (and international standard \*\*ISO 18459:2015\*\*) defines the \*\*Asynchronous Message Service (AMS)\*\*.

AMS establishes an architectural standard for publisher-subscriber and peer-to-peer message interchange designed specifically for spacecraft flight software modules (e.g. NASA Core Flight System / cFS), avionics buses, payload instruments, robotic surface rovers, and ground integration testbeds (EGSE).

\---

\#\# 2\. Structural & Topological Model  
AMS organizes communicating entities into a strictly governed four-level hierarchy:  
\- \*\*Venture\*\*: The overarching mission or operational context (e.g., \`LUNAR\_GATEWAY\_MISSION\`).  
\- \*\*Continuum\*\*: A distinct communication fabric or network segment (e.g., \`FLIGHT\_INTERNAL\_BUS\`, \`GROUND\_EGSE\`).  
\- \*\*Zone\*\*: A logical sub-network domain within a continuum (e.g., \`AVIONICS\_ZONE\`, \`PAYLOAD\_ZONE\`).  
\- \*\*Unit\*\*: A specific physical or logical computing module (e.g., \`GN\&C\_COMPUTER\`, \`STAR\_TRACKER\`, \`SCIENCE\_CAMERA\`).

\---

\#\# 3\. Communication Models  
AMS supports four complementary communication semantics:  
1\. \*\*Publish / Subscribe\*\*: Multi-point distribution where subscribers register interest in numerical \*\*Subject Numbers\*\* (\$1 \\le S \\le 65535\$). Publishers emit messages without prior knowledge of subscriber identities.  
2\. \*\*Send (Unicast)\*\*: Directed point-to-point peer messaging from a specific source unit to a target destination unit.  
3\. \*\*Query / Reply\*\*: Asynchronous two-way request-response transaction paired via a 16-bit \*\*Context\*\* identifier.  
4\. \*\*Announce\*\*: Continental or zonal broadcast message delivery.

\---

\#\# 4\. Message Wire Header Structure (18 Octets)  
Every AMS message is framed by a 18-octet standard header:  
\- \`Continuum ID\` (16 bits)  
\- \`Zone ID\` (16 bits)  
\- \`Source Unit ID\` (16 bits)  
\- \`Destination Unit ID\` (16 bits, 0 for pub/sub)  
\- \`Subject Number\` (16 bits)  
\- \`Sequence Number\` (16 bits)  
\- \`Context Number\` (16 bits)  
\- \`Priority\` (8 bits: 0 \= Low, 1 \= Normal, 2 \= High, 3 \= Urgent)  
\- \`Delivery Mode\` (8 bits: 0 \= Best-Effort, 1 \= Assured, 2 \= Urgent)  
\- \`Payload Length\` (16 bits)  
\- Followed by application payload bytes and a 16-bit CRC-16 (X.25) trailer.  
