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