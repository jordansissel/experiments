use std::{f64::consts::PI, time::Duration};
use core::error::Error;
use crossterm::event::EventStream;
use futures::{FutureExt, StreamExt};
use ratatui::{Frame, layout::{Constraint, Layout}, palette::{Hsl, Hsla}, style::{Color, Style}, text::{Line, Text}};
use rand::prelude::*;

//const VBARS: [char; 8] = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
const VBARS: [char; 8] = ['▁','▁', '▂','▂', '▃', '▃', '▄', '▄'];
const VBARS2: [char; 8] = [ '▄', '▄', '▅','▅', '▆','▆', '▇','▇'];
const HBARS: [char; 8] = ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];

#[tokio::main(flavor = "current_thread")]
pub async fn main() -> Result<(), Box<dyn Error>> {
  let mut terminal = ratatui::init();
  let r_vbars = { 
    //let mut r = VBARS.clone();
    let mut r = VBARS2.clone();
    r.reverse();
    r
  };
  let r_hbars = { 
    let mut r = HBARS.clone();
    r.reverse();
    r
  };

  let mut tty = EventStream::new();

  let mut clock = tokio::time::interval(Duration::from_millis(32));

  let mut done = false;

  //let clear = Line::from(iter::repeat_n(VBARS[0], terminal.size()?.width as usize).collect::<String>());

  //let mut rng = rand::rng();

  //let vbars = VBARS.iter().map(|x| Cell::from(*x)).collect::<Vec<_>>();
  //let hbars = HBARS.iter().map(|x| Cell::from(*x)).collect::<Vec<_>>();

  let mut i = 0;
  let mut forward = true;
  while !done {
    tokio::select! {
        _ = clock.tick() => { },
        Some(_) = tty.next().fuse() => { done = true; }
    }

    terminal.draw(|frame| {
      let [_, vertical, _] = Layout::vertical(vec![
        Constraint::Fill(1),
        Constraint::Percentage(50),
        Constraint::Fill(1),
      ]).areas(frame.area());

      let [_, centered, _] = Layout::horizontal(vec![
        Constraint::Fill(1),
        Constraint::Percentage(50),
        Constraint::Fill(1),
      ]).areas(vertical);
      
      let (left, right, top, bottom) = (centered.left(), centered.right() - 1, centered.top(), centered.bottom() - 1);

      let sides = [
        (left ..= left, (top + 1)..= (bottom-1), r_hbars, Style::default().reversed()),
        (right ..= right, (top + 1)..= (bottom-1), HBARS, Style::default()),
        //(left ..= left, top..= bottom, r_hbars, Style::default().reversed()),
        //(right ..= right, top..= bottom, HBARS, Style::default()),

        ((left + 1)..= (right-1), top ..= top, VBARS, Style::default()),
        ((left + 1)..= (right-1), bottom ..= bottom, r_vbars, Style::default().reversed()),
        //(left..= (right-1), top ..= top, VBARS, Style::default()),
        //(left..= (right-1), bottom ..= bottom, r_vbars, Style::default().reversed()),

        //(left ..= left, top..=top, [' ', ' ', '▗', '▗', '▟', '▟', '█', '█'], Style::default()),

        //(left ..= left, top..=top, [' ', ' ', ' ', '▗', '▗', '▗', '◢', '◢'], Style::default()),
        //(right ..= right, top..=top, [' ', ' ', ' ', '▖', '▖', '▖', '◣', '◣'], Style::default()),
        //(left ..= left, bottom..=bottom, [' ', ' ', ' ', '▝', '▝', '▝', '◥', '◥'], Style::default()),
        //(right ..= right, bottom..=bottom, [' ', ' ', ' ', '▘', '▘', '▘', '◤', '◤'], Style::default()),

        
        //(left ..= left, top..=top, [' ', ' ', ' ', ' ', ' ', '▗', '▗', '▗'], Style::default()),
        //(left ..= left, top..=top, ['⚠', '⚠', '⚠', '⚠', '⚠','⚠','⚠','⚠'], Style::default()),
        (left+1 ..= left+1, top+1..=top+1, ['◤', '◤', '◤', '◤', '◤','◤','◤','◤'], Style::default()),
        (right ..= right, top..=top, [' ', ' ', ' ', ' ', ' ', ' ', '▖', '▖'], Style::default()),
        (left ..= left, bottom..=bottom, [' ', ' ', ' ', '▝', '▝', '▝', '◥', '◥'], Style::default()),
        (right ..= right, bottom..=bottom, [' ', ' ', ' ', '▘', '▘', '▘', '◤', '◤'], Style::default()),
      ];

      let buf = frame.buffer_mut();
      for (xr, yr, symbols, style) in sides {
        for x in xr {
          for y in yr.clone() {
            //buf[(x,y)] = symbols[rng.random_range(0..symbols.len())];
            //buf[(x,y)].set_char(symbols[rng.random_range(0..symbols.len())]);
            //buf[(x,y)].set_char(symbols[i as usize % symbols.len()]);
            buf[(x,y)].set_char(symbols[i]);
            buf[(x,y)].set_style(style.fg(Color::from_hsl(Hsl::new(30.0, i as f32 * 0.2, 0.10 + (i as f32) * 0.05))));
          }
        }
      }
    })?;

    if forward {
      i += 1;
      if i == (HBARS.len() - 1) {
        forward = false;
      }
    } else {
      i -= 1;
      if i == 0 {
        forward = true;
      }
    }
  }
  ratatui::restore();

  Ok(())
}

/*
#[allow(dead_code)]
fn trig(frame: &mut Frame) {
    let width = frame.area().width;
    let center = width as f64 / 2.0;
    let cycles = 4f64;
    let x_scale = cycles * (2f64 * PI) / (width - (width % BARS.len() as u16)) as f64;
    let bar_scale = BARS.len() - 1;

    let (line1, line2) = (0..width).map(|i| {
        let f = i as f64;
        let point = (f * x_scale + (center)).cos();
        let scale = point * bar_scale as f64;
        let i1 = scale.round() as usize;
        let i2 = bar_scale - (-scale as f64).round() as usize;
        (BARS[i1], BARS[i2])
    }).collect::<(String, String)>();

    let text = Text::from_iter([
        line1.into(),
        Line::from(line2).style(Style::default().reversed()),
    ]);
    frame.render_widget(text, frame.area());
}
*/
