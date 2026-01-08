# Check Emergency Contacts in Database

Write-Host "Checking emergency_contacts table..." -ForegroundColor Cyan

# Load MySQL .NET Connector
Add-Type -Path "C:\Program Files (x86)\MySQL\MySQL Connector NET 8.0.23\MySql.Data.dll" -ErrorAction SilentlyContinue

try {
    $connectionString = "Server=localhost;Database=safehaven_db;Uid=root;Pwd=root;"
    $connection = New-Object MySql.Data.MySqlClient.MySqlConnection($connectionString)
    $connection.Open()
    
    # Count total contacts
    $command = $connection.CreateCommand()
    $command.CommandText = "SELECT COUNT(*) as total FROM emergency_contacts"
    $total = $command.ExecuteScalar()
    Write-Host "`nTotal contacts in DB: $total" -ForegroundColor Green
    
    # Get sample data
    $command.CommandText = "SELECT id, category, name, phone, is_national, is_active FROM emergency_contacts LIMIT 5"
    $reader = $command.ExecuteReader()
    
    Write-Host "`nSample contacts:" -ForegroundColor Yellow
    while ($reader.Read()) {
        Write-Host "  ID: $($reader['id']) | Category: $($reader['category']) | Name: $($reader['name']) | Phone: $($reader['phone']) | National: $($reader['is_national']) | Active: $($reader['is_active'])"
    }
    $reader.Close()
    
    $connection.Close()
    Write-Host "`n✅ Database check complete" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Note: This script requires MySQL .NET Connector" -ForegroundColor Yellow
}
