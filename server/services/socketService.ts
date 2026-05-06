import { Server as SocketIOServer } from 'socket.io';

/**
 * Socket.io Singleton Servisi
 * 
 * Bu modül, Socket.io sunucu örneğini (instance) tek bir noktadan yönetir.
 * Böylece RabbitMQ consumer'ı gibi farklı modüller, 
 * doğrudan bu servisten io instance'ına erişip istemcilere mesaj gönderebilir.
 */
let io: SocketIOServer | null = null;

/**
 * Socket.io instance'ını ayarlar. Sunucu başlatılırken bir kez çağrılır.
 */
export const setSocketIO = (socketIOInstance: SocketIOServer): void => {
    io = socketIOInstance;
};

/**
 * Socket.io instance'ını döndürür. Diğer modüller bu fonksiyon ile erişir.
 */
export const getSocketIO = (): SocketIOServer | null => {
    return io;
};

/**
 * Belirli bir userId'ye ait room'a event gönderir.
 * Her kullanıcı bağlandığında kendi userId'si ile bir "room"a katılır.
 * Bu sayede sadece ilgili kullanıcıya bildirim gider.
 */
export const emitToUser = (userId: number | string, event: string, data: any): void => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
        console.log(`[SOCKET] Event '${event}' -> user_${userId} gönderildi.`);
    } else {
        console.warn('[SOCKET] io instance henüz hazır değil, mesaj gönderilemedi.');
    }
};
