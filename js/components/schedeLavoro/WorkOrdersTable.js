```diff
                 <td>${new Date(scheda.data_inizio).toLocaleDateString()}</td>
                 <td>${new Date(scheda.data_fine).toLocaleDateString()}</td>
                 <td>${scheda.luogo}</td>
-                <td>${scheda.responsabile ? `${scheda.responsabile.nome} ${scheda.responsabile.cognome}` : '-'}</td>
+                <td>${scheda.responsabile || '-'}</td>
                 <td class="status-${scheda.stato.toLowerCase()}">${scheda.stato}</td>
```