from app import app,api
from model import User,List,Card
from model import Userlist,Listcard
from flask import render_template


@app.route("/")
def index():
    card = Card.query.filter_by(cardid = 1).first()
    return render_template('index.html',a = card)


@app.route("/board")
def kanban():
    return render_template('kanban.html')




api.add_resource(User,"/user/<int:userid>")
api.add_resource(List,"/list/<int:listid>")
api.add_resource(Card,"/card/<int:cardid>")
api.add_resource(Userlist,"/list/user/<int:userid>")
api.add_resource(Listcard,"/card/list/<int:listid>")



if __name__ == "__main__":
    app.run(debug=True)