import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import type { Pet, VaccinationRecord, MedicationPlan, HealthFlag } from '@furr/core';

export async function generateAndSharePdf(
  pet: Pet,
  flags: HealthFlag[],
  vaccinations: VaccinationRecord[],
  medications: MedicationPlan[],
) {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Sharing unavailable', 'This device does not support file sharing.');
      return;
    }

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #101618; margin: 0; padding: 40px; }
            h1 { font-size: 24px; font-weight: 900; margin-bottom: 5px; color: #02202B; }
            h2 { font-size: 16px; font-weight: 800; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #ECE9E2; padding-bottom: 5px; color: #62A48C; }
            .meta { color: #758187; font-size: 14px; margin-bottom: 30px; }
            .disclaimer { background-color: #F8F7F3; padding: 15px; border-radius: 8px; font-size: 12px; color: #758187; margin-top: 40px; }
            .row { display: flex; justify-content: space-between; border-bottom: 1px solid #ECE9E2; padding: 10px 0; }
            .row strong { display: block; margin-bottom: 3px; }
            .empty { color: #A3ADB0; font-style: italic; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; background-color: #EEFAF5; color: #2A6A51; }
          </style>
        </head>
        <body>
          <h1>${pet.name}'s Health Summary</h1>
          <div class="meta">
            ${pet.species.toUpperCase()} · ${pet.breed || 'Mixed'} · ${pet.sex || 'Unknown'} 
            <br />
            Generated on ${new Date().toLocaleDateString()}
          </div>

          <h2>Allergies & Conditions</h2>
          ${flags.length === 0 ? '<div class="empty">No active allergies or conditions on record.</div>' : flags.map(f => `
            <div class="row">
              <div>
                <strong>${f.title} <span class="badge">${f.status.toUpperCase()}</span></strong>
                <div style="font-size: 12px; color: #758187">${f.notes || 'No notes'}</div>
              </div>
              <div style="font-size: 12px; color: #758187">${f.startedOn ? `Since ${f.startedOn}` : ''}</div>
            </div>
          `).join('')}

          <h2>Vaccinations</h2>
          ${vaccinations.length === 0 ? '<div class="empty">No vaccinations on record.</div>' : vaccinations.map(v => `
            <div class="row">
              <div>
                <strong>${v.vaccineType === 'Other' ? (v.customVaccineName || 'Vaccine') : v.vaccineType}</strong>
                <div style="font-size: 12px; color: #758187">${v.provenance === 'VET_VERIFIED' ? 'Verified by Vet' : 'Owner Entered'}</div>
              </div>
              <div style="font-size: 12px; color: #758187">Administered: ${v.administeredOn}</div>
            </div>
          `).join('')}

          <h2>Active Medications</h2>
          ${medications.filter(m => m.isActive).length === 0 ? '<div class="empty">No active medications.</div>' : medications.filter(m => m.isActive).map(m => `
            <div class="row">
              <div>
                <strong>${m.medicationName}</strong>
                <div style="font-size: 12px; color: #758187">${m.doseInstruction}</div>
              </div>
              <div style="font-size: 12px; color: #758187">Since: ${m.startAt.slice(0, 10)}</div>
            </div>
          `).join('')}

          <div class="disclaimer">
            <strong>Disclaimer:</strong> This is a summary generated from the Furr platform. It may contain owner-entered information and is not a substitute for official veterinary records, travel certificates, or professional medical advice.
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html, base64: false });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${pet.name}'s Health Summary`,
      UTI: 'com.adobe.pdf',
    });
  } catch (err) {
    Alert.alert('Error', 'Could not generate PDF summary.');
    console.error(err);
  }
}
