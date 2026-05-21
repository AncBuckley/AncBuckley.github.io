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

function Draw-SideGoggle($G, $X, $Y, $Sign = 1) {
  Fill-Capsule $G ($X - $Sign * 22) ($Y - 1) ($X + $Sign * 4) ($Y - 1) 2 $DarkBrass
  Fill-Ellipse $G ($X + $Sign * 8) $Y 10 7 $Brass
  Fill-Ellipse $G ($X + $Sign * 8) $Y 6 4 $Glass
  Fill-Ellipse $G ($X + $Sign * 18) ($Y + 1) 3 4 $DarkBrass
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

function Draw-ProfileHat($G, $Style, $Dir, $Frame) {
  $sign = if ($Dir -eq "left") { -1 } else { 1 }
  $y = (Bob $Frame) - 4
  $x = 64 + (Phase $Frame) * 0.6 + $sign * 2

  switch ($Style) {
    0 {
      Fill-Ellipse $G ($x - $sign * 2) (45 + $y) 24 15 $Primary
      Fill-Polygon $G @(
        @(($x - $sign * 27), (52 + $y)), @(($x + $sign * 35), (52 + $y)),
        @(($x + $sign * 28), (60 + $y)), @(($x - $sign * 23), (58 + $y))
      ) $DarkLeather
      Draw-SideGoggle $G ($x + $sign * 2) (42 + $y) $sign
      Fill-Ellipse $G ($x + $sign * 28) (39 + $y) 5 5 $Brass
    }
    1 {
      Fill-Ellipse $G ($x + $sign * 2) (57 + $y) 38 5 $DarkLeather
      Fill-Polygon $G @(
        @(($x - $sign * 16), (22 + $y)), @(($x + $sign * 18), (22 + $y)),
        @(($x + $sign * 22), (56 + $y)), @(($x - $sign * 20), (56 + $y))
      ) $Primary
      Draw-Line $G ($x - $sign * 17) (44 + $y) ($x + $sign * 21) (46 + $y) $Brass 3
      Draw-Gear $G ($x + $sign * 18) (38 + $y) 5
    }
    2 {
      Fill-Ellipse $G ($x - $sign) (43 + $y) 28 18 $Primary
      Fill-Polygon $G @(
        @(($x - $sign * 31), (49 + $y)), @(($x + $sign * 34), (49 + $y)),
        @(($x + $sign * 29), (61 + $y)), @(($x - $sign * 26), (60 + $y))
      ) $Fur
      Fill-Capsule $G ($x - $sign * 20) (55 + $y) ($x - $sign * 17) (74 + $y) 6 $Fur
      Fill-Capsule $G ($x + $sign * 21) (55 + $y) ($x + $sign * 18) (67 + $y) 5 $Fur
      Draw-SideGoggle $G ($x + $sign) (43 + $y) $sign
    }
    3 {
      Fill-Ellipse $G ($x + $sign * 4) (56 + $y) 38 5 $DarkLeather
      Fill-Polygon $G @(
        @(($x - $sign * 22), (36 + $y)), @(($x + $sign * 23), (34 + $y)),
        @(($x + $sign * 27), (54 + $y)), @(($x - $sign * 23), (54 + $y))
      ) $Primary
      Fill-Polygon $G @(
        @(($x - $sign * 14), (28 + $y)), @(($x + $sign * 17), (27 + $y)),
        @(($x + $sign * 22), (36 + $y)), @(($x - $sign * 17), (36 + $y))
      ) $Brass
      Fill-Ellipse $G ($x + $sign * 15) (29 + $y) 7 5 $Glass
    }
    4 {
      Fill-Ellipse $G ($x + $sign * 2) (55 + $y) 35 5 $DarkLeather
      Fill-Ellipse $G ($x - $sign * 2) (42 + $y) 27 14 $Primary
      Fill-Polygon $G @(
        @(($x - $sign * 21), (46 + $y)), @(($x + $sign * 25), (46 + $y)),
        @(($x + $sign * 29), (53 + $y)), @(($x - $sign * 18), (53 + $y))
      ) $Brass
      Draw-Gear $G ($x - $sign * 20) (43 + $y) 5
    }
    5 {
      Fill-Ellipse $G ($x - $sign) (48 + $y) 25 18 $Primary
      Fill-Polygon $G @(
        @(($x - $sign * 30), (55 + $y)), @(($x + $sign * 38), (55 + $y)),
        @(($x + $sign * 32), (63 + $y)), @(($x - $sign * 26), (62 + $y))
      ) $DarkLeather
      Draw-Line $G ($x - $sign * 16) (36 + $y) ($x - $sign * 27) (24 + $y) $Brass 2
      Draw-Line $G ($x + $sign * 17) (36 + $y) ($x + $sign * 31) (25 + $y) $Brass 2
      Draw-SideGoggle $G ($x + $sign * 2) (50 + $y) $sign
    }
    6 {
      Fill-Ellipse $G ($x + $sign * 4) (58 + $y) 45 5 $DarkLeather
      Fill-Polygon $G @(
        @(($x - $sign * 25), (55 + $y)), @(($x + $sign * 30), (55 + $y)),
        @(($x + $sign * 20), (33 + $y)), @(($x - $sign * 16), (35 + $y))
      ) $Primary
      Draw-Line $G ($x - $sign * 19) (48 + $y) ($x + $sign * 26) (47 + $y) $Brass 3
    }
    7 {
      Fill-Ellipse $G ($x + $sign * 3) (57 + $y) 37 5 $DarkLeather
      Fill-Polygon $G @(
        @(($x - $sign * 18), (34 + $y)), @(($x + $sign * 19), (33 + $y)),
        @(($x + $sign * 23), (56 + $y)), @(($x - $sign * 21), (55 + $y))
      ) $Primary
      Fill-Capsule $G ($x + $sign * 18) (22 + $y) ($x + $sign * 21) (46 + $y) 4 $Copper
      Fill-Ellipse $G ($x + $sign * 21) (19 + $y) 5 4 $Steel
    }
    8 {
      Fill-Ellipse $G ($x + $sign * 2) (55 + $y) 36 5 $DarkLeather
      Fill-Ellipse $G ($x - $sign) (43 + $y) 29 12 $Primary
      Draw-Line $G ($x - $sign * 20) (48 + $y) ($x + $sign * 25) (48 + $y) $Brass 3
      for ($i = -2; $i -le 2; $i++) {
        Draw-Line $G ($x - $sign * (9 - $i * 4)) (34 + $y) ($x + $sign * (10 + $i * 5)) (50 + $y) (Shade $Primary -30) 1
      }
    }
    default {
      Fill-Ellipse $G ($x + $sign * 3) (54 + $y) 37 6 $DarkLeather
      Fill-Ellipse $G ($x - $sign * 3) (42 + $y) 25 16 $Primary
      Fill-Polygon $G @(
        @(($x - $sign * 12), (27 + $y)), @(($x + $sign * 15), (25 + $y)),
        @(($x + $sign * 20), (35 + $y)), @(($x - $sign * 13), (36 + $y))
      ) $Brass
      Draw-Line $G ($x + $sign * 10) (26 + $y) ($x + $sign * 16) (12 + $y) $Brass 2
      Fill-Ellipse $G ($x + $sign * 17) (11 + $y) 4 4 $Glass
    }
  }
}

function Draw-Hat($G, $Style, $Dir, $Frame) {
  $side = $Dir -eq "left" -or $Dir -eq "right"
  if ($side) {
    Draw-ProfileHat $G $Style $Dir $Frame
    return
  }
  $sign = if ($Dir -eq "left") { -1 } else { 1 }
  $y = (Bob $Frame) - 4
  $narrow = if ($Dir -eq "up") { 0.9 } else { 1 }
  $x = 64 + (Phase $Frame) * 0.6
  switch ($Style) {
    0 {
      Fill-Ellipse $G $x (45 + $y) (25 * $narrow) 15 $Primary
      Fill-Rect $G ($x - 26 * $narrow) (52 + $y) (52 * $narrow) 7 $DarkLeather
      if ($side) { Draw-SideGoggle $G $x (42 + $y) $sign } else { Draw-Goggles $G $x (42 + $y) $narrow }
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
      if ($side) { Draw-SideGoggle $G $x (43 + $y) $sign } else { Draw-Goggles $G $x (43 + $y) $narrow }
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
      if ($side) { Draw-SideGoggle $G $x (50 + $y) $sign } else { Draw-Goggles $G $x (50 + $y) $narrow }
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
    Fill-Capsule $G (64 - $sign * 10) 89 (64 - $sign * (18 + $p * 3)) 126 ([Math]::Max(5, $r - 2)) $Primary
    Fill-Capsule $G (64 + $sign * 14) 86 (64 + $sign * (28 + $p * 5)) 133 ($r + 1) $Primary
    Fill-Ellipse $G (64 + $sign * (29 + $p * 5)) 136 5 5 $DarkLeather
  } else {
    Fill-Capsule $G 43 86 (27 - $p * 7) 132 $r $Primary
    Fill-Capsule $G 85 86 (101 + $p * 7) 132 $r $Primary
    Fill-Ellipse $G (27 - $p * 7) 135 5 5 $DarkLeather
    Fill-Ellipse $G (101 + $p * 7) 135 5 5 $DarkLeather
  }
}

function Draw-ProfileShirt($G, $Style, $Dir, $Frame) {
  $sign = if ($Dir -eq "left") { -1 } else { 1 }
  $p = Phase $Frame
  $bulky = $Style -in @(1, 4, 7)
  $arm = if ($bulky) { 9 } else { 7 }
  $x = 64 + $sign * 2
  $long = $Style -in @(0, 5, 8, 9)
  $hem = if ($long) { 168 } else { 151 }

  Fill-Capsule $G ($x - $sign * 10) 90 ($x - $sign * (16 + $p * 3)) 127 ([Math]::Max(5, $arm - 2)) (Shade $Primary -24)
  Fill-Polygon $G @(
    @(($x - $sign * 20), 78), @(($x - $sign * 7), 73), @(($x + $sign * 14), 78),
    @(($x + $sign * 21), 101), @(($x + $sign * 18), $hem), @(($x - $sign * 18), ($hem - $(if ($long) { 0 } else { 3 })))
  ) $Primary
  Fill-Polygon $G @(
    @(($x - $sign * 7), 74), @(($x + $sign * 13), 79),
    @(($x + $sign * 7), 94), @(($x - $sign * 3), 88)
  ) (Shade $Primary -20)
  Draw-Line $G ($x - $sign * 18) 84 ($x - $sign * 19) ($hem - 4) (Shade $Primary -42) 2
  Fill-Capsule $G ($x + $sign * 11) 86 ($x + $sign * (28 + $p * 5)) 133 ($arm + 1) $Primary
  Fill-Ellipse $G ($x + $sign * (29 + $p * 5)) 136 5 5 $DarkLeather

  switch ($Style) {
    0 {
      Draw-Line $G ($x + $sign * 14) 84 ($x + $sign * 17) ($hem - 8) $Leather 4
      Draw-Buttons $G ($x + $sign * 12) 93 4 13
      Draw-Line $G ($x - $sign * 18) 75 ($x + $sign * 15) 80 $Brass 4
      Draw-Line $G ($x - $sign * 22) 153 ($x + $sign * 21) 156 $DarkLeather 3
    }
    1 {
      Fill-Capsule $G ($x - $sign * 13) 78 ($x + $sign * 13) 81 7 $Fur
      Draw-Line $G ($x - $sign * 18) 145 ($x + $sign * 18) 149 $Fur 5
      Draw-Line $G ($x - $sign * 4) 92 ($x + $sign * 14) 132 $Leather 2
    }
    2 {
      Fill-Polygon $G @(
        @(($x - $sign * 12), 84), @(($x + $sign * 13), 87),
        @(($x + $sign * 15), 143), @(($x - $sign * 12), 140)
      ) $Dark
      Draw-Line $G ($x - $sign * 7) 84 ($x + $sign * 11) 126 $Leather 3
      Draw-Gear $G ($x + $sign * 9) 113 7
    }
    3 {
      Fill-Polygon $G @(
        @(($x - $sign * 13), 92), @(($x + $sign * 16), 95),
        @(($x + $sign * 17), 149), @(($x - $sign * 14), 146)
      ) $Leather
      Draw-Line $G ($x - $sign * 10) 100 ($x + $sign * 13) 103 (Shade $Leather 24) 3
      Draw-Line $G ($x - $sign * 18) 149 ($x + $sign * 18) 152 $Brass 3
      Draw-Buttons $G ($x + $sign * 8) 89 3 12
    }
    4 {
      Fill-Capsule $G ($x - $sign * 11) 80 ($x + $sign * 11) 84 6 $Steel
      Fill-Ellipse $G ($x + $sign * 10) 112 10 10 $Glass
      Draw-Line $G ($x - $sign * 20) 145 ($x + $sign * 20) 150 $Brass 4
    }
    5 {
      Draw-Line $G ($x - $sign * 17) 78 ($x + $sign * 15) 82 $DarkLeather 5
      Fill-Polygon $G @(
        @(($x - $sign * 18), 88), @(($x - $sign), 90),
        @(($x - $sign * 10), 163), @(($x - $sign * 22), 157)
      ) (Shade $Primary -24)
      Fill-Polygon $G @(
        @(($x + $sign * 2), 84), @(($x + $sign * 15), 88), @(($x + $sign * 9), 102)
      ) $Red
      Draw-Line $G ($x + $sign * 6) 97 ($x + $sign * 8) 152 $Red 3
    }
    6 {
      Draw-Line $G ($x - $sign * 8) 84 ($x + $sign * 15) 139 $Leather 3
      Draw-Line $G ($x - $sign * 17) 112 ($x + $sign * 18) 116 $DarkLeather 4
      Draw-Gear $G ($x + $sign * 14) 102 5
    }
    7 {
      Fill-Capsule $G ($x - $sign * 13) 78 ($x + $sign * 12) 81 5 $Fur
      Fill-Polygon $G @(
        @(($x + $sign), 84), @(($x + $sign * 15), 87),
        @(($x + $sign * 14), 152), @(($x + $sign * 4), 151)
      ) $Cream
      Draw-Line $G ($x - $sign * 16) 101 ($x + $sign * 17) 104 $Brass 2
    }
    8 {
      Fill-Polygon $G @(
        @(($x - $sign * 11), 92), @(($x + $sign * 14), 95),
        @(($x + $sign * 17), 144), @(($x - $sign * 12), 141)
      ) $DarkLeather
      for ($i = 0; $i -lt 4; $i++) {
        Draw-Line $G ($x - $sign * 7) (101 + $i * 9) ($x + $sign * 12) (97 + $i * 9) $Brass 1
      }
      Draw-Line $G ($x - $sign * 20) 146 ($x + $sign * 20) 151 $Brass 4
    }
    default {
      Fill-Polygon $G @(
        @(($x - $sign * 12), 91), @(($x + $sign * 15), 94),
        @(($x + $sign * 17), 150), @(($x - $sign * 13), 147)
      ) $Cream
      Draw-Line $G ($x + $sign * 5) 101 ($x + $sign * 11) 130 $Red 4
      Draw-Line $G ($x - $sign * 19) 147 ($x + $sign * 19) 152 $Brass 3
      Draw-Buttons $G ($x + $sign * 13) 88 3 12
    }
  }
}

function Draw-Torso($G, $X, $W, $LongCoat, $Side = $false, $Sign = 1) {
  $bottom = if ($LongCoat) { 168 } else { 151 }
  if ($Side) {
    Fill-Polygon $G @(
      @(($X - $Sign * $W * 0.42), 76), @(($X + $Sign * $W * 0.5), 79),
      @(($X + $Sign * $W * 0.46), $bottom), @(($X - $Sign * $W * 0.54), ($bottom - $(if ($LongCoat) { 0 } else { 2 })))
    ) $Primary
    return
  }
  Fill-Polygon $G @(
    @(($X - $W / 2), 76), @(($X + $W / 2), 76),
    @(($X + $W / 2 - 7), $bottom), @(($X - $W / 2 + 7), $bottom)
  ) $Primary
}

function Draw-Shirt($G, $Style, $Dir, $Frame) {
  $side = $Dir -eq "left" -or $Dir -eq "right"
  if ($side) {
    Draw-ProfileShirt $G $Style $Dir $Frame
    return
  }
  $sign = if ($Dir -eq "left") { -1 } else { 1 }
  $x = 64 + $(if ($side) { $sign * 2 } else { 0 })
  $w = if ($side) { 40 + ($Style % 3) * 3 } else { 45 + ($Style % 4) * 2 }
  $long = $Style -in @(0, 5, 8, 9)
  Draw-Arms $G $Dir $Frame ($Style -in @(1, 4, 7))
  Draw-Torso $G $x $w $long $side $sign
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
  if ($side) {
    $bottom = if ($long) { 164 } else { 147 }
    Fill-Capsule $G ($x - $sign * ($w * 0.42)) 84 ($x - $sign * ($w * 0.48)) $bottom 2 (Shade $Primary -42)
    Fill-Polygon $G @(
      @(($x - $sign * 5), 78), @(($x + $sign * 10), 80),
      @(($x + $sign * 16), 101), @(($x + $sign * 2), 94)
    ) (Shade $Primary -20)
    Draw-Line $G ($x + $sign * 5) 82 ($x + $sign * 14) 103 $Brass 1
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
