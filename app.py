import os
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from models import db, HistoricoConversao

# Carrega variáveis de segurança
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

API_KEY = os.getenv('EXCHANGE_RATE_API_KEY')
BASE_URL = f"https://v6.exchangerate-api.com/v6/fd1fd1f2ae49726bed65ea7d/latest"

# Cria o banco de dados na primeira execução
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/converter', methods=['POST'])
def converter():
    dados = request.get_json()
    
    origem = dados.get('origem', '').upper()
    destino = dados.get('destino', '').upper()
    
    # Validação de segurança dos inputs
    try:
        valor = float(dados.get('valor', 0))
        if valor <= 0:
            raise ValueError
    except ValueError:
        return jsonify({"erro": "Valor inválido. Insira um número positivo."}), 400

    if not origem or not destino:
        return jsonify({"erro": "Moedas de origem e destino são obrigatórias."}), 400

    # Requisição para a API externa
    try:
        resposta = requests.get(BASE_URL + origem)
        dados_api = resposta.json()

        if dados_api.get('result') != 'success':
            return jsonify({"erro": "Falha ao obter taxas de câmbio."}), 400

        taxas = dados_api.get('conversion_rates', {})
        if destino not in taxas:
            return jsonify({"erro": "Moeda de destino não suportada."}), 400

        taxa_atual = taxas[destino]
        valor_convertido = round(valor * taxa_atual, 2)

        # Salva no Banco de Dados
        novo_historico = HistoricoConversao(
            moeda_origem=origem,
            moeda_destino=destino,
            valor_original=valor,
            valor_convertido=valor_convertido,
            taxa_utilizada=taxa_atual
        )
        db.session.add(novo_historico)
        db.session.commit()

        return jsonify({
            "sucesso": True,
            "resultado": valor_convertido,
            "taxa": taxa_atual
        })

    except Exception as e:
        return jsonify({"erro": "Erro interno no servidor."}), 500
@app.route('/api/moedas', methods=['GET'])
def moedas():
    # Rota que busca a lista de todas as moedas suportadas
    try:
        url_moedas = f"https://v6.exchangerate-api.com/v6/{API_KEY}/codes"
        resposta = requests.get(url_moedas)
        dados = resposta.json()
        
        if dados.get('result') == 'success':
            return jsonify(dados.get('supported_codes', []))
        return jsonify([])
    except Exception as e:
        return jsonify([])
if __name__ == '__main__':
    app.run(debug=True)