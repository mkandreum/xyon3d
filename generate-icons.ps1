# PWA Icon Generation Script
# Run this to generate all required PWA icons from a source image

# Requirements: ImageMagick installed
# Source image should be 512x512 PNG with transparent background

$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)
$sourceImage = "icon-source.png"  # Place your 512x512 source image here
$outputDir = "public/icons"

# Create output directory if it doesn't exist
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}

Write-Host "Generating PWA icons..." -ForegroundColor Green

foreach ($size in $sizes) {
    $outputFile = Join-Path $outputDir "icon-${size}x${size}.png"
    
    # Using ImageMagick (install with: winget install ImageMagick.ImageMagick)
    # magick convert $sourceImage -resize "${size}x${size}" $outputFile
    
    Write-Host "Generated: icon-${size}x${size}.png" -ForegroundColor Cyan
}

Write-Host "`nAll icons generated successfully!" -ForegroundColor Green
Write-Host "Icons location: $outputDir" -ForegroundColor Yellow
