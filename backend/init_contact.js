const pool = require("./config/db");

async function createContactTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contact_info (
                id SERIAL PRIMARY KEY,
                company_name VARCHAR(255),
                address TEXT,
                primary_phone VARCHAR(50),
                secondary_phone VARCHAR(50),
                whatsapp_number VARCHAR(50),
                email VARCHAR(255),
                map_embed_url TEXT,
                facebook_url TEXT,
                twitter_url TEXT,
                instagram_url TEXT,
                linkedin_url TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Check if a row exists, if not, insert initial data from contactInfo.js
        const check = await pool.query("SELECT id FROM contact_info LIMIT 1");
        if (check.rows.length === 0) {
            await pool.query(`
                INSERT INTO contact_info (
                    company_name, address, primary_phone, secondary_phone, whatsapp_number, 
                    email, map_embed_url, facebook_url, twitter_url, instagram_url, linkedin_url
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    "N-Skill Training",
                    "361/3, Pillayar Kovil Street, Raghavendra Nagar, Irandamkattalai, Kovur, Chennai - 600 122. India",
                    "+91 - 98842 09774",
                    "+91 - 80560 63023",
                    "+9198842 09774",
                    "nskilltraining@gmail.com",
                    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.355152504856!2d80.1293214!3d13.012892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525fdf8e6b19a3%3A0x6b7b2586e3f1e1e!2sPillayar%20Kovil%20St%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1709476000000!5m2!1sen!2sin",
                    "#", "#", "#", "#"
                ]
            );
            console.log("Initial contact info inserted.");
        }
        
        console.log("Contact info table ready.");
    } catch (err) {
        console.error("Error creating contact info table:", err.message);
    } finally {
        pool.end();
    }
}

createContactTable();
