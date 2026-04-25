import http from 'http';

function request(options, bodyData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        data: data ? JSON.parse(data) : null
      }));
    });
    req.on('error', reject);
    if (bodyData) {
      req.write(JSON.stringify(bodyData));
    }
    req.end();
  });
}

async function run() {
  console.log("1. Authenticating as admin...");
  // Try to find the admin user first directly from DB or just use a known login?
  // Let's first query the DB directly to get the admin email
}
run();
