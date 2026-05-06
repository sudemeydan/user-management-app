import { Request, Response, NextFunction } from 'express';
import { Client } from '@elastic/elasticsearch';

// Docker container'a veya local'e bağlanmak için client ayarı
const isDocker = process.env.DATABASE_URL?.includes('@db:5432');
const elasticNode = isDocker ? 'http://elasticsearch:9200' : 'http://localhost:9200';

const client = new Client({ node: elasticNode });
const INDEX_NAME = 'admin-logs*'; // winston-elasticsearch default olarak tarih ekler

export const getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { action, level, page = 1, limit = 50 } = req.query;

    const must: any[] = [];

    if (action) {
      must.push({ match: { action: action } });
    }
    
    if (level) {
      must.push({ match: { level: level } });
    }

    const from = (Number(page) - 1) * Number(limit);

    // Elasticsearch'e bağlanmayı deneyelim, index yoksa hata vermesin diye önce ping veya error handle edelim
    try {
        const result = await client.search({
          index: INDEX_NAME,
          from: from,
          size: Number(limit),
          sort: [{ '@timestamp': { order: 'desc' } }],
          query: must.length > 0 ? { bool: { must } } : { match_all: {} }
        });
        
        // Elastic 8.x response formatı
        const hits = (result.hits.hits as any[]).map(hit => ({
          _id: hit._id,
          ...hit._source
        }));
    
        res.json({
          success: true,
          data: hits,
          total: (result.hits.total as any).value || 0,
          page: Number(page),
          limit: Number(limit)
        });
    } catch (esError: any) {
        // Eğer index henüz oluşturulmadıysa (hiç log atılmadıysa) boş dönebiliriz.
        if (esError.meta?.body?.error?.type === 'index_not_found_exception') {
             res.json({
                success: true,
                data: [],
                total: 0,
                page: Number(page),
                limit: Number(limit),
                message: "Henüz hiç log bulunmuyor."
             });
             return;
        }
        throw esError;
    }

  } catch (error) {
    next(error);
  }
};

export default {
  getLogs
};
