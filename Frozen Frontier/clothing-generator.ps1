Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Text;

public static class TransparentGifWriter {
  private struct Code {
    public int Value;
    public int Size;
    public Code(int value, int size) {
      Value = value;
      Size = size;
    }
  }

  public static void Save(Bitmap bitmap, string path, Color transparent) {
    var colors = new List<Color>();
    var map = new Dictionary<int, int>();
    colors.Add(Color.FromArgb(255, 0, 0, 0));
    var indices = new int[bitmap.Width * bitmap.Height];

    for (int y = 0; y < bitmap.Height; y++) {
      for (int x = 0; x < bitmap.Width; x++) {
        Color pixel = bitmap.GetPixel(x, y);
        int index = y * bitmap.Width + x;
        if (pixel.ToArgb() == transparent.ToArgb() || pixel.A == 0) {
          indices[index] = 0;
          continue;
        }
        int key = Color.FromArgb(255, pixel.R, pixel.G, pixel.B).ToArgb();
        int paletteIndex;
        if (!map.TryGetValue(key, out paletteIndex)) {
          paletteIndex = colors.Count;
          map[key] = paletteIndex;
          colors.Add(Color.FromArgb(255, pixel.R, pixel.G, pixel.B));
          if (colors.Count > 256) throw new InvalidOperationException("Too many colors for GIF clothing sheet.");
        }
        indices[index] = paletteIndex;
      }
    }

    while (colors.Count < 4) colors.Add(Color.Black);
    int tableSize = 2;
    while ((1 << tableSize) < colors.Count) tableSize++;
    int tableLength = 1 << tableSize;
    while (colors.Count < tableLength) colors.Add(Color.Black);

    using (var writer = new BinaryWriter(File.Open(path, FileMode.Create, FileAccess.Write))) {
      WriteAscii(writer, "GIF89a");
      WriteShort(writer, bitmap.Width);
      WriteShort(writer, bitmap.Height);
      writer.Write((byte)(0x80 | ((tableSize - 1) << 4) | (tableSize - 1)));
      writer.Write((byte)0);
      writer.Write((byte)0);
      foreach (Color color in colors) {
        writer.Write(color.R);
        writer.Write(color.G);
        writer.Write(color.B);
      }

      writer.Write((byte)0x21);
      writer.Write((byte)0xf9);
      writer.Write((byte)0x04);
      writer.Write((byte)0x01);
      WriteShort(writer, 0);
      writer.Write((byte)0);
      writer.Write((byte)0);

      writer.Write((byte)0x2c);
      WriteShort(writer, 0);
      WriteShort(writer, 0);
      WriteShort(writer, bitmap.Width);
      WriteShort(writer, bitmap.Height);
      writer.Write((byte)0);

      int minCodeSize;
      byte[] encoded = LzwEncode(indices, tableLength, out minCodeSize);
      writer.Write((byte)minCodeSize);
      for (int i = 0; i < encoded.Length; i += 255) {
        int count = Math.Min(255, encoded.Length - i);
        writer.Write((byte)count);
        writer.Write(encoded, i, count);
      }
      writer.Write((byte)0);
      writer.Write((byte)0x3b);
    }
  }

  private static byte[] LzwEncode(int[] indices, int colorCount, out int minCodeSize) {
    minCodeSize = Math.Max(2, CeilLog2(colorCount));
    int clearCode = 1 << minCodeSize;
    int endCode = clearCode + 1;
    var bytes = new List<byte>();
    int current = 0;
    int bitCount = 0;
    int codeSize = minCodeSize + 1;
    Action<int> writeCode = value => {
      current |= value << bitCount;
      bitCount += codeSize;
      while (bitCount >= 8) {
        bytes.Add((byte)(current & 255));
        current >>= 8;
        bitCount -= 8;
      }
    };
    foreach (int index in indices) {
      writeCode(clearCode);
      writeCode(index);
    }
    writeCode(endCode);
    if (bitCount > 0) bytes.Add((byte)(current & 255));
    return bytes.ToArray();
  }

