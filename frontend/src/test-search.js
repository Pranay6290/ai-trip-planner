// Quick test script for search functionality
import { searchIndianDestinations } from './data/indianDestinations.js';

// Test searches
const testQueries = ['Digha', 'Kolkata', 'Jharkhand', 'Ranchi', 'Mumbai', 'Goa'];

console.log('🧪 Testing Indian Destinations Search:');
console.log('=====================================');

testQueries.forEach(query => {
  const results = searchIndianDestinations(query);
  console.log(`\n🔍 Search: "${query}"`);
  console.log(`📊 Results: ${results.length} found`);
  
  if (results.length > 0) {
    results.forEach((dest, index) => {
      console.log(`   ${index + 1}. ${dest.name} (${dest.state})`);
      console.log(`      Category: ${dest.category} | Rating: ${dest.rating}`);
      console.log(`      Description: ${dest.description}`);
    });
  } else {
    console.log('   ❌ No results found');
  }
});

console.log('\n🎯 Summary:');
testQueries.forEach(query => {
  const results = searchIndianDestinations(query);
  const status = results.length > 0 ? '✅' : '❌';
  console.log(`${status} ${query}: ${results.length} results`);
});

export { searchIndianDestinations };
