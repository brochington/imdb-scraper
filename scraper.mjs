import { chromium } from 'playwright';

const config = {
  shows: [
    { show: 'Jurassic World Camp Cretaceous', seasons: [1], showPage: 'https://pro.imdb.com/title/tt10436228' },
    { show: 'Chico Bon Bon: Monkey with a Tool Belt', seasons: [3] },
    { show: 'Team Kaylie', seasons: [3] },
    { show: 'Locke & Key', seasons: [1] },
    { show: 'Narcos: Mexico', seasons: [2] },
    { show: 'Song Exploder', seasons: [1] },
    { show: 'Deaf U', seasons: [1] },
  ]
};

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });

  const page = await browser.newPage();

  // Login
  await page.goto("https://pro.imdb.com/login");

  await page.click("#login_with_imdb");

  await page.fill("#ap_email", "Mdscstation1@gmail.com"); // email

  await page.fill("#ap_password", "Inclusioncoder223");

  await page.click("#signInSubmit");

  await page.waitForTimeout(15000);

  // Should now be logged in.
  await page.goto("https://pro.imdb.com/title/tt10436228/episodes");

  const episodeUrls = await page.evaluate(() => {
    // const episodesEl = document.querySelector('[data-a-name="episodes"]');
    // const urls = [...episodesEl.querySelectorAll('.episode_row a')].map(el => el.href);
    const urls = [...new Set([...document.querySelectorAll('.episode_row a')].map(el => el.href))];
    const filmmakers = urls.map(url => url + 'filmmakers');


    return filmmakers;
    // const episodeRows = episodesEl.querySelectorAll('tr.episode-row');
    // const asss = episodeRows.querySelectorAll('a');
    // [...asss].map(el => {
    //   return el.href;
    // });
    
  });

  // only trying on the the first page for now.
  const episode1 = episodeUrls[0];
  await page.goto(episode1);

  const filmmakers = await page.evaluate(() => {
    return [...document.querySelectorAll('[data-a-name="filmmakers"] tbody')].flatMap(el => {
      const section = el.querySelector('tr.a-histogram-row.a-active.heading > th:nth-child(1) > span > span > span.a-size-.a-text-bold');
    
      if (!section) return null;
      const sectionName = section.innerText.trim();
      
      const filmmakers = [...el.querySelectorAll('.filmmaker')].map(filmmaker => {
        const name = filmmaker.querySelector("td:nth-child(1) > div > span > span > a").innerText;
        const position = filmmaker.querySelector("td:nth-child(1) > div > div > span > span.see_more_text_collapsed").innerText;
    
        return {
          section: sectionName,
          name,
          position
        }
      })
    
      return filmmakers;
    }).filter(f => !!f)
  });

  console.log(filmmakers);

  await page.waitForTimeout(25000);


  // for (let { show, seasons } of config.shows) {
    // await page.fill("#searchField", show);
    // await page.waitForTimeout(5000);
    // await page.keyboard.press('Enter');

    // await page.waitForTimeout(5000);
    // await page.click("#result > ul > li:nth-child(1) > a");


    // // Episodes
    // await page.click("text=Episodes");

    // await page.waitForTimeout(5000);

    // on show page
    
    // for (let season of seasons) {
    //   await page.selectOption("#season_dropdown", `${season}`);

    //   await page.screenshot({ path: `${show}-${season}.png` });
    //   // await page.screenshot({ path: `${show} season ${season}.png` });
    // }

    // await page.click("title=IMDbPro");
  // }
  
  
  await page.close();
  await browser.close();
})();