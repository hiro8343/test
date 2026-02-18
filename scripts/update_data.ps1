$csvUrl = "https://docs.google.com/spreadsheets/d/1IN-PC0r_y6WHSQs1-Xklakj72LYm43q6xUspQ0KueXE/export?format=csv"
# Using relative paths assuming CWD is project root
$csvPath = "temp_cool_new.csv"
$jsonPath = "data/cool_items.json"

Write-Host "Downloading CSV from $csvUrl..."
Invoke-WebRequest -Uri $csvUrl -OutFile $csvPath

Write-Host "Reading CSV from $csvPath..."
$csvData = Import-Csv -Path $csvPath -Encoding UTF8

$catMap = @{
    '宇宙' = 'space'; '理科' = 'space'; '生物' = 'space'; '地学' = 'space';
    '数学' = 'math'; '算数' = 'math'; '言語' = 'math';
    '地理' = 'world'; '公民' = 'world'; '世界' = 'world';
    '歴史' = 'history'; '歴史（日本史）' = 'history'; '歴史（世界史）' = 'history';
    '文学' = 'literature';
    'アニメ・漫画' = 'manga_anime'; 'マンガ' = 'manga_anime'; '漫画' = 'manga_anime'; 'アニメ' = 'manga_anime';
    '教養' = 'culture'; '雑学' = 'culture'; '文化' = 'culture';
    '物理' = 'science'; '化学' = 'science'
}

$items = @()
$id = 1

foreach ($row in $csvData) {
    if ([string]::IsNullOrWhiteSpace($row.'タイトル') -or [string]::IsNullOrWhiteSpace($row.'内容')) { continue }

    $catJp = $row.'カテゴリー'.Trim()
    $catId = $catMap[$catJp]
    if (-not $catId) { $catId = 'culture' }

    $content = $row.'内容'.Trim()
    
    # Simple logic for stars
    $len = $content.Length
    $stars = 2
    if ($len > 200) { $stars = 5 }
    elseif ($len > 100) { $stars = 4 }
    elseif ($len > 40) { $stars = 3 }

    $item = [ordered]@{
        id             = $id
        category       = $catId
        title          = $row.'タイトル'.Trim()
        description    = $row.'解説'.Trim()
        content        = $content
        stars          = $stars
        explanationUrl = $row.'チェック用URL'.Trim()
        wordUrl        = $row.'チェック用URL'.Trim()
    }
    $items += $item
    $id++
}

$json = $items | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($jsonPath, $json, [System.Text.Encoding]::UTF8)

Write-Host "Successfully converted $($items.Count) items to $jsonPath"