  private static int CeilLog2(int value) {
    int bits = 0;
    int current = 1;
    while (current < value) {
      current <<= 1;
      bits++;
    }
    return bits;
  }

  private static void WriteAscii(BinaryWriter writer, string value) {
    writer.Write(Encoding.ASCII.GetBytes(value));
  }

  private static void WriteShort(BinaryWriter writer, int value) {
    writer.Write((byte)(value & 255));
    writer.Write((byte)((value >> 8) & 255));
  }
}
"@

$Root = Join-Path $PSScriptRoot "assets\clothing"
$CellW = 128
$CellH = 216
$Frames = 4
$Directions = @("down", "left", "up", "right")
$Categories = @{
  heads = @{ singular = "head"; count = 10 }
  hats = @{ singular = "hat"; count = 10 }
  shirts = @{ singular = "shirt"; count = 10 }
  pants = @{ singular = "pants"; count = 10 }
  shoes = @{ singular = "shoes"; count = 10 }
}

$Primary = "#ffffff"
$Brass = "#d89b34"
$DarkBrass = "#9a6425"
$Copper = "#b7643e"
$Leather = "#5b3b2e"
$DarkLeather = "#2f241f"
$Fur = "#e2d0ad"
$Dark = "#172632"
$Shadow = "#0c151d"
$Glass = "#9fe8ff"
$Steel = "#aab9bf"
$Red = "#b34a3c"
$Cream = "#f1dfbb"

function New-Color($Hex) {
  $value = $Hex.TrimStart("#")
  return [System.Drawing.Color]::FromArgb(
    255,
    [Convert]::ToInt32($value.Substring(0, 2), 16),
    [Convert]::ToInt32($value.Substring(2, 2), 16),
    [Convert]::ToInt32($value.Substring(4, 2), 16)
  )
}

function New-Brush($Hex) {
  return [System.Drawing.SolidBrush]::new((New-Color $Hex))
}

function New-Pen($Hex, $Width = 1) {
  $pen = [System.Drawing.Pen]::new((New-Color $Hex), [single]$Width)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  return $pen
}

function Shade($Hex, $Amount) {
  $value = $Hex.TrimStart("#")
  $r = [Math]::Max(0, [Math]::Min(255, [Convert]::ToInt32($value.Substring(0, 2), 16) + $Amount))
  $g = [Math]::Max(0, [Math]::Min(255, [Convert]::ToInt32($value.Substring(2, 2), 16) + $Amount))
  $b = [Math]::Max(0, [Math]::Min(255, [Convert]::ToInt32($value.Substring(4, 2), 16) + $Amount))
  return "#{0:x2}{1:x2}{2:x2}" -f $r, $g, $b
}

function Fill-Ellipse($G, $X, $Y, $Rx, $Ry, $Color) {
  $brush = New-Brush $Color
  $G.FillEllipse($brush, [single]($X - $Rx), [single]($Y - $Ry), [single]($Rx * 2), [single]($Ry * 2))
  $brush.Dispose()
}

function Fill-Rect($G, $X, $Y, $W, $H, $Color) {
  $brush = New-Brush $Color
  $G.FillRectangle($brush, [single]$X, [single]$Y, [single]$W, [single]$H)
  $brush.Dispose()
}

function Fill-Polygon($G, $Points, $Color) {
  $brush = New-Brush $Color
  $typed = [System.Drawing.PointF[]]($Points | ForEach-Object { [System.Drawing.PointF]::new([single]$_[0], [single]$_[1]) })
  $G.FillPolygon($brush, $typed)
  $brush.Dispose()
}

function Draw-Line($G, $X1, $Y1, $X2, $Y2, $Color, $Width = 1) {
  $pen = New-Pen $Color $Width
  $G.DrawLine($pen, [single]$X1, [single]$Y1, [single]$X2, [single]$Y2)
  $pen.Dispose()
}

