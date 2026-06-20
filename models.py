from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class HistoricoConversao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    moeda_origem = db.Column(db.String(3), nullable=False)
    moeda_destino = db.Column(db.String(3), nullable=False)
    valor_original = db.Column(db.Float, nullable=False)
    valor_convertido = db.Column(db.Float, nullable=False)
    taxa_utilizada = db.Column(db.Float, nullable=False)
    data_hora = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "origem": self.moeda_origem,
            "destino": self.moeda_destino,
            "valor": self.valor_original,
            "resultado": self.valor_convertido,
            "data": self.data_hora.strftime("%d/%m/%Y %H:%M:%S")
        }