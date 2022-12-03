import bcrypt
from app import app,api,jwt
from utils import send_mail
from model import User,List,Card
from model import Userlist,Listcard
from flask import render_template,jsonify,make_response
from flask_restful import Resource,reqparse
from flask_jwt_extended import create_access_token,get_jwt_identity,jwt_required

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

@app.route("/mail",methods=['POST'])
@jwt_required()
def mailreports():
    userid = get_jwt_identity()
    resp = send_mail(userid)
    with open(f"{userid}.html",'w') as html_file:
        html_file.write(resp)
        html_file.close()
    return resp

@app.route("/cardcsv")
def get_card_csv():
    userid = get_jwt_identity()
    parser = reqparse.RequestParser()
    parser.add_argument('cardid')
    args = parser.parse_args()
    cardid = args.get('cardid')

    card = Card.query.filter_by(cardid = cardid).first()
    if card.list.user.userid == userid:
        pass

if __name__ == "__main__":
    app.run(debug=True)
