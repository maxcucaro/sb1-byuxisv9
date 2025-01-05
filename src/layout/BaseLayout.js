import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';

export function BaseLayout(content) {
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EVENT TRACK - Control Stage</title>
      <link rel="stylesheet" href="css/style.css">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
    </head>
    <body>
      ${Header()}
      ${Navigation()}
      <main class="main-content">
        ${content}
      </main>
      ${Footer()}
    </body>
    </html>
  `;
}