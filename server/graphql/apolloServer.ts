// @ts-nocheck
import { ApolloServer } from '@apollo/server';
// @ts-ignore: TypeScript might complain about express4 module resolution due to commonjs but it works
import { expressMiddleware } from '@apollo/server/express4';
import { Application, Request } from 'express';
import typeDefs from './typeDefs';
import resolvers from './resolvers';

// Apollo Server instance'ını oluştur
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

import bodyParser from 'body-parser';
import cors from 'cors';

// Express uygulamasına Apollo Server'ı bağlayan fonksiyon
export const startApolloServer = async (app: Application) => {
  await server.start();
  
  // '/graphql' endpoint'ini oluştur ve middleware olarak ekle
  // Express 5 tipleri ile Apollo middleware'inin tipleri ufak farklılıklar gösteriyor, @ts-ignore ile devredışı bırakıyoruz
  // @ts-ignore
  app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    (req, res, next) => {
      // Tarayıcıdan Sandbox'a girilirken GET isteğinde body olmaz. Apollo'nun çökmemesi için boş obje ataması yapıyoruz.
      if (req.body === undefined) req.body = {};
      next();
    },
    expressMiddleware(server, {
      context: async ({ req }: { req: Request }) => {
        // İleride burada yetkilendirme (token doğrulama vb.) işlemleri yapılabilir.
        // Şimdilik sadece request nesnesini context'e ekliyoruz.
        return { req };
      },
    })
  );
  
  console.log(`🚀 GraphQL Endpoint ready at http://localhost:3001/graphql`);
};
