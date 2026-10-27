/**
 * AMSForge Pro - CCSDS 735.1-B-1 & ISO 18459 Spacecraft Asynchronous Message Service (AMS) Engine
 * Implements Subject-Based Publish/Subscribe, Peer-to-Peer Unicast Routing, Continuum/Zone Topology,
 * Message Header Serialization, Meta-AMS (MAMS) Registration, and Heartbeat Liveness Tracking.
 * Standards: CCSDS 735.1-B-1 / CCSDS 871.0-B-1 (Blue Book) / ISO 18459:2015
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AMSEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // CRC-16 (X.25 / CCITT) Implementation
  function crc16(buffer) {
    let crc = 0xFFFF;
    for (let i = 0; i < buffer.length; i++) {
      crc ^= buffer[i];
      for (let j = 0; j < 8; j++) {
        if ((crc & 1) !== 0) {
          crc = (crc >>> 1) ^ 0x8408;
        } else {
          crc = crc >>> 1;
        }
      }
    }
    return (~crc) & 0xFFFF;
  }

  class AMSEngine {
    constructor(options = {}) {
      this.version = "1.0.0";
      this.standard = "CCSDS 735.1-B-1 / ISO 18459:2015";
      this.continuumId = options.continuumId || 1; // Default Flight Continuum
      this.zoneId = options.zoneId || 10;          // Default Avionics Zone
      this.registeredUnits = new Map();             // unitId -> { name, role, lastHeartbeat, subscriptions }
      this.subscriptions = new Map();               // subjectNumber -> Set(unitId)
      this.sequenceCounters = new Map();           // unitId -> currentSeq
      this.messageHistory = [];
    }

    /**
     * Registers a module/unit within the AMS Continuum/Zone (MAMS Registration)
     */
    registerUnit(unitId, name, role) {
      if (this.registeredUnits.has(unitId)) {
        let u = this.registeredUnits.get(unitId);
        u.name = name;
        u.role = role;
        u.lastHeartbeat = Date.now();
        return u;
      }
      let unit = {
        unitId: unitId,
        name: name,
        role: role,
        registeredAt: Date.now(),
        lastHeartbeat: Date.now(),
        subscriptions: new Set()
      };
      this.registeredUnits.set(unitId, unit);
      this.sequenceCounters.set(unitId, 1);
      return unit;
    }

    /**
     * Subscribes a unit to a subject topic
     */
    subscribe(unitId, subjectNumber) {
      if (!this.registeredUnits.has(unitId)) {
        throw new Error(`Unit ID ${unitId} is not registered in AMS continuum.`);
      }
      let unit = this.registeredUnits.get(unitId);
      unit.subscriptions.add(subjectNumber);

      if (!this.subscriptions.has(subjectNumber)) {
        this.subscriptions.set(subjectNumber, new Set());
      }
      this.subscriptions.get(subjectNumber).add(unitId);

      return {
        unitId: unitId,
        subjectNumber: subjectNumber,
        status: "SUBSCRIBED"
      };
    }

    /**
     * Serializes an AMS Message Header & Payload into binary wire format
     * @param {Object} msg - Message fields
     * @returns {Object} { packetBytes, hex, header, payload }
     */
    createMessage(msg = {}) {
      const sourceUnitId = msg.sourceUnitId || 1;
      const destUnitId = msg.destUnitId !== undefined ? msg.destUnitId : 0; // 0 = Pub/Sub Multicast
      const subjectNumber = msg.subjectNumber || 100;
      const priority = msg.priority !== undefined ? msg.priority : 1; // 0=Low, 1=Normal, 2=High, 3=Urgent
      const deliveryMode = msg.deliveryMode !== undefined ? msg.deliveryMode : 1; // 1 = Assured
      const context = msg.context !== undefined ? msg.context : 0;
      const payloadStr = msg.payload || "AMS_HEARTBEAT_DATA";

      let seq = this.sequenceCounters.get(sourceUnitId) || 1;
      this.sequenceCounters.set(sourceUnitId, seq + 1);

      let payloadBytes = (typeof payloadStr === 'string') ? new TextEncoder().encode(payloadStr) : new Uint8Array(payloadStr);

      // Header Size: 18 octets
      // [Continuum (2B) | Zone (2B) | SrcUnit (2B) | DstUnit (2B) | Subject (2B) | Seq (2B) | Context (2B) | Priority (1B) | DeliveryMode (1B) | PayloadLen (2B)]
      let header = new Uint8Array(18);
      header[0] = (this.continuumId >> 8) & 0xFF;
      header[1] = this.continuumId & 0xFF;
      header[2] = (this.zoneId >> 8) & 0xFF;
      header[3] = this.zoneId & 0xFF;
      header[4] = (sourceUnitId >> 8) & 0xFF;
      header[5] = sourceUnitId & 0xFF;
      header[6] = (destUnitId >> 8) & 0xFF;
      header[7] = destUnitId & 0xFF;
      header[8] = (subjectNumber >> 8) & 0xFF;
      header[9] = subjectNumber & 0xFF;
      header[10] = (seq >> 8) & 0xFF;
      header[11] = seq & 0xFF;
      header[12] = (context >> 8) & 0xFF;
      header[13] = context & 0xFF;
      header[14] = priority & 0xFF;
      header[15] = deliveryMode & 0xFF;
      header[16] = (payloadBytes.length >> 8) & 0xFF;
      header[17] = payloadBytes.length & 0xFF;

      // Calculate CRC-16 over header + payload
      let bodyWithoutCrc = new Uint8Array(header.length + payloadBytes.length);
      bodyWithoutCrc.set(header, 0);
      bodyWithoutCrc.set(payloadBytes, header.length);

      let c16 = crc16(bodyWithoutCrc);
      let packetBytes = new Uint8Array(bodyWithoutCrc.length + 2);
      packetBytes.set(bodyWithoutCrc, 0);
      packetBytes[packetBytes.length - 2] = (c16 >> 8) & 0xFF;
      packetBytes[packetBytes.length - 1] = c16 & 0xFF;

      let hex = Array.from(packetBytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

      // Find recipients
      let recipients = [];
      if (destUnitId === 0) {
        // Pub/Sub multicast to all units subscribed to this subject
        let subs = this.subscriptions.get(subjectNumber);
        if (subs) {
          recipients = Array.from(subs).filter(u => u !== sourceUnitId);
        }
      } else {
        recipients = [destUnitId];
      }

      let record = {
        standard: this.standard,
        packetBytes: packetBytes,
        hex: hex,
        totalLength: packetBytes.length,
        header: {
          continuumId: this.continuumId,
          zoneId: this.zoneId,
          sourceUnitId: sourceUnitId,
          destUnitId: destUnitId,
          subjectNumber: subjectNumber,
          sequenceNumber: seq,
          context: context,
          priority: priority,
          deliveryMode: deliveryMode,
          payloadLength: payloadBytes.length,
          crcHex: ((c16 >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase() + (c16 & 0xFF).toString(16).padStart(2, '0').toUpperCase()
        },
        payloadText: (typeof payloadStr === 'string') ? payloadStr : "[Binary Data]",
        recipients: recipients,
        timestamp: Date.now()
      };

      this.messageHistory.push(record);
      return record;
    }

    /**
     * Dissects an AMS binary wire message
     */
    dissectMessage(buffer) {
      let b = (buffer instanceof Uint8Array) ? buffer : new Uint8Array(buffer);
      if (b.length < 20) throw new Error("AMS packet buffer too short (minimum 20 octets including CRC).");

      let continuumId = (b[0] << 8) | b[1];
      let zoneId = (b[2] << 8) | b[3];
      let sourceUnitId = (b[4] << 8) | b[5];
      let destUnitId = (b[6] << 8) | b[7];
      let subjectNumber = (b[8] << 8) | b[9];
      let seq = (b[10] << 8) | b[11];
      let context = (b[12] << 8) | b[13];
      let priority = b[14];
      let deliveryMode = b[15];
      let payloadLength = (b[16] << 8) | b[17];

      let payloadBytes = b.subarray(18, 18 + payloadLength);
      let payloadText = "";
      try {
        payloadText = new TextDecoder().decode(payloadBytes);
      } catch (e) {
        payloadText = "[Binary Payload]";
      }

      let expectedCrc = (b[18 + payloadLength] << 8) | b[19 + payloadLength];
      let calcCrc = crc16(b.subarray(0, 18 + payloadLength));

      return {
        continuumId, zoneId, sourceUnitId, destUnitId, subjectNumber,
        sequenceNumber: seq, context, priority, deliveryMode,
        payloadLength, payloadText,
        crcValid: expectedCrc === calcCrc
      };
    }
  }

  return AMSEngine;
}));
