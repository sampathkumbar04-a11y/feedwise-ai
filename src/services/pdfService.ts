import { FeedScanReport } from '../types';

/**
 * Generates an official Feed Quality Analysis & Certificate printable window
 * or triggers a formatted laboratory report download.
 */
export function generateCertificatePrint(report: FeedScanReport): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the official printable Feed Quality Certificate.');
    return;
  }

  const date = new Date(report.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>FeedWise AI - Quality Certificate #${report.id.substring(0, 8)}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1c1917; background: #fff; }
          .cert-container { border: 4px double #15803d; padding: 32px; border-radius: 8px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #e7e5e4; padding-bottom: 20px; }
          .title { font-size: 26px; font-weight: bold; color: #166534; margin: 0; }
          .subtitle { font-size: 14px; color: #78716c; margin-top: 4px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; font-size: 14px; }
          .score-badge { text-align: center; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0; }
          .score-num { font-size: 36px; font-weight: 800; color: #15803d; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #d6d3d1; padding: 10px 14px; text-align: left; font-size: 13px; }
          th { background: #f5f5f4; font-weight: 600; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; color: #78716c; }
          .signature-line { border-top: 1px dashed #78716c; width: 180px; text-align: center; padding-top: 6px; }
        </style>
      </head>
      <body>
        <div class="cert-container">
          <div class="header">
            <h1 class="title">FEEDWISE AI - FODDER & SILAGE QUALITY CERTIFICATE</h1>
            <p class="subtitle">Official Analytical Verification for Dairy Livestock Feeds</p>
          </div>

          <div class="meta-grid">
            <div><strong>Sample Identifier:</strong> ${report.sampleName}</div>
            <div><strong>Certificate ID:</strong> ${report.id}</div>
            <div><strong>Sample Type:</strong> ${report.feedType.toUpperCase()}</div>
            <div><strong>Inspection Date:</strong> ${date}</div>
            <div><strong>Quality Grade:</strong> ${report.qualityGrade}</div>
            <div><strong>Spoilage Risk:</strong> ${report.spoilageRisk}</div>
          </div>

          <div class="score-badge">
            <div>CATTLE FEED QUALITY INDEX</div>
            <div class="score-num">${report.overallScore} / 100</div>
            <div>Confidence Rating: ${report.confidenceScore}% (Computer Vision Spectrometry)</div>
            ${report.fliegData ? `<div><strong>Flieg Fermentation Score:</strong> ${report.fliegData.fliegScore} / 100 (${report.fliegData.grade})</div>` : ''}
          </div>

          <h3>Nutritional Profile (Dry Matter Basis)</h3>
          <table>
            <thead>
              <tr>
                <th>Nutrient Parameter</th>
                <th>Measured Value</th>
                <th>Reference Standard</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Dry Matter (DM)</td><td>${report.nutritionalValues.dryMatter}%</td><td>Typical: 30% - 35% (Silage)</td></tr>
              <tr><td>Crude Protein (CP)</td><td>${report.nutritionalValues.crudeProtein}%</td><td>Target: > 8.0%</td></tr>
              <tr><td>Total Digestible Nutrients (TDN)</td><td>${report.nutritionalValues.totalDigestibleNutrients}%</td><td>Target: > 65%</td></tr>
              <tr><td>Neutral Detergent Fiber (NDF)</td><td>${report.nutritionalValues.neutralDetergentFiber}%</td><td>Target: < 48%</td></tr>
              <tr><td>Acid Detergent Fiber (ADF)</td><td>${report.nutritionalValues.acidDetergentFiber}%</td><td>Target: < 28%</td></tr>
              <tr><td>Metabolizable Energy (ME)</td><td>${report.nutritionalValues.metabolizableEnergy} MJ/kg</td><td>High-yielding: > 9.5 MJ/kg</td></tr>
            </tbody>
          </table>

          <div style="margin-top: 24px;">
            <strong>Agronomist Advisory:</strong>
            <ul>
              ${report.recommendations.map((r) => `<li>${r}</li>`).join('')}
            </ul>
          </div>

          <div class="footer">
            <div>
              Generated via FeedWise AI Autonomous Agronomy Engine<br/>
              Certified for Cooperative Milk Union Standards
            </div>
            <div class="signature-line">
              Authorized Quality Assessor
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
}
