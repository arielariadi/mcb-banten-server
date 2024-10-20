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
      required: function () {
        return this.role === 'user';
      },
    },

    jenisKelamin: {
      type: String,
      required: function () {
        return this.role === 'user';
      },
      enum: ['Laki-laki', 'Perempuan'],
    },

    tanggalLahir: {
      type: Date,
      required: function () {
        return this.role === 'user';
      },
    },

    noHp: {
      type: String,
      required: function () {
        return this.role === 'user';
      },
      unique: true,
      validate: {
        validator: function (value) {
          return /^08\d{0,11}$/.test(value); // Memastikan dimulai dengan "08" dan maksimal 13 digit
        },
        message: (props) =>
          `${props.value} tidak valid! Nomor HP harus dimulai dengan "08" dan terdiri dari maksimal 13 digit.`,
      },
    },

    totalReward: {
      type: Number,
      default: 0,
      required: function () {
        return this.role === 'user';
      },
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