function Fill-Capsule($G, $X1, $Y1, $X2, $Y2, $Radius, $Color) {
  Draw-Line $G $X1 $Y1 $X2 $Y2 $Color ($Radius * 2)
}

function Phase($Frame) {
  return @(0, -1, 0, 1)[$Frame]
}

function Bob($Frame) {
  if (($Frame % 2) -eq 1) { return -1.3 }
  return 0
}

function Draw-Gear($G, $X, $Y, $R) {
  Fill-Ellipse $G $X $Y $R $R $Brass
  Fill-Ellipse $G $X $Y ([Math]::Max(2, $R - 4)) ([Math]::Max(2, $R - 4)) $Shadow
  Fill-Ellipse $G $X $Y ([Math]::Max(1, $R - 7)) ([Math]::Max(1, $R - 7)) $Brass
  for ($i = 0; $i -lt 8; $i++) {
    $a = [Math]::PI * 2 * $i / 8
    Fill-Rect $G ($X + [Math]::Cos($a) * ($R + 1) - 1.5) ($Y + [Math]::Sin($a) * ($R + 1) - 1.5) 3 3 $Brass
  }
}

function Draw-Goggles($G, $X, $Y, $Narrow = 1) {
  Fill-Ellipse $G ($X - 8 * $Narrow) $Y (8 * $Narrow) 6 $Brass
  Fill-Ellipse $G ($X + 8 * $Narrow) $Y (8 * $Narrow) 6 $Brass
  Fill-Ellipse $G ($X - 8 * $Narrow) $Y (5 * $Narrow) 3 $Glass
  Fill-Ellipse $G ($X + 8 * $Narrow) $Y (5 * $Narrow) 3 $Glass
  Fill-Rect $G ($X - 2 * $Narrow) ($Y - 1) (4 * $Narrow) 2 $DarkBrass
}

function Draw-Buttons($G, $X, $Y, $Count, $Step = 13) {
  for ($i = 0; $i -lt $Count; $i++) {
    Fill-Ellipse $G $X ($Y + $i * $Step) 2.2 2.2 $Brass
  }
}

function Draw-Head($G, $Style, $Dir, $Frame) {
  $side = $Dir -eq "left" -or $Dir -eq "right"
  $sign = if ($Dir -eq "left") { -1 } else { 1 }
  $y = Bob $Frame
  $shape = @(
    @(18, 20), @(21, 22), @(17, 24), @(23, 19), @(18, 22),
    @(22, 21), @(17, 20), @(20, 24), @(24, 20), @(19, 23)
  )[$Style]
  $x = 64 + (Phase $Frame) * 0.7 + $(if ($side) { $sign * 2 } else { 0 })
  Fill-Ellipse $G $x (52 + $y) $(if ($side) { $shape[0] * 0.62 } else { $shape[0] }) $shape[1] $Primary
  Fill-Ellipse $G ($x + $(if ($side) { -$sign * 4 } else { 0 })) (69 + $y) $(if ($side) { 8 } else { 10 }) 7 (Shade $Primary -12)
  if ($side) {
    Fill-Ellipse $G ($x + $sign * 12) (51 + $y) 4 5 $Primary
    Fill-Ellipse $G ($x + $sign * 9) (51 + $y) 1.8 1.8 $Shadow
    Draw-Line $G ($x + $sign * 10) (59 + $y) ($x + $sign * 19) (60 + $y) $Leather 1
  } elseif ($Dir -eq "down") {
    Fill-Ellipse $G ($x - 7) (51 + $y) 1.8 1.8 $Shadow
    Fill-Ellipse $G ($x + 7) (51 + $y) 1.8 1.8 $Shadow
    Draw-Line $G ($x - 6) (61 + $y) ($x + 6) (61 + $y) $Leather $(if (($Style % 3) -eq 0) { 2 } else { 1 })
    if (($Style % 4) -eq 1) {
      Fill-Ellipse $G ($x - 9) (62 + $y) 4 2 $DarkLeather
      Fill-Ellipse $G ($x + 9) (62 + $y) 4 2 $DarkLeather
    }
  } else {
    Fill-Rect $G ($x - 14) (38 + $y) 28 9 (Shade $Primary -22)
    if (($Style % 3) -eq 2) {
      Fill-Capsule $G ($x - 17) (57 + $y) ($x + 17) (57 + $y) 3 (Shade $Primary -18)
    }
  }
}

