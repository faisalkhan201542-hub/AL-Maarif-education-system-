import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import Student from '../models/Student.js';
import FeeChallan from '../models/FeeChallan.js';

let client = null;
let qrCodeDataURL = null;
let status = 'DISCONNECTED'; // DISCONNECTED, AWAITING_QR, CONNECTED

const fmtMoney = (val) => "Rs. " + Number(val).toLocaleString('en-PK');

export const initializeWhatsApp = () => {
  if (client) {
    console.log("WhatsApp client already initialized.");
    return;
  }

  console.log("Initializing WhatsApp Client...");
  
  const puppeteerOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  };

  // Use hardcoded path only on Windows local environments
  if (process.platform === 'win32') {
    puppeteerOptions.executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  }

  client = new Client({
    authStrategy: new LocalAuth({ clientId: "almaarif-session" }),
    puppeteer: puppeteerOptions
  });

  client.on('qr', async (qr) => {
    console.log('WhatsApp QR Code received. Awaiting scan...');
    status = 'AWAITING_QR';
    try {
      qrCodeDataURL = await qrcode.toDataURL(qr);
    } catch (err) {
      console.error("Failed to generate QR Data URL", err);
    }
  });

  client.on('ready', () => {
    console.log('WhatsApp Client is READY!');
    status = 'CONNECTED';
    qrCodeDataURL = null;
  });

  client.on('authenticated', () => {
    console.log('WhatsApp Authenticated!');
  });

  client.on('auth_failure', msg => {
    console.error('WhatsApp Authentication failure', msg);
    status = 'DISCONNECTED';
    qrCodeDataURL = null;
  });

  client.on('disconnected', (reason) => {
    console.log('WhatsApp Client disconnected:', reason);
    status = 'DISCONNECTED';
    qrCodeDataURL = null;
    if (client) {
      client.destroy();
      client = null;
    }
  });

  // Chatbot Logic
  client.on('message', async (msg) => {
    if (!msg.body) return;
    
    const text = msg.body.trim().toUpperCase();
    
    // Simple command parser: e.g. "FEE 104"
    if (text.startsWith("FEE ")) {
      const regNo = text.split(" ")[1];
      if (regNo) {
        try {
          const student = await Student.findOne({ registrationNumber: regNo, status: 'Active' });
          if (!student) {
            await msg.reply(`Sorry, no active student found with Registration Number: ${regNo}`);
            return;
          }

          // Calculate pending fees
          const unpaidChallans = await FeeChallan.find({ 
            student: student._id, 
            paymentStatus: { $ne: 'Paid' } 
          });

          if (unpaidChallans.length === 0) {
            await msg.reply(`Al-Maarif Education: There are no pending fees for ${student.name}. Thank you!`);
            return;
          }

          let totalPending = 0;
          let breakdown = "";
          unpaidChallans.forEach(c => {
            const remaining = c.remainingAmount;
            totalPending += remaining;
            breakdown += `- ${c.billingMonth}: ${fmtMoney(remaining)}\n`;
          });

          const reply = `*Al-Maarif Education*\n\nStudent: ${student.name}\nClass: ${student.class}\n\n*Pending Fee Details:*\n${breakdown}\n*Total Outstanding:* ${fmtMoney(totalPending)}\n\nPlease ensure timely payment to avoid late fines.`;
          await msg.reply(reply);
        } catch (error) {
          console.error("Error processing FEE command:", error);
          await msg.reply("An error occurred while fetching fee details. Please try again later.");
        }
      }
    }
    else if (text === "HELP") {
      await msg.reply(`*Al-Maarif Education Bot*\n\nAvailable Commands:\n- *FEE [RegNo]* (e.g. FEE 104) to check pending fee balance.\n- *HELP* to see this message.`);
    }
  });

  client.initialize();
};

export const getStatus = () => {
  return { status, qrCode: qrCodeDataURL };
};

export const logout = async () => {
  if (client) {
    await client.logout();
    await client.destroy();
    client = null;
    status = 'DISCONNECTED';
    qrCodeDataURL = null;
  }
};

export const startConnection = async () => {
  if (status === 'DISCONNECTED' || !client) {
    initializeWhatsApp();
  }
  return getStatus();
};

export const sendMessage = async (phone, message) => {
  if (status !== 'CONNECTED' || !client) {
    throw new Error("WhatsApp client is not connected.");
  }
  
  let formattedPhone = phone.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('03') && formattedPhone.length === 11) {
    formattedPhone = '92' + formattedPhone.substring(1);
  }
  
  const chatId = `${formattedPhone}@c.us`;
  
  try {
    const isRegistered = await client.isRegisteredUser(chatId);
    if (!isRegistered) {
      throw new Error(`Phone number ${phone} is not registered on WhatsApp.`);
    }
    await client.sendMessage(chatId, message);
    return true;
  } catch (error) {
    console.error(`Failed to send WhatsApp message to ${phone}:`, error);
    throw error;
  }
};
