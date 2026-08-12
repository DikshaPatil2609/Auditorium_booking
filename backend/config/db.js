const oracledb = require('oracledb');
require('dotenv').config();

try {
    oracledb.initOracleClient();
} catch (err) {
    console.error("Warning: Oracle Thick mode failed to init - ", err);
}

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true; // Auto-commit on to replicate basic MySQL behaviour

let pool;

async function initPool() {
    try {
        pool = await oracledb.createPool({
            user: process.env.DB_USER || 'admin',
            password: process.env.DB_PASSWORD || 'password',
            connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XEPDB1',
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 1
        });
        console.log('Connected to Oracle Database');
    } catch (err) {
        console.error('Failed to create Oracle DB pool: ', err);
    }
}

initPool();

const db = {
    // Wrapper to replicate the `const [rows] = await db.query(...)` syntax
    query: async (sqlText, binds = []) => {
        if (!pool) throw new Error('Database pool not initialized');
        let connection;
        try {
            connection = await pool.getConnection();
            const result = await connection.execute(sqlText, binds);
            
            // Oracle returns column names in uppercase by default. We map them to lowercase.
            let rows = result.rows || [];
            rows = rows.map(row => {
                const lowerRow = {};
                for (const key of Object.keys(row)) {
                    lowerRow[key.toLowerCase()] = row[key];
                }
                return lowerRow;
            });
            
            // Replicate affectedRows for UPDATE/INSERT tracking
            rows.affectedRows = result.rowsAffected || 0;
            
            // Note: For INSERTS returning IDs, oracle uses outBinds. We append outBinds to result object for access if needed.
            if (result.outBinds) {
               rows.outBinds = result.outBinds;
            }

            return [rows, result.metaData];
        } catch (err) {
            throw err;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection: ', err);
                }
            }
        }
    }
};

module.exports = db;
