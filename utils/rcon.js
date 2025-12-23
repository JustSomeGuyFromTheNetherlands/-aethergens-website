const net = require('net');

class RCON {
  constructor(host, port, password) {
    this.host = host;
    this.port = parseInt(port);
    this.password = password;
    this.requestId = 0;
    this.authenticated = false;
    this.socket = null;
  }

  async connect() {
    if (this.socket && !this.socket.destroyed && this.authenticated) {
      return true;
    }

    this.disconnect();

    return new Promise((resolve, reject) => {
      this.socket = net.createConnection(this.port, this.host, () => {
        this.authenticate()
          .then(() => resolve(true))
          .catch(reject);
      });

      this.socket.on('error', reject);
      this.socket.setTimeout(5000);
      this.socket.on('timeout', () => {
        this.socket.destroy();
        reject(new Error('RCON connection timeout'));
      });
    });
  }

  async authenticate() {
    this.requestId = 1;
    await this.writePacket(3, this.password);
    const response = await this.readPacket();

    if (response.id === -1 || response.type !== 2) {
      this.disconnect();
      throw new Error('RCON authentication failed - incorrect password');
    }

    this.authenticated = true;
  }

  async sendCommand(command) {
    if (!this.authenticated) {
      await this.connect();
    }

    await this.writePacket(2, command);
    const response = await this.readPacket();
    return response.body;
  }

  writePacket(type, body) {
    return new Promise((resolve, reject) => {
      this.requestId++;

      const packet = Buffer.allocUnsafe(4 + 4 + body.length + 2);
      packet.writeInt32LE(4 + 4 + body.length + 2, 0); // Length
      packet.writeInt32LE(this.requestId, 4); // ID
      packet.writeInt32LE(type, 8); // Type
      packet.write(body, 12); // Body
      packet.writeUInt8(0, 12 + body.length); // Null terminator
      packet.writeUInt8(0, 13 + body.length); // Empty null terminator

      this.socket.write(packet, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  readPacket() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('RCON read timeout'));
      }, 5000);

      this.socket.once('data', (data) => {
        clearTimeout(timeout);

        if (data.length < 4) {
          reject(new Error('RCON: Invalid packet'));
          return;
        }

        const length = data.readInt32LE(0);
        if (length < 10 || length > 4096) {
          reject(new Error(`RCON: Invalid packet length: ${length}`));
          return;
        }

        const id = data.readInt32LE(4);
        const type = data.readInt32LE(8);
        const body = data.slice(12).toString('utf8').replace(/\0/g, '');

        resolve({ id, type, body });
      });

      this.socket.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  disconnect() {
    if (this.socket && !this.socket.destroyed) {
      this.socket.destroy();
    }
    this.socket = null;
    this.authenticated = false;
  }

  async banPlayer(username, reason = 'Banned by admin') {
    // Escape reason for command
    const escapedReason = reason.replace(/"/g, '\\"');
    return await this.sendCommand(`ban ${username} "${escapedReason}"`);
  }

  async banIP(ip, reason = 'IP Banned by admin') {
    // Escape reason for command
    const escapedReason = reason.replace(/"/g, '\\"');
    return await this.sendCommand(`ip-ban ${ip} "${escapedReason}"`);
  }

  async unbanPlayer(username) {
    return await this.sendCommand(`pardon ${username}`);
  }

  async unbanIP(ip) {
    return await this.sendCommand(`ip-pardon ${ip}`);
  }

  async kickPlayer(username, reason = 'Kicked by admin') {
    return await this.sendCommand(`kick ${username} ${reason}`);
  }

  async broadcast(message) {
    return await this.sendCommand(`say ${message}`);
  }

  async listPlayers() {
    return await this.sendCommand('list');
  }

  async execute(command) {
    return await this.sendCommand(command);
  }
}

async function getRCON() {
  const { getDB } = require('../database');
  const db = getDB();

  const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
  if (!serverSettings) {
    throw new Error('Server not configured');
  }

  const rconHostResult = await db.fetchOne("SELECT value FROM config WHERE `key` = 'rcon_host'");
  const rconHost = rconHostResult ? rconHostResult.value : serverSettings.server_ip;

  const rconPortResult = await db.fetchOne("SELECT value FROM config WHERE `key` = 'rcon_port'");
  const rconPort = rconPortResult ? parseInt(rconPortResult.value) : 2755;

  const rconPasswordResult = await db.fetchOne("SELECT value FROM config WHERE `key` = 'rcon_password'");
  const rconPassword = rconPasswordResult ? rconPasswordResult.value : 'cheese';

  // Initialize defaults if not set
  if (!rconHostResult) {
    await db.query(
      "INSERT INTO config (`key`, `value`, updated_at) VALUES ('rcon_host', ?, NOW()) ON DUPLICATE KEY UPDATE `value` = ?, updated_at = NOW()",
      [rconHost, rconHost]
    );
  }
  if (!rconPortResult) {
    await db.query(
      "INSERT INTO config (`key`, `value`, updated_at) VALUES ('rcon_port', ?, NOW()) ON DUPLICATE KEY UPDATE `value` = ?, updated_at = NOW()",
      [rconPort.toString(), rconPort.toString()]
    );
  }
  if (!rconPasswordResult) {
    await db.query(
      "INSERT INTO config (`key`, `value`, updated_at) VALUES ('rcon_password', ?, NOW()) ON DUPLICATE KEY UPDATE `value` = ?, updated_at = NOW()",
      [rconPassword, rconPassword]
    );
  }

  return new RCON(rconHost, rconPort, rconPassword);
}

module.exports = { RCON, getRCON };

