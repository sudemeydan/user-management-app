import pika
import time
import os

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')

def callback(ch, method, properties, body):
    print(f" [x] Node.js'ten yeni bir CV görev mesajı alındı: {body.decode()}")
    print(" [x] CV İşleniyor (NLP işlemleri simüle ediliyor - 3 saniye sürecek)...")
    time.sleep(3)
    print(" [x] CV İşlemi Tamamlandı!")
    
    ch.basic_ack(delivery_tag=method.delivery_tag) 

def start_worker():
    print("Servis başlatılıyor, RabbitMQ'nun hazır olması bekleniyor...")
    time.sleep(10) 
    
    print(f"RabbitMQ'ya bağlanılıyor ({RABBITMQ_HOST})...")
    
    # RabbitMQ'ya bağlan
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    channel = connection.channel()
    
    
    channel.queue_declare(queue='cv_parsing_queue', durable=True)
    
    print(' [*] Kuyruk dinleniyor. Çıkmak için CTRL+C tuşlarına basın')
    
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='cv_parsing_queue', on_message_callback=callback)
    
    channel.start_consuming()

if __name__ == '__main__':
    start_worker()