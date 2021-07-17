import { chromium } from 'playwright';
import fs from 'fs/promises';

const showPages = [
  "https://pro.imdb.com/title/tt10436228",
  "https://pro.imdb.com/title/tt9717424",
  "https://pro.imdb.com/title/tt3007572"
];

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50, acceptDownloads: true });

  const page = await browser.newPage();

  // Login
  await page.goto("https://pro.imdb.com/login");

  await page.click("#login_with_imdb");

  // NOTE - Fill in email:
  await page.fill("#ap_email", "<EMAIL>");

  // NOTE - Fill in password here:
  await page.fill("#ap_password", "<PASSWORD>");

  await page.click("#signInSubmit");

  await page.waitForTimeout(15000);

  // Cycle through shows
  for (let showPage of showPages) {
    await page.goto(showPage + "/episodes");
  
    const episodeUrls = await page.evaluate(() => {
  
      const urls = [...new Set([...document.querySelectorAll('.episode_row a')].map(el => el.href))];
      const filmmakers = urls.map(url => url + 'filmmakers');
  
      return filmmakers;    
    });
  
    // Cycle through episodes
    for (let episodeUrl of episodeUrls) {
      await page.goto(episodeUrl);
    
      const { csv, showName, episodeInfo } = await page.evaluate(() => {
        const csv = [...document.querySelectorAll('[data-a-name="filmmakers"] tbody')].flatMap(el => {
          const section = el.querySelector('tr.a-histogram-row.a-active.heading > th:nth-child(1) > span > span > span.a-size-.a-text-bold') || el.querySelector('tr span.a-text-bold');
        
          if (!section) return null;
          const sectionName = section.innerText;
          
          const filmmakers = [...el.querySelectorAll('.filmmaker')].map(filmmaker => {
            const name = filmmaker.querySelector("td:nth-child(1) > div > span > span > a").innerText;
            const position = filmmaker.querySelector("td:nth-child(1) > div > div > span > span.see_more_text_collapsed").innerText;
        
            return {
              section: sectionName.trim(),
              name,
              position: position.replaceAll(",", "-")
            }
          })
        
          return filmmakers;
        })
        .filter(f => !!f)
        .reduce((acc, { section, name, position}) => `${acc}${section},${name},${position}\n`, 'section,name,position\n');
        
        const showName = document.querySelector('#title_heading > h1 > span > a').innerText;
        const episodeInfo = document
          .querySelector('#title_heading > div.a-row.a-spacing-micro').innerText.replaceAll("/", "|");
    
        return { csv, showName, episodeInfo };
      });
    
      // Write CSV files
      await fs.writeFile(`exports/${showName}: ${episodeInfo}.csv`, csv);
    }
  }

  await page.waitForTimeout(4000);
  
  await page.close();
  await browser.close();
})();