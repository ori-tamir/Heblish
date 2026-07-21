# Native messaging host: switch Windows keyboard layout (Hebrew / English US)
# Reads Chrome/Edge native messages from stdin, writes JSON response to stdout.

$ErrorActionPreference = "Stop"

Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class KeyboardLayoutHelper {
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern IntPtr LoadKeyboardLayout(string pwszKLID, uint Flags);
    [DllImport("user32.dll")]
    public static extern IntPtr ActivateKeyboardLayout(IntPtr hkl, uint Flags);
}
"@

function Read-NativeMessage {
    $stdin = [Console]::OpenStandardInput()
    $lenBytes = New-Object byte[] 4
    $read = $stdin.Read($lenBytes, 0, 4)
    if ($read -lt 4) { return $null }
    $len = [BitConverter]::ToInt32($lenBytes, 0)
    if ($len -le 0 -or $len -gt 1048576) { return $null }
    $data = New-Object byte[] $len
    $offset = 0
    while ($offset -lt $len) {
        $n = $stdin.Read($data, $offset, $len - $offset)
        if ($n -le 0) { break }
        $offset += $n
    }
    return [Text.Encoding]::UTF8.GetString($data)
}

function Write-NativeMessage([string]$json) {
    $bytes = [Text.Encoding]::UTF8.GetBytes($json)
    $len = [BitConverter]::GetBytes([int32]$bytes.Length)
    $stdout = [Console]::OpenStandardOutput()
    $stdout.Write($len, 0, 4)
    $stdout.Write($bytes, 0, $bytes.Length)
    $stdout.Flush()
}

function Switch-Layout([string]$direction) {
    $klid = if ($direction -eq "en2he") { "0000040D" } else { "00000409" }
    $hkl = [KeyboardLayoutHelper]::LoadKeyboardLayout($klid, 1)
    if ($hkl -eq [IntPtr]::Zero) {
        throw "LoadKeyboardLayout failed for $klid"
    }
    [void][KeyboardLayoutHelper]::ActivateKeyboardLayout($hkl, 0)
}

try {
    $raw = Read-NativeMessage
    if (-not $raw) {
        Write-NativeMessage '{"ok":false,"error":"empty message"}'
        exit 0
    }
    $msg = $raw | ConvertFrom-Json
    $dir = $msg.direction
    if ($dir -ne "en2he" -and $dir -ne "he2en") {
        Write-NativeMessage '{"ok":false,"error":"invalid direction"}'
        exit 0
    }
    Switch-Layout $dir
    Write-NativeMessage ('{"ok":true,"direction":"' + $dir + '"}')
} catch {
    $err = ($_.Exception.Message -replace '"', '\"')
    Write-NativeMessage ('{"ok":false,"error":"' + $err + '"}')
}