function Draw-Hat($G, $Style, $Dir, $Frame) {
  $side = $Dir -eq "left" -or $Dir -eq "right"
  $sign = if ($Dir -eq "left") { -1 } else { 1 }
  $y = (Bob $Frame) - 4
  $narrow = if ($side) { 0.72 } elseif ($Dir -eq "up") { 0.9 } else { 1 }
  $x = 64 + (Phase $Frame) * 0.6 + $(if ($side) { $sign * 2 } else { 0 })
  switch ($Style) {
    0 {
      Fill-Ellipse $G $x (45 + $y) (25 * $narrow) 15 $Primary
      Fill-Rect $G ($x - 26 * $narrow) (52 + $y) (52 * $narrow) 7 $DarkLeather
      Draw-Goggles $G $x (42 + $y) $narrow
      Fill-Ellipse $G ($x + $sign * 22 * $narrow) (39 + $y) 5 5 $Brass
    }
    1 {
      Fill-Ellipse $G $x (56 + $y) (36 * $narrow) 5 $DarkLeather
      Fill-Rect $G ($x - 18 * $narrow) (22 + $y) (36 * $narrow) 35 $Primary
      Fill-Rect $G ($x - 20 * $narrow) (43 + $y) (40 * $narrow) 7 $Brass
      Draw-Gear $G ($x + 15 * $narrow) (38 + $y) 5
    }
    2 {
      Fill-Ellipse $G $x (43 + $y) (26 * $narrow) 17 $Primary
      Fill-Rect $G ($x - 30 * $narrow) (49 + $y) (60 * $narrow) 9 $Fur
      Fill-Capsule $G ($x - 24 * $narrow) (55 + $y) ($x - 20 * $narrow) (72 + $y) 6 $Fur
      Fill-Capsule $G ($x + 24 * $narrow) (55 + $y) ($x + 20 * $narrow) (72 + $y) 6 $Fur
      Draw-Goggles $G $x (43 + $y) $narrow
    }
    3 {
      Fill-Ellipse $G $x (55 + $y) (34 * $narrow) 5 $DarkLeather
      Fill-Rect $G ($x - 24 * $narrow) (35 + $y) (48 * $narrow) 18 $Primary
      Fill-Rect $G ($x - 17 * $narrow) (28 + $y) (34 * $narrow) 8 $Brass
      Fill-Ellipse $G ($x + 2 * $narrow) (29 + $y) 7 5 $Glass
    }
    4 {
      Fill-Ellipse $G $x (54 + $y) (32 * $narrow) 5 $DarkLeather
      Fill-Ellipse $G $x (42 + $y) (25 * $narrow) 13 $Primary
      Fill-Rect $G ($x - 20 * $narrow) (46 + $y) (40 * $narrow) 7 $Brass
      Draw-Gear $G ($x - 16 * $narrow) (43 + $y) 5
    }
    5 {
      Fill-Ellipse $G $x (48 + $y) (24 * $narrow) 18 $Primary
      Fill-Rect $G ($x - 30 * $narrow) (55 + $y) (60 * $narrow) 8 $DarkLeather
      Draw-Line $G ($x - 18 * $narrow) (36 + $y) ($x - 27 * $narrow) (24 + $y) $Brass 2
      Draw-Line $G ($x + 18 * $narrow) (36 + $y) ($x + 27 * $narrow) (24 + $y) $Brass 2
      Draw-Goggles $G $x (50 + $y) $narrow
    }
    6 {
      Fill-Ellipse $G $x (57 + $y) (43 * $narrow) 5 $DarkLeather
      Fill-Polygon $G @(
        @(($x - 27 * $narrow), (55 + $y)), @(($x + 27 * $narrow), (55 + $y)),
        @(($x + 18 * $narrow), (34 + $y)), @(($x - 18 * $narrow), (34 + $y))
      ) $Primary
      Fill-Rect $G ($x - 23 * $narrow) (47 + $y) (46 * $narrow) 5 $Brass
    }
    7 {
      Fill-Ellipse $G $x (56 + $y) (34 * $narrow) 5 $DarkLeather
      Fill-Rect $G ($x - 18 * $narrow) (33 + $y) (36 * $narrow) 22 $Primary
      Fill-Rect $G ($x + 16 * $narrow) (22 + $y) (8 * $narrow) 24 $Copper
      Fill-Ellipse $G ($x + 20 * $narrow) (19 + $y) 5 4 $Steel
    }
    8 {
      Fill-Ellipse $G $x (54 + $y) (33 * $narrow) 5 $DarkLeather
      Fill-Ellipse $G $x (43 + $y) (28 * $narrow) 11 $Primary
      Fill-Rect $G ($x - 20 * $narrow) (48 + $y) (40 * $narrow) 5 $Brass
      for ($i = -2; $i -le 2; $i++) {
        Draw-Line $G ($x + $i * 7 * $narrow) (34 + $y) ($x + $i * 10 * $narrow) (50 + $y) (Shade $Primary -30) 1
      }
    }
    default {
      Fill-Ellipse $G $x (53 + $y) (34 * $narrow) 6 $DarkLeather
      Fill-Ellipse $G $x (41 + $y) (24 * $narrow) 16 $Primary
      Fill-Rect $G ($x - 14 * $narrow) (27 + $y) (28 * $narrow) 8 $Brass
      Draw-Line $G $x (28 + $y) $x (13 + $y) $Brass 2
      Fill-Ellipse $G $x (11 + $y) 4 4 $Glass
    }
  }
}

