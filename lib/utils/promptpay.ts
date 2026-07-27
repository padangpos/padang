// PromptPay EMVCo QR Payload Generator Helper

export function generatePromptPayPayload(promptpayId: string, amount?: number): string {
  const sanitizedId = promptpayId.replace(/[^0-9]/g, '');
  let formattedId = sanitizedId;

  // Phone number format (starts with 0 -> convert to 66)
  if (sanitizedId.length === 10 && sanitizedId.startsWith('0')) {
    formattedId = '0066' + sanitizedId.slice(1);
  }

  const targetLength = formattedId.length.toString().padStart(2, '0');
  const targetTag = formattedId.length === 13 ? '02' : '01'; // 01 for phone, 02 for tax ID

  let payload = `00020101021229370016A000000677010111${targetTag}${targetLength}${formattedId}5802TH5303764`;

  if (amount && amount > 0) {
    const amountStr = amount.toFixed(2);
    const amountLen = amountStr.length.toString().padStart(2, '0');
    payload += `54${amountLen}${amountStr}`;
  }

  payload += '6304';
  
  // Calculate CRC16 checksum
  const crc = crc16(payload);
  return payload + crc;
}

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
