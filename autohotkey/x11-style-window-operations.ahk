
!LButton::

CoordMode, Mouse, Relative
MouseGetPos, cur_win_x, cur_win_y, window_id
WinGet, window_minmax, MinMax, ahk_id %window_id%

; Return if the window is maximized or minimized
if window_minmax <> 0
{
  return
}

CoordMode, Mouse, Screen
SetWinDelay, 20


loop
{
  ; exit the loop if the left mouse button was released
  if !GetKeyState("LButton", "P")
  {
    break
  }

  ; move the window based on cursor position
  MouseGetPos, cur_x, cur_y
  WinMove, ahk_id %window_id%,, (cur_x - cur_win_x), (cur_y - cur_win_y)
}

return

!RButton::

CoordMode, Mouse, Screen
MouseGetPos, imx, imy, window_id
WinGetPos, x, y, w, h, ahk_id %window_id%

; Return if the window is maximized or minimized
WinGet, window_minmax, MinMax, ahk_id %window_id%

if window_minmax <> 0
{
  return
}

SetWinDelay, 20

loop
{

  ; exit the loop if the left mouse button was released
  if !GetKeyState("RButton", "P")
  {
    break
  }
  MouseGetPos, mx, my
  WinMove, ahk_id %window_id%, , , , (w + mx - imx), (h + my - imy), , 
}

return
