const http = require('http');
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
console.log('Terhubung ke Firebase Firestore');

const host = 'localhost';
const port = 3001;

const requestListener = async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    if (req.url === '/' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ message: "Server berjalan dan terhubung ke Firebase!" }));

    } else if (req.url === '/register' && req.method === 'POST') {
        try {
            const body = await bacaBody(req);
            const { username, password } = body;

            if (!username || !password) {
                kirimRespon(res, 400, { error: 'Username dan password harus diisi' });
                return;
            }

            const userRef = db.collection('users').doc(username);
            const doc = await userRef.get();

            if (doc.exists) {
                kirimRespon(res, 409, { error: 'Username sudah dipakai' });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await userRef.set({
                username: username,
                password: hashedPassword,
                createdAt: new Date()
            });

            const topikList = ['glb', 'glbb', 'vertikal', 'parabola'];
            const batch = db.batch();
            
            topikList.forEach(topik => {
                const progressRef = userRef.collection('progressKuis').doc(topik);
                batch.set(progressRef, {
                    topik: topik,
                    selesai: false,
                    skor: 0,
                    jawaban: [],
                    createdAt: new Date()
                });
            });
            
            await batch.commit();

            kirimRespon(res, 201, { message: 'Akun berhasil dibuat' });

        } catch (error) {
            console.error('Error registrasi:', error);
            kirimRespon(res, 500, { error: 'Terjadi kesalahan pada server' });
        }

    } else if (req.url === '/login' && req.method === 'POST') {
        try {
            const body = await bacaBody(req);
            const { username, password } = body;

            if (!username || !password) {
                kirimRespon(res, 400, { error: 'Username dan password harus diisi' });
                return;
            }

            const userRef = db.collection('users').doc(username);
            const doc = await userRef.get();

            if (!doc.exists) {
                kirimRespon(res, 401, { error: 'Username atau password salah' });
                return;
            }

            const userData = doc.data();
            const passwordBenar = await bcrypt.compare(password, userData.password);

            if (!passwordBenar) {
                kirimRespon(res, 401, { error: 'Username atau password salah' });
                return;
            }

            const token = jwt.sign(
                { username: username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            kirimRespon(res, 200, { 
                message: 'Login berhasil',
                token: token,
                username: username
            });

        } catch (error) {
            console.error('Error login:', error);
            kirimRespon(res, 500, { error: 'Terjadi kesalahan pada server' });
        }

    } else if (req.url === '/progress-kuis' && req.method === 'GET') {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                kirimRespon(res, 401, { error: 'Token tidak ditemukan' });
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const username = decoded.username;

            const userRef = db.collection('users').doc(username);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                kirimRespon(res, 404, { error: 'User tidak ditemukan' });
                return;
            }

            const progressSnapshot = await userRef.collection('progressKuis').get();
            
            if (progressSnapshot.empty) {
                kirimRespon(res, 200, { progressKuis: {} });
                return;
            }

            const progressKuis = {};
            progressSnapshot.forEach(doc => {
                const data = doc.data();
                progressKuis[doc.id] = {
                    selesai: data.selesai,
                    skor: data.skor,
                    jawaban: data.jawaban,
                    terakhirDikerjakan: data.terakhirDikerjakan
                };
            });

            kirimRespon(res, 200, { progressKuis });

        } catch (error) {
            console.error('Error ambil progress:', error);
            kirimRespon(res, 500, { error: 'Terjadi kesalahan pada server' });
        }

    } else if (req.url === '/progress-kuis' && req.method === 'POST') {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                kirimRespon(res, 401, { error: 'Token tidak ditemukan' });
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const username = decoded.username;

            const body = await bacaBody(req);
            const { topik, skor, jawaban, selesai } = body;

            if (!topik) {
                kirimRespon(res, 400, { error: 'Topik harus diisi' });
                return;
            }

            const userRef = db.collection('users').doc(username);
            const progressRef = userRef.collection('progressKuis').doc(topik);
            
            await progressRef.set({
                topik: topik,
                selesai: selesai || false,
                skor: skor || 0,
                jawaban: jawaban || [],
                terakhirDikerjakan: new Date()
            }, { merge: true });

            kirimRespon(res, 200, { message: 'Progress kuis berhasil disimpan' });

        } catch (error) {
            console.error('Error simpan progress:', error);
            kirimRespon(res, 500, { error: 'Terjadi kesalahan pada server' });
        }

    } else {
        kirimRespon(res, 404, 'Halaman tidak ditemukan', 'text/plain');
    }
};

function bacaBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
    });
}

function kirimRespon(res, statusCode, data, contentType = 'application/json') {
    res.setHeader('Content-Type', contentType);
    res.writeHead(statusCode);
    if (contentType === 'application/json') {
        res.end(JSON.stringify(data));
    } else {
        res.end(data);
    }
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server berjalan di http://${host}:${port}`);
});