import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const principalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: "Murad Khalil" },
    whatsapp: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

principalSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

principalSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

principalSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("Principal", principalSchema);
