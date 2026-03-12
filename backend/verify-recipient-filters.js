const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function verifyRecipientFilters() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'safehaven_db'
  });

  try {
    console.log('Checking most recent SMS blast with recipient_filters...\n');
    
    // Get the most recent blast with filters
    const [blasts] = await connection.query(`
      SELECT 
        id, 
        message,
        recipient_filters,
        recipient_count,
        created_at 
      FROM sms_blasts 
      WHERE recipient_filters IS NOT NULL
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (blasts.length === 0) {
      console.log('✗ No blasts found with recipient_filters');
      console.log('Try sending a new SMS blast from the web interface');
      return;
    }
    
    const blast = blasts[0];
    console.log('Most Recent Blast with Filters:');
    console.log('================================');
    console.log(`Blast ID: ${blast.id}`);
    console.log(`Created: ${blast.created_at}`);
    console.log(`Message: ${blast.message.substring(0, 50)}...`);
    console.log(`Recipients: ${blast.recipient_count}`);
    console.log('\nRecipient Filters (Raw):');
    console.log(blast.recipient_filters);
    console.log('\nRecipient Filters (Parsed):');
    
    try {
      const filters = typeof blast.recipient_filters === 'string' 
        ? JSON.parse(blast.recipient_filters)
        : blast.recipient_filters;
      
      console.log(JSON.stringify(filters, null, 2));
      
      // Verify structure
      console.log('\n✓ Verification:');
      console.log(`  - Provinces: ${filters.provinces?.length || 0} (${filters.provinces?.join(', ') || 'none'})`);
      console.log(`  - Cities: ${filters.cities?.length || 0} (${filters.cities?.join(', ') || 'none'})`);
      console.log(`  - Barangays: ${filters.barangays?.length || 0} (${filters.barangays?.join(', ') || 'none'})`);
      console.log(`  - Contact Groups: ${filters.contactGroupIds?.length || 0}`);
      
      if (filters.provinces?.includes('Pangasinan')) {
        console.log('\n✅ SUCCESS: Pangasinan filter found!');
      } else {
        console.log('\n⚠️  WARNING: Pangasinan not found in filters');
      }
      
    } catch (e) {
      console.error('✗ Error parsing JSON:', e.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

verifyRecipientFilters().catch(console.error);
