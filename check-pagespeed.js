const https = require('https');

const url = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.paintly.pro&strategy=mobile&category=performance';

https.get(url, (res) => {
  let data = '';

  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);

      if (json.error) {
        console.error('API Error:', json.error.message);
        return;
      }

      if (!json.lighthouseResult) {
        console.log('Full response:', JSON.stringify(json, null, 2).substring(0, 500));
        return;
      }

      const score = Math.round(json.lighthouseResult.categories.performance.score * 100);
      const audits = json.lighthouseResult.audits;

      console.log('=== PageSpeed Insights Results (Mobile) ===');
      console.log('Performance Score:', score + '/100');
      console.log('');
      console.log('Core Web Vitals:');
      console.log('  LCP (Largest Contentful Paint):', audits['largest-contentful-paint']?.displayValue || 'N/A');
      console.log('  FCP (First Contentful Paint):', audits['first-contentful-paint']?.displayValue || 'N/A');
      console.log('  TBT (Total Blocking Time):', audits['total-blocking-time']?.displayValue || 'N/A');
      console.log('  CLS (Cumulative Layout Shift):', audits['cumulative-layout-shift']?.displayValue || 'N/A');
      console.log('  Speed Index:', audits['speed-index']?.displayValue || 'N/A');

    } catch (error) {
      console.error('Parse error:', error.message);
      console.log('Raw data (first 500 chars):', data.substring(0, 500));
    }
  });
}).on('error', (error) => {
  console.error('Request error:', error.message);
});
