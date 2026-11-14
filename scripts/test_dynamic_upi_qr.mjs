import QRCode from 'qrcode';

function buildStandardUpiUri({ amount, vpa = 'theattirebbsr@okicici', merchantName = 'Academic Level', note = 'Order123' }) {
  const amountStr = Number(amount || 49).toFixed(2);
  return `upi://pay?pa=${vpa}&pn=${encodeURIComponent(merchantName)}&am=${amountStr}&cu=INR&tn=${encodeURIComponent(note)}`;
}

// Test case 1: User's example upi://pay?pa=merchant@bank&pn=Merchant%20Name&am=250.00&cu=INR&tn=Order123
const ex = buildStandardUpiUri({ amount: 250, vpa: 'merchant@bank', merchantName: 'Merchant Name', note: 'Order123' });
console.log('User example test:');
console.log(ex);
if (ex !== 'upi://pay?pa=merchant@bank&pn=Merchant%20Name&am=250.00&cu=INR&tn=Order123') {
  throw new Error('Example URI did not match exact format');
}

// Test case 2: Production ₹49 with Academic Level merchant name
const prod49 = buildStandardUpiUri({ amount: 49, note: 'Order_AL_49' });
console.log('\nProduction ₹49 URI with Academic Level:');
console.log(prod49);
if (prod49 !== 'upi://pay?pa=theattirebbsr@okicici&pn=Academic%20Level&am=49.00&cu=INR&tn=Order_AL_49') {
  throw new Error('₹49 URI did not match exact format');
}

// Test case 3: Production ₹129 with Academic Level merchant name
const prod129 = buildStandardUpiUri({ amount: 129, note: 'Order_AL_PLUS' });
console.log('\nProduction ₹129 URI with Academic Level:');
console.log(prod129);
if (prod129 !== 'upi://pay?pa=theattirebbsr@okicici&pn=Academic%20Level&am=129.00&cu=INR&tn=Order_AL_PLUS') {
  throw new Error('₹129 URI did not match exact format');
}

// Test case 4: Generate QR data URL
QRCode.toDataURL(prod49, { width: 360, margin: 2, errorCorrectionLevel: 'M' }).then(url => {
  console.log('\nQR Data URL generated successfully! Length:', url.length);
  console.log('Starts with:', url.substring(0, 30));
  console.log('✓ All 4 dynamic UPI QR tests with "Academic Level" passed perfectly!');
});
