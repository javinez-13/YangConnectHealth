import pool from '../config/database.js';

async function addProfilePictureColumn() {
  try {
    // Check if column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='profile_picture_url'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('Adding profile_picture_url column to users table...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN profile_picture_url TEXT
      `);
      console.log('✅ Successfully added profile_picture_url column');
    } else {
      console.log('✅ profile_picture_url column already exists');
      // Check if it needs to be altered to TEXT type
      const columnInfo = await pool.query(`
        SELECT data_type, character_maximum_length
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='profile_picture_url'
      `);
      if (columnInfo.rows[0]?.data_type === 'character varying' && columnInfo.rows[0]?.character_maximum_length < 10000) {
        console.log('Updating column type to TEXT for larger images...');
        await pool.query(`
          ALTER TABLE users 
          ALTER COLUMN profile_picture_url TYPE TEXT
        `);
        console.log('✅ Successfully updated column type to TEXT');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addProfilePictureColumn();

