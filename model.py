from app import db
from datetime import date,datetime,timedelta
from flask_restful import Resource,reqparse



class User(db.Model,Resource):
    __tablename__ = "User"
    userid = db.Column(db.Integer,primary_key = True,autoincrement=True)
    username = db.Column(db.String,unique=True,nullable=False)
    password = db.Column(db.String,nullable=False)
    email = db.Column(db.String,nullable=False,unique = True)
    lists = db.relationship("List",backref="user")

    def get(self,userid):
        user = User.query.filter_by(userid = userid).first()
        if user:
            return {"userid":user.userid,
                    "username":user.username,
                    "password":user.password,
                    "email":user.email}









class List(db.Model,Resource):
    __tablename__ = "List"
    listid = db.Column(db.Integer,primary_key=True,autoincrement=True)
    listname = db.Column(db.String,nullable = False)
    userid = db.Column(db.Integer,db.ForeignKey('User.userid'),nullable = False)
    content = db.Column(db.String)
    cards = db.relationship("Card",backref="list")


    def get(self,listid):
        list = List.query.filter_by(listid = listid).first()
        if list:
            return {"listid":list.listid,
                    "listname":list.listname,
                    "userid":list.userid,
                    "content":list.content}


    def delete(self,listid):

        try:
            List.query.filter_by(listid = listid).delete()
        except Exception as e:
            db.session.rollback()
        finally:
            db.session.commit()





class Card(db.Model,Resource):
    __tablename__ = "Card"
    cardid = db.Column(db.Integer,primary_key=True,autoincrement=True)
    listid = db.Column(db.Integer,db.ForeignKey('List.listid'),nullable=False)
    createdate = db.Column(db.String,nullable=False)
    deadline = db.Column(db.String,nullable=False)
    enddate = db.Column(db.String)
    cardtitle = db.Column(db.String)
    cardcontent = db.Column(db.String)

    def get(self,cardid):
        card = Card.query.filter_by(cardid = cardid).first()
        if card:
            return {"cardid":card.cardid,
                    "listid":card.listid,
                    "createdate":card.createdate,
                    "deadline":card.deadline,
                    "enddate":card.enddate,
                    "cardtitle":card.cardtitle,
                    "cardcontent":card.cardcontent}


    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument('listid')
        args = parser.parse_args()
        card = Card(   
                    listid = args.get('listid'),
                    createdate = date.today(),
                    deadline = (date.today() + timedelta(days = 30)).isoformat(),
                    enddate = "",
                    cardtitle = "cardtitle",
                    cardcontent = "cardcontent")

        try: 
            card = db.session.add(card)
        except Exception as e:
            db.session.rollback()
        finally:
            db.session.commit()
        

    def delete(self,cardid):
        
        try:
            Card.query.filter_by(cardid = cardid).delete()
        except Exception as e:
            db.session.rollback()
        finally:
            db.session.commit()



class Userlist(Resource):

    def get(self,userid):
        lists = List.query.filter_by(userid = userid).all()
        if not lists:
            return None
        response = []
        for list in lists:
            response.append({"listid":list.listid,
                            "listname":list.listname,
                            "userid":list.userid,
                            "content":list.content})
        return response





class Listcard(Resource):

    def get(self,listid):
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