$folder = 'C:\Users\LENOVO\Downloads\Stitich'
Get-ChildItem $folder -Filter *.html | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  # Remove all <img ...> tags
  $content = $content -replace '<img[^>]*>', ''
  # Define FAQ HTML block
  $faq = "<h3 style='margin-top:30px; font-weight:600;'>❓ Frequently Asked Questions</h3>`n<ul style='margin-left:20px; line-height:1.6;'><li><strong>How can I download the PDFs?</strong> Click the 📥 button to open the file in a new tab.</li><li><strong>Are these assignments legal to use?</strong> They are reference only; submit your own work.</li><li><strong>Can I share these links?</strong> Yes, but do not redistribute the PDFs.</li></ul>"
  $seoMarker = '<!-- ========== SEO METADATA ========== -->'
  if ($content -match $seoMarker) {
    # Insert FAQ before SEO marker
    $content = $content -replace $seoMarker, "`n$faq`n$seoMarker"
  } else {
    # Append FAQ at end if SEO marker not present
    $content = $content + "`n$faq"
  }
  Set-Content -Path $_.FullName -Value $content -Encoding UTF8
  Write-Host "Updated $($_.Name)"
}
