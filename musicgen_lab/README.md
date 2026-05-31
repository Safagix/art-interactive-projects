# 🎵 MusicGen Lab (CPU Version)

Este entorno está configurado para correr **MusicGen** en modo compatible (sin tarjeta gráfica NVIDIA).

## 🚀 Cómo usarlo

1. Abre una terminal en esta carpeta:

    ```powershell
    cd "musicgen_lab"
    ```

2. Si es la primera vez (o si falla), instala las dependencias "bleeding edge":

    ```powershell
    pip uninstall -y xformers audiocraft
    pip install "https://github.com/facebookresearch/audiocraft/archive/refs/heads/main.zip" --no-deps
    ```

3. Ejecuta el generador:

    ```powershell
    python test_musicgen.py
    ```

## 📝 Notas

- **Velocidad**: Al no usar GPU (CUDA), la generación será lenta (aprox. 1-2 minutos para 5 segundos de audio).
- **Modelos**: El script usa `facebook/musicgen-small` por defecto.
- **Xformers**: Se ha eliminado para evitar errores de DLL en Windows.
