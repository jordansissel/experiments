Import-Module Hyper-V
function Clone-VM($parent, $suffix) {
        $diskpath='C:\users\public\documents\hyper-v\Virtual hard disks'

        $name = "$parent - $suffix"
        $disk="$diskpath\$name.vhdx"

        # Stop/purge the vm if it exists already
        Remove-VMClone $name

        # Create a new differencing drive against the parent vm's drive.
        $parentdisk=(Get-VMHardDiskDrive $parent).Path
        New-VHD $disk -ParentPath $parentdisk -Differencing

        # Use parent's switch
        $parentswitch=(Get-VMNetworkAdapter $parent).SwitchName

        # Create a new VM and start it.
        New-VM $name -VHDPath $disk -SwitchName $parentswitch | 
          Set-VM -Passthru -MemoryStartupBytes 1GB -ProcessorCount 2 -MemoryMaximumBytes 1GB |
          Set-VM -Passthru -Notes "clone" |
          Start-VM -Passthru | Connect-VM
}

function Connect-VM {
    [CmdletBinding()]
    Param(
        [Parameter(Position=0,Mandatory=$true,ValueFromPipeline=$true,ParameterSetName='inputObject')]
        [Microsoft.HyperV.PowerShell.VirtualMachine[]]$inputObject,

        [Parameter(Position=0,Mandatory=$true,ParameterSetName='Name')]
        [string]$Name,

        [switch]$ssh,
        [string]$user
    ) 
 
    Process {
        if ($Name) {
          $inputObject = Get-VM -Name $Name -ErrorAction Stop
        }

        foreach ($vm in $inputObject) {
            if ($ssh) {
                $ipv6 = Get-VMIPv6Address $vm
                if ($user) {
                    & 'C:\Program Files (x86)\PuTTY\putty.exe' $user@$ipv6
                } else {
                    & 'C:\Program Files (x86)\PuTTY\putty.exe' $ipv6
                }
            } else {
                & vmconnect.exe $vm.ComputerName $vm.Name -G $vm.Id.Guid
            }
        }
    }
}

function Get-VMIPv6Address($vm) {
  Compute-EUI64 (Get-VMNetworkAdapter $vm | select -first 1).MacAddress
}

function Compute-EUI64([string]$mac) {
  # To compute EUI-64, we have to invert the 2nd bit.
  $highbytemunged = (("0x{0}" -f $mac.Substring(0,2)) -as [int]) -bxor 0x2
  $highbytehex = "{0:x2}" -f $highbytemunged
  
  return [string]::Format("FE80::{0}{1}:{2}ff:fe{3}:{4}", $highbytehex, $mac.Substring(2,2), $mac.Substring(4,2), $mac.Substring(6,2), $mac.Substring(8)) 
}

function Freeze-VM {
    [CmdletBinding()]
    Param(
        [Parameter(Position=0,Mandatory=$true,ValueFromPipeline=$true,ParameterSetName='inputObject')]
        [Microsoft.HyperV.PowerShell.VirtualMachine[]]$InputObject,
        
        [Parameter(Position=0,Mandatory=$true,ParameterSetName='Name')]
        [string]$Name
    ) 
 
    Process {
        if ($Name) {
          $inputObject = Get-VM -Name $Name
        }
        foreach ($vm in $InputObject) {
            Get-VMHardDiskDrive $vm | % { Set-ItemProperty $_.Path -name IsReadOnly -value $true }
        }
    }
}

function Thaw-VM {
    [CmdletBinding()]
    Param(
        [Parameter(Position=0,Mandatory=$true,ValueFromPipeline=$true,ParameterSetName='inputObject')]
        [Microsoft.HyperV.PowerShell.VirtualMachine[]]$InputObject,
        
        [Parameter(Position=0,Mandatory=$true,ParameterSetName='Name')]
        [string]$Name
    ) 
 
    Process {
        if ($Name) {
          $inputObject = Get-VM -Name $Name
        }
        foreach ($vm in $InputObject) {
            Get-VMHardDiskDrive $vm | % { Set-ItemProperty $_.Path -name IsReadOnly -value $false }
        }
    }
}

function Remove-VMClone {
    [CmdletBinding()]
    Param(
        [Parameter(Position=0,Mandatory=$true,ValueFromPipeline=$true,ParameterSetName='inputObject')]
        [Microsoft.HyperV.PowerShell.VirtualMachine[]]$InputObject,
        
        [Parameter(Position=0,Mandatory=$true,ParameterSetName='Name')]
        [string]$Name
    ) 
 
    Process {
        if ($Name) {
          $inputObject = Get-VM -Name $Name
        }
        foreach ($vm in $InputObject) {
            if ($vm.Notes -eq "clone") {
                Stop-VM -TurnOff -Passthru $vm | Get-VMHardDiskDrive | Remove-Item
                Remove-VM $vm
            } else {
                Write-Warning ("VM '{0}' is not a clone. I will not delete it." -f $vm.Name)
            }
        }
    }

}

function Suspend-Computer {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.Application]::SetSuspendState([System.Windows.Forms.PowerState]::Suspend, $false, $false)
}
