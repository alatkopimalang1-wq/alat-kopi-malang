const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Konfigurasi Origin Toko (Kecamatan Tlogomas, Kota Malang, Jawa Timur 65144)
const SHIPPING_ORIGIN = {
  subdistrict: 'Tlogomas, Kec. Lowokwaru',
  city: 'Kota Malang',
  province: 'Jawa Timur',
  postal_code: 65144
};

// Tarif dasar per Kg dari Origin Tlogomas, Kota Malang (65144) berdasarkan zona tujuan
const ZONE_BASE_RATES = {
  malang_raya: { jne_reg: 9000, jne_next: 15000, jnt_reg: 9000, sicepat_reg: 8500, sicepat_next: 14000, etd_reg: '1 - 2 Hari', etd_next: '1 Hari' },
  jatim:       { jne_reg: 12000, jne_next: 21000, jnt_reg: 12500, sicepat_reg: 11500, sicepat_next: 20000, etd_reg: '1 - 3 Hari', etd_next: '1 Hari' },
  jateng_diy:  { jne_reg: 18000, jne_next: 30000, jnt_reg: 19000, sicepat_reg: 17500, sicepat_next: 28000, etd_reg: '2 - 3 Hari', etd_next: '1 - 2 Hari' },
  jabar_banten_dki: { jne_reg: 22000, jne_next: 36000, jnt_reg: 23000, sicepat_reg: 21500, sicepat_next: 34000, etd_reg: '2 - 4 Hari', etd_next: '1 - 2 Hari' },
  bali_ntb:    { jne_reg: 24000, jne_next: 40000, jnt_reg: 25000, sicepat_reg: 23500, sicepat_next: 38000, etd_reg: '2 - 4 Hari', etd_next: '1 - 2 Hari' },
  luar_jawa:   { jne_reg: 38000, jne_next: 58000, jnt_reg: 40000, sicepat_reg: 37000, sicepat_next: 55000, etd_reg: '3 - 6 Hari', etd_next: '2 - 3 Hari' }
};

function calculateFallbackRates(destinationProvince, destinationCity, destinationPostalCode, totalWeightGrams) {
  const weightKg = Math.max(1, Math.ceil((Number(totalWeightGrams) || 1000) / 1000));
  const prov = String(destinationProvince || '').toLowerCase();
  const city = String(destinationCity || '').toLowerCase();

  let zone = ZONE_BASE_RATES.luar_jawa;
  if (city.includes('malang') || city.includes('batu')) {
    zone = ZONE_BASE_RATES.malang_raya;
  } else if (prov.includes('jawa timur')) {
    zone = ZONE_BASE_RATES.jatim;
  } else if (prov.includes('jawa tengah') || prov.includes('yogyakarta')) {
    zone = ZONE_BASE_RATES.jateng_diy;
  } else if (prov.includes('jawa barat') || prov.includes('jakarta') || prov.includes('banten')) {
    zone = ZONE_BASE_RATES.jabar_banten_dki;
  } else if (prov.includes('bali') || prov.includes('nusa tenggara')) {
    zone = ZONE_BASE_RATES.bali_ntb;
  }

  return [
    {
      courier_code: 'jne',
      courier_name: 'JNE Express',
      service_code: 'REG',
      service_name: 'Layanan Reguler (REG)',
      etd: zone.etd_reg,
      price: zone.jne_reg * weightKg
    },
    {
      courier_code: 'jne',
      courier_name: 'JNE Express',
      service_code: 'YES',
      service_name: 'Yakin Esok Sampai (Next Day)',
      etd: zone.etd_next,
      price: zone.jne_next * weightKg
    },
    {
      courier_code: 'jnt',
      courier_name: 'J&T Express',
      service_code: 'EZ',
      service_name: 'Reguler (EZ)',
      etd: zone.etd_reg,
      price: zone.jnt_reg * weightKg
    },
    {
      courier_code: 'sicepat',
      courier_name: 'SiCepat Ekspres',
      service_code: 'SIUNT',
      service_name: 'SiUntung (Reguler)',
      etd: zone.etd_reg,
      price: zone.sicepat_reg * weightKg
    },
    {
      courier_code: 'sicepat',
      courier_name: 'SiCepat Ekspres',
      service_code: 'BEST',
      service_name: 'Besok Sampai Tujuan (Next Day)',
      etd: zone.etd_next,
      price: zone.sicepat_next * weightKg
    }
  ];
}
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];

  // API Endpoint: Cek Ongkos Kirim Otomatis (Origin: Tlogomas, Kota Malang 65144 -> JNE, J&T, SiCepat)
  if (req.method === 'POST' && reqUrl === '/api/shipping/calculate-cost') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const destProvince = payload.province || 'Jawa Timur';
        const destCity = payload.city || 'Kota Malang';
        const destDistrict = payload.district || '';
        const destPostalCode = parseInt(payload.destination_postal_code) || 65144;
        const items = Array.isArray(payload.items) ? payload.items : [];
        const computedWeight = items.length > 0
          ? items.reduce((sum, it) => sum + ((Number(it.weight) || 500) * (Number(it.quantity) || 1)), 0)
          : (Number(payload.weight) || 1000);
        const totalWeightGrams = Math.max(1, computedWeight);

        const rates = calculateFallbackRates(destProvince, destCity, destPostalCode, totalWeightGrams);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          origin: SHIPPING_ORIGIN,
          destination: {
            province: destProvince,
            city: destCity,
            district: destDistrict,
            postal_code: destPostalCode
          },
          total_weight_grams: totalWeightGrams,
          billed_weight_kg: Math.max(1, Math.ceil(totalWeightGrams / 1000)),
          rates
        }));
      } catch (err) {
        res.writeHead(422, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Gagal menghitung ongkos kirim: ' + err.message }));
      }
    });
    return;
  }

  // API Endpoint: Upload Media (Video / Gambar) langsung ke server lokal
  if (req.method === 'POST' && reqUrl === '/api/upload-media') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Batasi hingga 150MB untuk video resolusi tinggi
      if (body.length > 150 * 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Ukuran file melebihi batas maksimal (150MB)' }));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        let filename = payload.filename || `reel_${Date.now()}.mp4`;
        filename = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const ext = path.extname(filename).toLowerCase();
        if (!['.mp4', '.webm', '.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
          filename += '.mp4';
        }

        const base64Data = (payload.base64Data || '').replace(/^data:([A-Za-z-+\/]+);base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const savePath = path.join(__dirname, 'images', filename);

        fs.writeFileSync(savePath, buffer);

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          success: true,
          url: `images/${filename}`,
          filename: filename,
          size: buffer.length
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  } else if (reqUrl === '/admin' || reqUrl === '/admin/') {
    reqUrl = '/admin.html';
  } else if (reqUrl === '/tentang-kami' || reqUrl === '/about') {
    reqUrl = '/about.html';
  }

  const filePath = path.join(__dirname, reqUrl);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Support HTTP 206 Partial Content for smooth video seeking & autoplay in browsers
    if (ext === '.mp4' || ext === '.webm') {
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600'
        });
        fileStream.pipe(res);
        return;
      }
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
