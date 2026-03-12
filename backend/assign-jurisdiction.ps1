# Assign Jurisdiction to Admin/MDRRMO Users
# This script assigns jurisdiction so they can use SMS Blast

Write-Host "🔧 Assigning Jurisdiction to Admin/MDRRMO Users..." -ForegroundColor Cyan
Write-Host ""

# Run the Node.js script
node assign-jurisdiction.js

Write-Host ""
Write-Host "✅ Done! Admin/MDRRMO users can now use SMS Blast" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Note: Users are assigned 'Pangasinan' province-level jurisdiction" -ForegroundColor Yellow
Write-Host "   They can send SMS to any city/barangay in Pangasinan" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 To change jurisdiction, update the users table:" -ForegroundColor Cyan
Write-Host "   UPDATE users SET jurisdiction = 'Province:City:Barangay' WHERE id = X" -ForegroundColor White
