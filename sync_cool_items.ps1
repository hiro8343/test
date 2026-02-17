$ErrorActionPreference = "Stop"

# Input/Output paths
$csvPath = "temp_cool.csv"
$jsonPath = "data/cool_items.json"

# Category Mapping
$categoryMap = @{
    "言語" = "culture"
    "数学" = "math"
    "歴史" = "history"
    "地理" = "world"
    "公民" = "world"
    "理科" = "space"
    "生物" = "space"
    "地学" = "space"
    "宇宙" = "space"
    "雑学" = "culture"
    "文化" = "culture"
}

# Read CSV with UTF-8 encoding
# Assuming the file was saved as UTF-8 by curl/Invoke-WebRequest
$csvData = Import-Csv -Path $csvPath -Encoding UTF8

$items = @()
$idCounter = 1

foreach ($row in $csvData) {
    $title = $row."タイトル"
    if ([string]::IsNullOrWhiteSpace($title)) { continue }

    $categoryJp = $row."カテゴリー"
    $categoryKey = "culture"
    if ($categoryMap.ContainsKey($categoryJp)) {
        $categoryKey = $categoryMap[$categoryJp]
    }

    $description = $row."解説"
    $content = $row."内容"
    $url = $row."チェック用URL"

    # Create custom object
    $item = [PSCustomObject]@{
        id = $idCounter
        category = $categoryKey
        title = $title
        description = $description
        content = $content
        stars = 3
        explanationUrl = $url
        wordUrl = $url
    }

    $items += $item
    $idCounter++
}

# Convert to JSON and save
# Depth 10 to ensure nested objects are serialized correctly (though here it's flat)
$jsonContent = $items | ConvertTo-Json -Depth 10

# Write with UTF8 encoding (without BOM is preferred usually, but default UTF8 in PS5.1 has BOM)
# Trying to match existing format
Set-Content -Path $jsonPath -Value $jsonContent -Encoding UTF8

Write-Host "Successfully converted $($items.Count) items to $jsonPath"
