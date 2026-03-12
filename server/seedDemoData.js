import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import BusinessProfile from './models/BusinessProfile.js';
import Client from './models/Client.js';
import Income from './models/Income.js';
import Expense from './models/Expense.js';
import Invoice from './models/Invoice.js';
import InvoiceLineItem from './models/InvoiceLineItem.js';
import Budget from './models/Budget.js';

dotenv.config();

const DEMO_EMAIL = 'demo@trubalance.com';
const DEMO_PASSWORD = 'demo123';

// ─── Helper ──────────────────────────────────────────────
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Seed Function ───────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Clean existing demo data ─────────────────────────
    const existingUser = await User.findOne({ email: DEMO_EMAIL });
    if (existingUser) {
      const uid = existingUser._id;
      const invoices = await Invoice.find({ userId: uid });
      const invoiceIds = invoices.map(i => i._id);

      await InvoiceLineItem.deleteMany({ invoiceId: { $in: invoiceIds } });
      await Invoice.deleteMany({ userId: uid });
      await Client.deleteMany({ userId: uid });
      await Income.deleteMany({ userId: uid });
      await Expense.deleteMany({ userId: uid });
      await Budget.deleteMany({ userId: uid });
      await BusinessProfile.deleteMany({ userId: uid });
      await User.deleteOne({ _id: uid });
      console.log('🗑️  Cleared old demo data');
    }

    // ── 1. Create Demo User ──────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, salt);

    const user = await User.create({
      name: 'Arya Verma',
      email: DEMO_EMAIL,
      password: hashedPassword,
      hasCompletedProfile: true
    });
    console.log('👤 Demo user created');

    // ── 2. Business Profile ──────────────────────────────
    const profile = await BusinessProfile.create({
      userId: user._id,
      businessName: 'Verma Digital Solutions',
      businessType: 'Freelancer',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      address: {
        street: '42, Andheri East, Saki Naka',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400072'
      },
      phone: '9876543210',
      email: 'hello@vermadigital.in',
      website: 'https://vermadigital.in',
      bankDetails: {
        accountNumber: '920020043265412',
        ifsc: 'UTIB0002083',
        bankName: 'Axis Bank',
        branch: 'Andheri East'
      },
      termsAndConditions: 'Payment is due within 15 days of invoice date. Late payments attract 1.5% monthly interest. All disputes subject to Mumbai jurisdiction.'
    });

    user.businessProfileId = profile._id;
    await user.save();
    console.log('🏢 Business profile created');

    // ── 3. Clients ───────────────────────────────────────
    const clientsData = [
      {
        clientName: 'TechNova Solutions Pvt. Ltd.',
        contactPerson: 'Rahul Mehta',
        email: 'rahul@technova.io',
        phone: '9823456789',
        gstin: '27AADCT1234F1Z5',
        address: { street: '301, Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', pincode: '400051' },
        notes: 'Premium client — web app + mobile development'
      },
      {
        clientName: 'GreenLeaf Organics',
        contactPerson: 'Priya Sharma',
        email: 'priya@greenleaf.co.in',
        phone: '9812345670',
        gstin: '29AADCG5678H1Z2',
        address: { street: '12, Koramangala 4th Block', city: 'Bengaluru', state: 'Karnataka', pincode: '560034' },
        notes: 'E-commerce platform for organic produce'
      },
      {
        clientName: 'UrbanNest Interiors',
        contactPerson: 'Vikram Singh',
        email: 'vikram@urbannest.com',
        phone: '9898765432',
        gstin: '07AADCU9012J1Z8',
        address: { street: '56, Hauz Khas Village', city: 'New Delhi', state: 'Delhi', pincode: '110016' },
        notes: 'Interior design portfolio website + booking system'
      },
      {
        clientName: 'CloudSync Analytics',
        contactPerson: 'Neha Gupta',
        email: 'neha@cloudsync.in',
        phone: '9845123456',
        gstin: '27AADCC3456K1Z1',
        address: { street: '88, Viman Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411014' },
        notes: 'SaaS dashboard and analytics tool'
      },
      {
        clientName: 'FitZone Wellness',
        contactPerson: 'Arun Patel',
        email: 'arun@fitzone.app',
        phone: '9867890123',
        gstin: '24AADCF7890L1Z4',
        address: { street: '15, SG Highway', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
        notes: 'Fitness tracking app — React Native'
      }
    ];

    const clients = await Client.insertMany(
      clientsData.map(c => ({ ...c, userId: user._id }))
    );
    console.log('👥 5 clients created');

    // ── 4. Income Records (~30) ──────────────────────────
    const incomeEntries = [
      // Jan 2026
      { title: 'TechNova - Website Redesign', amount: 85000, category: 'Freelance', date: new Date('2026-01-05'), icon: '💻' },
      { title: 'Monthly Retainer - CloudSync', amount: 45000, category: 'Business', date: new Date('2026-01-10'), icon: '🤝' },
      { title: 'Stock Dividends - Q4 2025', amount: 12500, category: 'Investments', date: new Date('2026-01-15'), icon: '📈' },
      { title: 'UI/UX Consultation - FitZone', amount: 25000, category: 'Freelance', date: new Date('2026-01-22'), icon: '🎨' },
      { title: 'Affiliate Commission - Hosting', amount: 8200, category: 'Other', date: new Date('2026-01-28'), icon: '💰' },
      // Feb 2026
      { title: 'GreenLeaf E-commerce Sprint 1', amount: 120000, category: 'Freelance', date: new Date('2026-02-03'), icon: '🛒' },
      { title: 'Monthly Retainer - CloudSync', amount: 45000, category: 'Business', date: new Date('2026-02-10'), icon: '🤝' },
      { title: 'UrbanNest Portfolio Site', amount: 55000, category: 'Freelance', date: new Date('2026-02-18'), icon: '🏠' },
      { title: 'Workshop - React Masterclass', amount: 35000, category: 'Other', date: new Date('2026-02-25'), icon: '📚' },
      { title: 'Mutual Fund Returns', amount: 7800, category: 'Investments', date: new Date('2026-02-28'), icon: '📈' },
      // Mar 2026
      { title: 'TechNova - Mobile App Phase 1', amount: 150000, category: 'Freelance', date: new Date('2026-03-01'), icon: '📱' },
      { title: 'Monthly Retainer - CloudSync', amount: 45000, category: 'Business', date: new Date('2026-03-10'), icon: '🤝' },
      { title: 'FitZone App Development', amount: 95000, category: 'Freelance', date: new Date('2026-03-12'), icon: '🏋️' },
      { title: 'GreenLeaf Sprint 2 Payment', amount: 120000, category: 'Freelance', date: new Date('2026-03-20'), icon: '🛒' },
      { title: 'Code Review Consulting', amount: 18000, category: 'Business', date: new Date('2026-03-25'), icon: '🔍' },
      // Apr 2026 (partial — future projections)
      { title: 'TechNova - Mobile App Phase 2', amount: 150000, category: 'Freelance', date: new Date('2026-01-18'), icon: '📱' },
      { title: 'UrbanNest Booking System', amount: 75000, category: 'Freelance', date: new Date('2026-01-25'), icon: '📅' },
      // More scattered entries
      { title: 'SEO Audit - GreenLeaf', amount: 20000, category: 'Business', date: new Date('2026-02-14'), icon: '🔎' },
      { title: 'API Integration Project', amount: 42000, category: 'Freelance', date: new Date('2026-03-08'), icon: '🔗' },
      { title: 'Domain Resale Profit', amount: 15000, category: 'Other', date: new Date('2026-01-12'), icon: '🌐' },
      { title: 'Fixed Deposit Interest', amount: 9500, category: 'Investments', date: new Date('2026-03-01'), icon: '🏦' },
      { title: 'CloudSync Dashboard Upgrade', amount: 65000, category: 'Freelance', date: new Date('2026-02-20'), icon: '📊' },
      { title: 'Training Session - Node.js', amount: 28000, category: 'Other', date: new Date('2026-03-15'), icon: '🎓' },
      { title: 'FitZone UI Redesign', amount: 38000, category: 'Freelance', date: new Date('2026-02-08'), icon: '🎨' },
      { title: 'TechNova Maintenance Fee', amount: 15000, category: 'Business', date: new Date('2026-03-05'), icon: '🔧' },
    ];

    await Income.insertMany(
      incomeEntries.map(e => ({ ...e, userId: user._id }))
    );
    console.log(`💵 ${incomeEntries.length} income records created`);

    // ── 5. Expense Records (~50) ─────────────────────────
    const expenseEntries = [
      // Office & Operations
      { title: 'WeWork Coworking - January', amount: 18000, category: 'Rent', vendor: 'WeWork India', date: new Date('2026-01-01'), icon: '🏢' },
      { title: 'WeWork Coworking - February', amount: 18000, category: 'Rent', vendor: 'WeWork India', date: new Date('2026-02-01'), icon: '🏢' },
      { title: 'WeWork Coworking - March', amount: 18000, category: 'Rent', vendor: 'WeWork India', date: new Date('2026-03-01'), icon: '🏢' },
      { title: 'MacBook Pro M3 EMI', amount: 12500, category: 'Bills', vendor: 'Apple India', date: new Date('2026-01-05'), icon: '💻' },
      { title: 'MacBook Pro M3 EMI', amount: 12500, category: 'Bills', vendor: 'Apple India', date: new Date('2026-02-05'), icon: '💻' },
      { title: 'MacBook Pro M3 EMI', amount: 12500, category: 'Bills', vendor: 'Apple India', date: new Date('2026-03-05'), icon: '💻' },
      { title: 'Internet - Airtel Fiber', amount: 1499, category: 'Utilities', vendor: 'Airtel', date: new Date('2026-01-08'), icon: '📡' },
      { title: 'Internet - Airtel Fiber', amount: 1499, category: 'Utilities', vendor: 'Airtel', date: new Date('2026-02-08'), icon: '📡' },
      { title: 'Internet - Airtel Fiber', amount: 1499, category: 'Utilities', vendor: 'Airtel', date: new Date('2026-03-08'), icon: '📡' },
      { title: 'Electricity Bill - January', amount: 3200, category: 'Utilities', vendor: 'Adani Electricity', date: new Date('2026-01-15'), icon: '⚡' },
      { title: 'Electricity Bill - February', amount: 2800, category: 'Utilities', vendor: 'Adani Electricity', date: new Date('2026-02-15'), icon: '⚡' },
      { title: 'Electricity Bill - March', amount: 3500, category: 'Utilities', vendor: 'Adani Electricity', date: new Date('2026-03-10'), icon: '⚡' },

      // Marketing
      { title: 'Google Ads Campaign', amount: 15000, category: 'Marketing', vendor: 'Google', date: new Date('2026-01-10'), icon: '📣', isGstExpense: true, gstAmount: 2700 },
      { title: 'LinkedIn Premium Business', amount: 5999, category: 'Marketing', vendor: 'LinkedIn', date: new Date('2026-01-12'), icon: '💼' },
      { title: 'Facebook Ads - Feb Campaign', amount: 8500, category: 'Marketing', vendor: 'Meta', date: new Date('2026-02-10'), icon: '📢', isGstExpense: true, gstAmount: 1530 },
      { title: 'Business Cards & Brochures', amount: 4500, category: 'Marketing', vendor: 'Vistaprint', date: new Date('2026-02-22'), icon: '📇' },
      { title: 'Google Ads - March', amount: 12000, category: 'Marketing', vendor: 'Google', date: new Date('2026-03-10'), icon: '📣', isGstExpense: true, gstAmount: 2160 },

      // Software & Tools
      { title: 'Figma Professional License', amount: 5200, category: 'Office Supplies', vendor: 'Figma', date: new Date('2026-01-03'), icon: '🎨' },
      { title: 'GitHub Team Subscription', amount: 3800, category: 'Office Supplies', vendor: 'GitHub', date: new Date('2026-01-03'), icon: '🐙' },
      { title: 'AWS Hosting - January', amount: 8500, category: 'Utilities', vendor: 'Amazon Web Services', date: new Date('2026-01-20'), icon: '☁️', isGstExpense: true, gstAmount: 1530 },
      { title: 'AWS Hosting - February', amount: 9200, category: 'Utilities', vendor: 'Amazon Web Services', date: new Date('2026-02-20'), icon: '☁️', isGstExpense: true, gstAmount: 1656 },
      { title: 'AWS Hosting - March', amount: 7800, category: 'Utilities', vendor: 'Amazon Web Services', date: new Date('2026-03-20'), icon: '☁️', isGstExpense: true, gstAmount: 1404 },
      { title: 'Notion Team Plan', amount: 2400, category: 'Office Supplies', vendor: 'Notion', date: new Date('2026-02-01'), icon: '📝' },
      { title: 'Vercel Pro Subscription', amount: 1600, category: 'Utilities', vendor: 'Vercel', date: new Date('2026-01-15'), icon: '▲' },

      // Professional
      { title: 'CA Consultation - GST Filing', amount: 8000, category: 'Professional Fees', vendor: 'Patel & Associates', date: new Date('2026-01-25'), icon: '📋' },
      { title: 'Legal Review - Client Contract', amount: 12000, category: 'Professional Fees', vendor: 'Khaitan & Co', date: new Date('2026-02-15'), icon: '⚖️' },
      { title: 'Annual Tax Filing Fee', amount: 15000, category: 'Taxes', vendor: 'Patel & Associates', date: new Date('2026-03-25'), icon: '🧾' },

      // Travel
      { title: 'Mumbai to Bengaluru - Client Meet', amount: 6800, category: 'Travel', vendor: 'IndiGo Airlines', date: new Date('2026-01-18'), icon: '✈️' },
      { title: 'Hotel Stay - Bengaluru (2 nights)', amount: 8400, category: 'Travel', vendor: 'Taj Hotels', date: new Date('2026-01-18'), icon: '🏨' },
      { title: 'Uber Rides - January', amount: 3200, category: 'Transport', vendor: 'Uber India', date: new Date('2026-01-30'), icon: '🚗' },
      { title: 'Mumbai to Delhi - Workshop', amount: 7500, category: 'Travel', vendor: 'Air India', date: new Date('2026-02-25'), icon: '✈️' },
      { title: 'Uber Rides - February', amount: 2800, category: 'Transport', vendor: 'Uber India', date: new Date('2026-02-28'), icon: '🚗' },
      { title: 'Uber Rides - March', amount: 3500, category: 'Transport', vendor: 'Uber India', date: new Date('2026-03-28'), icon: '🚗' },

      // Food & Entertainment
      { title: 'Client Lunch - TechNova Team', amount: 4500, category: 'Food', vendor: 'The Table Mumbai', date: new Date('2026-01-20'), icon: '🍽️' },
      { title: 'Team Dinner - Project Completion', amount: 6200, category: 'Food', vendor: 'Farzi Cafe', date: new Date('2026-02-28'), icon: '🎉' },
      { title: 'Coffee Meetings - January', amount: 2100, category: 'Food', vendor: 'Starbucks', date: new Date('2026-01-25'), icon: '☕' },
      { title: 'Coffee Meetings - February', amount: 1800, category: 'Food', vendor: 'Blue Tokai', date: new Date('2026-02-20'), icon: '☕' },
      { title: 'Coffee Meetings - March', amount: 2400, category: 'Food', vendor: 'Third Wave Coffee', date: new Date('2026-03-15'), icon: '☕' },
      { title: 'Netflix Business Account', amount: 649, category: 'Entertainment', vendor: 'Netflix', date: new Date('2026-01-01'), icon: '🎬' },
      { title: 'Spotify Premium', amount: 119, category: 'Entertainment', vendor: 'Spotify', date: new Date('2026-01-01'), icon: '🎵' },

      // Health & Education
      { title: 'Health Insurance Premium', amount: 12000, category: 'Insurance', vendor: 'HDFC Ergo', date: new Date('2026-01-01'), icon: '🏥' },
      { title: 'Gym Membership - Q1', amount: 9000, category: 'Health', vendor: 'Cult.fit', date: new Date('2026-01-05'), icon: '🏋️' },
      { title: 'Udemy - Advanced TypeScript', amount: 1299, category: 'Education', vendor: 'Udemy', date: new Date('2026-01-10'), icon: '📖' },
      { title: 'AWS Certification Exam', amount: 11000, category: 'Education', vendor: 'Amazon', date: new Date('2026-02-20'), icon: '🎓' },

      // Shopping / Equipment
      { title: 'Ergonomic Chair - Herman Miller', amount: 45000, category: 'Shopping', vendor: 'Herman Miller India', date: new Date('2026-01-08'), icon: '🪑' },
      { title: 'Dell 27" Monitor', amount: 28000, category: 'Shopping', vendor: 'Dell India', date: new Date('2026-02-12'), icon: '🖥️' },
      { title: 'Mechanical Keyboard', amount: 8500, category: 'Shopping', vendor: 'Keychron', date: new Date('2026-03-01'), icon: '⌨️' },
      { title: 'Office Stationery Pack', amount: 2200, category: 'Office Supplies', vendor: 'Amazon', date: new Date('2026-01-15'), icon: '📎' },

      // Maintenance
      { title: 'AC Servicing - Office', amount: 2500, category: 'Maintenance', vendor: 'Urban Company', date: new Date('2026-02-10'), icon: '🔧' },
      { title: 'Laptop Repair - Battery', amount: 4500, category: 'Maintenance', vendor: 'iService', date: new Date('2026-03-18'), icon: '🔋' },
    ];

    await Expense.insertMany(
      expenseEntries.map(e => ({ ...e, userId: user._id }))
    );
    console.log(`💸 ${expenseEntries.length} expense records created`);

    // ── 6. Invoices & Line Items ─────────────────────────
    const invoicesData = [
      {
        invoiceNumber: 'VDS-2026-001',
        clientIdx: 0, // TechNova
        invoiceDate: new Date('2026-01-05'),
        dueDate: new Date('2026-01-20'),
        status: 'Paid',
        paymentDate: new Date('2026-01-18'),
        paymentMethod: 'Bank Transfer',
        paymentReference: 'NEFT-REF-8834521',
        notes: 'Website redesign — Phase 1 delivery',
        lineItems: [
          { itemName: 'Website UI/UX Design', description: 'Complete redesign of 12 pages', quantity: 1, rate: 45000, gstPercentage: 18 },
          { itemName: 'Frontend Development', description: 'React.js implementation with responsive design', quantity: 1, rate: 35000, gstPercentage: 18 },
          { itemName: 'SEO Optimization', description: 'On-page SEO for all pages', quantity: 1, rate: 5000, gstPercentage: 18 },
        ]
      },
      {
        invoiceNumber: 'VDS-2026-002',
        clientIdx: 1, // GreenLeaf
        invoiceDate: new Date('2026-02-03'),
        dueDate: new Date('2026-02-18'),
        status: 'Paid',
        paymentDate: new Date('2026-02-16'),
        paymentMethod: 'UPI',
        paymentReference: 'UPI-GL-20260216',
        notes: 'E-commerce platform Sprint 1',
        lineItems: [
          { itemName: 'E-commerce Platform Setup', description: 'Next.js based storefront with product catalog', quantity: 1, rate: 65000, gstPercentage: 18 },
          { itemName: 'Payment Gateway Integration', description: 'Razorpay integration with UPI + cards', quantity: 1, rate: 25000, gstPercentage: 18 },
          { itemName: 'Admin Dashboard', description: 'Order management and inventory system', quantity: 1, rate: 30000, gstPercentage: 18 },
        ]
      },
      {
        invoiceNumber: 'VDS-2026-003',
        clientIdx: 2, // UrbanNest
        invoiceDate: new Date('2026-02-18'),
        dueDate: new Date('2026-03-05'),
        status: 'Paid',
        paymentDate: new Date('2026-03-02'),
        paymentMethod: 'Bank Transfer',
        paymentReference: 'IMPS-UN-4478923',
        notes: 'Portfolio website complete delivery',
        lineItems: [
          { itemName: 'Portfolio Website Design', description: 'Modern grid-based portfolio with animations', quantity: 1, rate: 30000, gstPercentage: 18 },
          { itemName: 'Booking System Integration', description: 'Calendar-based appointment booking', quantity: 1, rate: 25000, gstPercentage: 18 },
        ]
      },
      {
        invoiceNumber: 'VDS-2026-004',
        clientIdx: 3, // CloudSync
        invoiceDate: new Date('2026-01-10'),
        dueDate: new Date('2026-01-25'),
        status: 'Paid',
        paymentDate: new Date('2026-01-24'),
        paymentMethod: 'Bank Transfer',
        paymentReference: 'NEFT-CS-7712903',
        notes: 'January retainer + dashboard upgrade',
        lineItems: [
          { itemName: 'Monthly Retainer - January', description: 'Bug fixes, maintenance, feature updates', quantity: 1, rate: 45000, gstPercentage: 18 },
          { itemName: 'Analytics Dashboard Upgrade', description: 'New charts and data visualization modules', quantity: 1, rate: 20000, gstPercentage: 18 },
        ]
      },
      {
        invoiceNumber: 'VDS-2026-005',
        clientIdx: 4, // FitZone
        invoiceDate: new Date('2026-03-01'),
        dueDate: new Date('2026-03-15'),
        status: 'Sent',
        notes: 'Fitness app UI redesign and development',
        lineItems: [
          { itemName: 'Mobile App UI Redesign', description: 'React Native UI overhaul — 8 screens', quantity: 1, rate: 55000, gstPercentage: 18 },
          { itemName: 'API Development', description: 'REST API for workout tracking', quantity: 1, rate: 30000, gstPercentage: 18 },
          { itemName: 'Push Notifications Setup', description: 'Firebase Cloud Messaging integration', quantity: 1, rate: 10000, gstPercentage: 18 },
        ]
      },
      {
        invoiceNumber: 'VDS-2026-006',
        clientIdx: 1, // GreenLeaf
        invoiceDate: new Date('2026-03-10'),
        dueDate: new Date('2026-03-25'),
        status: 'Sent',
        notes: 'E-commerce Sprint 2 — advanced features',
        lineItems: [
          { itemName: 'Inventory Management System', description: 'Real-time stock tracking with alerts', quantity: 1, rate: 40000, gstPercentage: 18 },
          { itemName: 'Customer Reviews Module', description: 'Rating and review system with moderation', quantity: 1, rate: 20000, gstPercentage: 18 },
          { itemName: 'Email Notification System', description: 'Transactional emails via SendGrid', quantity: 1, rate: 15000, gstPercentage: 18 },
          { itemName: 'Performance Optimization', description: 'CDN setup, image optimization, caching', quantity: 1, rate: 12000, gstPercentage: 18 },
        ]
      },
      {
        invoiceNumber: 'VDS-2026-007',
        clientIdx: 0, // TechNova
        invoiceDate: new Date('2026-03-12'),
        dueDate: new Date('2026-03-27'),
        status: 'Draft',
        notes: 'Mobile app development — Phase 1',
        lineItems: [
          { itemName: 'Mobile App Architecture', description: 'System design and tech stack planning', quantity: 1, rate: 20000, gstPercentage: 18 },
          { itemName: 'React Native Development', description: 'Core features — auth, dashboard, profile', quantity: 1, rate: 80000, gstPercentage: 18 },
          { itemName: 'Backend API Development', description: 'Node.js REST APIs for mobile app', quantity: 1, rate: 50000, gstPercentage: 18 },
        ]
      },
      {
        invoiceNumber: 'VDS-2026-008',
        clientIdx: 3, // CloudSync
        invoiceDate: new Date('2026-02-01'),
        dueDate: new Date('2026-02-15'),
        status: 'Overdue',
        notes: 'February retainer — follow up required',
        lineItems: [
          { itemName: 'Monthly Retainer - February', description: 'Bug fixes, maintenance, feature updates', quantity: 1, rate: 45000, gstPercentage: 18 },
          { itemName: 'Custom Report Builder', description: 'Drag-and-drop report generation tool', quantity: 1, rate: 35000, gstPercentage: 18 },
        ]
      },
    ];

    for (const inv of invoicesData) {
      // Create line items first
      const lineItemDocs = [];
      let subtotal = 0;
      let taxTotal = 0;

      // Create invoice first (without line items)
      const invoice = await Invoice.create({
        userId: user._id,
        invoiceNumber: inv.invoiceNumber,
        clientId: clients[inv.clientIdx]._id,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        status: inv.status,
        paymentDate: inv.paymentDate,
        paymentMethod: inv.paymentMethod,
        paymentReference: inv.paymentReference,
        notes: inv.notes,
        termsAndConditions: profile.termsAndConditions,
        lineItems: [],
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0
      });

      // Create line items
      for (const li of inv.lineItems) {
        const itemTotal = (li.quantity * li.rate) - (li.discount || 0);
        const taxAmount = (itemTotal * li.gstPercentage) / 100;

        const lineItem = await InvoiceLineItem.create({
          invoiceId: invoice._id,
          itemName: li.itemName,
          description: li.description,
          quantity: li.quantity,
          rate: li.rate,
          discount: li.discount || 0,
          gstPercentage: li.gstPercentage,
          itemTotal,
          taxAmount
        });

        lineItemDocs.push(lineItem._id);
        subtotal += itemTotal;
        taxTotal += taxAmount;
      }

      // Update invoice with line items and totals
      invoice.lineItems = lineItemDocs;
      invoice.subtotal = subtotal;
      invoice.taxAmount = taxTotal;
      invoice.totalAmount = subtotal + taxTotal;

      // Set tax breakup (same state = CGST + SGST, diff state = IGST)
      const clientState = clients[inv.clientIdx].address.state;
      if (clientState === 'Maharashtra') {
        invoice.taxBreakup = { cgst: taxTotal / 2, sgst: taxTotal / 2, igst: 0 };
      } else {
        invoice.taxBreakup = { cgst: 0, sgst: 0, igst: taxTotal };
      }

      await invoice.save();
    }
    console.log(`🧾 ${invoicesData.length} invoices created with line items`);

    // ── 7. Budgets ───────────────────────────────────────
    const budgetMonths = ['2026-01', '2026-02', '2026-03'];
    const budgetCategories = [
      { category: 'Food', amount: 15000 },
      { category: 'Transport', amount: 10000 },
      { category: 'Shopping', amount: 50000 },
      { category: 'Bills', amount: 15000 },
      { category: 'Entertainment', amount: 5000 },
      { category: 'Health', amount: 12000 },
      { category: 'Education', amount: 15000 },
      { category: 'Other', amount: 20000 },
    ];

    const budgetDocs = [];
    for (const month of budgetMonths) {
      for (const b of budgetCategories) {
        budgetDocs.push({
          userId: user._id,
          category: b.category,
          amount: b.amount,
          month
        });
      }
    }

    await Budget.insertMany(budgetDocs);
    console.log(`📊 ${budgetDocs.length} budget records created`);

    // ── Done ─────────────────────────────────────────────
    console.log('\n🎉 Demo data seeded successfully!');
    console.log(`   Email:    ${DEMO_EMAIL}`);
    console.log(`   Password: ${DEMO_PASSWORD}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
