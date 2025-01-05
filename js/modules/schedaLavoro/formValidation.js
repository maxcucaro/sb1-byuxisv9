```diff
 export function validateSchedaForm(formData) {
-  const { nome, produzione_id, data_inizio, data_fine, luogo, responsabile_id } = formData;
+  const { nome, produzione_id, data_inizio, data_fine, luogo } = formData;
   
   if (!nome?.trim()) throw new Error('Il nome della scheda è obbligatorio');
   if (!produzione_id) throw new Error('La produzione è obbligatoria');
   if (!data_inizio) throw new Error('La data di inizio è obbligatoria');
   if (!data_fine) throw new Error('La data di fine è obbligatoria');
   if (!luogo?.trim()) throw new Error('Il luogo è obbligatorio');
-  if (!responsabile_id) throw new Error('Il responsabile è obbligatorio');

   const inizio = new Date(data_inizio);
   const fine = new Date(data_fine);
```