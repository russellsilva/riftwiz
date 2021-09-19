#ignore the code style inconsistency; first time powershelling
$nl = [Environment]::NewLine
$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

$temp = Get-Content ".\skills.txt" | Out-String
$skill_data = $temp -Split '-------------------------------------------------------------------------------'
$output = '['

for (($i = 0); $i -lt $skill_data.Count; $i++) {
	if ($skill_data[$i].trim()) {
	
		if (! $i -eq 0) {
			$output += ','
		}
		$output += '{' + $nl
		
		$skill_parts = $skill_data[$i] -Split "`r`n`r`n"
		# 1 - skill spec
		# 2 - applies to (optional, unformatted)
		# 3 - applies what
		
		$spec = $skill_parts[0] -Split ","
		# title, schools, Level x
		$title = $spec[0].trim()
		$schools = $spec[1].trim() -Split "&"
		$schools_stringified = '["' + ($schools.trim() -join '","') + '"]';
		if ($spec[2]) {
			$do_not_litter = $spec[2].trim() -match '\d+'
			$lvlreq = $Matches[0]
		} else {
			$lvlreq = -1
		}
		
		
		
		$applies_to = ''
		if ($skill_parts.Count -eq 2) {
			$applies_what = $skill_parts[1]
		} elseif ($skill_parts.Count -eq 3) {
			$applies_to = $skill_parts[1]
			$applies_what = $skill_parts[2]
		}
		$applies_what_stringified = '["' + (($applies_what.trim() -Split "`r`n") -join '","') + '"]';
		
		$output += '"title": "'+ $title +'",' + $nl;
		$output += '"schools":'+ $schools_stringified +',' + $nl;
		$output += '"level":"' + $lvlreq + '",' + $nl;
		$output += '"applies_to":"' + $applies_to + '",' + $nl;
		$output += '"applies_what":' + $applies_what_stringified + $nl;
		$output += '}'
		#$entry = ($skill_data[$i] -split '[\r\n]') |? {$_}
		#	if ($entry) {
		#	Write-host $entry.Count
				#for (($j = 0); $j -lt $skill_data[$i].Count; $j++)
				#{
					
				#}
		#	}
	}
}

$output += ']'
#[System.IO.File]::WriteAllLines(".\skills.json", $output)

$output | Out-File -Encoding "UTF8" ".\skills.json"