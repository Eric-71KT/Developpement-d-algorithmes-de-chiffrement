from flask import Flask
from flask_socketio import SocketIO

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_secret_key'
    socketio = SocketIO(app)

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app, socketio