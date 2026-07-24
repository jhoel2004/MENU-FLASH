#!/usr/bin/env python3
"""
FLASH Menu - Script interactivo para agregar productos
Uso: python3 add_product.py
"""

import json
import os
import shutil

DATOS_FILE = "datos.txt"
IMAGENES_DIR = "imagenes"

def load_data():
    with open(DATOS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(DATOS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"\n  Guardado en {DATOS_FILE}")

def show_categories(data):
    print("\n=== CATEGORIAS EXISTENTES ===\n")
    for i, cat in enumerate(data["categories"], 1):
        icon = cat.get("icon", "?")
        item_count = len(cat.get("items", []))
        print(f"  {i}. {icon} {cat['title']} ({item_count} productos)")
    print(f"  {len(data['categories']) + 1}. Crear nueva categoria")
    print()

def show_images():
    if not os.path.exists(IMAGENES_DIR):
        os.makedirs(IMAGENES_DIR)
        print(f"  Carpeta {IMAGENES_DIR}/ creada")
    
    images = [f for f in os.listdir(IMAGENES_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp'))]
    if images:
        print(f"\n  Imagenes disponibles en {IMAGENES_DIR}/:")
        for img in sorted(images):
            print(f"    - {img}")
    else:
        print(f"\n  No hay imagenes en {IMAGENES_DIR}/")
    print()

def generate_placeholder(name, filename):
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        width, height = 400, 600
        img = Image.new('RGB', (width, height), color="#1a1a1a")
        d = ImageDraw.Draw(img)
        
        # Border
        d.rectangle([10, 10, width-10, height-10], outline="#d4af37", width=4)
        d.rectangle([20, 20, width-20, height-20], outline="#d4af37", width=1)
        
        # Text
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 36)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
        except:
            font = ImageFont.load_default()
            font_small = font
        
        lines = name.split()
        y = height // 2 - (len(lines) * 22)
        for line in lines:
            bbox = d.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            x = (width - text_width) // 2
            d.text((x, y), line, fill="#d4af37", font=font)
            y += 44
        
        d.text(((width - 60)//2, height - 50), "FLASH", fill="#d4af37", font=font_small)
        
        filepath = os.path.join(IMAGENES_DIR, filename)
        img.save(filepath)
        print(f"  Placeholder generado: {filepath}")
        return True
    except ImportError:
        print("  Instala Pillow para generar placeholders: pip install Pillow")
        return False

def get_image():
    print("Opciones de imagen:")
    print("  1. Usar imagen existente")
    print("  2. Generar placeholder automatico")
    print("  3. Sin imagen")
    print()
    
    choice = input("Selecciona (1-3): ").strip()
    
    if choice == "1":
        show_images()
        filename = input("Nombre del archivo (ej: mi_producto.png): ").strip()
        if not filename:
            print("  Nombre vacio, usando sin imagen")
            return None
        
        # Check if file exists
        filepath = os.path.join(IMAGENES_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  Archivo {filepath} no encontrado")
            use_placeholder = input("  Generar placeholder con ese nombre? (s/n): ").strip().lower()
            if use_placeholder == "s":
                name = input("  Nombre del producto para el placeholder: ").strip()
                if generate_placeholder(name, filename):
                    return f"{IMAGENES_DIR}/{filename}"
                return None
            return None
        
        return f"{IMAGENES_DIR}/{filename}"
    
    elif choice == "2":
        name = input("Nombre del producto para el placeholder: ").strip()
        if not name:
            print("  Nombre vacio, cancelando")
            return None
        
        # Generate filename from name
        filename = name.lower().replace(" ", "_").replace(".", "").replace(",", "")
        filename = "".join(c for c in filename if c.isalnum() or c == "_") + ".png"
        
        if generate_placeholder(name, filename):
            return f"{IMAGENES_DIR}/{filename}"
        return None
    
    else:
        return None

def create_new_category():
    print("\n--- NUEVA CATEGORIA ---\n")
    cat_id = input("ID de la categoria (sin espacios, ej: 'tragos'): ").strip().lower()
    if not cat_id:
        print("  ID vacio, cancelando")
        return None
    
    title = input("Titulo visible (ej: 'Tragos Especiales'): ").strip()
    if not title:
        print("  Titulo vacio, cancelando")
        return None
    
    icon = input("Icono emoji (ej: '🍸', '🍷', '🫗'): ").strip()
    if not icon:
        icon = "◆"
    
    category = {
        "id": cat_id,
        "title": title,
        "icon": icon,
        "items": []
    }
    
    return category

def add_product():
    print("\n" + "="*50)
    print("   FLASH - AGREGAR NUEVO PRODUCTO")
    print("="*50)
    
    data = load_data()
    show_categories(data)
    
    # Select category
    max_option = len(data["categories"]) + 1
    cat_choice = input(f"Selecciona categoria (1-{max_option}): ").strip()
    
    try:
        cat_index = int(cat_choice) - 1
    except ValueError:
        print("  Opcion invalida")
        return
    
    if cat_index == len(data["categories"]):
        # Create new category
        new_cat = create_new_category()
        if new_cat:
            data["categories"].append(new_cat)
            category = new_cat
            print(f"\n  Categoria '{new_cat['title']}' creada!")
        else:
            return
    elif 0 <= cat_index < len(data["categories"]):
        category = data["categories"][cat_index]
        print(f"\n  Agregando a: {category.get('icon', '')} {category['title']}")
    else:
        print("  Opcion invalida")
        return
    
    # Get product details
    print("\n--- DETALLES DEL PRODUCTO ---\n")
    
    name = input("Nombre del producto: ").strip()
    if not name:
        print("  Nombre vacio, cancelando")
        return
    
    price = input("Precio (ej: '50 Bs', 'Gratis', '$10'): ").strip()
    if not price:
        price = "A consultar"
    
    description = input("Descripcion (opcional, Enter para omitir): ").strip()
    
    # Get image
    print()
    image = get_image()
    
    # Create product
    product = {
        "name": name,
        "price": price
    }
    
    if description:
        product["description"] = description
    
    if image:
        product["image"] = image
    
    # Add to category
    category["items"].append(product)
    
    # Save
    save_data(data)
    
    print(f"\n  Producto '{name}' agregado a '{category['title']}'!")
    print(f"  Precio: {price}")
    if description:
        print(f"  Descripcion: {description}")
    if image:
        print(f"  Imagen: {image}")
    
    print("\n" + "="*50)
    print("  Listo! Recarga la pagina para ver el cambio.")
    print("="*50)

def list_products():
    data = load_data()
    print("\n=== PRODUCTOS ACTUALES ===\n")
    
    for cat in data["categories"]:
        icon = cat.get("icon", "?")
        print(f"  {icon} {cat['title']}")
        for item in cat.get("items", []):
            desc = f" - {item['description']}" if item.get("description") else ""
            print(f"    - {item['name']}: {item['price']}{desc}")
        print()

def main():
    while True:
        print("\n" + "="*50)
        print("   FLASH - GESTION DE MENU")
        print("="*50)
        print()
        print("  1. Agregar producto")
        print("  2. Ver productos actuales")
        print("  3. Salir")
        print()
        
        choice = input("Selecciona (1-3): ").strip()
        
        if choice == "1":
            add_product()
        elif choice == "2":
            list_products()
        elif choice == "3":
            print("\n  Hasta luego!")
            break
        else:
            print("  Opcion invalida")

if __name__ == "__main__":
    main()
