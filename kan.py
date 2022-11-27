import bcrypt
from app import app,api,jwt
from model import User,List,Card
from model import Userlist,Listcard
from flask import render_template,jsonify,make_response
from flask_restful import Resource,reqparse
from flask_jwt_extended import create_access_token,verify_jwt_in_request,get_jwt_identity

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/authenticate",methods=['POST'])
def authenticate():
    parser = reqparse.RequestParser()
    parser.add_argument('username')
    parser.add_argument('password')
    args = parser.parse_args()
    username = args.get('username')
    password = args.get('password')
    user = User.query.filter_by(username = username).first()

    if user and bcrypt.checkpw(password.encode(), user.password):
        access_token = create_access_token(identity=user.userid)
        print(access_token)
        return jsonify(token=access_token)
    
    return make_response(jsonify({"message":"Check username or password"}),401)



if __name__ == "__main__":
    app.run(debug=True)