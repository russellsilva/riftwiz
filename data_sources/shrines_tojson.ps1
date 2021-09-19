#ignore the code style inconsistency; first time powershelling
$nl = [Environment]::NewLine
$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

$temp = Get-Content ".\shrines.txt" | Out-String
$shrine_data = $temp -Split "`r`n`r`n"
$output = '['

for (($i = 0); $i -lt $shrine_data.Count; $i++) {
	if ($shrine_data[$i].trim()) {
	
		if (! $i -eq 0) {
			$output += ','
		}
		
		
		$output += '{' + $nl
		$halves = $shrine_data[$i] -Split ":"
		$title = $halves[0].trim()
		
		$parts = $halves[1].trim() -Split ";"
		$desc = $parts[0] #need to get rid of comas in conditions first
		
		$conditions_str = '['
		for (($j = 1); $j -lt $parts.Count; $j++) {
			if ($j -gt 1) {
				$conditions_str +=','
			}
			if ($parts[$j].trim() -match '&') {
				$tmp = '"'
				$pp = $parts[$j] -Split '&'
				for ($zzz=0;$zzz -lt $pp.Count; $zzz++) {
					$pp[$zzz] = $pp[$zzz].trim()
				}
				$tmp+= $pp -join '","'
				
				$tmp+= '"'
				$conditions_str += $tmp
			} else {
				$conditions_str +='"' + $parts[$j].trim() + '"'
			}
		}
		$conditions_str += ']'
		
		
		$output += '"title": "'+ $title +'",' + $nl;
		$output += '"desc":"' + $desc +'",' + $nl;
		$output += '"conditions":' + $conditions_str + $nl;
		$output += '}'
	}
}

$output += ']'

$output | Out-File -Encoding "UTF8" ".\shrines.json"