import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

const successRate = new Rate('success_rate');
const analysisTime = new Trend('analysis_duration');

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '3m', target: 125 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<120000'],
    'success_rate': ['rate>0.5'],
  },
};

const BASE_URL = 'http://fraudbuster.local';

const TEST_PRODUCTS = [
  'https://www.amazon.sg/Sony-WH-CH720N-Canceling-Headphones-Microphone/dp/B0BS1QCFHX/?th=1',
];

export default function () {
  const productUrl = TEST_PRODUCTS[Math.floor(Math.random() * TEST_PRODUCTS.length)];
  
  console.log(`[User ${__VU}] Testing: ${productUrl.substring(30, 60)}...`);
  
  const homepage = http.get(`${BASE_URL}/`);
  check(homepage, {
    'homepage loads': (r) => r.status === 200,
  });
  
  sleep(1);
  
  console.log(`[User ${__VU}] Submitting analysis...`);
  const startTime = Date.now();
  
  const formData = { amazon_url: productUrl };
  const params = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: '120s',
  };
  
  const analysis = http.post(`${BASE_URL}/`, formData, params);
  const duration = Date.now() - startTime;
  analysisTime.add(duration);
  
  const success = check(analysis, {
    'analysis succeeds': (r) => r.status === 200,
    'has results': (r) => r.body && r.body.length > 0,
  });
  
  successRate.add(success);
  
  if (success) {
    console.log(`[User ${__VU}] Completed in ${(duration / 1000).toFixed(2)}s`);
  } else {
    console.log(`[User ${__VU}] Failed (${analysis.status}) after ${(duration / 1000).toFixed(2)}s`);
  }
  
  sleep(2);
}

export function setup() {
  console.log('\n' + '='.repeat(70));
  console.log('AGGRESSIVE KUBERNETES LOAD TEST');
  console.log('='.repeat(70));
  console.log('\nThis test will PUSH YOUR CLUSTER HARD!');
  console.log('\nLoad progression:');
  console.log('  • 0-30s:    50 users (warm up)');
  console.log('  • 30s-2.5m: 100 users (pushing hard) 💪');
  console.log('  • 2.5-5.5m: 125 users (MAXIMUM LOAD!) 🚀');
  console.log('  • 5.5-6.5m: 0 users (finish)');
  console.log('\nExpected outcomes:');
  console.log('  • CPU will spike to 70%+');
  console.log('  • HPA will scale pods from 2 → 8');
  console.log('  • Response times will increase');
  console.log('  • Some requests may timeout (normal under extreme load)');
  console.log('\nWATCH:');
  console.log('  Terminal 2: kubectl get hpa,pods -n fraud-buster');
  console.log('  Terminal 3: kubectl top pods -n fraud-buster');
  console.log('\n' + '='.repeat(70) + '\n');
}

export function teardown() {
  console.log('\n' + '='.repeat(70));
  console.log('AGGRESSIVE LOAD TEST COMPLETED!');
  console.log('='.repeat(70) + '\n');
}

export function handleSummary(data) {
  console.log('\n' + '='.repeat(70));
  console.log('AGGRESSIVE LOAD TEST SUMMARY');
  console.log('='.repeat(70) + '\n');
  
  const metrics = data.metrics;
  
  if (metrics.http_reqs) {
    console.log(`Total HTTP Requests: ${metrics.http_reqs.values.count}`);
    const iterations = metrics.iterations?.values.count || 0;
    console.log(`Complete Analyses: ${iterations}`);
  }
  
  if (metrics.http_req_failed) {
    const failedCount = metrics.http_req_failed.values.passes || 0;
    const totalCount = metrics.http_reqs.values.count;
    const failureRate = totalCount > 0 ? (failedCount / totalCount * 100).toFixed(2) : 0;
    console.log(`Failed Requests: ${failedCount} (${failureRate}%)`);
  }
  
  if (metrics.success_rate) {
    const successPct = (metrics.success_rate.values.rate * 100).toFixed(2);
    console.log(`\nAnalysis Success Rate: ${successPct}%`);
    
    if (parseFloat(successPct) >= 70) {
      console.log('EXCELLENT! System handled heavy load well!');
    } else if (parseFloat(successPct) >= 50) {
      console.log('ACCEPTABLE. System struggled but survived.');
    } else {
      console.log('POOR. System was overwhelmed by the load.');
    }
  }
  
  if (metrics.analysis_duration) {
    console.log('\n⏱Analysis Performance Under Load:');
    console.log(`   Average:  ${(metrics.analysis_duration.values.avg / 1000).toFixed(2)}s`);
    console.log(`   Minimum:  ${(metrics.analysis_duration.values.min / 1000).toFixed(2)}s`);
    console.log(`   Maximum:  ${(metrics.analysis_duration.values.max / 1000).toFixed(2)}s`);
    console.log(`   P95:      ${(metrics.analysis_duration.values['p(95)'] / 1000).toFixed(2)}s`);
    console.log(`   P99:      ${(metrics.analysis_duration.values['p(99)'] / 1000).toFixed(2)}s`);
    
    const avgTime = metrics.analysis_duration.values.avg / 1000;
    if (avgTime < 30) {
      console.log('   ⚡ Still fast under heavy load!');
    } else if (avgTime < 60) {
      console.log('   🐢 Slowed down under pressure (expected).');
    } else {
      console.log('   🐌 Very slow - system was heavily loaded.');
    }
  }
  
  if (metrics.http_req_duration) {
    console.log('\nHTTP Performance:');
    console.log(`   Avg Response: ${(metrics.http_req_duration.values.avg / 1000).toFixed(2)}s`);
    console.log(`   P95 Response: ${(metrics.http_req_duration.values['p(95)'] / 1000).toFixed(2)}s`);
    console.log(`   P99 Response: ${(metrics.http_req_duration.values['p(99)'] / 1000).toFixed(2)}s`);
  }
  
  if (metrics.vus_max) {
    console.log(`\n👥 Peak Concurrent Users: ${metrics.vus_max.values.value}`);
  }
  
  if (metrics.iterations) {
    const duration = data.state.testRunDurationMs / 1000;
    const throughput = (metrics.iterations.values.count / duration).toFixed(2);
    console.log(`\nThroughput: ${throughput} analyses/second`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('POST-TEST ACTIONS:');
  console.log('   1. Check if HPA scaled: kubectl get hpa -n fraud-buster');
  console.log('   2. Verify all pods healthy: kubectl get pods -n fraud-buster');
  console.log('   3. Check resource usage: kubectl top pods -n fraud-buster');
  console.log('   4. Review pod logs for errors');
  console.log('   5. Watch HPA scale back down (takes ~5 minutes)');
  console.log('='.repeat(70) + '\n');
  
  console.log('Generating HTML report...\n');
  
  return {
    'summary.html': htmlReport(data, { 
      title: 'Fraud Buster - Aggressive Load Test Report'
    }),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data, null, 2),
  };
}