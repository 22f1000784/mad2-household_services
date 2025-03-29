# Celery configuration file

# Broker settings (using Redis as broker)
broker_url = 'redis://localhost:6379/0'

# Result backend settings (using Redis as result backend)
result_backend = 'redis://localhost:6379/1'
timezone = 'Asia/Kolkata'
broker_connection_retry_on_startup = True

