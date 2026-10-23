$ErrorActionPreference = 'Stop'
$photos = @(
  @{name='alley'; id='1519608487953-e999c86e7455'},
  @{name='walk'; id='1448375240586-882707db888b'},
  @{name='sea'; id='1519046904884-53103b34b206'},
  @{name='city'; id='1476514525535-07fb3b4ae5f1'},
  @{name='sunset'; id='1472120435266-53107fd0c44a'},
  @{name='weekend'; id='1464822759023-fed622ff2c3b'},
  @{name='colors'; id='1500530855697-b586d89ba3ee'},
  @{name='route'; id='1469474968028-56623f02e42e'},
  @{name='cafe'; id='1501339847302-ac426a4a7cbb'},
  @{name='autumn'; id='1441974231531-c6227db76b6e'},
  @{name='moment'; id='1470770841072-f978cf4d019e'},
  @{name='travel'; id='1488646953014-85cb44e25828'}
)
$dest = Join-Path $PSScriptRoot 'dist\thumbnails'
New-Item -ItemType Directory -Path $dest -Force | Out-Null
foreach ($photo in $photos) {
  $url = 'https://images.unsplash.com/photo-' + $photo.id + '?w=360&h=240&fit=crop&fm=jpg&q=75'
  $path = Join-Path $dest ($photo.name + '.jpg')
  Invoke-WebRequest -Uri $url -OutFile $path
  Write-Output ($photo.name + ': ' + (Get-Item -LiteralPath $path).Length + ' bytes')
}
