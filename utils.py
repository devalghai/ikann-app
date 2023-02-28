import os 
import json
import smtplib
import datetime
from app import app
from celery import Celery
from os.path import basename
from model import User,List,Card
from flask import render_template
from prettytable import PrettyTable
from celery.schedules import crontab
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

sender = "enter outlook email"
password = "enter password"

celeryapp = Celery(__name__,
            broker='redis://localhost',
            backend='redis://localhost')
class ContextTask(celeryapp.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

celeryapp.Task = ContextTask

@celeryapp.task()
def sendmonthlyalert():
    users = User.query.all()
    for user in users:
        send_mail.delay(user.userid)

@celeryapp.task()
def send_mail(userid):
    
    user = User.query.filter_by(userid = userid).first()
    username = user.username
    to = user.email

    lists = List.query.filter_by(userid = userid).all()
    cards = []

    for _list in lists:
        curr = Card.query.filter_by(listid = _list.listid).all()
        cards.extend(curr)

    date = datetime.date.today()
    template =  render_template('report.html',cards = cards,user = user,date = date)


    text = f"""
        Dear {username},
        Greetings from IKann!
        The activity report is attached herewith.
        """  

    message = MIMEMultipart()
    message['From'] = sender
    message['To'] = to
    message['Subject'] = "Activity report!"
  
    body = MIMEText(text,'plain')
    filename = basename(f"{username}.html")
    attachment = MIMEApplication(template,Name=filename)
    attachment['Content-Disposition'] = 'attachment; filename="{}"'.format(filename)
    
    message.attach(body)
    message.attach(attachment)

    s = smtplib.SMTP('smtp-mail.outlook.com',587)
    s.ehlo_or_helo_if_needed()
    s.starttls()
    
    try:
        s.login(sender,password)
    except Exception as e:
        return False

    try:
        s.send_message(message,sender,to)
    except Exception as e:
        return False

    s.quit()
    return True

@celeryapp.task()
def maillist(listid,userid):

    _list = List.query.filter_by(listid = listid).first()

    if  _list and _list.user.userid != userid:
        return False

    username = _list.user.username
    to = _list.user.email

    cards = Card.query.filter_by(listid = listid).all()
    response = """Card Title,Card Content,List name,Date created,Deadline,Completed on""" + "\n"
    
    for card in cards:
        newrow = fr"{card.cardtitle.strip()},{card.cardcontent.strip()},{_list.listname.strip()},{card.createdate},{card.deadline},{card.enddate}" + "\n"
        response += newrow
    
    text = f"""
        Dear {username},
        Greetings from IKann!
        The tasks in list {_list.listname} is attached herewith.
        """  

    message = MIMEMultipart()
    message['From'] = sender
    message['To'] = to
    message['Subject'] = f"CSV list {_list.listname}"
  
    body = MIMEText(text,'plain')
    filename = basename(f"{_list.listname}.csv")
    attachment = MIMEApplication(response,Name=filename)
    attachment['Content-Disposition'] = 'attachment; filename="{}"'.format(filename)
    
    message.attach(body)
    message.attach(attachment)

    s = smtplib.SMTP('smtp-mail.outlook.com',587)
    s.ehlo_or_helo_if_needed()
    s.starttls()
    
    try:
        s.login(sender,password)
    except Exception as e:
        return False

    try:
        s.send_message(message,sender,to)
    except Exception as e:
        return False

    s.quit()
    return True

@celeryapp.task()
def mailcard(cardid,userid):

    _card = Card.query.filter_by(cardid = cardid).first()

    if  _card and _card.list.user.userid != userid:
        return False

    username = _card.list.user.username
    to = _card.list.user.email

    response = """Card Title,Card Content,Date created,Deadline,Completed on""" + "\n"
    newrow = fr"{_card.cardtitle.strip()},{_card.cardcontent.strip()},{_card.createdate},{_card.deadline},{_card.enddate}" + "\n"
    response += newrow
    
    text = f"""
        Dear {username},
        Greetings from IKann!
        The card {_card.cardtitle} is attached herewith.
        """  

    message = MIMEMultipart()
    message['From'] = sender
    message['To'] = to
    message['Subject'] = f"CSV card {_card.cardtitle}"
  
    body = MIMEText(text,'plain')
    filename = basename(f"{_card.cardtitle}.csv")
    attachment = MIMEApplication(response,Name=filename)
    attachment['Content-Disposition'] = 'attachment; filename="{}"'.format(filename)
    
    message.attach(body)
    message.attach(attachment)

    s = smtplib.SMTP('smtp-mail.outlook.com',587)
    s.ehlo_or_helo_if_needed()
    s.starttls()
    
    try:
        s.login(sender,password)
    except Exception as e:
        return False

    try:
        s.send_message(message,sender,to)
    except Exception as e:
        return False

    s.quit()
    return True

@celeryapp.task()
def senddailyalert():
    users = User.query.all()
    for user in users:
        sendalertto.delay(user.userid,user.username,user.email)

@celeryapp.task()
def sendalertto(userid,username,email):
    
  
    to = email


    lists = List.query.filter_by(userid = userid).all()
    cards = []
    
    currdate = datetime.date.today()
    aftertwodays = currdate + datetime.timedelta(days=2)
    
    currdate = currdate.isoformat()
    aftertwodays = aftertwodays.isoformat()
    
    
    for list in lists:
        curr = Card.query.filter_by(listid = list.listid).all()
        cards.extend(curr)

    cards = [card for card in cards if currdate <= card.deadline <= aftertwodays and card.enddate == "-"]
    
    if not cards:
        return

    table = PrettyTable()
    table.align = "l"
    table.format = True

    table.field_names = ["Card Title","Card Content","List Name","Create Date","Deadline"]

    for card in cards:
        table.add_row([card.cardtitle, card.cardcontent, card.list.listname,card.createdate,card.deadline])
    
    table.sortby = "Deadline"

    text = f"""
        Dear {username},
        Greetings from IKann!
        Tasks due to be completed by {aftertwodays}.
        """  
    
    message = MIMEMultipart()
    message['From'] = sender
    message['To'] = to
    message['Subject'] = f"Schedule - {currdate}"
    
    body = MIMEText(text,'plain')
    table = MIMEText(table.get_html_string(attributes={"style":"border: 1px solid black;border-collapse: collapse;"}),'html')
    message.attach(body)
    message.attach(table)


    s = smtplib.SMTP('smtp-mail.outlook.com',587)
    s.ehlo_or_helo_if_needed()
    s.starttls()
    
    try:
        s.login(sender,password)
    except Exception as e:
        return False

    try:
        s.send_message(message,sender,to)
    except Exception as e:
        return False

    s.quit()
    return True

@celeryapp.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    dir = os.path.abspath(os.path.dirname(__file__))
    filepath = os.path.join(dir,'celerybeat-schedule')
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
        except Exception as e:
            pass


    sender.add_periodic_task(crontab(hour=9, minute=0),senddailyalert.s(), name='send-daily-reminder')
    sender.add_periodic_task(crontab(hour=10, minute=00,day_of_month=1),sendmonthlyalert.s(),name='send-monthly-report')

celeryapp.conf.timezone = 'Asia/Kolkata'