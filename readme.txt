
1.Run in a terminal.
    redis-server

2. Inside folder ikann-app 
    Run in another terminal
        celery -A utils.celeryapp worker --beat
    
    Run in another terminal 
        python3 kan.py
