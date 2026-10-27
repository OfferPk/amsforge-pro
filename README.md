\# AMSForge Pro (v1.0.0)  
\#\#\# CCSDS 735.1-B-1 & ISO 18459 Spacecraft Asynchronous Message Service (AMS) Studio & Flight Bus Broker

AMSForge Pro is an aerospace-grade developer studio, subject-based publish/subscribe message broker, peer-to-peer unicast router, continuum/zone topology manager, heartbeat liveness monitor, and 10-point normative compliance auditor designed for spacecraft flight software (e.g. NASA Core Flight System / cFS), payload modules, and avionics testbeds (EGSE).

\---

\#\# 🌟 Key Capabilities  
\- \*\*Subject-Based Publish/Subscribe Routing\*\*: Multicast message distribution to registered subscriber units based on numerical subject topic numbers (\$1 \\le S \\le 65535\$).  
\- \*\*Direct Peer-to-Peer Unicast & Query/Reply\*\*: Point-to-point command dispatch and asynchronous two-way request/response transactions with 16-bit context correlation.  
\- \*\*Topological Continuum & Zone Addressing\*\*: Models multi-tiered space missions across Ventures, Continua, Zones, and Units per CCSDS 735.1-B-1 specifications.  
\- \*\*Normative 18-Octet Header Packing\*\*: Serializes Continuum ID, Zone ID, Source Unit ID, Destination Unit ID, Subject Number, Sequence Counter, Context, Priority (0..3), Delivery Mode (Best-Effort vs Assured), and Payload Length.  
\- \*\*CRC-16 Integrity Trailer\*\*: Appends and validates binary Frame Check Sequence (CRC-16 X.25) over entire header and payload.  
\- \*\*10-Point Normative Auditor\*\*: Automated verification engine enforcing rules \`AMS-001\` through \`AMS-010\` per official CCSDS Blue Book standards.

\---

\#\# 📂 Project Structure  
\`\`\`text  
ams-forge-pro/  
├── source-code/  
│   ├── ams-engine.js            \# Core AMS broker, subject router & MAMS manager  
│   ├── ams-auditor.js           \# 10-point normative compliance auditor  
│   ├── ams\_cli.py               \# Python 3 CLI executable  
│   ├── ams-cli.py               \# Python 3 CLI alias  
│   ├── test\_runner.py           \# 10-suite unit test runner  
│   └── index.html               \# Interactive Mission Control operations console  
├── build/  
│   └── ams-forge-pro-v1.0.0.zip \# Standalone production bundle  
├── documentation/  
│   ├── CCSDS\_AMS\_SPECIFICATION.md \# Normative protocol specification  
│   └── AMS\_COMPLIANCE\_MATRIX.md   \# 10-point requirement traceability  
└── screenshots/  
    ├── architecture-diagram.svg   \# System architecture diagram  
    └── ams-studio-preview.svg     \# Operations studio interface preview  
\`\`\`

\---

\#\# 🚀 Quick Start

\#\#\# Running Automated Tests  
\`\`\`bash  
python3 source-code/test\_runner.py \-v  
\`\`\`

\#\#\# Command Line Interface  
\`\`\`bash  
\# Publish telemetry to subject topic 101  
python3 source-code/ams\_cli.py \--mode publish \--src 1 \--subject 101 \--payload "ATTITUDE\_OK"

\# Send unicast command directly to Unit ID 3  
python3 source-code/ams\_cli.py \--mode send \--src 1 \--dst 3 \--subject 200 \--payload "TRIGGER\_CAMERA"

\# Run 10-Point Normative Compliance Audit  
python3 source-code/ams\_cli.py \--mode audit  
\`\`\`

\#\#\# Launching the Web Operations Console  
Open \`source-code/index.html\` in any web browser for interactive unit registration, pub/sub topic dispatching, hex wire stream inspection, and compliance scorecard verification.  
