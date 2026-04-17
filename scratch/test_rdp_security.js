const rdp = require('node-rdpjs-2');

const host = '192.168.1.154'; // Thinkpad
const username = 'subzero';
const password = 'your-password-here'; // I'll assume the user will test this or I'll just check negotiation

async function test(securitySetting) {
  console.log(`\n--- Testing security: ${JSON.stringify(securitySetting)} ---`);
  return new Promise((resolve) => {
    try {
      const client = rdp.createClient({
        userName: username,
        password: 'password',
        domain: '',
        enableNla: true,
        security: securitySetting,
        ignoreCertificate: true,
        logLevel: 'INFO'
      });

      client.on('ready', () => {
        console.log('[SUCCESS] Connected!');
        client.close();
        resolve(true);
      });

      client.on('error', (err) => {
        console.log('[ERROR] Code:', err.code, 'Msg:', err.message);
        resolve(false);
      });

      client.connect(host, 3389);
      
      // Timeout
      setTimeout(() => {
        client.close();
        resolve(false);
      }, 5000);
    } catch (e) {
      console.log('[INIT ERROR]', e.message);
      resolve(false);
    }
  });
}

async function runAll() {
  await test('TLS');
  await test('NLA');
  await test({ rdp: true, tls: true, nla: true });
}

runAll();
