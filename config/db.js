const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

// Database file path
const dbPath = path.join(dbDir, 'appointment.db');

// Initialize database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database schema
function initializeDatabase() {
    // Create doctors table
    db.run(`
        CREATE TABLE IF NOT EXISTS doctors (
                                               id_doc INTEGER PRIMARY KEY AUTOINCREMENT,
                                               nom TEXT NOT NULL,
                                               ville TEXT,
                                               email TEXT UNIQUE NOT NULL,
                                               imageurl TEXT,
                                               telephone TEXT,
                                               specialite TEXT,
                                               password TEXT NOT NULL
        )
    `);

    // Create clients table
    db.run(`
        CREATE TABLE IF NOT EXISTS clients (
                                               id_clt INTEGER PRIMARY KEY AUTOINCREMENT,
                                               nom TEXT NOT NULL,
                                               ville TEXT,
                                               email TEXT UNIQUE NOT NULL,
                                               imageurl TEXT,
                                               telephone TEXT,
                                               password TEXT NOT NULL
        )
    `);

    // Create rendez_vous (appointments) table
    db.run(`
        CREATE TABLE IF NOT EXISTS rendez_vous (
                                                   id_rdv INTEGER PRIMARY KEY AUTOINCREMENT,
                                                   status TEXT DEFAULT 'pending',
                                                   date TEXT NOT NULL,
                                                   description_rdv TEXT,
                                                   id_doc INTEGER,
                                                   id_clt INTEGER,
                                                   FOREIGN KEY (id_doc) REFERENCES doctors (id_doc),
            FOREIGN KEY (id_clt) REFERENCES clients (id_clt)
            )
    `);

    // Create messages table
    db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id_message INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      sender_type TEXT NOT NULL,
      receiver_id INTEGER NOT NULL,
      receiver_type TEXT NOT NULL,
      message_content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

    console.log('Database tables initialized');

    // Check if we need to seed sample data (if tables are empty)
    checkAndSeedSampleData();
}

// Check if sample data needs to be inserted
function checkAndSeedSampleData() {
    db.get('SELECT COUNT(*) as count FROM doctors', [], (err, result) => {
        if (err) {
            console.error('Error checking doctors count:', err);
            return;
        }

        if (result.count === 0) {
            console.log('No doctors found, seeding sample data...');
            seedSampleData();
        } else {
            console.log(`Database already has ${result.count} doctors. No seeding required.`);
        }
    });
}

// Insert sample data for testing
async function seedSampleData() {
    try {
        // Create hashed password for sample accounts
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Insert sample doctors
        const doctors = [
            {
                nom: 'Dr. Othmane',
                ville: 'Casablanca',
                email: 'othmane@example.com',
                telephone: '+212 612345678',
                specialite: 'Heart Specialist',
                password: hashedPassword
            },
            {
                nom: 'Dr. Yousri BOUZOK',
                ville: 'Rabat',
                email: 'yousri@example.com',
                telephone: '+212 623456789',
                specialite: 'Heart Specialist',
                password: hashedPassword
            },
            {
                nom: 'Dr. Soufiane RAHIMI',
                ville: 'Marrakech',
                email: 'soufiane@example.com',
                telephone: '+212 634567890',
                specialite: 'General Medicine',
                password: hashedPassword
            }
        ];

        // Insert sample clients
        const clients = [
            {
                nom: 'Ziad EL BAROUDI',
                ville: 'Casablanca',
                email: 'ziad@example.com',
                telephone: '+212 645678901',
                password: hashedPassword
            },
            {
                nom: 'Simo KERROUMI',
                ville: 'Rabat',
                email: 'simo@example.com',
                telephone: '+212 656789012',
                password: hashedPassword
            }
        ];

        // Insert the data
        for (const doctor of doctors) {
            db.run(
                `INSERT INTO doctors (nom, ville, email, telephone, specialite, password)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [doctor.nom, doctor.ville, doctor.email, doctor.telephone, doctor.specialite, doctor.password],
                function(err) {
                    if (err) {
                        console.error('Error inserting doctor:', err);
                    } else {
                        console.log(`Doctor added with ID: ${this.lastID}`);
                    }
                }
            );
        }

        for (const client of clients) {
            db.run(
                `INSERT INTO clients (nom, ville, email, telephone, password)
         VALUES (?, ?, ?, ?, ?)`,
                [client.nom, client.ville, client.email, client.telephone, client.password],
                function(err) {
                    if (err) {
                        console.error('Error inserting client:', err);
                    } else {
                        console.log(`Client added with ID: ${this.lastID}`);

                        // Add sample appointments for this client
                        if (this.lastID) {
                            addSampleAppointments(this.lastID);
                        }
                    }
                }
            );
        }

        console.log('Sample data seeding completed');

    } catch (error) {
        console.error('Error seeding sample data:', error);
    }
}

// Add sample appointments
function addSampleAppointments(clientId) {
    // Get a doctor ID
    db.get('SELECT id_doc FROM doctors LIMIT 1', [], (err, doctor) => {
        if (err || !doctor) {
            console.error('Error getting doctor for appointments:', err);
            return;
        }

        // Create sample appointments
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = [
            {
                date: new Date(today.setHours(13, 10, 0, 0)).toISOString(),
                status: 'confirmed',
                description: 'Regular checkup'
            },
            {
                date: new Date(tomorrow.setHours(14, 0, 0, 0)).toISOString(),
                status: 'pending',
                description: 'Follow-up appointment'
            }
        ];

        for (const appointment of appointments) {
            db.run(
                `INSERT INTO rendez_vous (date, status, description_rdv, id_doc, id_clt)
         VALUES (?, ?, ?, ?, ?)`,
                [appointment.date, appointment.status, appointment.description, doctor.id_doc, clientId],
                function(err) {
                    if (err) {
                        console.error('Error inserting appointment:', err);
                    } else {
                        console.log(`Appointment added with ID: ${this.lastID}`);
                    }
                }
            );
        }
    });
}

// Export database instance
module.exports = db;