import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import type { Pet, VaccinationRecord, MedicationPlan, WeightEntry } from '@furr/core';

function generateHtml(pet: Pet, vaccinations: VaccinationRecord[], medications: MedicationPlan[], weights: WeightEntry[]) {
  const primaryColor = '#FF6B6B';
  const ageString = pet.birthDate ? new Date(pet.birthDate).toLocaleDateString() : 'Unknown';
  
  const vaccinationsHtml = vaccinations.length > 0 
    ? vaccinations.map(v => `
      <div class="row">
        <div><strong>${v.vaccineType === 'Other' ? v.customVaccineName : v.vaccineType}</strong></div>
        <div>Administered: ${v.administeredOn}</div>
        <div>Next Due: ${v.nextDueOn || 'N/A'}</div>
      </div>
    `).join('')
    : '<div class="row">No vaccination records found.</div>';

  const medicationsHtml = medications.length > 0
    ? medications.map(m => `
      <div class="row">
        <div><strong>${m.medicationName}</strong></div>
        <div>Dose: ${m.doseInstruction}</div>
        <div>Started: ${m.startAt.slice(0, 10)}</div>
      </div>
    `).join('')
    : '<div class="row">No active medications.</div>';

  const weightsHtml = weights.length > 0
    ? weights.slice(0, 5).map(w => `
      <div class="row">
        <div>${w.measuredOn}</div>
        <div><strong>${w.value} ${w.unit}</strong></div>
      </div>
    `).join('')
    : '<div class="row">No weight entries.</div>';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${pet.name}'s Health Report</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111827; margin: 0; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 32px; font-weight: 900; margin: 0; letter-spacing: -1px; }
        .subtitle { font-size: 14px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; }
        .brand { font-size: 18px; font-weight: 900; color: ${primaryColor}; }
        
        .pet-info { display: flex; gap: 40px; margin-bottom: 40px; background: #F9FAFB; padding: 24px; border-radius: 16px; border: 1px solid #E5E7EB; }
        .pet-photo { width: 120px; height: 120px; border-radius: 60px; object-fit: cover; background: #E5E7EB; flex-shrink: 0; border: 4px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .pet-details { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .detail-item { display: flex; flex-direction: column; gap: 4px; }
        .detail-label { font-size: 11px; font-weight: 800; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; }
        .detail-value { font-size: 16px; font-weight: 700; color: #111827; }

        .section { margin-bottom: 40px; }
        .section-title { font-size: 20px; font-weight: 800; margin-bottom: 16px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; color: ${primaryColor}; }
        .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #E5E7EB; font-size: 14px; }
        .row:last-child { border-bottom: none; }
        
        .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #9CA3AF; padding-top: 20px; border-top: 1px solid #E5E7EB; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">${pet.name}</h1>
          <div class="subtitle">Official Health Report</div>
        </div>
        <div class="brand">FURR.</div>
      </div>

      <div class="pet-info">
        ${pet.photoPath ? `<img src="${pet.photoPath}" class="pet-photo" />` : `<div class="pet-photo" style="display:flex;align-items:center;justify-content:center;font-size:48px;">${pet.species === 'cat' ? '🐈' : '🐕'}</div>`}
        <div class="pet-details">
          <div class="detail-item"><span class="detail-label">Species / Breed</span><span class="detail-value">${pet.species === 'cat' ? 'Cat' : 'Dog'} - ${pet.breed || 'Mixed'}</span></div>
          <div class="detail-item"><span class="detail-label">Sex</span><span class="detail-value">${pet.sex === 'male' ? 'Male' : pet.sex === 'female' ? 'Female' : 'Unknown'}</span></div>
          <div class="detail-item"><span class="detail-label">DOB</span><span class="detail-value">${ageString}</span></div>
          <div class="detail-item"><span class="detail-label">Microchip</span><span class="detail-value">${pet.microchipNumber || 'Not registered'}</span></div>
          <div class="detail-item"><span class="detail-label">Colour</span><span class="detail-value">${pet.colour || 'N/A'}</span></div>
          <div class="detail-item"><span class="detail-label">Neutered</span><span class="detail-value">${pet.isNeutered === true ? 'Yes' : pet.isNeutered === false ? 'No' : 'Unknown'}</span></div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Vaccination History</h2>
        ${vaccinationsHtml}
      </div>

      <div class="section">
        <h2 class="section-title">Active Medications</h2>
        ${medicationsHtml}
      </div>

      <div class="section">
        <h2 class="section-title">Recent Weight Entries</h2>
        ${weightsHtml}
      </div>

      <div class="footer">
        Generated by Furr - The Ultimate Pet Care App<br>
        Date: ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `;
}

export async function exportPetCv(pet: Pet, vaccinations: VaccinationRecord[], medications: MedicationPlan[], weights: WeightEntry[]) {
  try {
    const html = generateHtml(pet, vaccinations, medications, weights);
    
    // Generate PDF file
    const { uri } = await Print.printToFileAsync({ 
      html,
      base64: false 
    });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { 
        UTI: '.pdf', 
        mimeType: 'application/pdf', 
        dialogTitle: `${pet.name}'s Health Report` 
      });
    } else {
      Alert.alert("Sharing not available", "Your device does not support sharing files.");
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert("Export Failed", "Could not generate the PDF report.");
  }
}
