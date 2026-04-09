import prisma from '../utils/prisma';
import { GraphQLError } from 'graphql';

const resolvers = {
  Query: {
    // Tüm kullanıcıları getir (sayfalama destekli)
    users: async (_: any, { skip, take }: { skip: number, take: number }) => {
      try {
        return await prisma.user.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        });
      } catch (error: any) {
        console.error("PRISMA USERS ERROR:", error.message || error);
        throw new GraphQLError(`Kullanıcılar getirilirken hata oluştu: ${error.message || error}`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    // Tek bir kullanıcı getir
    user: async (_: any, { id }: { id: number }) => {
      try {
        return await prisma.user.findUnique({
          where: { id },
        });
      } catch (error) {
        throw new GraphQLError('Kullanıcı getirilirken hata oluştu.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    // Tüm gönderileri getir
    posts: async (_: any, { skip, take }: { skip: number, take: number }) => {
      try {
        return await prisma.post.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        throw new GraphQLError('Gönderiler getirilirken hata oluştu.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    // Tek bir gönderi getir
    post: async (_: any, { id }: { id: number }) => {
        try {
          return await prisma.post.findUnique({
            where: { id },
          });
        } catch (error) {
          throw new GraphQLError('Gönderi getirilirken hata oluştu.', {
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          });
        }
    },

    // Tüm CV'leri getir
    cvs: async (_: any, { skip, take }: { skip: number, take: number }) => {
      try {
        return await prisma.cV.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        throw new GraphQLError('CVler getirilirken hata oluştu.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    // Tek bir CV getir
    cv: async (_: any, { id }: { id: number }) => {
        try {
          return await prisma.cV.findUnique({
            where: { id },
          });
        } catch (error) {
          throw new GraphQLError('CV getirilirken hata oluştu.', {
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          });
        }
    },
    
     // Tüm bağlantıları getir
     connections: async (_: any, { skip, take }: { skip: number, take: number }) => {
        try {
          return await prisma.connection.findMany({
            skip,
            take,
            orderBy: { createdAt: 'desc' },
          });
        } catch (error) {
          throw new GraphQLError('Bağlantılar getirilirken hata oluştu.', {
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          });
        }
      },
  },

  // Field Resolvers: Bir alan istendiğinde, o alana ait ilişkisel verileri nasıl bulacağı belirleniyor.
  User: {
    profile: (parent: any) => prisma.profile.findUnique({ where: { userId: parent.id } }),
    profileImage: (parent: any) => prisma.profileImage.findUnique({ where: { userId: parent.id } }),
    posts: (parent: any) => prisma.post.findMany({ where: { authorId: parent.id } }),
    cvs: (parent: any) => prisma.cV.findMany({ where: { userId: parent.id } }),
    sentConnections: (parent: any) => prisma.connection.findMany({ where: { senderId: parent.id } }),
    receivedConnections: (parent: any) => prisma.connection.findMany({ where: { receiverId: parent.id } }),
  },

  Post: {
    author: (parent: any) => prisma.user.findUnique({ where: { id: parent.authorId } }),
    images: (parent: any) => prisma.postImage.findMany({ where: { postId: parent.id } }),
  },

  CV: {
    user: (parent: any) => prisma.user.findUnique({ where: { id: parent.userId } }),
    entries: (parent: any) => prisma.cVEntry.findMany({ where: { cvId: parent.id } }),
  },

  Connection: {
    sender: (parent: any) => prisma.user.findUnique({ where: { id: parent.senderId } }),
    receiver: (parent: any) => prisma.user.findUnique({ where: { id: parent.receiverId } }),
  }
};

export default resolvers;
