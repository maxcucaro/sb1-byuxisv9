import { db } from './config/database.js';
import { handleError } from './utils/errorHandling.js';

export async function insertBacklineArticle(formData) {
  return handleError(async () => {
    const { data, error } = await db
      .from('articoli_backline')
      .insert([{
        ...formData,
        settore: 'BACKLINE'
      }])
      .select();

    if (error) throw error;
    return { success: true, data };
  }, 'inserimento articolo backline');
}