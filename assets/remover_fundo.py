import os
from PIL import Image
from collections import deque

# Caminho da pasta onde estão as imagens
pasta_imagens = r"C:\Users\Usuário1\Downloads\nutriatap\nutriatap\src\assets"
tolerancia = 30  # Tolerância de cor (ajustável)

def cor_semelhante(cor1, cor2, tolerancia):
    return all(abs(cor1[i] - cor2[i]) <= tolerancia for i in range(3))

def remover_fundo_preciso(imagem_path, tolerancia):
    img = Image.open(imagem_path).convert("RGBA")
    pixels = img.load()
    largura, altura = img.size

    visitados = set()
    fila = deque()

    # Adiciona todas as bordas na fila (pixels que podem ter fundo)
    for x in range(largura):
        fila.append((x, 0))
        fila.append((x, altura - 1))
    for y in range(altura):
        fila.append((0, y))
        fila.append((largura - 1, y))

    cor_fundo = pixels[0, 0]

    while fila:
        x, y = fila.popleft()
        if (x, y) in visitados:
            continue
        visitados.add((x, y))

        try:
            r, g, b, a = pixels[x, y]
        except IndexError:
            continue

        if cor_semelhante((r, g, b), cor_fundo[:3], tolerancia):
            pixels[x, y] = (r, g, b, 0)
            # Adiciona vizinhos na fila
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < largura and 0 <= ny < altura:
                    fila.append((nx, ny))

    return img

def renomear_com_underscore(nome):
    nome_base, ext = os.path.splitext(nome)
    for i in range(len(nome_base)-1, -1, -1):
        if not nome_base[i].isdigit():
            return nome_base[:i+1] + "_" + nome_base[i+1:] + ext
    return nome_base + ext

# Processamento
for nome_arquivo in os.listdir(pasta_imagens):
    if nome_arquivo.lower().endswith(".png"):
        caminho_imagem = os.path.join(pasta_imagens, nome_arquivo)
        imagem_sem_fundo = remover_fundo_preciso(caminho_imagem, tolerancia)

        novo_nome = renomear_com_underscore(nome_arquivo)
        novo_caminho = os.path.join(pasta_imagens, novo_nome)
        imagem_sem_fundo.save(novo_caminho, format="PNG")

print("Processo concluído com precisão.")
