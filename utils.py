import datetime
from flask import render_template
from model import User,List,Card


def send_mail(userid):
    user = User.query.filter_by(userid = userid).first()
    lists = List.query.filter_by(userid = userid).all()
    cards = []

    for list in lists:
        curr = Card.query.filter_by(listid = list.listid).all()
        cards.extend(curr)
    
    date = datetime.date.today()
    template =  render_template('report.html',cards = cards,user = user,date = date)
    return template