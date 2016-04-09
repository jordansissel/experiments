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
        [Microsoft.HyperV.PowerShell.VirtualMachine[]]$InputObject
    ) 
 
    Process {
        foreach ($vm in $InputObject) {
           & vmconnect.exe  localhost $vm.Name -G $vm.Id.Guid
        }
    }
}

function Freeze-VM {
    [CmdletBinding()]
    Param(
        [Parameter(Position=0,Mandatory=$true,ValueFromPipeline=$true,ParameterSetName='inputObject')]
        [Microsoft.HyperV.PowerShell.VirtualMachine[]]$InputObject
    ) 
 
    Process {
        foreach ($vm in $InputObject) {
            Get-VMHardDiskDrive $vm | % { Set-ItemProperty $_.Path -name IsReadOnly -value $true }
        }
    }
}
