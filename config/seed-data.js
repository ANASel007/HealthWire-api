const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Database file path
const dbPath = path.join(__dirname, 'database', 'appointment.db');

// Connect to database
const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error('Could not connect to database', err);
        process.exit(1);
    }

    console.log('Connected to database, seeding data...');

    try {
        // Create hashed password
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

        // Clear existing data
        await runQuery('DELETE FROM messages');
        await runQuery('DELETE FROM rendez_vous');
        await runQuery('DELETE FROM clients');
        await runQuery('DELETE FROM doctors');

        console.log('Tables cleared, inserting new data...');

        // Insert doctors
        for (const doctor of doctors) {
            await runQuery(
                `INSERT INTO doctors (nom, ville, email, telephone, specialite, password)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [doctor.nom, doctor.ville, doctor.email, doctor.telephone, doctor.specialite, doctor.password]
            );
        }

        console.log('Doctors inserted successfully');

        // Insert clients
        for (const client of clients) {
            await runQuery(
                `INSERT INTO clients (nom, ville, email, telephone, password)
         VALUES (?, ?, ?, ?, ?)`,
                [client.nom, client.ville, client.email, client.telephone, client.password]
            );
        }

        console.log('Clients inserted successfully');

        // Get IDs of inserted records
        const doctorIds = await getIds('doctors', 'id_doc');
        const clientIds = await getIds('clients', 'id_clt');

        // Create appointments
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = [
            {
                date: new Date(today.setHours(13, 10, 0, 0)).toISOString(),
                status: 'confirmed',
                description: 'Regular checkup',
                doctorId: doctorIds[0],
                clientId: clientIds[0]
            },
            {
                date: new Date(tomorrow.setHours(14, 0, 0, 0)).toISOString(),
                status: 'pending',
                description: 'Follow-up appointment',
                doctorId: doctorIds[0],
                clientId: clientIds[1]
            },
            {
                date: new Date(tomorrow.setHours(15, 30, 0, 0)).toISOString(),
                status: 'pending',
                description: 'Initial consultation',
                doctorId: doctorIds[1],
                clientId: clientIds[0]
            }
        ];

        // Insert appointments
        for (const appointment of appointments) {
            await runQuery(
                `INSERT INTO rendez_vous (date, status, description_rdv, id_doc, id_clt)
         VALUES (?, ?, ?, ?, ?)`,
                [
                    appointment.date,
                    appointment.status,
                    appointment.description,
                    appointment.doctorId,
                    appointment.clientId
                ]
            );
        }

        console.log('Appointments inserted successfully');

        // Create sample messages
        const messages = [
            {
                senderId: doctorIds[0],
                senderType: 'doctor',
                receiverId: clientIds[0],
                receiverType: 'client',
                content: 'Hello, how can I assist you today?',
                created: new Date(today.setHours(10, 30, 0, 0)).toISOString()
            },
            {
                senderId: clientIds[0],
                senderType: 'client',
                receiverId: doctorIds[0],
                receiverType: 'doctor',
                content: 'I need to reschedule my appointment.',
                created: new Date(today.setHours(10, 35, 0, 0)).toISOString()
            },
            {
                senderId: doctorIds[1],
                senderType: 'doctor',
                receiverId: clientIds[0],
                receiverType: 'client',
                content: 'Your appointment is confirmed.',
                created: new Date(today.setHours(9, 15, 0, 0)).toISOString()
            }
        ];

        // Insert messages
        for (const message of messages) {
            await runQuery(
                `INSERT INTO messages (sender_id, sender_type, receiver_id, receiver_type, message_content, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    message.senderId,
                    message.senderType,
                    message.receiverId,
                    message.receiverType,
                    message.content,
                    0, // Not read
                    message.created
                ]
            );
        }

        console.log('Messages inserted successfully');
        console.log('Data seeding completed!');

        // Close database connection
        db.close();
        process.exit(0);

    } catch (error) {
        console.error('Error seeding data:', error);
        db.close();
        process.exit(1);
    }
});

// Helper function to run queries as promises
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// Helper function to get IDs from a table
function getIds(table, idColumn) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT ${idColumn} FROM ${table}`, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(row => row[idColumn]));
        });
    });
}