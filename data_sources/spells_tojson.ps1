#ignore the code style inconsistency; first time powershelling
$nl = [Environment]::NewLine
$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

function Get-The-D {
    param (
        $String
    )
	$output = 0;
	if ($String -match '\d+') {
		$output = $Matches[0]
	}
	Write-output $output;
}

$temp = Get-Content ".\Spells.txt" | Out-String
$spell_data = $temp -Split '-------------------------------------------------------------------------------------------------------------------------------'
$output = '['

for (($i = 0); $i -lt $spell_data.Count; $i++) {
	if ($spell_data[$i].trim()) {
	
		if (! $i -eq 0) {
			$output += ','
		}
		
		
		
		
		$output += '{' + $nl
		
		
		
		$halves = $spell_data[$i] -Split "`r`n`r`nUpgrade[s]*:\s*`r`n`r`n"
		
		#Spellname: Effect, [range], [LoS], charges, Tags, Level
		$spell_part = $halves[0].trim();
		
		
		
		$spell_halves = $spell_part -Split ":"
		
		$title = $spell_halves[0].trim()
		$main_info_array = $spell_halves[1].trim() -Split ';'
		
		
		
		$desc = $main_info_array[0]
		
		
		
		$current_arg_index = 1;
		$range = 'none';
		
		if ($main_info_array[$current_arg_index] -match 'range') {
			
			$range = Get-The-D $main_info_array[$current_arg_index]
			$current_arg_index += 1
		}
		
		
		$los_req = 1
		if ($main_info_array[$current_arg_index] -match 'los') {
			
			$los_req = 0
			$current_arg_index += 1
		}
		
		$charges = 'none'
		if ($main_info_array[$current_arg_index] -match 'charge') {
			
			$charges = Get-The-D $main_info_array[$current_arg_index]
			$current_arg_index += 1
		}
		
		
		$tags = $main_info_array[$current_arg_index] -Split '&'
		for ($zzz=0;$zzz -lt $tags.Count; $zzz++) {
			$tags[$zzz] = $tags[$zzz].trim()
		}
		$tags_stringified = '["' + ($tags -join '","') + '"]'
		$current_arg_index += 1
		
		
		$lvl_req = 'none'
		if ($main_info_array[$current_arg_index] -match 'level') {
			$lvl_req = Get-The-D $main_info_array[$current_arg_index]
			$current_arg_index += 1
		}
		
		$upgrades_stringified = '[]'
		if ($halves[1]) {
			$upgrades = $halves[1] -Split "`r`n"
			$upgrades_stringified = '[';
				for (($j = 0); $j -lt $upgrades.Count; $j++) {
					if ($upgrades[$j].trim()) {
					$upg_halves = $upgrades[$j].trim() -Split ':'
					$upg_title = $upg_halves[0].trim();
					
					
					
					$upg_stuff = $upg_halves[1].trim() -Split ';'
					
					#Write-Host '---'
					#Write-Host $upg_halves[0]
					#Write-Host $upg_halves[1]
					#break
					
					if ($upg_stuff.Count -eq 1) { #some still have commas instead of semicolons
						$upg_stuff = $upg_halves[1].trim() -Split ','
					}
					
					#$tmp = $upg_stuff -join '==='
					
					
					if ($upg_stuff.Count -ne 1) {
						$first_part = @()
						for (($k = 0); $k -lt $upg_stuff.Count-1; $k++) {
							$first_part += ($upg_stuff[$k])
						}
						
						$upg_desc = $first_part -join ' '
						
						if ($j -ne 0) {
							$upgrades_stringified += ','
						}
						
						$cost = Get-The-D $upg_stuff[$upg_stuff.Count-1].trim()
						$temp = $upg_stuff[$upg_stuff.Count-1].trim() -Split $cost,2
						
						if ($temp[1].trim()) {
							$upg_desc += $temp[1]
						}
						
						$upgrades_stringified += $nl
						$upgrades_stringified += "`t"
						$upgrades_stringified += '{' + $nl
						$upgrades_stringified += "`t`t"
						$upgrades_stringified += '"title" : "' + $upg_title + '",'+ $nl
						$upgrades_stringified += "`t`t"
						$upgrades_stringified += '"description" : "' + $upg_desc + '",'+ $nl
						$upgrades_stringified += "`t`t"
						$upgrades_stringified += '"cost" : "' + $cost + '"'+ $nl
						$upgrades_stringified += "`t"
						$upgrades_stringified += '}'
					}
				}
			}
			$upgrades_stringified += ']';
		}
		
		$output += '"title" : "' + $title + '",'+ $nl
		$output += '"description" : "' + $desc + '",'+ $nl
		$output += '"range" : "' + $range + '",'+ $nl
		$output += '"los_required" : "' + $los_req + '",'+ $nl
		$output += '"charges" : "' + $charges + '",'+ $nl
		$output += '"schools" : ' + $tags_stringified + ','+ $nl
		$output += '"level" : "' + $lvl_req + '",'+ $nl
		$output += '"upgrades" : '+ $upgrades_stringified + $nl
		
		
		
		$output += '}' + $nl
		
		
		
		
		
	}
}

$output += ']'

$output | Out-File -Encoding "UTF8" ".\spells.json"