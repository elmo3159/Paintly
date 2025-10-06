const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Paintly テストサーバー</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          background: white;
          color: #333;
          padding: 30px;
          border-radius: 15px;
          display: inline-block;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        h1 { color: #667eea; margin-bottom: 20px; }
        .success { color: #28a745; font-size: 24px; margin: 20px 0; }
        .info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎨 Paintly テストサーバー</h1>
        <div class="success">✅ 接続成功！</div>
        <div class="info">
          <strong>サーバー情報:</strong><br>
          ポート: 9000<br>
          時刻: ${new Date().toLocaleString('ja-JP')}<br>
          WSL IP: 172.17.161.101
        </div>
        <p><strong>この画面が表示されれば、WSLからWindowsへの接続は正常です</strong></p>
        <p>Next.jsアプリも同様にアクセス可能なはずです</p>
      </div>
    </body>
    </html>
  `);
});

server.listen(9000, '0.0.0.0', () => {
  console.log('🚀 テストサーバー起動: http://0.0.0.0:9000');
  console.log('🌐 Windows からアクセス: http://172.17.161.101:9000');
  console.log('🔗 または: http://localhost:9000');
});