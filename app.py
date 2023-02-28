import os
from flask import Flask
from flask_restful import Api
from flask_caching import Cache
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager


app = Flask(__name__)
dir = os.path.abspath(os.path.dirname(__file__))
dir = "sqlite:///"  + os.path.join(dir,'database.sqlite3')
app.config["SQLALCHEMY_DATABASE_URI"] = dir
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/GHMq@7sEq#Mv7K$OYDX&Hdjy'
app.config["CACHE_TYPE"] = "RedisCache"
app.config["CACHE_DEFAULT_TIMEOUT"] = 3600


db = SQLAlchemy(app)
api = Api(app)
jwt = JWTManager(app)
cache = Cache(app)