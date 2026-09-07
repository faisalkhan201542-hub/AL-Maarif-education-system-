import mongoose from "mongoose";

const schoolSettingsSchema = new mongoose.Schema(
  {
    schoolName: { type: String, default: "Al-Maarif Education" },
    logoUrl: { type: String, default: "" },
    address: { type: String, default: "512, Near Professor Colony" },
    principalName: { type: String, default: "Murad Khalil" },
    principalWhatsapp: { type: String, default: "+923139163732" },
    schoolPhone: { type: String, default: "+923139163732" },
    schoolEmail: { type: String, default: "info@almaarifeducation.edu.pk" },
    googleMapsLink: { type: String, default: "" },
    academicYear: { type: String, default: "2026" },
    // EasyPaisa settings (Section 48)
    paymentMethod: { type: String, default: "EasyPaisa" },
    easypaisaNumber: { type: String, default: "+923139163732" },
    easypaisaAccountName: { type: String, default: "Murad Khalil" },
    paymentInstructions: {
      type: String,
      default:
        "1. Open EasyPaisa.\n2. Send the required fee amount to the school's EasyPaisa number.\n3. Keep the transaction receipt/reference number.\n4. Provide the transaction reference to the school for confirmation.",
    },
  },
  { timestamps: true }
);

// Singleton pattern helper
schoolSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model("SchoolSettings", schoolSettingsSchema);