function Draw-Arms($G, $Dir, $Frame, $Bulky = $false) {
  $p = Phase $Frame
  $side = $Dir -eq "left" -or $Dir -eq "right"
  $sign = if ($Dir -eq "left") { -1 } else { 1 }
  $r = if ($Bulky) { 9 } else { 7 }
  if ($side) {
    Fill-Capsule $G (64 + $sign * 11) 86 (64 + $sign * (22 + $p * 5)) 133 $r $Primary
    Fill-Capsule $G (64 - $sign * 5) 89 (64 - $sign * (9 + $p * 3)) 126 ([Math]::Max(5, $r - 2)) $Primary
    Fill-Ellipse $G (64 + $sign * (23 + $p * 5)) 136 5 5 $DarkLeather
  } else {
    Fill-Capsule $G 43 86 (27 - $p * 7) 132 $r $Primary
    Fill-Capsule $G 85 86 (101 + $p * 7) 132 $r $Primary
    Fill-Ellipse $G (27 - $p * 7) 135 5 5 $DarkLeather
    Fill-Ellipse $G (101 + $p * 7) 135 5 5 $DarkLeather
  }
}

function Draw-Torso($G, $X, $W, $LongCoat) {
  $bottom = if ($LongCoat) { 168 } else { 151 }
  Fill-Polygon $G @(
    @(($X - $W / 2), 76), @(($X + $W / 2), 76),
    @(($X + $W / 2 - 7), $bottom), @(($X - $W / 2 + 7), $bottom)
  ) $Primary
}

