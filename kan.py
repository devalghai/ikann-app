import bcrypt
from app import app,cache,db
from model import User,Card,List
from flask_restful import reqparse
from utils import send_mail,maillist,mailcard
from flask import render_template,jsonify,make_response
from flask_jwt_extended import create_access_token,get_jwt_identity,jwt_required

@app.route("/")
@cache.cached()
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
        return jsonify(token=access_token)
    
    return make_response(jsonify({"message":"Check username or password"}),401)

@app.route("/mail",methods=['POST'])
@jwt_required()
def mailreports():
    userid = get_jwt_identity()
    job = send_mail.delay(userid)
    res = job.wait()
    return jsonify(res)


@app.route("/exportlist",methods=['POST'])
@jwt_required()
def exportlist():
    userid = get_jwt_identity()
    parser = reqparse.RequestParser()
    parser.add_argument('listid')
    args = parser.parse_args()
    listid = args.get('listid')
    
    job = maillist.delay(listid,userid)
    response = job.wait()
    return jsonify(response)

@app.route("/exportcard",methods=['POST'])
@jwt_required()
def exportcard():
    userid = get_jwt_identity()
    parser = reqparse.RequestParser()
    parser.add_argument('cardid')
    args = parser.parse_args()
    cardid = args.get('cardid')

    job = mailcard.delay(cardid,userid)
    response = job.wait()
    return jsonify(response)


@app.route("/changepassword",methods=['PUT'])
@jwt_required()
def changepassword():
    userid = get_jwt_identity()
    parser = reqparse.RequestParser()
    parser.add_argument('newpassword')
    parser.add_argument('currentpassword')
    args = parser.parse_args()
    currentpassword = args.get('currentpassword')
    newpassword = args.get('newpassword')

    user = User.query.filter_by(userid = userid).first()

    if user and bcrypt.checkpw(currentpassword.encode(), user.password):
        password = newpassword.encode()
        password = bcrypt.hashpw(password, bcrypt.gensalt())
        user.password = password

        try:
            db.session.add(user)
            response = True
        except Exception as e:
            db.session.rollback()
            response = False
        finally:
            db.session.commit()

        return jsonify(response)

    return jsonify(False)


@app.route("/deleteaccount",methods=['PUT'])
@jwt_required()
def deleteaccount():
    userid = get_jwt_identity()
    parser = reqparse.RequestParser()
    parser.add_argument('deletepassword')
    args = parser.parse_args()
    password = args.get('deletepassword')

    user = User.query.filter_by(userid = userid).first()

    if user and bcrypt.checkpw(password.encode(), user.password):
        
        lists = List.query.filter_by(userid = userid).all()

        listids = [list.listid for list in lists]

        try:
            db.session.query(Card).filter(Card.listid.in_(listids)).delete()
            db.session.query(List).filter(List.userid == userid).delete()
            db.session.query(User).filter(User.userid == userid).delete()
            response = True
        except Exception as e:
            db.session.rollback()
            response = False
        finally:
            db.session.commit()

        return jsonify(response)

    return jsonify(False)


if __name__ == "__main__":
    app.run(debug=True)
