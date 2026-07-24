from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder(filename, text, bg_color="#1a1a1a", text_color="#d4af37"):
    # Create image
    width, height = 400, 600
    img = Image.new('RGB', (width, height), color=bg_color)
    d = ImageDraw.Draw(img)
    
    # Add border
    border_width = 4
    d.rectangle([10, 10, width-10, height-10], outline=text_color, width=border_width)
    
    # Add inner border
    d.rectangle([20, 20, width-20, height-20], outline=text_color, width=1)
    
    # Add text (simplified since we might not have custom fonts)
    # We'll use default font but try to center it
    try:
        # Try to load a better font if available, otherwise default
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 40)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
    except:
        font = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Split text into lines
    lines = text.split(' ')
    y = height // 2 - (len(lines) * 25)
    
    for line in lines:
        # Calculate text size (approximate for default font)
        bbox = d.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x = (width - text_width) // 2
        d.text((x, y), line, fill=text_color, font=font)
        y += 50

    # Add "FLASH" branding
    d.text(((width - 60)//2, height - 60), "FLASH", fill=text_color, font=font_small)

    # Save
    output_path = f"imagenes/{filename}"
    img.save(output_path)
    print(f"Created {output_path}")

# Missing items
items = [
    ("burguesa.png", "Cerveza Burguesa"),
    ("corona.png", "Cerveza Corona"),
    ("mini_huari.png", "Mini Huari"),
    ("caja_mini_huari.png", "Caja Mini Huari"),
    ("old_parr.png", "Whisky Old Parr"),
    ("red_label.png", "Red Label"),
    ("black_label.png", "Black Label"),
    ("habana.png", "Habana"),
    ("tequila.png", "Tequila"),
    ("ron_abuelo.png", "Ron Abuelo"),
    ("casa_real.png", "Casa Real Etiqueta Negra"),
    ("fernet.png", "Fernet"),
    ("ron_solera.png", "Ron Solera"),
    ("jagger.png", "Jagger")
]

for filename, text in items:
    create_placeholder(filename, text)