function Draw-Shirt($G, $Style, $Dir, $Frame) {
  $side = $Dir -eq "left" -or $Dir -eq "right"
  $sign = if ($Dir -eq "left") { -1 } else { 1 }
  $x = 64 + $(if ($side) { $sign * 3 } else { 0 })
  $w = if ($side) { 30 + ($Style % 3) * 2 } else { 45 + ($Style % 4) * 2 }
  $long = $Style -in @(0, 5, 8, 9)
  Draw-Arms $G $Dir $Frame ($Style -in @(1, 4, 7))
  Draw-Torso $G $x $w $long
  Fill-Rect $G ($x - $w / 2 + 4) 82 ($w - 8) 8 (Shade $Primary -28)
  switch ($Style) {
    0 {
      Fill-Rect $G ($x - 4) 81 8 82 $Leather
      Draw-Buttons $G ($x + 8) 88 5
      Fill-Rect $G ($x - $w / 2 - 3) 74 ($w + 6) 9 $Brass
      Fill-Rect $G ($x - 23) 151 46 7 $DarkLeather
    }
    1 {
      Fill-Rect $G ($x - $w / 2 - 6) 76 ($w + 12) 12 $Fur
      Fill-Rect $G ($x - $w / 2 - 3) 144 ($w + 6) 10 $Fur
      Fill-Ellipse $G $x 80 18 7 $Fur
      Draw-Line $G ($x - $w / 2 + 8) 93 ($x + $w / 2 - 8) 139 $Leather 2
    }
    2 {
      Fill-Rect $G ($x - $w / 2 + 5) 78 ($w - 10) 65 $Dark
      Draw-Line $G ($x - 17) 83 ($x + 17) 139 $Leather 3
      Draw-Line $G ($x + 17) 83 ($x - 17) 139 $Leather 3
      Draw-Gear $G $x 112 7
    }
    3 {
      Fill-Rect $G ($x - 18) 92 36 58 $Leather
      Fill-Rect $G ($x - 15) 96 30 8 (Shade $Leather 24)
      Fill-Rect $G ($x - 21) 148 42 6 $Brass
      Draw-Buttons $G $x 88 4 11
    }
    4 {
      Fill-Rect $G ($x - $w / 2 - 2) 78 ($w + 4) 15 $Steel
      Fill-Rect $G ($x - 13) 100 26 28 $Dark
      Fill-Ellipse $G $x 114 10 10 $Glass
      Fill-Rect $G ($x - 27) 144 54 8 $Brass
    }
    5 {
      Fill-Rect $G ($x - $w / 2 - 4) 76 ($w + 8) 12 $DarkLeather
      Fill-Polygon $G @(@(($x - $w / 2 - 9), 86), @(($x - 8), 88), @(($x - 16), 165), @(($x - $w / 2 - 14), 158)) (Shade $Primary -24)
      Fill-Rect $G ($x - 10) 84 20 13 $Red
      Fill-Rect $G ($x - 2) 97 5 54 $Red
    }
    6 {
      Draw-Line $G ($x - 18) 82 ($x + 18) 146 $Leather 3
      Draw-Line $G ($x + 18) 82 ($x - 18) 146 $Leather 3
      Fill-Rect $G ($x - 22) 108 44 8 $DarkLeather
      Draw-Gear $G ($x + 16) 101 5
    }
    7 {
      Fill-Rect $G ($x - $w / 2 - 4) 76 ($w + 8) 9 $Fur
      Fill-Rect $G ($x - 17) 83 34 10 $Cream
      Fill-Rect $G ($x - 5) 83 10 70 $Cream
      Draw-Line $G ($x - 20) 101 ($x + 20) 101 $Brass 2
    }
    8 {
      Fill-Rect $G ($x - 18) 91 36 52 $DarkLeather
      for ($i = 0; $i -lt 4; $i++) {
        Draw-Line $G ($x - 15) (100 + $i * 10) ($x + 15) (96 + $i * 10) $Brass 1
      }
      Fill-Rect $G ($x - 25) 145 50 9 $Brass
      Draw-Gear $G ($x - 22) 119 5
    }
    default {
      Fill-Rect $G ($x - 20) 90 40 60 $Cream
      Fill-Rect $G ($x - 4) 101 8 28 $Red
      Fill-Rect $G ($x - 14) 111 28 8 $Red
      Fill-Rect $G ($x - 22) 146 44 7 $Brass
      Draw-Buttons $G ($x + 17) 87 4 12
    }
  }
}

