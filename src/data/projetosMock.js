export const projetos = [
  {
    id: 'projeto60mais',
    nome: 'Projeto 60+',
    cor: '#FF9800',
    nucleos: [
      {
        id: 'nucleo1',
        nome: 'Núcleo Copacabana',
        coordenadas: [-22.971, -43.182],
        endereco: 'Rua Barata Ribeiro, 500 - Copacabana',
        dataInicio: '2023-01-15',
        municipio: 'Rio de Janeiro',
        bairro: 'Copacabana',
        pessoas: [
          {
            id: 'p101',
            nome: 'Maria da Silva',
            idade: 68,
            projetos: ['projeto60mais', 'projetoSaude'],
            enderecoResidencial: {
              logradouro: 'Rua Siqueira Campos, 150',
              bairro: 'Copacabana',
              municipio: 'Rio de Janeiro',
              coordenadas: [-22.9705, -43.1835],
            },
          },
          {
            id: 'p102',
            nome: 'João Santos',
            idade: 72,
            projetos: ['projeto60mais'],
            enderecoResidencial: {
              logradouro: 'Av. Atlântica, 2000',
              bairro: 'Copacabana',
              municipio: 'Rio de Janeiro',
              coordenadas: [-22.969, -43.18],
            },
          },
        ],
      },
      {
        id: 'nucleo2',
        nome: 'Núcleo Tijuca',
        coordenadas: [-22.924, -43.235],
        endereco: 'Rua Conde de Bonfim, 800 - Tijuca',
        dataInicio: '2023-03-10',
        municipio: 'Rio de Janeiro',
        bairro: 'Tijuca',
        pessoas: [
          {
            id: 'p201',
            nome: 'Ana Oliveira',
            idade: 65,
            projetos: ['projeto60mais'],
            enderecoResidencial: {
              logradouro: 'Rua São Francisco Xavier, 300',
              bairro: 'Tijuca',
              municipio: 'Rio de Janeiro',
              coordenadas: [-22.925, -43.233],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'projetoSaude',
    nome: 'Projeto Saúde em Casa',
    cor: '#4CAF50',
    nucleos: [
      {
        id: 'nucleo3',
        nome: 'Núcleo Centro',
        coordenadas: [-22.907, -43.18],
        endereco: 'Rua da Assembléia, 50 - Centro',
        dataInicio: '2023-02-01',
        municipio: 'Rio de Janeiro',
        bairro: 'Centro',
        pessoas: [
          {
            id: 'p101',
            nome: 'Maria da Silva',
            idade: 68,
            projetos: ['projeto60mais', 'projetoSaude'],
            enderecoResidencial: {
              logradouro: 'Rua Siqueira Campos, 150',
              bairro: 'Copacabana',
              municipio: 'Rio de Janeiro',
              coordenadas: [-22.9705, -43.1835],
            },
          },
          {
            id: 'p301',
            nome: 'Carlos Pereira',
            idade: 58,
            projetos: ['projetoSaude'],
            enderecoResidencial: {
              logradouro: 'Rua Uruguaiana, 100',
              bairro: 'Centro',
              municipio: 'Rio de Janeiro',
              coordenadas: [-22.904, -43.180],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'projetoJuventude',
    nome: 'Projeto Juventude Ativa',
    cor: '#2196F3',
    nucleos: [
      {
        id: 'nucleo4',
        nome: 'Núcleo Icaraí',
        coordenadas: [-22.903, -43.103],
        endereco: 'Rua Moreira César, 400 - Icaraí',
        dataInicio: '2024-04-05',
        municipio: 'Niterói',
        bairro: 'Icaraí',
        pessoas: [
          {
            id: 'p401',
            nome: 'Lucas Rocha',
            idade: 19,
            projetos: ['projetoJuventude'],
            enderecoResidencial: {
              logradouro: 'Rua Gavião Peixoto, 120',
              bairro: 'Icaraí',
              municipio: 'Niterói',
              coordenadas: [-22.902, -43.106],
            },
          },
          {
            id: 'p402',
            nome: 'Mariana Costa',
            idade: 21,
            projetos: ['projetoJuventude'],
            enderecoResidencial: {
              logradouro: 'Rua Lopes Trovão, 210',
              bairro: 'Icaraí',
              municipio: 'Niterói',
              coordenadas: [-22.904, -43.103],
            },
          },
        ],
      },
    ],
  },
]
