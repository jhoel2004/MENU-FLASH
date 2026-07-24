from PIL import Image, ImageDraw, ImageFont

def create_crate_placeholder():
    width, height = 400, 400
    # Red background for the crate
    img = Image.new('RGB', (width, height), color="#cc0000")
    d = ImageDraw.Draw(img)
    
    # Add some details to look like a crate (simple lines)
    border_color = "#ff4444"
    d.rectangle([20, 20, width-20, height-20], outline=border_color, width=5)
    
    # Text
    text = "Caja Mini Huari"
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 30)
    except:
        font = ImageFont.load_default()
        
    # Center text
    bbox = d.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    d.text((x, y), text, fill="white", font=font)
    
    # Save
    img.save("imagenes/caja_mini_huari.png")
    print("Created imagenes/caja_mini_huari.png")

if __name__ == "__main__":
    create_crate_placeholder()
