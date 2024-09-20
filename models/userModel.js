import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    alamat: {
      type: String,
      required: true,
    },

    jenisKelamin: {
      type: String,
      required: true,
      enum: ['Laki-laki', 'Perempuan'],
    },

    tanggalLahir: {
      type: Date,
      required: true,
    },

    noDana: {
      type: String,
      required: true,
      unique: true,
    },

    totalReward: {
      type: Number,
      default: 0,
    },

    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
