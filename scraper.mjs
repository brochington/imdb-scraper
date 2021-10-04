import { chromium } from 'playwright';
import fs from 'fs/promises';

const showPages = [
  'https://pro.imdb.com/title/tt11061808/?ref_=instant_tt_1&q=tough%20as%20nails',
  'https://pro.imdb.com/title/tt4458594/?ref_=instant_tt_1&q=Blaze%20and%20the%20Monster',
  'https://pro.imdb.com/title/tt12844622/?ref_=instant_tt_1&q=Santiago%20of%20',
  'https://pro.imdb.com/title/tt11833388/?ref_=instant_tt_1&q=Danger%20Force',
  'https://pro.imdb.com/title/tt11853378/?ref_=instant_tt_1&q=Side%20Hustle',
  'https://pro.imdb.com/title/tt0176095/?ref_=instant_tt_1&q=Challenge',
  'https://pro.imdb.com/title/tt1566154/?ref_=instant_tt_1&q=Teen%20Mom%20OG',
  'https://pro.imdb.com/title/tt9698572/?ref_=instant_tt_1&q=Double%20Shot%20at%20L',
  'https://pro.imdb.com/title/tt1820166/?ref_=instant_tt_1&q=Ridiculousness',
  'https://pro.imdb.com/title/tt2498968/?ref_=instant_tt_1&q=Catfish',
  'https://pro.imdb.com/title/tt7577814/?ref_=instant_tt_1&q=Floribama',
  'https://pro.imdb.com/title/tt1865740/?ref_=instant_tt_1&q=Ink%20Master',
  'https://pro.imdb.com/title/tt1863526/?ref_=instant_tt_1&q=Bar%20Rescue',
  'https://pro.imdb.com/title/tt2224452/?ref_=instant_tt_3&q=Love%20and%20Hi',
  'https://pro.imdb.com/title/tt1718437/?ref_=instant_tt_1&q=Love%20and%20Hip%20Hop%20N',
  'https://pro.imdb.com/title/tt5965978/?ref_=instant_tt_1&q=Black%20Ink%20Crew',
  'https://pro.imdb.com/title/tt2738096/?ref_=instant_tt_2&q=Black%20Ink%20Crew',
  'https://pro.imdb.com/title/tt0472989/?ref_=instant_tt_1&q=Wild%20n',
  'https://pro.imdb.com/title/tt10580092/?ref_=instant_tt_1&q=The%20Oval',
  'https://pro.imdb.com/title/tt10752770/?ref_=instant_tt_1&q=Sistas',
  'https://pro.imdb.com/title/tt10525048/?ref_=instant_tt_2&q=Bigger',
  'https://pro.imdb.com/title/tt11306366/?ref_=instant_tt_1&q=Ruthless',
  'https://pro.imdb.com/title/tt8115582/?ref_=instant_tt_1&q=Twenties',
  'https://pro.imdb.com/title/tt8319644/?ref_=instant_tt_1&q=Games%20People',
  'https://pro.imdb.com/title/tt0115147/?ref_=instant_tt_2&q=The%20Daily%20Show',
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

  const episodesUrls = showPages
    .map(sp => sp.split('?')[0])
    .map(sp => sp.endsWith('/') ? sp.substring(0, sp.length - 1) : sp)
    .map(sp => `${sp}/episodes`);

  // Cycle through shows
  for (let episodesUrl of episodesUrls) {
    await page.goto(episodesUrl);

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

      const { csv, showName, epName, epInfo, seasonNum, epNum } = await page.evaluate(() => {
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

        const epName = document.querySelector('#title_heading > span.a-size-medium')?.innerText;

        const epInfo = document
          .querySelector(
            '#title_heading > div.a-row.a-spacing-micro, #title_heading > div.a-row.a-spacing-top-micro'
          )
          .innerText.replaceAll('/', '|');

        const [seasonNum, epNum] = document
          .querySelector('#title_heading')
          ?.innerText.match(/((?!Season\s)\d+)|((?!Episode\s\d+))/g)
          .filter((a) => !!a);

        return { csv, showName, epName, epInfo, seasonNum, epNum };
      });

      let fileName = `${showName}:S${seasonNum}E${epNum}-${epName}.csv`.replaceAll('/', '|');
      console.log(filename);

      // Write CSV files
      await fs.writeFile(`exports/${fileName}`, csv);
    }
  }

  await page.waitForTimeout(4000);

  await page.close();
  await browser.close();
})();
