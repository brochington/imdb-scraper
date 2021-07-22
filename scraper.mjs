import { chromium } from 'playwright';
import fs from 'fs/promises';

const showPages = [
  'https://pro.imdb.com/title/tt10359446',
  'https://pro.imdb.com/title/tt11744632',
  'https://pro.imdb.com/title/tt11822998',
  'https://pro.imdb.com/title/tt8289930',
  'https://pro.imdb.com/title/tt8784324',
  'https://pro.imdb.com/title/tt7907916',
  'https://pro.imdb.com/title/tt7889220',
  'https://pro.imdb.com/title/tt11823088',
  'https://pro.imdb.com/title/tt11823076', // Tiger King
  'https://pro.imdb.com/title/tt8893550',
  'https://pro.imdb.com/title/tt11958942',
  'https://pro.imdb.com/title/tt6987788',
  'https://pro.imdb.com/title/tt8914684',
  'https://pro.imdb.com/title/tt11958922',
  'https://pro.imdb.com/title/tt12004280',
  'https://pro.imdb.com/title/tt12176398',
  'https://pro.imdb.com/title/tt12027008',
  'https://pro.imdb.com/title/tt11718294',
  'https://pro.imdb.com/title/tt12189310',
  'https://pro.imdb.com/title/tt9846284',
  'https://pro.imdb.com/title/tt8784324',
  'https://pro.imdb.com/title/tt9498102',
  'https://pro.imdb.com/title/tt11963042',
  'https://pro.imdb.com/title/tt8425308',
  'https://pro.imdb.com/title/tt12200714',
  'https://pro.imdb.com/title/tt11958648',
  'https://pro.imdb.com/title/tt12845620',
  'https://pro.imdb.com/title/tt12312250',
  'https://pro.imdb.com/title/tt7752034',
  'https://pro.imdb.com/title/tt7259746',
];

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
    acceptDownloads: true,
  });

  const page = await browser.newPage();

  // Login
  await page.goto('https://pro.imdb.com/login');

  await page.click('#login_with_imdb');

  // NOTE - Fill in email:
  await page.fill('#ap_email', '<EMAIL>');

  // NOTE - Fill in password here:
  await page.fill('#ap_password', '<PASSWORD>');

  await page.click('#signInSubmit');

  await page.waitForTimeout(15000);

  // Cycle through shows
  for (let showPage of showPages) {
    await page.goto(showPage + '/episodes');

    const episodeUrls = await page.evaluate(() => {
      const urls = [
        ...new Set(
          [...document.querySelectorAll('.episode_row .episode_title a')].map(
            (el) => el.href
          )
        ),
      ];
      const filmmakers = urls.map((url) => url + 'filmmakers');

      return filmmakers;
    });

    // Cycle through episodes
    for (let episodeUrl of episodeUrls) {
      await page.goto(episodeUrl);

      const { csv, showName, episodeInfo } = await page.evaluate(() => {
        const csv = [
          ...document.querySelectorAll('[data-a-name="filmmakers"] tbody'),
        ]
          .flatMap((el) => {
            const section =
              el.querySelector(
                'tr.a-histogram-row.a-active.heading > th:nth-child(1) > span > span > span.a-size-.a-text-bold'
              ) || el.querySelector('tr span.a-text-bold');

            if (!section) return null;
            if (!section.innerText) throw new Error('No section innerText');
            const sectionName = section?.innerText;

            const filmmakers = [...el.querySelectorAll('.filmmaker')].map(
              (filmmaker) => {
                const nameEl = filmmaker.querySelector(
                  'td:nth-child(1) > div > span > span > a'
                );

                if (!nameEl) throw new Error('No name!');
                const name = nameEl?.innerText;

                const positionEl = filmmaker.querySelector(
                  'td:nth-child(1) > div > div > span > span.see_more_text_collapsed'
                );

                if (!positionEl) throw new Error('No no position!');
                const position = positionEl?.innerText;

                return {
                  section: sectionName.trim(),
                  name,
                  position: position.replaceAll(',', '-'),
                };
              }
            );

            return filmmakers;
          })
          .filter((f) => !!f)
          .reduce(
            (acc, { section, name, position }) =>
              `${acc}${section},${name},${position}\n`,
            'section,name,position\n'
          );

        const showName = document.querySelector(
          '#title_heading > h1 > span > a'
        ).innerText;

        const episodeInfo = document
          .querySelector('#title_heading > div.a-row.a-spacing-micro')
          .innerText.replaceAll('/', '|');

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
