// Carrega a lista de moedas assim que o site abre
document.addEventListener('DOMContentLoaded', async () => {
    const origemSelect = document.getElementById('origem');
    const destinoSelect = document.getElementById('destino');

    try {
        const resposta = await fetch('/api/moedas');
        const moedas = await resposta.json();

        // Limpa a mensagem de "Carregando..."
        origemSelect.innerHTML = '';
        destinoSelect.innerHTML = '';

        // Cria uma opção para cada moeda recebida da API
        moedas.forEach(([codigo, nome]) => {
            const opcaoOrigem = document.createElement('option');
            opcaoOrigem.value = codigo;
            opcaoOrigem.textContent = `${codigo} - ${nome}`;
            
            // Deixa USD selecionado por padrão na origem
            if (codigo === 'USD') opcaoOrigem.selected = true;
            origemSelect.appendChild(opcaoOrigem);

            const opcaoDestino = document.createElement('option');
            opcaoDestino.value = codigo;
            opcaoDestino.textContent = `${codigo} - ${nome}`;
            
            // Deixa BRL selecionado por padrão no destino
            if (codigo === 'BRL') opcaoDestino.selected = true;
            destinoSelect.appendChild(opcaoDestino);
        });
    } catch (erro) {
        console.error("Erro ao carregar moedas:", erro);
        origemSelect.innerHTML = '<option value="">Erro ao carregar lista</option>';
        destinoSelect.innerHTML = '<option value="">Erro ao carregar lista</option>';
    }
});
document.getElementById('form-conversao').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const valor = document.getElementById('valor').value;
    const origem = document.getElementById('origem').value.toUpperCase();
    const destino = document.getElementById('destino').value.toUpperCase();
    
    const boxResultado = document.getElementById('resultado-box');
    const boxErro = document.getElementById('erro-box');
    
    boxResultado.classList.add('d-none');
    boxErro.classList.add('d-none');

    try {
        const resposta = await fetch('/api/converter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ valor, origem, destino })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            document.getElementById('valor-resultado').innerText = `${dados.resultado} ${destino}`;
            document.getElementById('taxa-info').innerText = `1 ${origem} = ${dados.taxa} ${destino}`;
            boxResultado.classList.remove('d-none');
        } else {
            boxErro.innerText = dados.erro;
            boxErro.classList.remove('d-none');
        }
    } catch (erro) {
        boxErro.innerText = "Erro ao conectar com o servidor.";
        boxErro.classList.remove('d-none');
    }
});