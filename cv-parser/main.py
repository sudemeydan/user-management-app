import pika
import time
import os
import json
import base64
import fitz 

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')

def extract_text_from_pdf_bytes(pdf_bytes):
    """
    Bellekteki PDF byte'larından metin çıkarır. 
    Dosyayı diske kaydetmeye gerek kalmaz.
    """
    text = ""
    try:
        # stream=True ile bellekten (bytes) PDF okuma
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page in doc:
            # 'sort=True' parametresi blokları mantıksal düzene (yukarıdan aşağıya, soldan sağa) sokar
            text += page.get_text("text", sort=True) + "\n\n"
        doc.close()
        return text
    except Exception as e:
        print(f" [!] PDF okuma hatası: {e}")
        return None

def callback(ch, method, properties, body):
    cv_id = "UNKNOWN"
    try:
        # Node.js'ten gelen JSON mesajını çöz
        try:
            data = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError as json_err:
            raise ValueError(f"Geçersiz JSON: {json_err}")
            
        cv_id = data.get("cvId", "UNKNOWN")
        pdf_base64 = data.get("fileData") 
        
        print(f" [x] CV İşleniyor: ID={cv_id}")
        
        if not pdf_base64:
            raise ValueError("fileData (PDF base64) bulunamadı.")

        # Data URI header'ı varsa temizle (örn: data:application/pdf;base64,...)
        if "base64," in pdf_base64:
            pdf_base64 = pdf_base64.split("base64,")[1]

        # Base64 string'ini tekrar bytes'a çevir
        try:
            pdf_bytes = base64.b64decode(pdf_base64)
        except Exception as b64_err:
            raise ValueError(f"Base64 çözme hatası: {b64_err}")
        
        # 1. Metni çıkar
        raw_text = extract_text_from_pdf_bytes(pdf_bytes)
        
        # 2. Sonucu hazırla
        if raw_text:
            print(f" [x] Metin başarıyla çıkarıldı (Karakter Sayısı: {len(raw_text)}).")
            result_data = {
                "cvId": cv_id,
                "rawText": raw_text,
                "status": "COMPLETED"
            }
        else:
            print(" [!] Metin çıkarılamadı.")
            result_data = {
                "cvId": cv_id,
                "status": "FAILED",
                "rawText": None
            }
            
        # 3. Sonucu cv_result_queue'ya gönder
        ch.basic_publish(
            exchange='',
            routing_key='cv_result_queue',
            body=json.dumps(result_data)
        )
        print(" [x] Sonuç Node.js'e gönderildi.")
            
    except Exception as e:
        print(f" [!] Beklenmeyen bir hata: {e}")
        try:
             error_data = {"cvId": cv_id, "status": "FAILED", "rawText": None, "error": str(e)}
             ch.basic_publish(exchange='', routing_key='cv_result_queue', body=json.dumps(error_data))
             print(" [x] Hata Node.js'e bildirildi.")
        except Exception as inner_e:
             print(f" [!] Hata mesajı gönderilemedi: {inner_e}")

    # Mesajı işlendi olarak işaretle
    ch.basic_ack(delivery_tag=method.delivery_tag) 

def connect_to_rabbitmq() -> pika.BlockingConnection:
    """RabbitMQ'ya bağlanana kadar dener ve bağlantıyı döndürür."""
    # RabbitMQ docker imajı bağlantı URL'sini ortam değişkeninden al veya default olarak amqp://rabbitmq:5672 kullan
    rabbitmq_url = os.getenv('RABBITMQ_URL', f'amqp://{RABBITMQ_HOST}:5672')
    parameters = pika.URLParameters(rabbitmq_url)
    
    while True:
        try:
            print(f"RabbitMQ'ya bağlanılıyor ({rabbitmq_url})...")
            connection = pika.BlockingConnection(parameters)
            return connection
        except pika.exceptions.AMQPConnectionError:
            print("Bağlantı başarısız, 5 saniye sonra tekrar deneniyor...")
            time.sleep(5)

def start_worker():
    print("Servis başlatılıyor, RabbitMQ'nun hazır olması bekleniyor...")
    time.sleep(5) 
    
    # Yeni ve güvenli bağlantı fonksiyonumuzu çağırıyoruz
    connection = connect_to_rabbitmq()
    channel = connection.channel()
    
    channel.queue_declare(queue='cv_parsing_queue', durable=True)
    channel.queue_declare(queue='cv_result_queue', durable=True)
    
    print(' [*] Kuyruk dinleniyor. Çıkmak için CTRL+C tuşlarına basın')
    
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='cv_parsing_queue', on_message_callback=callback)
    
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        print("Çıkış yapılıyor...")
        channel.stop_consuming()
    finally:
        connection.close()

if __name__ == '__main__':
    start_worker()