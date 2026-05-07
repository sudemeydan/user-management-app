import { Request, Response, NextFunction } from 'express';
import { Client } from '@elastic/elasticsearch';

const isDocker = process.env.DATABASE_URL?.includes('@db:5432');
const elasticNode = isDocker ? 'http://elasticsearch:9200' : 'http://localhost:9200';

const client = new Client({ node: elasticNode });
const INDEX_NAME = 'admin-logs*';

export const getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { action, level, page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);

    // winston-elasticsearch verisi "fields" objesi altına yazıyor.
    // severity = log level (info, error, warn)
    // fields.action = işlem tipi (LOGIN, ADMIN_DELETE_USER vb.)
    const must: any[] = [];

    if (action) {
      must.push({ match: { 'fields.action': action } });
    }

    if (level) {
      must.push({ match: { severity: level } });
    }

    let result: any;
    try {
      result = await client.search({
        index: INDEX_NAME,
        from,
        size: Number(limit),
        sort: [{ '@timestamp': { order: 'desc' } }],
        query: must.length > 0 ? { bool: { must } } : { match_all: {} },
      });
    } catch (esError: any) {
      // Index henüz oluşturulmadıysa boş döndür
      const errType = esError?.meta?.body?.error?.type || esError?.name;
      if (errType === 'index_not_found_exception' || esError?.message?.includes('index_not_found')) {
        res.json({ success: true, data: [], total: 0, page: Number(page), limit: Number(limit) });
        return;
      }
      throw esError;
    }

    // Veriyi frontend için düzenle: fields içindeki alanları üst seviyeye çıkar
    const hits = (result.hits.hits as any[]).map((hit: any) => {
      const src = hit._source || {};
      return {
        _id: hit._id,
        timestamp: src['@timestamp'],
        message: src.message,
        level: src.severity,            // winston-elasticsearch "severity" kullanıyor
        action: src.fields?.action,
        userId: src.fields?.userId,
        email: src.fields?.email,
        role: src.fields?.role,
        adminId: src.fields?.adminId,
        targetUserId: src.fields?.targetUserId,
        error: src.fields?.error,
        service: src.fields?.service,
      };
    });

    res.json({
      success: true,
      data: hits,
      total: (result.hits.total as any).value || 0,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

export default { getLogs };
