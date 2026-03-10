# 🗺️ GeoIntel RJ V5.0 PRO

Plataforma de inteligência territorial e análise eleitoral para o estado do Rio de Janeiro.

## 🚀 Funcionalidades

### 🗳️ Análise Eleitoral
- Comparativo 2022 vs 2024
- Mapas coropléticos por município e bairro
- Pontos de votação com popups detalhados
- Mapa de calor de densidade de votos

### 👥 Projetos Sociais
- Georreferenciamento de núcleos (ex.: Projeto 60+)
- Endereços residenciais de participantes
- Identificação de participantes em múltiplos projetos ✨
- Cruzamento inteligente com dados eleitorais

### 🗺️ Camadas WMS
- Integração com Armazém Virtual (Geo-Rio)
- Presets: Ortofoto, Base Cartográfica, Limite de Bairros
- Detecção automática de camadas via GetCapabilities

### 📤 Ferramentas de Exportação
- Snapshot do mapa (PNG)
- Relatório executivo em PDF com insights automáticos
- Exportação de dados (CSV, GeoJSON, JSON, KML)
- Compartilhamento de estado via URL com restauração automática

### 🔐 Sistema de Login
- Múltiplos perfis (Analista, Coordenador)
- Permissões por projeto
- Login rápido com um clique

## 🛠️ Tecnologias

- React + Vite
- Leaflet / React-Leaflet
- Tailwind CSS
- Recharts
- jsPDF + html2canvas + dom-to-image-more
- React Hot Toast
- Radix UI

## 📦 Instalação

```bash
git clone https://github.com/WallanDavid/gis.git
cd gis
npm install
npm run dev
```

## 🔄 Atualizar dados do TSE

Requisitos: internet ativa. Os dados são obtidos do Portal de Dados Abertos do TSE.

```bash
npm run tse:download
```

O script baixa os conjuntos de 2022 e 2024, filtra apenas RJ, agrega e salva em:

- src/data/eleicoesReais.js

Se indisponível, o app usa src/data/eleicoesMock.js como fallback.

## 🔑 Credenciais de Teste

Perfil | Email | Senha  
--- | --- | ---  
Analista | analista@geo.com | 123456  
Coordenador | coordenador@geo.com | 123456  

## 🌐 Deploy

O projeto está configurado para deploy no Netlify.

```bash
npm run build
# Fazer upload da pasta dist/ no painel da hospedagem
```

## 📁 Estrutura do Projeto

```text
src/
├── components/         # Componentes React
│   ├── electoral/      # Camadas eleitorais
│   ├── projetos/       # Camadas de projetos
│   ├── wms/            # Integração WMS
│   └── sidebar/        # Painel lateral (filtro, abas, etc.)
├── data/               # Dados mockados (CSV, JSON)
├── hooks/              # Hooks customizados
├── utils/              # Funções utilitárias (relatórios, etc.)
└── App.jsx             # Componente principal e rotas
```

## 📊 Exemplo de Uso

1. Faça login como Analista.  
2. Na aba Eleitoral, selecione Candidato A e ano 2024.  
3. Na aba Projetos, marque "Projeto 60+" e ative o Cruzamento Inteligente.  
4. Filtre núcleos onde Candidato A teve mais de 10.000 votos.  
5. Exporte um relatório PDF com os insights gerados.  

## 📄 Licença

MIT
