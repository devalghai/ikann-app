import bcrypt
from app import db,api
from flask import jsonify, make_response
from flask_restful import Resource,reqparse
from datetime import date,datetime,timedelta
from flask_jwt_extended import jwt_required,get_jwt_identity



@api.resource("/user/<int:userid>","/user")
class User(db.Model,Resource):
    __tablename__ = "User"
    userid = db.Column(db.Integer,primary_key = True,autoincrement=True)
    username = db.Column(db.String,unique=True,nullable=False)
    password = db.Column(db.String,nullable=False)
    email = db.Column(db.String,nullable=False,unique = True)
    lists = db.relationship("List",backref="user")

    @jwt_required()
    def get(self):
        userid = get_jwt_identity()
        user = User.query.filter_by(userid = userid).first()
        if user:
            return {"username":user.username,
                    "email":user.email}

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username')
        parser.add_argument('password')
        parser.add_argument('email')

        args = parser.parse_args()

        username = args.get('username')
        password = args.get('password')
        email = args.get('email')

        user = User.query.filter_by(username = username).first()
        if user:
            response = make_response(jsonify({"message":"Username exists"}),409)
            return response
        
        user = User.query.filter_by(email = email).first()
        if user:
            response = make_response(jsonify({"message":"Username exists"}),409)
            return response
        password = password.encode()
        password = bcrypt.hashpw(password, bcrypt.gensalt())

        user = User(username = username,
                    password = password,
                    email = email)


        try:
            db.session.add(user)
        except Exception as e:
            print(e)
            db.session.rollback()
        finally:
            db.session.commit()
        





@api.resource("/list/<int:listid>","/list")
class List(db.Model,Resource):
    __tablename__ = "List"
    listid = db.Column(db.Integer,primary_key=True,autoincrement=True)
    listname = db.Column(db.String,nullable = False)
    userid = db.Column(db.Integer,db.ForeignKey('User.userid'),nullable = False)
    content = db.Column(db.String)
    cards = db.relationship("Card",backref="list")

    @jwt_required()
    def get(self,listid):
        list = List.query.filter_by(listid = listid).first()
        if list and list.user.userid != get_jwt_identity():
            return make_response("Unauthorised",401)

        if list:
            return {"listid":list.listid,
                    "listname":list.listname,
                    "userid":list.userid,
                    "content":list.content}

    @jwt_required()
    def delete(self,listid):

        list = List.query.filter_by(listid = listid).first()
        if list and list.user.userid != get_jwt_identity():
            return make_response("Unauthorised",401)


        try:
            List.query.filter_by(listid = listid).delete()
        except Exception as e:
            db.session.rollback()
        finally:
            db.session.commit()

    @jwt_required()
    def put(self,listid):
        parser = reqparse.RequestParser()
        parser.add_argument('content')
        parser.add_argument('name')
        args = parser.parse_args()

        list = List.query.filter_by(listid = listid).first()
        if list and list.user.userid != get_jwt_identity():
            return make_response("Unauthorised",401)

        list.listname = args.get('name')
        list.content = args.get('content')
        try:
            db.session.add(list)
        except Exception as e:
            db.session.rollback()
        finally:
            db.session.commit()
    
    @jwt_required()
    def post(self):
        
        userid = get_jwt_identity()

        list = List(listname = "New List",
                    userid = userid,
                    content = "New Content")

        try:
            db.session.add(list)
        except Exception as e:
            db.session.rollback()
        finally:
            db.session.commit()








@api.resource("/card/<int:cardid>","/card")
class Card(db.Model,Resource):
    __tablename__ = "Card"
    cardid = db.Column(db.Integer,primary_key=True,autoincrement=True)
    listid = db.Column(db.Integer,db.ForeignKey('List.listid'),nullable=False)
    createdate = db.Column(db.String,nullable=False)
    deadline = db.Column(db.String,nullable=False)
    enddate = db.Column(db.String)
    cardtitle = db.Column(db.String)
    cardcontent = db.Column(db.String)

    @jwt_required()
    def get(self,cardid):
        card = Card.query.filter_by(cardid = cardid).first()
        if card and card.list.user.userid != get_jwt_identity():
            return make_response("Unauthorised",401)
        if card:
            return {"cardid":card.cardid,
                    "listid":card.listid,
                    "createdate":card.createdate,
                    "deadline":card.deadline,
                    "enddate":card.enddate,
                    "cardtitle":card.cardtitle,
                    "cardcontent":card.cardcontent}

    @jwt_required()
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('listid')
        args = parser.parse_args()

        list = List.query.filter_by(listid = args.get('listid')).first()
        if list and list.user.userid != get_jwt_identity():
            return make_response("Unauthorised",401)

        card = Card(   
                    listid = args.get('listid'),
                    createdate = date.today(),
                    deadline = date.today(),
                    enddate = "-",
                    cardtitle = "",
                    cardcontent = "")

        try: 
            card = db.session.add(card)
        except Exception as e:
            db.session.rollback()
        finally:
            db.session.commit()
        
    @jwt_required()
    def delete(self,cardid):
        card = Card.query.filter_by( cardid = cardid).first()
        if card and card.list.user.userid != get_jwt_identity():
            return make_response("Unauthorised",401)
        
        try:
            Card.query.filter_by(cardid = cardid).delete()
        except Exception as e:
            db.session.rollback()
        finally:
            db.session.commit()

    @jwt_required()
    def put(self,cardid):

        parser = reqparse.RequestParser()
        parser.add_argument('listid')
        parser.add_argument('deadline')
        parser.add_argument('enddate')
        parser.add_argument('cardtitle')
        parser.add_argument('cardcontent')
        args = parser.parse_args()

        card = Card.query.filter_by( cardid = cardid).first()
        
        if card and card.list.user.userid != get_jwt_identity():
            return make_response("Unauthorised",401)

        card.listid = args.get('listid',"")
        card.enddate = args.get('enddate',"")
        card.cardtitle = args.get('cardtitle',"")
        card.cardcontent = args.get('cardcontent',"")
        card.deadline = args.get('deadline')

        try:
            db.session.add(card)
        except Exception as e:
            db.session.rollback()
        finally:
            db.session.commit()





@api.resource("/list/user")
class Userlist(Resource):
    

    @jwt_required()
    def get(self):
        current_userid = get_jwt_identity()
        lists = List.query.filter_by(userid = current_userid).all()
        if not lists:
            return None
        response = []
        for list in lists:
            response.append({"listid":list.listid,
                            "listname":list.listname,
                            "userid":list.userid,
                            "content":list.content})
        return response




@api.resource("/card/list/<int:listid>")
class Listcard(Resource):

    @jwt_required()
    def get(self,listid):

        list = List.query.filter_by(listid = listid).first()
        if list and list.user.userid != get_jwt_identity():
            return make_response("Unauthorised",401)
        
        cards = Card.query.filter_by(listid = listid).all()
        
        if not cards:
            return None
        response = []
        for card in cards:
            response.append({"cardid":card.cardid,
                            "listid":card.listid,
                            "createdate":card.createdate,
                            "deadline":card.deadline,
                            "enddate":card.enddate,
                            "cardtitle":card.cardtitle,
                            "cardcontent":card.cardcontent})
        return response