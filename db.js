// SQLite database setup for Anupam Dental using sqlite3 module
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'anupam-dental.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database open error:', err);
  } else {
    console.log('Connected to SQLite database');
    initDb();
  }
});

// Initialize tables
function initDb() {
  db.serialize(() => {
    // Doctors table
    db.run(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        specialization TEXT,
        contact TEXT,
        license TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Patients table
    db.run(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        contact TEXT,
        notes TEXT,
        lastVisit DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Appointments table
    db.run(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER,
        doctorId INTEGER,
        service TEXT,
        servicePrice REAL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        contact TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE SET NULL
      )
    `, (err) => {
      if (err) console.error('Appointments table error:', err);
    });

    // Treatment history table
    db.run(`
      CREATE TABLE IF NOT EXISTS treatmentHistory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointmentId INTEGER,
        patientId INTEGER,
        doctorId INTEGER,
        treatmentType TEXT,
        notes TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE CASCADE,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE SET NULL
      )
    `);
  });
}

// Promise wrapper for db operations
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Exported functions for CRUD operations
module.exports = {
  db,
  
  // Doctor functions
  async getDoctors() {
    return dbAll('SELECT * FROM doctors ORDER BY name');
  },
  
  async getDoctorById(id) {
    return dbGet('SELECT * FROM doctors WHERE id = ?', [id]);
  },
  
  async addDoctor(name, specialization, contact, license) {
    const result = await dbRun('INSERT INTO doctors (name, specialization, contact, license) VALUES (?, ?, ?, ?)', [name, specialization, contact, license]);
    return { id: result.id, name, specialization, contact, license };
  },
  
  async updateDoctor(id, name, specialization, contact, license) {
    await dbRun('UPDATE doctors SET name = ?, specialization = ?, contact = ?, license = ? WHERE id = ?', [name, specialization, contact, license, id]);
    return this.getDoctorById(id);
  },
  
  async deleteDoctor(id) {
    await dbRun('DELETE FROM doctors WHERE id = ?', [id]);
  },

  // Patient functions
  async getPatients() {
    return dbAll('SELECT * FROM patients ORDER BY name');
  },
  
  async getPatientById(id) {
    return dbGet('SELECT * FROM patients WHERE id = ?', [id]);
  },
  
  async addPatient(name, age, contact, notes) {
    const result = await dbRun('INSERT INTO patients (name, age, contact, notes) VALUES (?, ?, ?, ?)', [name, age, contact, notes]);
    return { id: result.id, name, age, contact, notes };
  },
  
  async updatePatient(id, name, age, contact, notes) {
    await dbRun('UPDATE patients SET name = ?, age = ?, contact = ?, notes = ? WHERE id = ?', [name, age, contact, notes, id]);
    return this.getPatientById(id);
  },
  
  async deletePatient(id) {
    await dbRun('DELETE FROM patients WHERE id = ?', [id]);
  },

  // Appointment functions
  async getAppointments(filters = {}) {
    let query = 'SELECT a.*, p.name as patientName, d.name as doctorName FROM appointments a LEFT JOIN patients p ON a.patientId = p.id LEFT JOIN doctors d ON a.doctorId = d.id';
    const conditions = [];
    const params = [];
    
    if (filters.doctorId) {
      conditions.push('a.doctorId = ?');
      params.push(filters.doctorId);
    }
    if (filters.patientId) {
      conditions.push('a.patientId = ?');
      params.push(filters.patientId);
    }
    if (filters.date) {
      conditions.push('a.date = ?');
      params.push(filters.date);
    }
    if (filters.status) {
      conditions.push('a.status = ?');
      params.push(filters.status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY a.date, a.time';
    
    return dbAll(query, params);
  },
  
  async getAppointmentById(id) {
    return dbGet('SELECT a.*, p.name as patientName, d.name as doctorName FROM appointments a LEFT JOIN patients p ON a.patientId = p.id LEFT JOIN doctors d ON a.doctorId = d.id WHERE a.id = ?', [id]);
  },
  
  async checkConflict(doctorId, date, time, excludeId = null) {
    // Check if doctor already has appointment at same time
    let query = 'SELECT COUNT(*) as count FROM appointments WHERE doctorId = ? AND date = ? AND time = ? AND status != "cancelled"';
    const params = [doctorId, date, time];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const result = await dbGet(query, params);
    return result && result.count > 0;
  },
  
  async addAppointment(patientId, doctorId, service, servicePrice, date, time, notes, contact = null) {
    // Check for conflict
    if (doctorId) {
      const conflict = await this.checkConflict(doctorId, date, time);
      if (conflict) {
        throw new Error('Doctor already has an appointment at this time');
      }
    }
    
    const result = await dbRun('INSERT INTO appointments (patientId, doctorId, service, servicePrice, date, time, notes, contact, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [patientId, doctorId, service, servicePrice, date, time, notes, contact, 'confirmed']);
    return this.getAppointmentById(result.id);
  },
  
  async updateAppointment(id, patientId, doctorId, service, servicePrice, date, time, notes, status) {
    // Check for conflict (exclude current appointment)
    if (doctorId) {
      const conflict = await this.checkConflict(doctorId, date, time, id);
      if (conflict) {
        throw new Error('Doctor already has an appointment at this time');
      }
    }
    
    await dbRun('UPDATE appointments SET patientId = ?, doctorId = ?, service = ?, servicePrice = ?, date = ?, time = ?, notes = ?, status = ? WHERE id = ?', [patientId, doctorId, service, servicePrice, date, time, notes, status, id]);
    return this.getAppointmentById(id);
  },
  
  async deleteAppointment(id) {
    await dbRun('DELETE FROM appointments WHERE id = ?', [id]);
  },

  // Doctor-patient history
  async getDoctorPatientHistory(doctorId) {
    return dbAll(`
      SELECT 
        a.id,
        a.date,
        a.time,
        a.service,
        a.status,
        p.id as patientId,
        p.name as patientName,
        COALESCE(p.contact, a.contact) as patientContact,
        th.notes as treatmentNotes,
        th.treatmentType
      FROM appointments a
      LEFT JOIN patients p ON a.patientId = p.id
      LEFT JOIN treatmentHistory th ON a.id = th.appointmentId
      WHERE a.doctorId = ? AND a.status IN ('completed', 'confirmed')
      ORDER BY a.date DESC, a.time DESC
    `, [doctorId]);
  },

  // Treatment history
  async addTreatmentRecord(appointmentId, patientId, doctorId, treatmentType, notes) {
    return dbRun('INSERT INTO treatmentHistory (appointmentId, patientId, doctorId, treatmentType, notes) VALUES (?, ?, ?, ?, ?)', [appointmentId, patientId, doctorId, treatmentType, notes]);
  }
};

