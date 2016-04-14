Import-Module Hyper-V
function Clone-VM($parent, $suffix) {
        $diskpath='C:\users\public\documents\hyper-v\Virtual hard disks'

        $vm = "$parent - $suffix"
        $disk="$diskpath\$vm.vhdx"

        # Stop/purge the vm if it exists already
        Get-VM $vm | Stop-VM -Passthru | Remove-VM
        Remove-Item $disk

        # Create a new differencing drive against the parent vm's drive.
        $parentdisk=(Get-VMHardDiskDrive $parent).Path
        New-VHD $disk -ParentPath $parentdisk -Differencing

        # Use parent's switch
        $parentswitch=(Get-VMNetworkAdapter $parent).SwitchName

        # Create a new VM and start it.
        New-VM $vm -MemoryStartupBytes 1GB -VHDPath $disk -SwitchName $parentswitch | Start-VM -Passthru | Connect-VM
}

function Connect-VM {
    [CmdletBinding()]
    Param(
        [Parameter(Position=0,Mandatory=$true,ValueFromPipeline=$true,ParameterSetName='inputObject')]
        [Microsoft.HyperV.PowerShell.VirtualMachine[]]$inputObject,

        [Parameter(Position=0,Mandatory=$true,ParameterSetName='Name')]
        [string]$Name,

        [switch]$ssh
    ) 
 
    Process {
        if ($Name) {
          $inputObject = Get-VM -Name $Name -ErrorAction Stop
        }

        foreach ($vm in $inputObject) {
            if ($ssh) {
                $mac = (Get-VMNetworkAdapter $vm | select -first 1).MacAddress
                $ipv6 = Compute-EUI64($mac)
                & 'C:\Program Files (x86)\PuTTY\putty.exe' $ipv6
            } else {
                & vmconnect.exe $vm.ComputerName $vm.Name -G $vm.Id.Guid
            }
        }
    }
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

function Remove-VMClone($parent, $suffix) {
    $vm = "$parent - $suffix"
    Get-VM $vm | Stop-VM -Passthru | Get-VMHardDiskDrive | Remove-Item
    Get-VM $vm | Remove-VM
}

function Suspend-Computer {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.Application]::SetSuspendState([System.Windows.Forms.PowerState]::Suspend, $false, $false)
}