function Draw-Pants($G, $Style, $Dir, $Frame) {
  $p = Phase $Frame
  $side = $Dir -eq "left" -or $Dir -eq "right"
  $sign = if ($Dir -eq "left") { -1 } else { 1 }
  Fill-Rect $G $(if ($side) { 53 } else { 43 }) 123 $(if ($side) { 24 } else { 42 }) 20 $Primary
  if ($side) {
    Fill-Capsule $G 63 136 (65 + $sign * (6 + $p * 5)) 184 9 $Primary
    Fill-Capsule $G 60 136 (58 - $sign * (3 + $p * 4)) 180 7 $Primary
    Fill-Rect $G 55 139 22 6 $Leather
  } else {
    Fill-Capsule $G 55 136 (50 + $p * 7) 184 9 $Primary
    Fill-Capsule $G 73 136 (78 - $p * 7) 184 9 $Primary
    Fill-Rect $G 42 137 44 6 $Leather
  }
  switch ($Style) {
    0 { Fill-Rect $G 48 151 11 19 $Leather; Fill-Rect $G 69 151 11 19 $Leather; Fill-Rect $G 41 126 46 6 $Brass }
    1 { Fill-Rect $G 45 145 38 12 $Fur; Fill-Rect $G 47 170 13 7 $Brass; Fill-Rect $G 68 170 13 7 $Brass }
    2 { Draw-Line $G 51 123 58 91 $Leather 3; Draw-Line $G 77 123 70 91 $Leather 3; Fill-Rect $G 47 132 34 8 $Brass; Draw-Gear $G 82 139 5 }
    3 { Fill-Rect $G 39 123 50 30 (Shade $Primary -28); Fill-Rect $G 43 153 42 7 $Brass }
    4 { Fill-Rect $G 47 151 12 14 $Steel; Fill-Rect $G 69 151 12 14 $Steel; Draw-Line $G 55 136 49 180 $DarkBrass 2; Draw-Line $G 73 136 79 180 $DarkBrass 2 }
    5 { Fill-Rect $G 43 176 42 9 $Fur; Fill-Rect $G 41 126 46 5 $DarkLeather; Fill-Rect $G 51 128 7 53 (Shade $Primary -24); Fill-Rect $G 70 128 7 53 (Shade $Primary -24) }
    6 { Fill-Rect $G 44 132 40 7 $Brass; Draw-Line $G 46 144 61 183 $Leather 2; Draw-Line $G 82 144 67 183 $Leather 2; Fill-Ellipse $G 52 158 5 5 $Glass }
    7 { Fill-Rect $G 43 123 42 18 $DarkLeather; Fill-Rect $G 49 143 11 40 $Primary; Fill-Rect $G 68 143 11 40 $Primary; Fill-Rect $G 47 155 13 5 $Brass; Fill-Rect $G 68 155 13 5 $Brass }
    8 { Draw-Line $G 50 126 82 126 $Brass 2; for ($i = 0; $i -lt 3; $i++) { Fill-Rect $G 47 (147 + $i * 10) 13 3 $DarkLeather; Fill-Rect $G 68 (147 + $i * 10) 13 3 $DarkLeather } }
    default { Fill-Rect $G 43 123 42 22 $Cream; Fill-Rect $G 45 147 15 36 $Primary; Fill-Rect $G 68 147 15 36 $Primary; Fill-Rect $G 42 141 44 5 $Brass }
  }
}

