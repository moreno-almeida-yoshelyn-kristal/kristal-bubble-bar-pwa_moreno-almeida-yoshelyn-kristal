from django.shortcuts import render

# "Base de datos" falsa: los 15 productos de Kristal Bubble Bar en memoria.
# Estos datos se insertan en el HTML ANTES de enviarlo al navegador (SSR).
PRODUCTOS = [
    {"id": 1, "nombre": "Taro", "categoria": "Bubble tea", "precio": 75, "stock": 20},
    {"id": 2, "nombre": "Milk tea clásico", "categoria": "Bubble tea", "precio": 70, "stock": 20},
    {"id": 3, "nombre": "Matcha", "categoria": "Bubble tea", "precio": 80, "stock": 20},
    {"id": 4, "nombre": "Brown sugar", "categoria": "Bubble tea", "precio": 85, "stock": 20},
    {"id": 5, "nombre": "Fresa con popping boba", "categoria": "Bubble tea", "precio": 80, "stock": 20},
    {"id": 6, "nombre": "Moka", "categoria": "Frappés", "precio": 75, "stock": 20},
    {"id": 7, "nombre": "Cookies & cream", "categoria": "Frappés", "precio": 80, "stock": 20},
    {"id": 8, "nombre": "Caramelo", "categoria": "Frappés", "precio": 75, "stock": 20},
    {"id": 9, "nombre": "Mazapán", "categoria": "Frappés", "precio": 75, "stock": 20},
    {"id": 10, "nombre": "Chai", "categoria": "Frappés", "precio": 75, "stock": 20},
    {"id": 11, "nombre": "Mango-maracuyá", "categoria": "Smoothies", "precio": 70, "stock": 20},
    {"id": 12, "nombre": "Frutos rojos", "categoria": "Smoothies", "precio": 70, "stock": 20},
    {"id": 13, "nombre": "Verde detox", "categoria": "Smoothies", "precio": 70, "stock": 20},
    {"id": 14, "nombre": "Piña colada (sin alcohol)", "categoria": "Smoothies", "precio": 70, "stock": 20},
    {"id": 15, "nombre": "Plátano con crema de cacahuate", "categoria": "Smoothies", "precio": 75, "stock": 20},
]


def vista_ssr(request):
    """
    Vista con Renderizado en Servidor (SSR).

    Agrupa los productos por categoría y se los manda a la plantilla.
    render() mezcla la plantilla con estos datos y devuelve el HTML final,
    YA CON los nombres y precios escritos (Ctrl+U los muestra en el código fuente).
    """
    categorias = []
    for producto in PRODUCTOS:
        grupo = next((c for c in categorias if c["nombre"] == producto["categoria"]), None)
        if grupo is None:
            grupo = {"nombre": producto["categoria"], "productos": []}
            categorias.append(grupo)
        grupo["productos"].append(producto)

    contexto = {"categorias": categorias, "total": len(PRODUCTOS)}
    return render(request, "catalogo/catalogo_ssr.html", contexto)