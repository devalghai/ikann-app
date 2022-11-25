from app import app,api
from model import User,List,Card
from model import Userlist,Listcard
from flask import render_template,jsonify,make_response
from flask_restful import Resource,reqparse
from flask_jwt import JWT, jwt_required, current_identity
import bcrypt

@app.route("/")
def index():
    return render_template('index.html')


@app.route("/board")
def kanban():
    return render_template('kanban.html')


@app.route("/authenticate",methods=['PUT'])
def authenticate():
    parser = reqparse.RequestParser()
    parser.add_argument('username')
    parser.add_argument('password')
    args = parser.parse_args()
    username = args.get('username')
    password = args.get('password')

    user = User.query.filter_by(username = username).first()
    
    if not user:
        return make_response(jsonify({"message":"Invalid username!"}),401)

    if bcrypt.checkpw(password.encode(), user.password):
        return make_response(jsonify({"token":"aa jao",
                                        "userid":user.userid}))
    return make_response(jsonify({"message":"Invalid password!"}),401)



if __name__ == "__main__":
    app.run(debug=True)