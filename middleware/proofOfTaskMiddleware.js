import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    cb(null, path.join(__dirname, '../public/images/proofOfTasks')); // Folder tempat file akan disimpan
  },
  filename: (req, file, cb) => {
    // Mengambil nama asli file tanpa ekstensi
    const originalName = path.parse(file.originalname).name;

    // Mengubah nama file menjadi huruf kecil dan mengganti spasi dengan '-'
    const formattedName = originalName.toLowerCase().replace(/\s+/g, '-');

    // Mendapatkan tanggal saat ini
    const now = new Date();
    const formattedDate =
      `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}` +
      `-${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

    // Menggabungkan nama yang sudah diformat dengan timestamp
    cb(
      null,
      `${formattedName}-${formattedDate}${path.extname(file.originalname)}`,
    );
  },
});

// Filter untuk hanya mengizinkan tipe file gambar
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/; // Daftar tipe file yang diizinkan
  const mimetype = fileTypes.test(file.mimetype); // Cek MIME type
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase()); // Cek ekstensi

  if (mimetype && extname) {
    return cb(null, true); // Izinkan file
  }
  cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
};

// Setup multer
const proofOfTasks = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Maksimal ukuran file 5 MB
  },
  fileFilter: fileFilter,
});

export default proofOfTasks;