function Draw-Shoes($G, $Style, $Dir, $Frame) {
  $p = Phase $Frame
  $side = $Dir -eq "left" -or $Dir -eq "right"
  $sign = if ($Dir -eq "left") { -1 } else { 1 }
  if ($side) {
    Fill-Ellipse $G (65 + $sign * (7 + $p * 5)) 190 15 6 $Primary
    Fill-Ellipse $G (58 - $sign * (2 + $p * 3)) 187 11 5 $Primary
  } else {
    Fill-Ellipse $G (50 + $p * 7) 190 13 6 $Primary
    Fill-Ellipse $G (78 - $p * 7) 190 13 6 $Primary
  }
  switch ($Style) {
    0 { Draw-Line $G 42 187 58 194 $Brass 1; Draw-Line $G 70 187 86 194 $Brass 1 }
    1 { Fill-Rect $G 38 185 22 7 $Steel; Fill-Rect $G 68 185 22 7 $Steel; Fill-Ellipse $G 49 188 4 3 $Brass; Fill-Ellipse $G 79 188 4 3 $Brass }
    2 { Fill-Rect $G 39 178 20 9 $Fur; Fill-Rect $G 69 178 20 9 $Fur }
    3 { Fill-Rect $G 40 171 18 19 $Primary; Fill-Rect $G 70 171 18 19 $Primary; Fill-Rect $G 43 176 12 4 $Brass; Fill-Rect $G 73 176 12 4 $Brass }
    4 { Fill-Rect $G 40 176 48 8 $Cream; Fill-Rect $G 42 184 46 4 $Brass }
    5 { for ($i = 0; $i -lt 3; $i++) { Draw-Line $G (42 + $i * 6) 194 (45 + $i * 6) 198 $Steel 1; Draw-Line $G (72 + $i * 6) 194 (75 + $i * 6) 198 $Steel 1 } }
    6 { Fill-Rect $G 39 180 20 11 (Shade $Primary -28); Fill-Rect $G 69 180 20 11 (Shade $Primary -28); Draw-Line $G 40 187 90 187 $Brass 1 }
    7 { Fill-Rect $G 39 180 20 5 $Brass; Fill-Rect $G 69 180 20 5 $Brass; Fill-Ellipse $G 48 183 3 3 $DarkBrass; Fill-Ellipse $G 78 183 3 3 $DarkBrass }
    8 { Fill-Rect $G 41 168 17 22 $Primary; Fill-Rect $G 70 168 17 22 $Primary; Fill-Rect $G 41 184 47 5 $DarkLeather }
    default { Draw-Line $G 30 196 62 196 $Fur 3; Draw-Line $G 66 196 98 196 $Fur 3; Draw-Line $G 33 192 59 200 $Brass 1; Draw-Line $G 69 192 95 200 $Brass 1 }
  }
}

function Draw-Part($G, $Category, $Style, $Dir, $Frame) {
  switch ($Category) {
    "heads" { Draw-Head $G $Style $Dir $Frame }
    "hats" { Draw-Hat $G $Style $Dir $Frame }
    "shirts" { Draw-Shirt $G $Style $Dir $Frame }
    "pants" { Draw-Pants $G $Style $Dir $Frame }
    "shoes" { Draw-Shoes $G $Style $Dir $Frame }
  }
}

foreach ($entry in $Categories.GetEnumerator()) {
  $folder = $entry.Key
  $config = $entry.Value
  $dir = Join-Path $Root $folder
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  for ($index = 0; $index -lt $config.count; $index++) {
    $bitmap = [System.Drawing.Bitmap]::new($CellW * $Frames, $CellH * $Directions.Count, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $key = [System.Drawing.Color]::FromArgb(255, 0, 255, 0)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
    $graphics.Clear($key)
    for ($row = 0; $row -lt $Directions.Count; $row++) {
      for ($frame = 0; $frame -lt $Frames; $frame++) {
        $state = $graphics.Save()
        $graphics.TranslateTransform($frame * $CellW, $row * $CellH)
        Draw-Part $graphics $folder $index $Directions[$row] $frame
        $graphics.Restore($state)
      }
    }
    $graphics.Dispose()
    $id = "{0}-{1:00}" -f $config.singular, ($index + 1)
    $path = Join-Path $dir "$id.gif"
    [TransparentGifWriter]::Save($bitmap, $path, $key)
    $bitmap.Dispose()
  }
}

Write-Output "steampunk clothing gif sprite sheets generated"
